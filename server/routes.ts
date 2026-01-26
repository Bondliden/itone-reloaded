             import path from "path";
import type { Express, Request, Response } from "express";import { import { storage } from "./storage";insertRecordingSchema, insertCollaborativeSessionSchema, insertSessionParticipantSchema, insertUserSongSchema, insertUploadJobSchema } from "@shared/schema";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export function registerRoutes(app: Express) {
  app.get("/api/songs", async (req: Request, res: Response) => {
    try {
      const { search, genre } = req.query;
      const songList = await storage.getSongs(search as string, genre as string);
      res.json(songList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const song = await storage.getSong(parseInt(id as string));
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song" });
    }
  });

  app.get("/api/subscription-plans", async (_req: Request, res: Response) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.get("/api/streaming-platforms", async (_req: Request, res: Response) => {
    try {
      const platforms = await storage.getStreamingPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streaming platforms" });
    }
  });

  app.get("/auth/me", (req: Request, res: Response) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.get("/api/user/songs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const userSongsList = await storage.getUserSongs(user.id);
      res.json(userSongsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user songs" });
    }
  });

  app.post("/api/user/songs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const result = insertUserSongSchema.safeParse({ ...req.body, userId: user.id });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const userSong = await storage.addUserSong(result.data);
      res.json(userSong);
    } catch (error) {
      res.status(500).json({ error: "Failed to add song" });
    }
  });

  app.delete("/api/user/songs/:songId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const songId = req.params.songId as string;
      await storage.removeUserSong(user.id, parseInt(songId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove song" });
    }
  });

  app.get("/api/recordings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const recordingsList = await storage.getRecordings(user.id);
      res.json(recordingsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recordings" });
    }
  });

  app.post("/api/recordings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const result = insertRecordingSchema.safeParse({ ...req.body, userId: user.id });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const recording = await storage.createRecording(result.data);
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: "Failed to create recording" });
    }
  });

  app.delete("/api/recordings/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const id = req.params.id as string;
      await storage.deleteRecording(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recording" });
    }
  });

  app.get("/api/sessions/code/:code", async (req: Request, res: Response) => {
    try {
      const code = req.params.code as string;
      const session = await storage.getCollaborativeSessionByCode(code);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const sessionCode = generateSessionCode();
      const result = insertCollaborativeSessionSchema.safeParse({ 
        ...req.body, 
        hostId: user.id,
        sessionCode,
        isActive: true 
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const session = await storage.createCollaborativeSession(result.data);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.post("/api/sessions/:id/join", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const sessionId = req.params.id as string;
      const result = insertSessionParticipantSchema.safeParse({ 
        sessionId: parseInt(sessionId),
        userId: user.id 
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const participant = await storage.addSessionParticipant(result.data);
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to join session" });
    }
  });

  app.post("/api/sessions/:id/leave", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const sessionId = req.params.id as string;
      await storage.removeSessionParticipant(parseInt(sessionId), user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave session" });
    }
  });

  app.get("/api/sessions/:id/participants", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id as string;
      const participants = await storage.getSessionParticipants(parseInt(sessionId));
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  app.get("/api/user/subscription", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const subscription = await storage.getUserSubscription(user.id);
      res.json(subscription || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.get("/api/user/platform-connections", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const connections = await storage.getUserPlatformConnections(user.id);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platform connections" });
    }
  });

  app.get("/api/user/upload-jobs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const jobs = await storage.getUploadJobs(user.id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upload jobs" });
    }
  });

  app.post("/api/upload-jobs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = req.user as any;
      const result = insertUploadJobSchema.safeParse({ ...req.body, userId: user.id });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const job = await storage.createUploadJob(result.data);
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to create upload job" });
    }
  });

  app.post("/api/create-checkout-session", async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    try {
      const { priceId, successUrl, cancelUrl, metadata } = req.body;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          trial_period_days: 7,
          metadata: metadata || {},
        },
        allow_promotion_codes: true,
        metadata: metadata || {},
      });
      
      res.json({ sessionId: session.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "OK", message: "iTone Karaoke API is running" });
  });
}

function generateSessionCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
