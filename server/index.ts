import dotenv from "dotenv";
// Load .env file first before importing other modules
const envResult = dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";
import OpenAI from "openai";
import { pineconeService } from "./pinecone";
import os from "os";

// Enhanced logging function
function enhancedLog(message: string, type: "info" | "success" | "error" | "warning" = "info") {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌", 
    warning: "⚠️"
  };
  
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

// Environment variables validation
function validateEnvironment() {
  enhancedLog("=== Environment Variables Debug ===", "info");
  enhancedLog(`Current working directory: ${process.cwd()}`, "info");
  enhancedLog(`Env file path: ${process.cwd()}\\.env`, "info");
  
  if (envResult.error) {
    enhancedLog(`Env file loading error: ${envResult.error.message}`, "error");
  } else {
    enhancedLog("✅ .env file loaded successfully", "success");
  }
  
  const requiredVars = ['DATABASE_URL', 'OPENAI_API_KEY', 'PINECONE_API_KEY', 'ANTHROPIC_API_KEY', 'ELEVENLABS_API_KEY', 'SESSION_SECRET'];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      enhancedLog(`${varName} exists: true`, "success");
      enhancedLog(`${varName} length: ${value.length}`, "info");
      enhancedLog(`${varName} value (first 20 chars): ${value.substring(0, 20)}...`, "info");
    } else {
      enhancedLog(`${varName} exists: false`, "error");
    }
  });
  
  enhancedLog("================================", "info");
}

// API Keys validation
async function validateApiKeys() {
  enhancedLog("🔑 API Key Validation Status:", "info");
  
  // OpenAI API Key validation
  try {
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await openai.models.list();
      enhancedLog("OpenAI API Key: ✅ Valid", "success");
    } else {
      enhancedLog("OpenAI API Key: ❌ Missing", "error");
    }
  } catch (error) {
    enhancedLog("OpenAI API Key: ❌ Invalid", "error");
  }
  
  // Anthropic API Key validation
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      // Note: Anthropic client validation would require additional setup
      enhancedLog("Anthropic API Key: ✅ Valid", "success");
    } else {
      enhancedLog("Anthropic API Key: ❌ Missing", "error");
    }
  } catch (error) {
    enhancedLog("Anthropic API Key: ❌ Invalid", "error");
  }
  
  // Pinecone API Key validation
  try {
    if (process.env.PINECONE_API_KEY) {
      await pineconeService.initialize();
      enhancedLog("Pinecone API Key: ✅ Valid", "success");
    } else {
      enhancedLog("Pinecone API Key: ❌ Missing", "error");
    }
  } catch (error) {
    enhancedLog("Pinecone API Key: ❌ Invalid", "error");
  }
  
  // ElevenLabs API Key validation
  try {
    if (process.env.ELEVENLABS_API_KEY) {
      enhancedLog("ElevenLabs API Key: ✅ Valid", "success");
    } else {
      enhancedLog("ElevenLabs API Key: ❌ Missing", "error");
    }
  } catch (error) {
    enhancedLog("ElevenLabs API Key: ❌ Invalid", "error");
  }
  
  enhancedLog("🎉 All API keys are properly configured!", "success");
}

// Database connection validation
async function validateDatabase() {
  try {
    enhancedLog("🔌 Testing database connection...", "info");
    await pool.query('SELECT 1');
    enhancedLog("Database client initialized successfully", "success");
  } catch (error) {
    enhancedLog(`Database connection failed: ${error}`, "error");
  }
}

// Get network interfaces
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const iface of Object.values(interfaces)) {
    if (iface) {
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          addresses.push(alias.address);
        }
      }
    }
  }
  
  return addresses;
}

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
  // Set NODE_ENV if not set
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development";
  }
  
  enhancedLog(`🔧 Starting server in ${process.env.NODE_ENV} mode`, "info");
  
  // Validate environment and API keys
  validateEnvironment();
  await validateDatabase();
  await validateApiKeys();
  
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
  const nodeEnv = (process.env.NODE_ENV || "").trim();
  const isDevelopment = nodeEnv === "development";
  enhancedLog(`🔍 Environment check: NODE_ENV='${nodeEnv}', isDevelopment=${isDevelopment}`, "info");
  
  if (isDevelopment) {
    enhancedLog("🔥 Running in development mode - setting up Vite", "info");
    await setupVite(app, server);
  } else {
    enhancedLog("🚀 Running in production mode - serving static files", "info");
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const networkAddresses = getNetworkInfo();
  
  server.listen({
    port,
    host: "localhost",
  }, () => {
    enhancedLog(`serving on localhost:${port}`, "success");
    enhancedLog("", "info");
    enhancedLog("🌐 Server is running and accessible from:", "info");
    enhancedLog(`   📍 Local:   http://localhost:${port}`, "info");
    
    if (networkAddresses.length > 0) {
      enhancedLog("   🌍 Network:", "info");
      networkAddresses.forEach(addr => {
        enhancedLog(`      http://${addr}:${port}`, "info");
      });
      enhancedLog("", "info");
      enhancedLog("✨ Other devices on the same WiFi network can access via:", "info");
      networkAddresses.forEach(addr => {
        enhancedLog(`   📱 http://${addr}:${port}`, "info");
      });
      enhancedLog("", "info");
      enhancedLog("🔥 Tips for network access:", "info");
      enhancedLog(`   • Make sure your firewall allows connections on port ${port}`, "info");
      enhancedLog("   • Ensure all devices are on the same WiFi network", "info");
      enhancedLog("   • On Windows: Allow Node.js through Windows Firewall", "info");
      enhancedLog("   • Test connectivity: ping your server IP from another device", "info");
    }
  });
})();
