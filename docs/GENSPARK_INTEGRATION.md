# Genspark AI Agent Integration Guide

This document provides comprehensive instructions for integrating the iTone Karaoke app with Genspark AI as an external agent via API calls.

## 🎯 Overview

The integration enables:
- **Smart song recommendations** based on user history and preferences
- **Real-time vocal coaching** during recording sessions
- **Content moderation** for uploads and chat messages
- **Performance analysis** with AI-powered insights
- **Personalized UI** adaptations and feature suggestions

## 🔧 Setup Instructions

### 1. Environment Configuration

Add these environment variables to your `.env` file:

```bash
# Genspark AI Configuration
VITE_GENSPARK_API_KEY=your_genspark_api_key_here
VITE_GENSPARK_BASE_URL=https://api.genspark.ai/v1
VITE_GENSPARK_TIMEOUT=30000
VITE_GENSPARK_RETRY_ATTEMPTS=3
VITE_GENSPARK_VERSION=1.0
```

### 2. N8N Orchestration Setup

Create these N8N workflows:

#### **Workflow 1: Song Recommendation Pipeline**
```json
{
  "name": "iTone-Genspark-Recommendations",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook",
      "endpoint": "/genspark/recommendations"
    },
    {
      "name": "Prepare User Context",
      "type": "javascript",
      "code": "// Aggregate user data for Genspark"
    },
    {
      "name": "Genspark AI Request",
      "type": "http",
      "url": "https://api.genspark.ai/v1/analyze",
      "method": "POST"
    },
    {
      "name": "Process Response",
      "type": "javascript",
      "code": "// Format AI response for frontend"
    }
  ]
}
```

#### **Workflow 2: Real-time Moderation**
```json
{
  "name": "iTone-Content-Moderation",
  "nodes": [
    {
      "name": "Content Upload Trigger",
      "type": "supabase",
      "table": "recordings"
    },
    {
      "name": "Genspark Moderation",
      "type": "http",
      "url": "https://api.genspark.ai/v1/moderate"
    },
    {
      "name": "Apply Moderation Results",
      "type": "supabase",
      "operation": "update"
    }
  ]
}
```

### 3. Backend API Endpoints

Create these Supabase Edge Functions:

#### **genspark-proxy/index.ts**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { type, data, userId, context } = await req.json()
  
  // Prepare request for Genspark
  const gensparkRequest = {
    type,
    data,
    context: {
      userId,
      timestamp: Date.now(),
      source: 'itone-karaoke',
      ...context
    }
  }

  // Forward to Genspark API
  const response = await fetch(Deno.env.get('GENSPARK_BASE_URL') + '/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('GENSPARK_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gensparkRequest)
  })

  const result = await response.json()
  
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
```

## 📊 API Request Examples

### Song Recommendations
```typescript
// Frontend usage
const aiRecommendations = useAIRecommendations();

await aiRecommendations.getSongRecommendations({
  mood: 'energetic',
  genre: 'rock',
  difficulty: 'medium'
});

// Genspark receives:
{
  "type": "recommendation",
  "data": {
    "type": "song_recommendation",
    "userHistory": {
      "recordedSongs": [...],
      "savedSongs": [...],
      "vocalAnalysis": {...}
    },
    "preferences": {
      "genres": ["rock"],
      "difficulty": "medium",
      "mood": "energetic"
    },
    "contextualData": {
      "timeOfDay": "afternoon",
      "location": "US"
    }
  },
  "context": {
    "userId": "user_123",
    "subscriptionTier": "platinum"
  }
}

// Genspark returns:
{
  "success": true,
  "data": {
    "recommendations": {
      "songs": [
        {
          "title": "Don't Stop Believin'",
          "artist": "Journey",
          "confidence": 0.92,
          "reasoning": "Matches your vocal range and energy preference",
          "difficulty": "medium",
          "youtube_url": "https://youtube.com/watch?v=..."
        }
      ]
    }
  },
  "confidence": 0.89,
  "metadata": {
    "modelUsed": "genspark-recommendations-v2",
    "processingTime": 1200
  }
}
```

### Real-time Vocal Analysis
```typescript
// During recording
const coaching = useRealTimeCoaching();

