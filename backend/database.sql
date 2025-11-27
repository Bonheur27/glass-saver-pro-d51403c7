-- =============================================
-- Cutting Optimizer Database Schema
-- Complete SQL Structure for MySQL
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS cutting_optimizer;
USE cutting_optimizer;

-- =============================================
-- USERS TABLE
-- Stores user authentication and profile info
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  company VARCHAR(255),
  role ENUM('user', 'admin', 'premium') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- =============================================
-- PROJECTS TABLE
-- Stores cutting optimization projects
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'in_progress', 'completed', 'archived') DEFAULT 'draft',
  is_favorite BOOLEAN DEFAULT FALSE,
  tags JSON,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_is_favorite (is_favorite)
);

-- =============================================
-- STOCK SHEETS TABLE
-- Stores available stock sheet configurations
-- =============================================
CREATE TABLE IF NOT EXISTS stock_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  height DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  kerf DECIMAL(10, 4) DEFAULT 0 COMMENT 'Blade kerf width in mm',
  material VARCHAR(100),
  thickness DECIMAL(10, 2),
  cost_per_sheet DECIMAL(10, 2) DEFAULT 0,
  grain_direction ENUM('none', 'horizontal', 'vertical') DEFAULT 'none',
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_material (material)
);

-- =============================================
-- PIECES TABLE
-- Stores required pieces to be cut
-- =============================================
CREATE TABLE IF NOT EXISTS pieces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  height DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  can_rotate BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  material VARCHAR(100),
  color VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_priority (priority)
);

-- =============================================
-- OPTIMIZATION RESULTS TABLE
-- Stores optimization output and statistics
-- =============================================
CREATE TABLE IF NOT EXISTS optimization_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  total_sheets INT NOT NULL,
  total_waste DECIMAL(10, 2) NOT NULL,
  efficiency DECIMAL(10, 2) NOT NULL,
  total_area_used DECIMAL(15, 2),
  total_area_available DECIMAL(15, 2),
  total_cuts INT,
  estimated_time_minutes INT,
  result_data JSON NOT NULL COMMENT 'Full layout data including placements',
  algorithm_used VARCHAR(50) DEFAULT 'guillotine',
  computation_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_efficiency (efficiency),
  INDEX idx_created_at (created_at)
);

-- =============================================
-- SHARED PROJECTS TABLE
-- Handles project sharing between users
-- =============================================
CREATE TABLE IF NOT EXISTS shared_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  shared_by_user_id INT NOT NULL,
  shared_with_email VARCHAR(255) NOT NULL,
  shared_with_user_id INT NULL,
  permission ENUM('view', 'edit', 'admin') DEFAULT 'view',
  accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project_id (project_id),
  INDEX idx_shared_with_email (shared_with_email),
  INDEX idx_shared_with_user_id (shared_with_user_id),
  UNIQUE KEY unique_share (project_id, shared_with_email)
);

-- =============================================
-- MATERIALS TABLE
-- Predefined materials library
-- =============================================
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'NULL for system materials',
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  thickness DECIMAL(10, 2),
  default_width DECIMAL(10, 2),
  default_height DECIMAL(10, 2),
  cost_per_sqm DECIMAL(10, 2),
  cost_per_sheet DECIMAL(10, 2),
  supplier VARCHAR(255),
  sku VARCHAR(100),
  color VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_active (is_active)
);

-- =============================================
-- PROJECT TEMPLATES TABLE
-- Reusable project configurations
-- =============================================
CREATE TABLE IF NOT EXISTS project_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'NULL for system templates',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSON NOT NULL,
  category VARCHAR(100),
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_is_public (is_public)
);

-- =============================================
-- ACTIVITY LOG TABLE
-- Tracks user actions for audit
-- =============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  old_data JSON,
  new_data JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
);

-- =============================================
-- USER SETTINGS TABLE
-- Stores user preferences
-- =============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  default_unit ENUM('mm', 'cm', 'inch') DEFAULT 'cm',
  default_kerf DECIMAL(10, 4) DEFAULT 3.0,
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'en',
  notifications_email BOOLEAN DEFAULT TRUE,
  notifications_browser BOOLEAN DEFAULT TRUE,
  auto_save BOOLEAN DEFAULT TRUE,
  show_grid BOOLEAN DEFAULT TRUE,
  snap_to_grid BOOLEAN DEFAULT FALSE,
  grid_size INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- PASSWORD RESET TOKENS TABLE
-- For password recovery
-- =============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);

-- =============================================
-- REFRESH TOKENS TABLE
-- For JWT refresh token rotation
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  device_info VARCHAR(255),
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(191)),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default materials
INSERT INTO materials (user_id, name, type, thickness, default_width, default_height, cost_per_sqm, cost_per_sheet) VALUES
(NULL, 'Plywood 18mm', 'Plywood', 18, 244, 122, 15.00, 44.69),
(NULL, 'Plywood 12mm', 'Plywood', 12, 244, 122, 12.00, 35.75),
(NULL, 'MDF 18mm', 'MDF', 18, 244, 122, 10.00, 29.79),
(NULL, 'MDF 12mm', 'MDF', 12, 244, 122, 8.00, 23.83),
(NULL, 'Particle Board 18mm', 'Particle Board', 18, 244, 122, 6.00, 17.87),
(NULL, 'Melamine 18mm White', 'Melamine', 18, 244, 122, 18.00, 53.63),
(NULL, 'OSB 18mm', 'OSB', 18, 244, 122, 8.00, 23.83),
(NULL, 'Hardboard 3mm', 'Hardboard', 3, 244, 122, 4.00, 11.92);

