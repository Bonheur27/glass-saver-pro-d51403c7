-- Create database
CREATE DATABASE IF NOT EXISTS cutting_optimizer;
USE cutting_optimizer;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Stock sheets table
CREATE TABLE IF NOT EXISTS stock_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  height DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  kerf DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
);

-- Pieces table
CREATE TABLE IF NOT EXISTS pieces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  height DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
);

-- Optimization results table
CREATE TABLE IF NOT EXISTS optimization_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  total_sheets INT NOT NULL,
  total_waste DECIMAL(10, 2) NOT NULL,
  efficiency DECIMAL(10, 2) NOT NULL,
  result_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
);

-- Shared projects table
CREATE TABLE IF NOT EXISTS shared_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  shared_with_email VARCHAR(255) NOT NULL,
  permission VARCHAR(50) DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_shared_with_email (shared_with_email)
);