await coaching.analyzeVocalPerformance({
  pitch: 75,
  volume: 68,
  stability: 82,
  timestamp: Date.now()
});

// Genspark receives:
{
  "type": "analysis",
  "data": {
    "type": "vocal_analysis",
    "performanceData": {
      "pitch": [72, 75, 73, 76],
      "volume": [65, 68, 70, 66],
      "timing": [0.98, 0.95, 0.97],
      "stability": 82
    },
    "historicalData": [...] // Previous recordings for comparison
  }
}

// Genspark returns:
{
  "success": true,
  "data": {
    "analysis": {
      "vocalScore": {
        "overall": 78,
        "pitch": 82,
        "timing": 75,
        "expression": 70,
        "improvement": [
          "Try breathing deeper for better stability",
          "Focus on pitch accuracy in the chorus",
          "Great volume control - keep it up!"
        ]
      }
    }
  },
  "confidence": 0.85
}
```

### Content Moderation
```typescript
// Before upload
const moderation = useContentModeration();

const result = await moderation.moderateVideo(videoUrl, {
  sessionType: 'collaborative',
  platform: 'youtube'
});

// Genspark receives:
{
  "type": "moderation",
  "data": {
    "type": "content_moderation",
    "content": {
      "videoUrl": "https://storage.url/recording.mp4",
      "metadata": {
        "duration": 180,
        "participants": 2,
        "song": "Bohemian Rhapsody"
      }
    },
    "context": {
      "userId": "user_123",
      "sessionType": "collaborative",
      "platformDestination": "youtube"
    }
  }
}

// Genspark returns:
{
  "success": true,
  "data": {
    "moderation": {
      "approved": true,
      "flagged": [],
      "severity": "low",
      "suggestions": [
        "Great content! Ready for upload",
        "Consider adding captions for accessibility"
      ]
    }
  },
  "confidence": 0.94
}
```

## 🔒 Security & Authentication

### API Key Management
```typescript
// Environment-based configuration
const gensparkConfig = {
  apiKey: process.env.GENSPARK_API_KEY, // Server-side only
  publicKey: process.env.VITE_GENSPARK_PUBLIC_KEY, // Frontend safe
  webhook: process.env.GENSPARK_WEBHOOK_SECRET
};

// Request signing for security
const requestSignature = crypto
  .createHmac('sha256', gensparkConfig.webhook)
  .update(JSON.stringify(requestData))
  .digest('hex');
```

### Rate Limiting & Quotas
```typescript
// Built-in rate limiting
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkLimit(userId: string, maxRequests: number = 100): Promise<boolean> {
    const now = Date.now();
    const hourAgo = now - 3600000;
    
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(time => time > hourAgo);
    
    return recentRequests.length < maxRequests;
  }
}
```

## ⚡ Performance Optimizations

### Request Caching
```typescript
// Automatic response caching
const cacheConfig = {
  recommendations: 5 * 60 * 1000, // 5 minutes
  analysis: 2 * 60 * 1000, // 2 minutes  
  moderation: 1 * 60 * 1000, // 1 minute
  personalization: 15 * 60 * 1000 // 15 minutes
};
```

### Streaming Responses
```typescript
// Real-time AI coaching with streaming
await gensparkService.generateContentStream(
  coachingRequest,
  (chunk) => {
    if (chunk.type === 'data') {
      updateCoachingTip(chunk.content);
    }
  }
);
```

### Request Batching
```typescript
// Batch multiple requests for efficiency
const batchRequest = {
  requests: [
    { type: 'recommendation', data: songData },
    { type: 'analysis', data: performanceData },
    { type: 'moderation', data: contentData }
  ]
};
```

## 🎛️ N8N Workflow Integration

### Webhook Endpoints for N8N
```typescript
// N8N can trigger these endpoints:
POST /api/genspark/trigger-analysis
POST /api/genspark/batch-moderation  
POST /api/genspark/user-insights
POST /api/genspark/content-generation
```

### Sample N8N Workflow JSON
```json
{
  "name": "iTone-AI-Pipeline",
  "active": true,
  "staticData": {},
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "genspark-webhook",
        "responseMode": "onReceived"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "jsCode": "// Process iTone data for Genspark\nconst userData = items[0].json;\nreturn {\n  gensparkRequest: {\n    type: userData.type,\n    data: userData.data,\n    userId: userData.userId\n  }\n};"
      },
      "name": "Format Request",
      "type": "n8n-nodes-base.code"
    },
    {
      "parameters": {
        "url": "https://api.genspark.ai/v1/analyze",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.GENSPARK_API_KEY}}"
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "request",
              "value": "={{$json.gensparkRequest}}"
            }
          ]
        }
      },
      "name": "Genspark AI",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "parameters": {
        "jsCode": "// Format response for iTone\nconst aiResponse = items[0].json;\nreturn {\n  formatted: {\n    success: aiResponse.success,\n    recommendations: aiResponse.data.recommendations,\n    confidence: aiResponse.confidence\n  }\n};"
      },
      "name": "Format Response",
      "type": "n8n-nodes-base.code"
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Format Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 📈 Usage Examples

