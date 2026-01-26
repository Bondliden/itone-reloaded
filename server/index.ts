import express from "express";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "iTone Karaoke API is running" });
});

// Serve static files
app.use(express.static(__dirname));

// SPA catch-all route - MUST be last
app.get("*", (req, res) => {
  res.sendFile(resolve(__dirname, "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Frontend missing");
    }
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`iTone Karaoke server running on port ${PORT}`);
});
