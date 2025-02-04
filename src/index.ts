import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import cors from "cors";
import { testConnection } from "./database";
import { initializeDatabase } from "./models";
import batchRoutes from "./routes/batch.routes";
import path from 'path';
import fs from 'fs';
import courseRoutes from './routes/course.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/batches');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: "http://localhost:5173" 
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "LMS API is up and running",
    version: "1.0.0",
    status: "healthy"
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/courses', courseRoutes);

async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database with models
    await initializeDatabase();
    
    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();