-- Insert default templates
INSERT INTO project_templates (user_id, name, description, template_data, category, is_public) VALUES
(NULL, 'Kitchen Cabinet Set', 'Standard kitchen cabinet cutting layout', '{"stockSheets":[{"label":"Plywood 18mm","width":244,"height":122,"quantity":4,"kerf":3}],"pieces":[{"label":"Cabinet Side","width":60,"height":80,"quantity":8},{"label":"Cabinet Top/Bottom","width":58,"height":50,"quantity":8},{"label":"Shelf","width":56,"height":48,"quantity":8}]}', 'Kitchen', TRUE),
(NULL, 'Bookshelf Standard', 'Basic bookshelf with adjustable shelves', '{"stockSheets":[{"label":"MDF 18mm","width":244,"height":122,"quantity":2,"kerf":3}],"pieces":[{"label":"Side Panel","width":30,"height":180,"quantity":2},{"label":"Shelf","width":80,"height":28,"quantity":6},{"label":"Back Panel","width":80,"height":180,"quantity":1}]}', 'Furniture', TRUE),
(NULL, 'Wardrobe Basic', 'Simple wardrobe design', '{"stockSheets":[{"label":"Melamine 18mm","width":244,"height":122,"quantity":3,"kerf":3}],"pieces":[{"label":"Side Panel","width":60,"height":200,"quantity":2},{"label":"Top/Bottom","width":98,"height":58,"quantity":2},{"label":"Shelf","width":96,"height":56,"quantity":4},{"label":"Door","width":49,"height":198,"quantity":2}]}', 'Furniture', TRUE);

-- =============================================
-- VIEWS FOR REPORTING
-- =============================================

-- Project summary view
CREATE OR REPLACE VIEW v_project_summary AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.description,
  p.status,
  p.created_at,
  p.updated_at,
  COUNT(DISTINCT ss.id) as sheet_count,
  COUNT(DISTINCT pc.id) as piece_count,
  SUM(ss.quantity) as total_sheets,
  SUM(pc.quantity) as total_pieces,
  (SELECT efficiency FROM optimization_results WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1) as last_efficiency,
  (SELECT total_waste FROM optimization_results WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1) as last_waste
FROM projects p
LEFT JOIN stock_sheets ss ON p.id = ss.project_id
LEFT JOIN pieces pc ON p.id = pc.project_id
GROUP BY p.id;

-- User statistics view
CREATE OR REPLACE VIEW v_user_statistics AS
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  COUNT(DISTINCT p.id) as total_projects,
  AVG(orl.efficiency) as avg_efficiency,
  SUM(orl.total_sheets) as total_sheets_used,
  AVG(orl.total_waste) as avg_waste
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN (
  SELECT or1.*
  FROM optimization_results or1
  INNER JOIN (
    SELECT project_id, MAX(created_at) as max_date
    FROM optimization_results
    GROUP BY project_id
  ) or2 ON or1.project_id = or2.project_id AND or1.created_at = or2.max_date
) orl ON p.id = orl.project_id
GROUP BY u.id;

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

-- Get dashboard statistics for a user
CREATE PROCEDURE sp_get_dashboard_stats(IN p_user_id INT)
BEGIN
  -- Total projects
  SELECT COUNT(*) as total_projects FROM projects WHERE user_id = p_user_id;
  
  -- Average efficiency
  SELECT AVG(or1.efficiency) as avg_efficiency
  FROM optimization_results or1
  INNER JOIN projects p ON or1.project_id = p.id
  WHERE p.user_id = p_user_id;
  
  -- Total sheets used
  SELECT COALESCE(SUM(or1.total_sheets), 0) as total_sheets
  FROM optimization_results or1
  INNER JOIN projects p ON or1.project_id = p.id
  WHERE p.user_id = p_user_id;
  
  -- Recent projects
  SELECT p.*, 
    (SELECT efficiency FROM optimization_results WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1) as efficiency
  FROM projects p
  WHERE p.user_id = p_user_id
  ORDER BY p.updated_at DESC
  LIMIT 5;
END //

-- Clean up expired tokens
CREATE PROCEDURE sp_cleanup_expired_tokens()
BEGIN
  DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE;
  DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = TRUE;
END //

DELIMITER ;

-- =============================================
-- TRIGGERS
-- =============================================

DELIMITER //

-- Update project timestamp when related data changes
CREATE TRIGGER tr_stock_sheets_update_project
AFTER INSERT ON stock_sheets
FOR EACH ROW
BEGIN
  UPDATE projects SET updated_at = NOW() WHERE id = NEW.project_id;
END //

CREATE TRIGGER tr_pieces_update_project
AFTER INSERT ON pieces
FOR EACH ROW
BEGIN
  UPDATE projects SET updated_at = NOW() WHERE id = NEW.project_id;
END //

CREATE TRIGGER tr_optimization_update_project
AFTER INSERT ON optimization_results
FOR EACH ROW
BEGIN
  UPDATE projects SET updated_at = NOW(), status = 'completed' WHERE id = NEW.project_id;
END //

DELIMITER ;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Composite indexes for common queries
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_projects_user_created ON projects(user_id, created_at DESC);
CREATE INDEX idx_optimization_project_created ON optimization_results(project_id, created_at DESC);
