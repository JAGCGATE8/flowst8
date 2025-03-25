require("dotenv").config(); // Load environment variables
const mysql = require("mysql2");

// ✅ Use a connection pool to prevent closed connection issues
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Allow up to 10 connections at once
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
    connection.release(); // Release the connection back to the pool
  }
});

// Export as a promise-based connection
module.exports = pool.promise();


