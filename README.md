# Itone.studio - Sing Your Heart Out

A comprehensive karaoke platform with real-time collaboration, HD recording, and streaming platform integration.

## Features

- 🎤 **Massive Song Library** - Thousands of songs across all genres
- 🧠 **AI-Powered Recommendations** - Smart song suggestions via Genspark AI
- 🎥 **HD Recording** - Professional quality video and audio recording
- 🎯 **Real-time Vocal Coaching** - AI analysis and feedback during recording
- 👥 **Live Collaboration** - Sing with up to 4 friends simultaneously
- 🎵 **Key Transpose** - Adjust songs to your vocal range (-12 to +12 semitones)
- 🛡️ **Content Moderation** - AI-powered safety and quality checks
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔒 **Secure Authentication** - Email/password and Google OAuth
- 💎 **Subscription Tiers** - Silver, Gold, and Platinum plans
- 🌐 **Platform Integration** - Upload directly to Spotify, Apple Music, and more
- 🌍 **International** - Auto-detect country and language support

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI Integration**: Genspark AI Agent with real-time streaming
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Orchestration**: N8N workflow automation
- **Payments**: Stripe integration
- **Hosting**: Bolt Hosting with SSL
- **Real-time**: WebRTC for collaboration
- **Audio/Video**: MediaRecorder API, WebAudio API
- **Modular Architecture**: Independent modules for scalability

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development server: `npm run dev`

## Subscription Plans

### Silver ($9.99/month)
- Standard quality recording
- 2-person collaboration
- Basic audio effects
- Email support

### Gold ($19.99/month)
- HD quality recording
- 4-person collaboration
- Advanced audio effects
- Priority support

### Platinum ($53.99/month)
- Ultra HD recording
- 4-person collaboration
- Professional audio suite
- Platform uploads included
- 24/7 support

## Platform Integration

Platinum subscribers get integrated access to:
- Spotify
- Apple Music
- Amazon Music
- YouTube Music
- Deezer

All platform API costs are included in the Platinum subscription with 10 uploads per month.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

© 2025 iTone. All rights reserved.