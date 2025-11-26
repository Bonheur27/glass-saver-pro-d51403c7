const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Total projects
    const [projectCount] = await db.query(
      'SELECT COUNT(*) as total FROM projects WHERE user_id = ?',
      [req.user.userId]
    );

    // Total sheets used
    const [sheetCount] = await db.query(
      `SELECT SUM(or1.total_sheets) as total
       FROM optimization_results or1
       INNER JOIN (
         SELECT project_id, MAX(created_at) as max_date
         FROM optimization_results
         GROUP BY project_id
       ) or2 ON or1.project_id = or2.project_id AND or1.created_at = or2.max_date
       INNER JOIN projects p ON or1.project_id = p.id
       WHERE p.user_id = ?`,
      [req.user.userId]
    );

    // Average efficiency
    const [avgEfficiency] = await db.query(
      `SELECT AVG(or1.efficiency) as average
       FROM optimization_results or1
       INNER JOIN (
         SELECT project_id, MAX(created_at) as max_date
         FROM optimization_results
         GROUP BY project_id
       ) or2 ON or1.project_id = or2.project_id AND or1.created_at = or2.max_date
       INNER JOIN projects p ON or1.project_id = p.id
       WHERE p.user_id = ?`,
      [req.user.userId]
    );

    // Recent projects
    const [recentProjects] = await db.query(
      `SELECT p.*, 
        (SELECT efficiency FROM optimization_results WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1) as efficiency,
        (SELECT total_sheets FROM optimization_results WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1) as sheets_used
       FROM projects p
       WHERE p.user_id = ?
       ORDER BY p.updated_at DESC
       LIMIT 5`,
      [req.user.userId]
    );

    res.json({
      totalProjects: projectCount[0].total || 0,
      totalSheetsUsed: sheetCount[0].total || 0,
      averageEfficiency: avgEfficiency[0].average || 0,
      recentProjects
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get efficiency trends
router.get('/trends', authMiddleware, async (req, res) => {
  try {
    const [trends] = await db.query(
      `SELECT 
        DATE(or1.created_at) as date,
        AVG(or1.efficiency) as efficiency,
        AVG(or1.total_waste) as waste,
        COUNT(DISTINCT or1.project_id) as projects
       FROM optimization_results or1
       INNER JOIN projects p ON or1.project_id = p.id
       WHERE p.user_id = ? AND or1.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(or1.created_at)
       ORDER BY date ASC`,
      [req.user.userId]
    );

    res.json(trends);
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get summary statistics
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    // Sheet usage by size
    const [sheetUsage] = await db.query(
      `SELECT 
        CONCAT(CAST(ss.width AS CHAR), 'x', CAST(ss.height AS CHAR)) as size,
        SUM(ss.quantity) as count
       FROM stock_sheets ss
       INNER JOIN projects p ON ss.project_id = p.id
       WHERE p.user_id = ?
       GROUP BY ss.width, ss.height
       ORDER BY count DESC
       LIMIT 10`,
      [req.user.userId]
    );

    // Waste distribution
    const [wasteDistribution] = await db.query(
      `SELECT 
        CASE 
          WHEN or1.total_waste < 10 THEN '0-10%'
          WHEN or1.total_waste < 20 THEN '10-20%'
          WHEN or1.total_waste < 30 THEN '20-30%'
          ELSE '30%+'
        END as range,
        COUNT(*) as count
       FROM optimization_results or1
       INNER JOIN (
         SELECT project_id, MAX(created_at) as max_date
         FROM optimization_results
         GROUP BY project_id
       ) or2 ON or1.project_id = or2.project_id AND or1.created_at = or2.max_date
       INNER JOIN projects p ON or1.project_id = p.id
       WHERE p.user_id = ?
       GROUP BY range
       ORDER BY range`,
      [req.user.userId]
    );

    // Monthly summary
    const [monthlySummary] = await db.query(
      `SELECT 
        DATE_FORMAT(or1.created_at, '%Y-%m') as month,
        COUNT(DISTINCT or1.project_id) as projects,
        SUM(or1.total_sheets) as sheets,
        AVG(or1.efficiency) as avg_efficiency
       FROM optimization_results or1
       INNER JOIN projects p ON or1.project_id = p.id
       WHERE p.user_id = ? AND or1.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(or1.created_at, '%Y-%m')
       ORDER BY month DESC`,
      [req.user.userId]
    );

    res.json({
      sheetUsage,
      wasteDistribution,
      monthlySummary
    });
  } catch (error) {
    console.error('Summary analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
