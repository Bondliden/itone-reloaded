import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    const { trigger, userId, data, workflowId } = webhookData;

    console.log(`N8N webhook received: ${trigger} for user ${userId}`);

    // Route to appropriate handler based on trigger
    switch (trigger) {
      case 'user_recording_complete':
        await handleRecordingAnalysis(supabase, userId, data);
        break;
        
      case 'daily_recommendations':
        await handleDailyRecommendations(supabase, userId, data);
        break;
        
      case 'content_moderation':
        await handleContentModeration(supabase, userId, data);
        break;
        
      case 'user_activity_analysis':
        await handleUserAnalytics(supabase, userId, data);
        break;
        
      case 'platform_upload_optimization':
        await handleUploadOptimization(supabase, userId, data);
        break;
        
      default:
        console.warn(`Unknown webhook trigger: ${trigger}`);
    }

    // Log webhook activity for analytics
    await supabase
      .from('webhook_logs')
      .insert({
        trigger,
        user_id: userId,
        workflow_id: workflowId,
        data: data,
        processed_at: new Date().toISOString(),
        status: 'success'
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        trigger,
        processed_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('N8N webhook error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Handler functions for different N8N triggers
async function handleRecordingAnalysis(supabase: any, userId: string, data: any) {
  // Trigger Genspark analysis for completed recording
  const analysisRequest = {
    type: 'vocal_analysis',
    userId,
    data: {
      recordingId: data.recordingId,
      audioMetrics: data.audioMetrics,
      songDetails: data.songDetails
    },
    priority: 'medium'
  };

  // Forward to Genspark via internal API
  const gensparkResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/genspark-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(analysisRequest)
  });

  const analysis = await gensparkResponse.json();
  
  // Store analysis results
  if (analysis.success) {
    await supabase
      .from('recording_analyses')
      .upsert({
        recording_id: data.recordingId,
        user_id: userId,
        ai_score: analysis.data.analysis?.vocalScore?.overall || 0,
        improvements: analysis.data.analysis?.vocalScore?.improvement || [],
        confidence: analysis.confidence,
        analyzed_at: new Date().toISOString()
      });
  }
}

async function handleDailyRecommendations(supabase: any, userId: string, data: any) {
  // Generate daily personalized recommendations
  const userProfile = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const userHistory = await supabase
    .from('recordings')
    .select('*, song:songs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const recommendationRequest = {
    type: 'recommendation',
    userId,
    data: {
      type: 'daily_suggestions',
      userProfile: userProfile.data,
      recentHistory: userHistory.data,
      timeContext: {
        dayOfWeek: new Date().getDay(),
        hour: new Date().getHours(),
        timezone: data.timezone || 'UTC'
      }
    },
    priority: 'low'
  };

  // Get recommendations from Genspark
  const gensparkResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/genspark-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(recommendationRequest)
  });

  const recommendations = await gensparkResponse.json();
  
  // Store recommendations for user
  if (recommendations.success && recommendations.data?.recommendations?.songs) {
    await supabase
      .from('user_recommendations')
      .upsert({
        user_id: userId,
        recommendations: recommendations.data.recommendations.songs,
        generated_at: new Date().toISOString(),
        context: 'daily_suggestions',
        confidence: recommendations.confidence
      });
  }
}

async function handleContentModeration(supabase: any, userId: string, data: any) {
  // Moderate user-generated content
  const moderationRequest = {
    type: 'moderation',
    userId,
    data: {
      type: 'content_moderation',
      content: {
        text: data.text,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl
      },
      context: {
        sessionType: data.sessionType || 'solo',
        platformDestination: data.platform
      }
    },
    priority: 'high'
  };

  const gensparkResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/genspark-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(moderationRequest)
  });

  const moderation = await gensparkResponse.json();
  
  // Apply moderation results
  if (moderation.success) {
    const moderationResult = moderation.data.moderation;
    
    if (!moderationResult.approved) {
      // Take action on flagged content
      await supabase
        .from('content_flags')
        .insert({
          user_id: userId,
          content_type: data.contentType,
          content_id: data.contentId,
          flags: moderationResult.flagged,
          severity: moderationResult.severity,
          auto_actions: moderationResult.autoActions || [],
          flagged_at: new Date().toISOString()
        });
      
      // Notify user if needed
      if (moderationResult.severity === 'high') {
        await supabase
          .from('user_notifications')
          .insert({
            user_id: userId,
            type: 'content_moderation',
            title: 'Content Review Required',
            message: 'Your recent upload needs review before publication.',
            data: { suggestions: moderationResult.suggestions }
          });
      }
    }
  }
}

async function handleUserAnalytics(supabase: any, userId: string, data: any) {
  // Analyze user behavior and performance trends
  const analyticsRequest = {
    type: 'analysis',
    userId,
    data: {
      type: 'user_behavior_analysis',
      behaviorData: data.behaviorData,
      performanceHistory: data.performanceHistory,
      timeRange: data.timeRange || 'month'
    },
    priority: 'low'
  };

  const gensparkResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/genspark-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(analyticsRequest)
  });

  const analytics = await gensparkResponse.json();
  
  // Store analytics insights
  if (analytics.success) {
    await supabase
      .from('user_analytics')
      .upsert({
        user_id: userId,
        insights: analytics.data.analysis,
        confidence: analytics.confidence,
        period: data.timeRange || 'month',
        generated_at: new Date().toISOString()
      });
  }
}

async function handleUploadOptimization(supabase: any, userId: string, data: any) {
  // Optimize platform upload strategy
  const optimizationRequest = {
    type: 'recommendation',
    userId,
    data: {
      type: 'platform_optimization',
      recording: data.recording,
      targetAudience: data.targetAudience,
      budget: data.budget,
      goals: data.goals
    },
    priority: 'medium'
  };

  const gensparkResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/genspark-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(optimizationRequest)
  });

  const optimization = await gensparkResponse.json();
  
  // Store optimization suggestions
  if (optimization.success && optimization.data?.recommendations?.platforms) {
    await supabase
      .from('upload_optimizations')
      .insert({
        user_id: userId,
        recording_id: data.recording.id,
        platform_recommendations: optimization.data.recommendations.platforms,
        confidence: optimization.confidence,
        generated_at: new Date().toISOString()
      });
  }
}