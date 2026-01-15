const express = require("express");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
require("dotenv").config();

const { pool } = require("./db"); // Test kết nối DB 

const app = express();
const server = http.createServer(app);

// Security & Middleware 
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Route test sức khỏe server 
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Smart Restaurant API is running (Skeleton Version)",
    timestamp: new Date()
  });
});

// Route test kết nối DB 
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Backend server skeleton running on port ${port}`);
});