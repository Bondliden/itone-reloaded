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

    const { uploadJobId } = await req.json();

    // Get upload job details
    const { data: uploadJob, error: jobError } = await supabase
      .from('upload_jobs')
      .select(`
        *,
        platform:streaming_platforms(*),
        recording:recordings(*),
        user_connection:user_platform_connections!inner(*)
      `)
      .eq('id', uploadJobId)
      .single();

    if (jobError || !uploadJob) {
      throw new Error('Upload job not found');
    }

    // Update status to processing
    await supabase
      .from('upload_jobs')
      .update({ upload_status: 'processing' })
      .eq('id', uploadJobId);

    try {
      // Simulate platform upload based on platform type
      let uploadResult;
      
      switch (uploadJob.platform.name) {
        case 'spotify':
          uploadResult = await uploadToSpotify(uploadJob);
          break;
        case 'amazon_music':
          uploadResult = await uploadToAmazonMusic(uploadJob);
          break;
        case 'apple_music':
          uploadResult = await uploadToAppleMusic(uploadJob);
          break;
        case 'youtube_music':
          uploadResult = await uploadToYouTubeMusic(uploadJob);
          break;
        case 'deezer':
          uploadResult = await uploadToDeezer(uploadJob);
          break;
        default:
          throw new Error(`Unsupported platform: ${uploadJob.platform.name}`);
      }

      // Update job with success
      await supabase
        .from('upload_jobs')
        .update({
          upload_status: 'completed',
          platform_track_id: uploadResult.trackId,
          platform_url: uploadResult.url,
          cost_used: uploadJob.platform.api_base_cost,
          completed_at: new Date().toISOString()
        })
        .eq('id', uploadJobId);

      // Deduct upload credit
      await supabase
        .from('platinum_subscriptions')
        .update({
          upload_credits_remaining: uploadJob.user_connection.upload_credits_remaining - 1
        })
        .eq('user_id', uploadJob.user_id);

      return new Response(
        JSON.stringify({ success: true, result: uploadResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (uploadError) {
      // Update job with failure
      await supabase
        .from('upload_jobs')
        .update({
          upload_status: 'failed',
          error_message: uploadError.message
        })
        .eq('id', uploadJobId);

      throw uploadError;
    }

  } catch (error) {
    console.error('Platform upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Platform-specific upload functions (mock implementations)
async function uploadToSpotify(uploadJob: any) {
  // Simulate Spotify API upload
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    trackId: `spotify_${Math.random().toString(36).substr(2, 9)}`,
    url: `https://open.spotify.com/track/${Math.random().toString(36).substr(2, 9)}`,
    platform: 'spotify'
  };
}

async function uploadToAmazonMusic(uploadJob: any) {
  // Simulate Amazon Music API upload
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    trackId: `amazon_${Math.random().toString(36).substr(2, 9)}`,
    url: `https://music.amazon.com/tracks/${Math.random().toString(36).substr(2, 9)}`,
    platform: 'amazon_music'
  };
}

async function uploadToAppleMusic(uploadJob: any) {
  // Simulate Apple Music API upload
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  return {
    trackId: `apple_${Math.random().toString(36).substr(2, 9)}`,
    url: `https://music.apple.com/track/${Math.random().toString(36).substr(2, 9)}`,
    platform: 'apple_music'
  };
}

async function uploadToYouTubeMusic(uploadJob: any) {
  // Simulate YouTube Music API upload
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  return {
    trackId: `youtube_${Math.random().toString(36).substr(2, 9)}`,
    url: `https://music.youtube.com/watch?v=${Math.random().toString(36).substr(2, 9)}`,
    platform: 'youtube_music'
  };
}

async function uploadToDeezer(uploadJob: any) {
  // Simulate Deezer API upload
  await new Promise(resolve => setTimeout(resolve, 2200));
  
  return {
    trackId: `deezer_${Math.random().toString(36).substr(2, 9)}`,
    url: `https://www.deezer.com/track/${Math.random().toString(36).substr(2, 9)}`,
    platform: 'deezer'
  };
}