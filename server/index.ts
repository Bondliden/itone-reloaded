import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import "dotenv/config";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "itone-karaoke-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await storage.getUserByGoogleId(profile.id);
          if (!user) {
            user = await storage.createUser({
              googleId: profile.id,
              email: profile.emails?.[0]?.value || "",
              displayName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth" }),
  (_req, res) => {
    res.redirect("/dashboard");
  }
);

app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

registerRoutes(app);

(async () => {
  const server = app.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });

  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();
