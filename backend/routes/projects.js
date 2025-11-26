const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all projects for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [projects] = await db.query(
      `SELECT p.*, 
        COUNT(DISTINCT ss.id) as sheet_count,
        COUNT(DISTINCT pc.id) as piece_count,
        (SELECT efficiency FROM optimization_results WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1) as last_efficiency
       FROM projects p
       LEFT JOIN stock_sheets ss ON p.id = ss.project_id
       LEFT JOIN pieces pc ON p.id = pc.project_id
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY p.updated_at DESC`,
      [req.user.userId]
    );

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project with details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [projects] = await db.query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    // Get stock sheets
    const [sheets] = await db.query(
      'SELECT * FROM stock_sheets WHERE project_id = ?',
      [req.params.id]
    );

    // Get pieces
    const [pieces] = await db.query(
      'SELECT * FROM pieces WHERE project_id = ?',
      [req.params.id]
    );

    // Get optimization results
    const [results] = await db.query(
      'SELECT * FROM optimization_results WHERE project_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.params.id]
    );

    res.json({
      ...project,
      stockSheets: sheets,
      pieces: pieces,
      optimizationResult: results[0] || null
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new project
router.post(
  '/',
  [authMiddleware, body('name').trim().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, stockSheets, pieces, optimizationResult } = req.body;

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Create project
        const [projectResult] = await connection.query(
          'INSERT INTO projects (user_id, name, description) VALUES (?, ?, ?)',
          [req.user.userId, name, description || null]
        );

        const projectId = projectResult.insertId;

        // Insert stock sheets
        if (stockSheets && stockSheets.length > 0) {
          const sheetValues = stockSheets.map(sheet => [
            projectId,
            sheet.label,
            sheet.width,
            sheet.height,
            sheet.quantity,
            sheet.kerf || 0
          ]);
          await connection.query(
            'INSERT INTO stock_sheets (project_id, label, width, height, quantity, kerf) VALUES ?',
            [sheetValues]
          );
        }

        // Insert pieces
        if (pieces && pieces.length > 0) {
          const pieceValues = pieces.map(piece => [
            projectId,
            piece.label,
            piece.width,
            piece.height,
            piece.quantity
          ]);
          await connection.query(
            'INSERT INTO pieces (project_id, label, width, height, quantity) VALUES ?',
            [pieceValues]
          );
        }

        // Insert optimization result
        if (optimizationResult) {
          await connection.query(
            'INSERT INTO optimization_results (project_id, total_sheets, total_waste, efficiency, result_data) VALUES (?, ?, ?, ?, ?)',
            [
              projectId,
              optimizationResult.totalSheets,
              optimizationResult.totalWaste,
              optimizationResult.efficiency,
              JSON.stringify(optimizationResult)
            ]
          );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({ id: projectId, name, description });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, stockSheets, pieces, optimizationResult } = req.body;

    // Verify ownership
    const [projects] = await db.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update project
      await connection.query(
        'UPDATE projects SET name = ?, description = ? WHERE id = ?',
        [name, description || null, req.params.id]
      );

      // Delete existing sheets and pieces
      await connection.query('DELETE FROM stock_sheets WHERE project_id = ?', [req.params.id]);
      await connection.query('DELETE FROM pieces WHERE project_id = ?', [req.params.id]);

      // Insert new stock sheets
      if (stockSheets && stockSheets.length > 0) {
        const sheetValues = stockSheets.map(sheet => [
          req.params.id,
          sheet.label,
          sheet.width,
          sheet.height,
          sheet.quantity,
          sheet.kerf || 0
        ]);
        await connection.query(
          'INSERT INTO stock_sheets (project_id, label, width, height, quantity, kerf) VALUES ?',
          [sheetValues]
        );
      }

      // Insert new pieces
      if (pieces && pieces.length > 0) {
        const pieceValues = pieces.map(piece => [
          req.params.id,
          piece.label,
          piece.width,
          piece.height,
          piece.quantity
        ]);
        await connection.query(
          'INSERT INTO pieces (project_id, label, width, height, quantity) VALUES ?',
          [pieceValues]
        );
      }

      // Insert new optimization result
      if (optimizationResult) {
        await connection.query(
          'INSERT INTO optimization_results (project_id, total_sheets, total_waste, efficiency, result_data) VALUES (?, ?, ?, ?, ?)',
          [
            req.params.id,
            optimizationResult.totalSheets,
            optimizationResult.totalWaste,
            optimizationResult.efficiency,
            JSON.stringify(optimizationResult)
          ]
        );
      }

      await connection.commit();
      connection.release();

      res.json({ message: 'Project updated successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export project
router.get('/:id/export', authMiddleware, async (req, res) => {
  try {
    const [projects] = await db.query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];
    const [sheets] = await db.query('SELECT * FROM stock_sheets WHERE project_id = ?', [req.params.id]);
    const [pieces] = await db.query('SELECT * FROM pieces WHERE project_id = ?', [req.params.id]);
    const [results] = await db.query('SELECT * FROM optimization_results WHERE project_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.id]);

    const exportData = {
      project,
      stockSheets: sheets,
      pieces,
      optimizationResult: results[0] ? JSON.parse(results[0].result_data) : null,
      exportedAt: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    console.error('Export project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Share project
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const { email, permission } = req.body;

    // Verify ownership
    const [projects] = await db.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if already shared
    const [existing] = await db.query(
      'SELECT id FROM shared_projects WHERE project_id = ? AND shared_with_email = ?',
      [req.params.id, email]
    );

    if (existing.length > 0) {
      // Update permission
      await db.query(
        'UPDATE shared_projects SET permission = ? WHERE id = ?',
        [permission || 'view', existing[0].id]
      );
    } else {
      // Create new share
      await db.query(
        'INSERT INTO shared_projects (project_id, shared_with_email, permission) VALUES (?, ?, ?)',
        [req.params.id, email, permission || 'view']
      );
    }

    res.json({ message: 'Project shared successfully' });
  } catch (error) {
    console.error('Share project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
