const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cutting_optimizer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('✅ Database connected successfully');
  connection.release();
});

module.exports = pool.promise();
