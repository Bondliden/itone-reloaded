import express from "express";
import session from 'express-session';
import passport from 'passport';
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import dotenv from "dotenv";
import { karaokeRoutes } from "./routes/karaoke.js";
import { authRoutes } from "./routes/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'itone-karaoke-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

app.use("/auth", authRoutes);
app.use("/api", karaokeRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "iTone Karaoke API is running" });
});

// Serve static files
app.use(express.static(__dirname));

// Catch-all route for SPA
app.get("*", (req, res) => {
  const indexPath = resolve(__dirname, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Error loading frontend");
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🎤 iTone Karaoke server running on port ${PORT}`);
});
