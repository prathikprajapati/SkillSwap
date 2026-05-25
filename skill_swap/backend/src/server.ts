import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import skillsRoutes from "./routes/skills";
import matchesRoutes, { messagesRouter } from "./routes/matches";
import requestsRoutes from "./routes/requests";
import messagesRoutes from "./routes/messages";
import gamificationRoutes from "./routes/gamification";
import ratingsRoutes from "./routes/ratings";
import notificationsRoutes from "./routes/notifications";
import sessionsRoutes from "./routes/sessions";
import exchangesRoutes from "./routes/exchanges";

import { initializeSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Security: Helmet middleware for security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "http://localhost:4173",
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "http://localhost:5176",
          "http://localhost:5177",
        ],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for development
  }),
);

// Security: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 1000 : 
       process.env.NODE_ENV === "development" ? 100 : 5, // Much higher limit for dev
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  // Bypass rate limiting for localhost in development
  skip: (req) => {
    return process.env.NODE_ENV === "development" && 
           (req.ip === "127.0.0.1" || req.ip === "::1" || 
            req.hostname === "localhost" || req.hostname === "127.0.0.1");
  },
});

// CORS middleware - Allow all localhost ports for development
const isLocalhostOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;
  return (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("http://[::1]:")
  );
};

// Only use CORS_ORIGIN if it's properly defined and not a wildcard or invalid
const corsOrigins: string[] =
  process.env.CORS_ORIGIN &&
  process.env.CORS_ORIGIN !== "http://localhost:*" &&
  !process.env.CORS_ORIGIN.includes("*")
    ? process.env.CORS_ORIGIN.split(",")
    : [];

// Default CORS origin to use when no origin header is provided
const defaultCorsOrigin = "http://localhost:5173";

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    // Allow all localhost ports in development
    if (process.env.NODE_ENV === "development" && isLocalhostOrigin(origin)) {
      callback(null, origin as string);
      return;
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow configured CORS origins
    if (corsOrigins.includes(origin)) {
      callback(null, origin);
      return;
    }

    // Check if origin matches any pattern (for dynamic origins)
    if (corsOrigins.some((o) => origin?.startsWith(o.replace(/\/$/, "")) || o === "*")) {
      callback(null, origin);
      return;
    }

    // Fallback to first configured origin or default
    callback(null, corsOrigins[0] || defaultCorsOrigin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security: Input sanitization middleware
app.use((req, res, next) => {
  // Sanitize request body to prevent XSS
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }
  next();
});

// Helper function to sanitize strings in an object
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      // Basic XSS prevention - remove script tags and dangerous content
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, ""); // Remove event handlers
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// Explicit CORS preflight handling for the hot endpoint used by frontend.
// This prevents cases where OPTIONS could hit a fallback/404 before CORS headers are applied.
app.options("/skills/offerings", cors(corsOptions));

// Health check endpoint - must be before authenticated routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug logger for the hot endpoint (helps confirm Origin + method reaching backend)
app.use("/skills/offerings", (req, res, next) => {
  const origin = req.headers.origin;
  // eslint-disable-next-line no-console
  console.log(
    `[CORS DEBUG] ${req.method} /skills/offerings origin=${origin ?? "none"}`
  );
  next();
});

// Apply stricter rate limiting to auth routes
app.use("/auth", authLimiter, authRoutes);

// Routes - Order matters! More specific routes first
app.use("/skills", skillsRoutes);
app.use("/users", userRoutes);
app.use("/matches", matchesRoutes);
app.use("/sessions", sessionsRoutes);
app.use("/requests", requestsRoutes);
app.use("/messages", messagesRouter);
app.use("/gamification", gamificationRoutes);
app.use("/ratings", ratingsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/exchanges", exchangesRoutes);

// Security: HTTPS enforcement for production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// 404 handler - must be before error handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === "development";

    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      ...(isDevelopment && { stack: err.stack }),
      // Add security headers to error responses
      ...(isDevelopment && { details: err.details }),
    });
  },
);

// Initialize WebSocket server
const io = initializeSocket(httpServer);

// Start server only if not in test mode or if explicitly requested
// This prevents port conflicts during testing
const isTestEnvironment = process.env.NODE_ENV === "test";
const shouldStartServer =
  !isTestEnvironment || process.env.FORCE_START_SERVER === "true";

if (shouldStartServer) {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `🔒 Security: Helmet, Rate Limiting, Input Sanitization enabled`,
    );
    console.log(`🔌 WebSocket: Socket.io initialized`);
  });
}

export default app;
export { httpServer, io };
