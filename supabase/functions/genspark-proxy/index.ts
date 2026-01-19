import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-genspark-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, data, userId, context, priority = 'medium' } = await req.json();

    // Validate request
    if (!type || !data) {
      throw new Error('Missing required fields: type and data');
    }

    // Rate limiting check
    const rateLimitKey = `genspark_${userId}_${Math.floor(Date.now() / 3600000)}`; // Per hour
    const rateLimitStore = new Map<string, number>();
    const currentCount = rateLimitStore.get(rateLimitKey) || 0;
    
    const maxRequests = priority === 'high' ? 200 : priority === 'medium' ? 100 : 50;
    if (currentCount >= maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    rateLimitStore.set(rateLimitKey, currentCount + 1);

    // Prepare request for Genspark
    const gensparkRequest = {
      type,
      data,
      context: {
        userId,
        timestamp: Date.now(),
        source: 'itone-karaoke',
        version: '1.0',
        priority,
        ...context
      },
      metadata: {
        userAgent: req.headers.get('user-agent'),
        requestId: crypto.randomUUID(),
        environment: Deno.env.get('ENVIRONMENT') || 'development'
      }
    };

    // Add authentication headers
    const headers = {
      'Authorization': `Bearer ${Deno.env.get('GENSPARK_API_KEY')}`,
      'Content-Type': 'application/json',
      'X-API-Version': '1.0',
      'X-Request-Source': 'iTone-Karaoke',
      'X-User-Tier': context?.subscriptionTier || 'free'
    };

    // Forward to Genspark API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(Deno.env.get('GENSPARK_BASE_URL') + '/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(gensparkRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Genspark API error: ${response.status}`);
      }

      const result = await response.json();

      // Add metadata for debugging
      const enhancedResult = {
        ...result,
        metadata: {
          ...result.metadata,
          processingTime: Date.now() - gensparkRequest.context.timestamp,
          proxiedAt: new Date().toISOString(),
          rateLimitRemaining: maxRequests - currentCount - 1
        }
      };

      return new Response(
        JSON.stringify(enhancedResult),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Processing-Time': (Date.now() - gensparkRequest.context.timestamp).toString()
          }
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - Genspark took too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Genspark proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Proxy request failed',
        timestamp: new Date().toISOString(),
        retryable: !error.message?.includes('Rate limit')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message?.includes('Rate limit') ? 429 : 400,
      }
    );
  }
});