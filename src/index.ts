import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import courseRoutes from "./routes/course.routes";
import chapterRoutes from "./routes/chapter.routes";
import sessionRoutes from "./routes/session.routes";
import cors from "cors";
import { testConnection } from "./database";
import { initializeDatabase } from "./models";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173" 
}));
app.use(express.json());

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
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/sessions', sessionRoutes);

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