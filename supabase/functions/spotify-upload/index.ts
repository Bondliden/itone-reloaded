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

    // Get upload job with platform connection
    const { data: uploadJob, error: jobError } = await supabase
      .from('upload_jobs')
      .select(`
        *,
        platform:streaming_platforms(*),
        recording:recordings(*),
        user_connection:user_platform_connections!inner(*)
      `)
      .eq('id', uploadJobId)
      .eq('user_platform_connections.platform_id', 'platform_id')
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
      // Get fresh access token (refresh if needed)
      const accessToken = await refreshSpotifyToken(uploadJob.user_connection, supabase);

      // Upload to Spotify
      const uploadResult = await uploadToSpotify(uploadJob, accessToken);

      // Update job with success
      await supabase
        .from('upload_jobs')
        .update({
          upload_status: 'completed',
          platform_track_id: uploadResult.trackId,
          platform_url: uploadResult.url,
          cost_used: uploadJob.platform.api_base_cost,
          completed_at: new Date().toISOString(),
          metadata: { ...uploadJob.metadata, spotify_response: uploadResult }
        })
        .eq('id', uploadJobId);

      // Deduct upload credit from Platinum subscription
      await supabase
        .from('platinum_subscriptions')
        .update({
          upload_credits_remaining: Math.max(0, uploadJob.upload_credits_remaining - 1)
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
    console.error('Spotify upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function refreshSpotifyToken(connection: any, supabase: any) {
  const now = new Date();
  const expiresAt = new Date(connection.token_expires_at);

  // If token expires within 5 minutes, refresh it
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const client_id = Deno.env.get('SPOTIFY_CLIENT_ID') || '';
    const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET') || '';

    const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token
      })
    });

    if (refreshResponse.ok) {
      const tokenData = await refreshResponse.json();
      const newExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

      // Update connection with new token
      await supabase
        .from('user_platform_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || connection.refresh_token,
          token_expires_at: newExpiresAt
        })
        .eq('id', connection.id);

      return tokenData.access_token;
    }
  }

  return connection.access_token;
}

async function uploadToSpotify(uploadJob: any, accessToken: string) {
  // Step 1: Create a playlist for the upload (if not exists)
  const playlistResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'iTone Karaoke Recordings',
      description: 'My karaoke recordings from iTone',
      public: false
    })
  });

  let playlistId;
  if (playlistResponse.ok) {
    const playlist = await playlistResponse.json();
    playlistId = playlist.id;
  } else {
    // Try to find existing playlist
    const existingPlaylistsResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (existingPlaylistsResponse.ok) {
      const playlists = await existingPlaylistsResponse.json();
      const karaokePlaylist = playlists.items.find((p: any) => p.name === 'iTone Karaoke Recordings');
      playlistId = karaokePlaylist?.id;
    }
  }

  // Note: Spotify doesn't allow direct audio file uploads via API
  // In a real implementation, this would require Spotify for Podcasters or similar service
  // For demo purposes, we'll simulate the upload process
  
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate upload time

  // Generate mock response
  const trackId = `spotify_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    trackId: trackId,
    url: `https://open.spotify.com/track/${trackId}`,
    playlistId: playlistId,
    platform: 'spotify',
    uploadedAt: new Date().toISOString()
  };
}