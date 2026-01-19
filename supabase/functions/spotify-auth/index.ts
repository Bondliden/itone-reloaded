import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const url = new URL(req.url);
    const path = url.pathname;

    // Spotify OAuth configuration
    const client_id = Deno.env.get('SPOTIFY_CLIENT_ID') || '';
    const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET') || '';
    const redirect_uri = 'https://itone.rocks';

    if (path.endsWith('/login')) {
      // Step 1: Redirect user to Spotify authorization
      const scope = 'user-read-private user-read-email user-library-modify streaming playlist-modify-public';
      const state = url.searchParams.get('user_id') || 'unknown';
      
      const authUrl = 'https://accounts.spotify.com/authorize?' + 
        new URLSearchParams({
          response_type: 'code',
          client_id: client_id,
          scope: scope,
          redirect_uri: redirect_uri,
          state: state
        }).toString();

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': authUrl
        }
      });
    }

    if (path.endsWith('/callback')) {
      // Step 2: Handle callback and request access token
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state'); // This contains user_id
      
      if (!code) {
        throw new Error('Authorization code not provided');
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();

      // Get user profile from Spotify
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to get Spotify profile');
      }

      const profile = await profileResponse.json();

      // Get platform ID for Spotify
      const { data: platform } = await supabase
        .from('streaming_platforms')
        .select('id')
        .eq('name', 'spotify')
        .single();

      if (!platform) {
        throw new Error('Spotify platform not found');
      }

      // Save connection to database
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
      
      const { error } = await supabase
        .from('user_platform_connections')
        .upsert({
          user_id: state,
          platform_id: platform.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          platform_user_id: profile.id,
          platform_username: profile.display_name || profile.id,
          connection_status: 'active'
        });

      if (error) {
        throw new Error(`Failed to save connection: ${error.message}`);
      }

      // Redirect back to dashboard with success
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${url.origin}/dashboard?spotify_connected=true`
        }
      });
    }

    // Default response
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );

  } catch (error) {
    console.error('Spotify auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});