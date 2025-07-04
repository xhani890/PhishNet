import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import FileStore from "session-file-store";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { isAuthenticated, hasOrganization, isAdmin } from './auth';  // Add isAdmin import here
import { pool } from './db';  // Also import pool for the database query

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize the FileStore with the session
const SessionFileStore = FileStore(session);

// Configure session middleware
app.use(
  session({
    name: "phishnet.sid",
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours instead of 10 minutes
      sameSite: "lax"
    },
    store: new SessionFileStore({
      path: "./sessions",
      ttl: 8 * 60 * 60 // 8 hours in seconds
    })
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Change the server.listen configuration
  const port = 5000;
  server.listen(port, "localhost", () => {
    log(`Server running at http://localhost:${port}`);
  });
})();

// Debug endpoint
app.get("/api/debug/templates", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get all templates with organization IDs
    const result = await pool.query(`SELECT id, name, organization_id FROM email_templates`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching debug data" });
  }
});
