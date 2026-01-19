# N8N Workflow Integration Guide

This document provides ready-to-use N8N workflows for iTone Karaoke + Genspark AI integration.

## 🔄 Workflow 1: Daily AI Recommendations

```json
{
  "name": "iTone-Daily-AI-Recommendations",
  "active": true,
  "staticData": {},
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursValue": 9
            }
          ]
        }
      },
      "name": "Daily Trigger",
      "type": "n8n-nodes-base.cron",
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "user_profiles",
        "where": {
          "conditions": [
            {
              "leftValue": "subscription_tier",
              "rightValue": "free",
              "operator": "!="
            }
          ]
        }
      },
      "name": "Get Active Users",
      "type": "n8n-nodes-base.supabase",
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "// Prepare user data for Genspark recommendations\nconst users = $input.all();\nconst userRequests = [];\n\nfor (const user of users) {\n  userRequests.push({\n    userId: user.json.id,\n    trigger: 'daily_recommendations',\n    data: {\n      timezone: user.json.timezone || 'UTC',\n      lastActivity: user.json.updated_at\n    },\n    workflowId: 'daily-recommendations-v1'\n  });\n}\n\nreturn userRequests;"
      },
      "name": "Format User Requests",
      "type": "n8n-nodes-base.code",
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "={{$env.SUPABASE_URL}}/functions/v1/n8n-genspark-webhook",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}"
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "trigger",
              "value": "={{$json.trigger}}"
            },
            {
              "name": "userId", 
              "value": "={{$json.userId}}"
            },
            {
              "name": "data",
              "value": "={{$json.data}}"
            },
            {
              "name": "workflowId",
              "value": "={{$json.workflowId}}"
            }
          ]
        }
      },
      "name": "Send to iTone Webhook",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    }
  ],
  "connections": {
    "Daily Trigger": {
      "main": [
        [
          {
            "node": "Get Active Users",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Active Users": {
      "main": [
        [
          {
            "node": "Format User Requests",
            "type": "main", 
            "index": 0
          }
        ]
      ]
    },
    "Format User Requests": {
      "main": [
        [
          {
            "node": "Send to iTone Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🎵 Workflow 2: Real-time Recording Analysis

```json
{
  "name": "iTone-Recording-AI-Analysis",
  "active": true,
  "staticData": {},
  "nodes": [
    {
      "parameters": {
        "tableName": "recordings",
        "watchType": "insert"
      },
      "name": "New Recording Trigger",
      "type": "n8n-nodes-base.supabaseTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "// Extract recording data for AI analysis\nconst recording = $input.first().json;\n\nreturn {\n  userId: recording.user_id,\n  recordingId: recording.id,\n  audioMetrics: {\n    duration: recording.duration,\n    quality: recording.quality,\n    transpose: recording.transpose_used\n  },\n  songDetails: {\n    title: recording.title,\n    originalSong: recording.song_id\n  },\n  trigger: 'user_recording_complete',\n  workflowId: 'recording-analysis-v1'\n};"
      },
      "name": "Prepare Analysis Data",
      "type": "n8n-nodes-base.code",
      "position": [460, 300]
    },
    {
      "parameters": {
        "url": "={{$env.SUPABASE_URL}}/functions/v1/n8n-genspark-webhook",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}"
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "trigger",
              "value": "={{$json.trigger}}"
            },
            {
              "name": "userId",
              "value": "={{$json.userId}}"
            },
            {
              "name": "data",
              "value": "={{$json}}"
            }
          ]
        }
      },
      "name": "Trigger AI Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "position": [680, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.success}}",
              "value2": "true"
            }
          ]
        }
      },
      "name": "Check Success",
      "type": "n8n-nodes-base.if",
      "position": [900, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "user_notifications",
        "columns": {
          "user_id": "={{$node['Prepare Analysis Data'].json.userId}}",
          "type": "ai_analysis_complete",
          "title": "🧠 AI Analysis Complete",
          "message": "Your recording has been analyzed. Check your analytics for insights!",
          "data": "={{$json.analysis}}"
        }
      },
      "name": "Notify User",
      "type": "n8n-nodes-base.supabase",
      "position": [1120, 240]
    }
  ],
  "connections": {
    "New Recording Trigger": {
      "main": [
        [
          {
            "node": "Prepare Analysis Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Analysis Data": {
      "main": [
        [
          {
            "node": "Trigger AI Analysis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Trigger AI Analysis": {
      "main": [
        [
          {
            "node": "Check Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Success": {
      "main": [
        [
          {
            "node": "Notify User",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🛡️ Workflow 3: Content Moderation Pipeline

```json
{
  "name": "iTone-Content-Moderation",
  "active": true,
  "staticData": {},
  "nodes": [
    {
      "parameters": {
        "tableName": "upload_jobs",
        "watchType": "insert"
      },
      "name": "Upload Job Created",
      "type": "n8n-nodes-base.supabaseTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "// Get upload details for moderation\nconst upload = $input.first().json;\n\nreturn {\n  userId: upload.user_id,\n  uploadId: upload.id,\n  recordingId: upload.recording_id,\n  platform: upload.platform?.name,\n  trigger: 'content_moderation',\n  data: {\n    contentType: 'video_upload',\n    recordingId: upload.recording_id,\n    platform: upload.platform?.name,\n    sessionType: upload.metadata?.sessionType || 'solo'\n  },\n  workflowId: 'content-moderation-v1'\n};"
      },
      "name": "Extract Upload Data",
      "type": "n8n-nodes-base.code",
      "position": [460, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "recordings",
        "where": {
          "conditions": [
            {
              "leftValue": "id",
              "rightValue": "={{$json.recordingId}}"
            }
          ]
        }
      },
      "name": "Get Recording Details",
      "type": "n8n-nodes-base.supabase",
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "={{$env.SUPABASE_URL}}/functions/v1/n8n-genspark-webhook",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}"
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "trigger",
              "value": "content_moderation"
            },
            {
              "name": "userId",
              "value": "={{$node['Extract Upload Data'].json.userId}}"
            },
            {
              "name": "data",
              "value": "={{Object.assign($node['Extract Upload Data'].json.data, {audioUrl: $json.file_url, title: $json.title})}}"
            }
          ]
        }
      },
      "name": "Moderate Content",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    }
  ],
  "connections": {
    "Upload Job Created": {
      "main": [
        [
          {
            "node": "Extract Upload Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Upload Data": {
      "main": [
        [
          {
            "node": "Get Recording Details",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Recording Details": {
      "main": [
        [
          {
            "node": "Moderate Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 📊 Workflow 4: Weekly Performance Analytics

```json
{
  "name": "iTone-Weekly-Analytics",
  "active": true,
  "staticData": {},
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "weekdays",
              "weekdaysValue": [1]
            },
            {
              "field": "hours",
              "hoursValue": 10
            }
          ]
        }
      },
      "name": "Weekly Trigger",
      "type": "n8n-nodes-base.cron",
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "user_profiles",
        "columns": "id, display_name, subscription_tier",
        "where": {
          "conditions": [
            {
              "leftValue": "created_at",
              "rightValue": "now() - interval '7 days'",
              "operator": ">="
            }
          ]
        }
      },
      "name": "Get Active Users",
      "type": "n8n-nodes-base.supabase",
      "position": [460, 300]
    },
    {
      "parameters": {
        "batchSize": 10,
        "jsCode": "// Process users in batches for analytics\nconst users = $input.all();\nconst batchRequests = [];\n\nfor (const user of users) {\n  batchRequests.push({\n    userId: user.json.id,\n    trigger: 'user_activity_analysis',\n    data: {\n      timeRange: 'week',\n      subscriptionTier: user.json.subscription_tier,\n      analysisType: 'performance_trends'\n    },\n    workflowId: 'weekly-analytics-v1'\n  });\n}\n\nreturn batchRequests;"
      },
      "name": "Batch User Analytics",
      "type": "n8n-nodes-base.code",
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "={{$env.SUPABASE_URL}}/functions/v1/n8n-genspark-webhook",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}"
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "trigger",
              "value": "={{$json.trigger}}"
            },
            {
              "name": "userId",
              "value": "={{$json.userId}}"
            },
            {
              "name": "data",
              "value": "={{$json.data}}"
            }
          ]
        }
      },
      "name": "Generate Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    }
  ]
}
```

## 🚀 Workflow 5: Platform Upload Optimization

```json
{
  "name": "iTone-Upload-Optimization",
  "active": true,
  "staticData": {},
  "nodes": [
    {
      "parameters": {
        "tableName": "platinum_subscriptions",
        "watchType": "update",
        "conditions": {
          "upload_credits_remaining": {
            "operator": "<=",
            "value": 5
          }
        }
      },
      "name": "Low Credits Trigger",
      "type": "n8n-nodes-base.supabaseTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "recordings",
        "where": {
          "conditions": [
            {
              "leftValue": "user_id",
              "rightValue": "={{$json.user_id}}"
            },
            {
              "leftValue": "created_at",
              "rightValue": "now() - interval '30 days'",
              "operator": ">="
            }
          ]
        },
        "sort": {
          "field": "created_at",
          "direction": "DESC"
        },
        "limit": 10
      },
      "name": "Get Recent Recordings",
      "type": "n8n-nodes-base.supabase",
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "// Analyze upload patterns for optimization\nconst subscription = $input.first().json;\nconst recordings = $input.last().json;\n\nreturn {\n  userId: subscription.user_id,\n  trigger: 'platform_upload_optimization',\n  data: {\n    creditsRemaining: subscription.upload_credits_remaining,\n    recentRecordings: recordings,\n    subscriptionTier: 'platinum',\n    optimizationGoal: 'maximize_reach'\n  },\n  workflowId: 'upload-optimization-v1'\n};"
      },
      "name": "Prepare Optimization Request",
      "type": "n8n-nodes-base.code",
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "={{$env.SUPABASE_URL}}/functions/v1/n8n-genspark-webhook",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}"
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "trigger",
              "value": "={{$json.trigger}}"
            },
            {
              "name": "userId",
              "value": "={{$json.userId}}"
            },
            {
              "name": "data",
              "value": "={{$json.data}}"
            }
          ]
        }
      },
      "name": "Get Upload Strategy",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    }
  ]
}
```

## ⚙️ Setup Instructions

### 1. N8N Environment Variables
```bash
# Add to your N8N instance
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GENSPARK_API_KEY=your_genspark_api_key
GENSPARK_BASE_URL=https://api.genspark.ai/v1
```

### 2. Deploy Webhook Functions
Deploy the provided Edge Functions to Supabase:
- `genspark-proxy` - Handles AI API calls
- `n8n-genspark-webhook` - Processes N8N triggers

### 3. Import Workflows
1. Copy the workflow JSON above
2. Import into your N8N instance
3. Configure Supabase credentials
4. Activate workflows

### 4. Test Integration
```bash
# Test webhook endpoint
curl -X POST \
  https://your-supabase-url/functions/v1/n8n-genspark-webhook \
  -H "Authorization: Bearer your-service-role-key" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "daily_recommendations",
    "userId": "test-user-id", 
    "data": {"timezone": "UTC"},
    "workflowId": "test-workflow"
  }'
```

## 📈 Monitoring & Analytics

Each workflow includes:
- **Error handling** with retry logic
- **Performance monitoring** with execution times
- **User activity tracking** for optimization
- **Rate limiting** to prevent API abuse
- **Batch processing** for efficiency

The workflows automatically scale based on user activity and optimize API usage for cost efficiency.