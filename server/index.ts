import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { type Server } from "http";
import { exec } from "child_process";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase } from "./database/connection";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  // Connect to MongoDB Atlas
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    process.exit(1);
  }

  const server = (await registerRoutes(app)) as Server;

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    try {
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    } catch {}
    // Do not rethrow here; rethrowing causes dev middleware to return an HTML error page
    // Log the error instead.
    console.error('[API Error]', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const startServer = async (port: number) => {
    return new Promise<void>((resolve, reject) => {
      server.listen(port, () => {
        log(`serving on port ${port}`);
        resolve();
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${port} is in use, trying port ${port + 1}...`);
          server.close();
          startServer(port + 1).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  };

  const port = parseInt(process.env.PORT || '10000', 10);
  
  try {
    await startServer(port);
    
    // Auto-open browser in development for convenience
    if (app.get("env") === "development") {
      const url = `http://localhost:${port}/`;
      const platform = process.platform;
      try {
        if (platform === 'win32') {
          exec(`start "" "${url}"`);
        } else if (platform === 'darwin') {
          exec(`open "${url}"`);
        } else {
          exec(`xdg-open "${url}"`);
        }
      } catch {}
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