### Integration in Components
```typescript
// In SongLibrary component
import { SmartRecommendations } from '../modules/genspark';

<SmartRecommendations 
  maxResults={6}
  onSongSelect={(song) => openRecordingStudio(song)}
/>

// In RecordingStudio component  
import { RealTimeCoaching } from '../modules/genspark';

<RealTimeCoaching
  audioMetrics={currentAudioMetrics}
  isRecording={isRecording}
/>
```

### Error Handling
```typescript
import { GensparkErrorBoundary } from '../modules/genspark';

<GensparkErrorBoundary>
  <SmartRecommendations />
</GensparkErrorBoundary>
```

### Advanced Usage
```typescript
// Custom AI coaching with streaming
const { generateContent } = useGenspark();

await generateContent({
  type: 'vocal_coaching',
  sourceContent: { recordingUrl },
  parameters: { creativity: 0.7, difficulty: 'medium' }
}, true, (chunk) => {
  // Handle streaming AI response
  updateCoachingDisplay(chunk.content);
});
```

## 🔍 Testing

### Mock Genspark Responses
For development/testing without Genspark API:

```typescript
// Set environment variable
VITE_GENSPARK_MOCK_MODE=true

// Mock responses will be used automatically
const mockResponse = {
  success: true,
  data: {
    recommendations: {
      songs: [
        {
          title: "Don't Stop Believin'",
          artist: "Journey", 
          confidence: 0.89,
          reasoning: "Perfect for your vocal range and style"
        }
      ]
    }
  }
};
```

## 🚀 Production Deployment

### Scaling Considerations
- **Request batching** for efficiency
- **Response caching** with appropriate TTLs  
- **Rate limiting** per user/subscription tier
- **Error retry** with exponential backoff
- **Circuit breaker** pattern for API failures

### Monitoring
- Track API response times
- Monitor success/failure rates  
- User engagement with AI features
- Cost optimization based on usage patterns

### Security Checklist
- ✅ API keys in environment variables only
- ✅ Request signing for sensitive operations
- ✅ User data anonymization for AI requests
- ✅ Rate limiting and quota enforcement  
- ✅ Error logging without sensitive data

## 📋 API Reference

### Request Types
| Type | Purpose | Real-time | Cacheable |
|------|---------|-----------|-----------|
| `recommendation` | Song/style suggestions | No | Yes (5min) |
| `moderation` | Content safety check | Yes | No |
| `analysis` | Performance scoring | Yes | Yes (2min) |
| `personalization` | UI customization | No | Yes (15min) |
| `content_generation` | Lyrics/coaching | No | Yes (10min) |

### Response Format
All Genspark responses follow this structure:
```typescript
{
  success: boolean;
  data: any; // Type-specific response data
  confidence: number; // 0-1 confidence score
  reasoning?: string; // AI explanation
  suggestions?: string[]; // Additional tips
  metadata: {
    processingTime: number;
    modelUsed: string;
    requestId: string;
    cacheHit?: boolean;
  };
  error?: string; // Only present if success: false
}
```

This integration provides a robust, scalable AI layer that enhances the karaoke experience while maintaining performance and security standards.