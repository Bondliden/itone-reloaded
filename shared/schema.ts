import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio").default(""),
  subscriptionTier: text("subscription_tier").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  duration: integer("duration").notNull(),
  genre: text("genre").notNull(),
  difficulty: text("difficulty").default("medium"),
  youtubeUrl: text("youtube_url").notNull(),
  spotifyId: text("spotify_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSongs = pgTable("user_songs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  songId: integer("song_id").notNull().references(() => songs.id),
  transposeValue: integer("transpose_value").default(0),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  songId: integer("song_id").notNull().references(() => songs.id),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  duration: integer("duration").notNull(),
  transposeUsed: integer("transpose_used").default(0),
  isCollaborative: boolean("is_collaborative").default(false),
  quality: text("quality").default("standard"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collaborativeSessions = pgTable("collaborative_sessions", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull().references(() => users.id),
  sessionCode: text("session_code").notNull().unique(),
  songId: integer("song_id").references(() => songs.id),
  maxParticipants: integer("max_participants").default(4),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionParticipants = pgTable("session_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => collaborativeSessions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  isMuted: boolean("is_muted").default(false),
  hasVideo: boolean("has_video").default(true),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull(),
  features: jsonb("features").default([]),
  maxCollaborators: integer("max_collaborators").default(1),
  downloadQuality: text("download_quality").default("standard"),
  platformUploads: boolean("platform_uploads").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  status: text("status").default("active"),
  currentPeriodStart: timestamp("current_period_start").defaultNow(),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streamingPlatforms = pgTable("streaming_platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  apiBaseCost: decimal("api_base_cost", { precision: 10, scale: 2 }).notNull(),
  oauthConfig: jsonb("oauth_config").default({}),
  uploadRequirements: jsonb("upload_requirements").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPlatformConnections = pgTable("user_platform_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platformId: integer("platform_id").notNull().references(() => streamingPlatforms.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  platformUserId: text("platform_user_id"),
  platformUsername: text("platform_username"),
  connectionStatus: text("connection_status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const uploadJobs = pgTable("upload_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recordingId: integer("recording_id").references(() => recordings.id),
  platformId: integer("platform_id").notNull().references(() => streamingPlatforms.id),
  uploadStatus: text("upload_status").default("pending"),
  platformTrackId: text("platform_track_id"),
  platformUrl: text("platform_url"),
  costUsed: decimal("cost_used", { precision: 10, scale: 2 }).default("0"),
  metadata: jsonb("metadata").default({}),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSongSchema = createInsertSchema(songs).omit({ id: true, createdAt: true });
export const insertUserSongSchema = createInsertSchema(userSongs).omit({ id: true, createdAt: true });
export const insertRecordingSchema = createInsertSchema(recordings).omit({ id: true, createdAt: true });
export const insertCollaborativeSessionSchema = createInsertSchema(collaborativeSessions).omit({ id: true, createdAt: true });
export const insertSessionParticipantSchema = createInsertSchema(sessionParticipants).omit({ id: true, joinedAt: true });
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUploadJobSchema = createInsertSchema(uploadJobs).omit({ id: true, createdAt: true, completedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type InsertUserSong = z.infer<typeof insertUserSongSchema>;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type InsertCollaborativeSession = z.infer<typeof insertCollaborativeSessionSchema>;
export type InsertSessionParticipant = z.infer<typeof insertSessionParticipantSchema>;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type InsertUploadJob = z.infer<typeof insertUploadJobSchema>;

export type User = typeof users.$inferSelect;
export type Song = typeof songs.$inferSelect;
export type UserSong = typeof userSongs.$inferSelect;
export type Recording = typeof recordings.$inferSelect;
export type CollaborativeSession = typeof collaborativeSessions.$inferSelect;
export type SessionParticipant = typeof sessionParticipants.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type StreamingPlatform = typeof streamingPlatforms.$inferSelect;
export type UserPlatformConnection = typeof userPlatformConnections.$inferSelect;
export type UploadJob = typeof uploadJobs.$inferSelect;
