# iTone Karaoke

A full-stack karaoke application with AI-powered recommendations, real-time collaboration, and professional recording capabilities.

## Overview

iTone Karaoke is a modern karaoke platform that allows users to:
- Browse and search a library of songs
- Record their performances with advanced audio effects
- Collaborate with friends in real-time sessions (up to 4 people)
- Upload recordings to streaming platforms (Spotify, YouTube Music, etc.)
- Subscribe to different tiers for premium features

## Architecture

### Backend (Express + TypeScript)
- **Server**: Express.js running on port 5000
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with Google OAuth
- **Payments**: Stripe integration for subscriptions

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with Radix UI components
- **Mobile**: Capacitor for iOS/Android builds

### Key Files
- `server/index.ts` - Main Express server with Passport authentication
- `server/routes.ts` - API route handlers
- `server/storage.ts` - Database storage layer using Drizzle
- `shared/schema.ts` - Database schema definitions
- `src/App.tsx` - React application entry point
- `src/pages/` - Page components (Home, Auth, Dashboard)
- `src/components/` - Reusable UI components

## Database Schema

### Core Tables
- `users` - User profiles with subscription tier
- `songs` - Song library with metadata
- `user_songs` - User's saved songs with transpose settings
- `recordings` - User recordings
- `collaborative_sessions` - Live collaboration sessions
- `session_participants` - Session participant tracking

### Subscription Tables
- `subscription_plans` - Available subscription tiers (Silver, Gold, Pro, Platinum)
- `user_subscriptions` - User subscription records with Stripe integration

### Platform Integration Tables
- `streaming_platforms` - Supported platforms (Spotify, YouTube Music, etc.)
- `user_platform_connections` - OAuth connections to platforms
- `upload_jobs` - Track platform upload jobs

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)

### Optional (for full functionality)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `STRIPE_SECRET_KEY` - Stripe API key for payments
- `SESSION_SECRET` - Express session secret

## Development

### Run Development Server
```bash
npm run dev
```

### Push Database Schema
```bash
npm run db:push
```

### Build for Production
```bash
npm run build
```

## Recent Changes

- **Jan 2026**: Migrated from Supabase to Replit PostgreSQL (Neon)
- Converted Supabase Edge Functions to Express routes
- Set up Drizzle ORM for database operations
- Configured Vite + Express integration for development
