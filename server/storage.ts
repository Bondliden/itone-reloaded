import { db } from "./db";
import { eq, and, like, or, desc } from "drizzle-orm";
import {
  users,
  songs,
  userSongs,
  recordings,
  collaborativeSessions,
  sessionParticipants,
  subscriptionPlans,
  userSubscriptions,
  streamingPlatforms,
  userPlatformConnections,
  uploadJobs,
  type User,
  type Song,
  type UserSong,
  type Recording,
  type CollaborativeSession,
  type SessionParticipant,
  type SubscriptionPlan,
  type UserSubscription,
  type StreamingPlatform,
  type UserPlatformConnection,
  type UploadJob,
  type InsertUser,
  type InsertSong,
  type InsertUserSong,
  type InsertRecording,
  type InsertCollaborativeSession,
  type InsertSessionParticipant,
  type InsertUserSubscription,
  type InsertUploadJob,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  getSongs(search?: string, genre?: string): Promise<Song[]>;
  getSong(id: number): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;

  getUserSongs(userId: number): Promise<UserSong[]>;
  addUserSong(userSong: InsertUserSong): Promise<UserSong>;
  removeUserSong(userId: number, songId: number): Promise<void>;

  getRecordings(userId: number): Promise<Recording[]>;
  getRecording(id: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  deleteRecording(id: number): Promise<void>;

  getCollaborativeSession(id: number): Promise<CollaborativeSession | undefined>;
  getCollaborativeSessionByCode(code: string): Promise<CollaborativeSession | undefined>;
  createCollaborativeSession(session: InsertCollaborativeSession): Promise<CollaborativeSession>;
  updateCollaborativeSession(id: number, data: Partial<InsertCollaborativeSession>): Promise<CollaborativeSession | undefined>;
  getSessionParticipants(sessionId: number): Promise<SessionParticipant[]>;
  addSessionParticipant(participant: InsertSessionParticipant): Promise<SessionParticipant>;
  removeSessionParticipant(sessionId: number, userId: number): Promise<void>;

  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getUserSubscription(userId: number): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;

  getStreamingPlatforms(): Promise<StreamingPlatform[]>;
  getUserPlatformConnections(userId: number): Promise<UserPlatformConnection[]>;
  getUploadJobs(userId: number): Promise<UploadJob[]>;
  createUploadJob(job: InsertUploadJob): Promise<UploadJob>;
  updateUploadJob(id: number, data: Partial<InsertUploadJob>): Promise<UploadJob | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set({ ...user, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return updated;
  }

  async getSongs(search?: string, genre?: string): Promise<Song[]> {
    let query = db.select().from(songs);
    
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      query = query.where(
        or(
          like(songs.title, searchTerm),
          like(songs.artist, searchTerm)
        )
      ) as typeof query;
    }
    
    if (genre) {
      query = query.where(eq(songs.genre, genre)) as typeof query;
    }
    
    return await query;
  }

  async getSong(id: number): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song;
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values(song).returning();
    return newSong;
  }

  async getUserSongs(userId: number): Promise<UserSong[]> {
    return await db.select().from(userSongs).where(eq(userSongs.userId, userId));
  }

  async addUserSong(userSong: InsertUserSong): Promise<UserSong> {
    const [newUserSong] = await db.insert(userSongs).values(userSong).returning();
    return newUserSong;
  }

  async removeUserSong(userId: number, songId: number): Promise<void> {
    await db.delete(userSongs).where(and(eq(userSongs.userId, userId), eq(userSongs.songId, songId)));
  }

  async getRecordings(userId: number): Promise<Recording[]> {
    return await db.select().from(recordings).where(eq(recordings.userId, userId)).orderBy(desc(recordings.createdAt));
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    const [recording] = await db.select().from(recordings).where(eq(recordings.id, id));
    return recording;
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    const [newRecording] = await db.insert(recordings).values(recording).returning();
    return newRecording;
  }

  async deleteRecording(id: number): Promise<void> {
    await db.delete(recordings).where(eq(recordings.id, id));
  }

  async getCollaborativeSession(id: number): Promise<CollaborativeSession | undefined> {
    const [session] = await db.select().from(collaborativeSessions).where(eq(collaborativeSessions.id, id));
    return session;
  }

  async getCollaborativeSessionByCode(code: string): Promise<CollaborativeSession | undefined> {
    const [session] = await db.select().from(collaborativeSessions).where(
      and(eq(collaborativeSessions.sessionCode, code), eq(collaborativeSessions.isActive, true))
    );
    return session;
  }

  async createCollaborativeSession(session: InsertCollaborativeSession): Promise<CollaborativeSession> {
    const [newSession] = await db.insert(collaborativeSessions).values(session).returning();
    return newSession;
  }

  async updateCollaborativeSession(id: number, data: Partial<InsertCollaborativeSession>): Promise<CollaborativeSession | undefined> {
    const [updated] = await db.update(collaborativeSessions).set(data).where(eq(collaborativeSessions.id, id)).returning();
    return updated;
  }

  async getSessionParticipants(sessionId: number): Promise<SessionParticipant[]> {
    return await db.select().from(sessionParticipants).where(eq(sessionParticipants.sessionId, sessionId));
  }

  async addSessionParticipant(participant: InsertSessionParticipant): Promise<SessionParticipant> {
    const [newParticipant] = await db.insert(sessionParticipants).values(participant).returning();
    return newParticipant;
  }

  async removeSessionParticipant(sessionId: number, userId: number): Promise<void> {
    await db.delete(sessionParticipants).where(
      and(eq(sessionParticipants.sessionId, sessionId), eq(sessionParticipants.userId, userId))
    );
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getUserSubscription(userId: number): Promise<UserSubscription | undefined> {
    const [subscription] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId));
    return subscription;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [newSubscription] = await db.insert(userSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateUserSubscription(id: number, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [updated] = await db.update(userSubscriptions).set({ ...data, updatedAt: new Date() }).where(eq(userSubscriptions.id, id)).returning();
    return updated;
  }

  async getStreamingPlatforms(): Promise<StreamingPlatform[]> {
    return await db.select().from(streamingPlatforms).where(eq(streamingPlatforms.isActive, true));
  }

  async getUserPlatformConnections(userId: number): Promise<UserPlatformConnection[]> {
    return await db.select().from(userPlatformConnections).where(eq(userPlatformConnections.userId, userId));
  }

  async getUploadJobs(userId: number): Promise<UploadJob[]> {
    return await db.select().from(uploadJobs).where(eq(uploadJobs.userId, userId)).orderBy(desc(uploadJobs.createdAt));
  }

  async createUploadJob(job: InsertUploadJob): Promise<UploadJob> {
    const [newJob] = await db.insert(uploadJobs).values(job).returning();
    return newJob;
  }

  async updateUploadJob(id: number, data: Partial<InsertUploadJob>): Promise<UploadJob | undefined> {
    const [updated] = await db.update(uploadJobs).set(data).where(eq(uploadJobs.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
