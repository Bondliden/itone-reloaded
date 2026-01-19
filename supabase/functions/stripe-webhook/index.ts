import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret');
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Check if this is a Platinum integrated subscription
        const isPlatinumIntegrated = session.metadata?.plan_type === 'platinum_integrated';
        
        if (isPlatinumIntegrated) {
          // Create Platinum subscription with integrated pricing
          const { error } = await supabase
            .from('platinum_subscriptions')
            .upsert({
              user_id: session.metadata?.user_id,
              stripe_subscription_id: subscription.id,
              base_subscription_cost: parseFloat(session.metadata?.base_cost || '29.99'),
              platform_access_cost: parseFloat(session.metadata?.platform_costs || '15.00'),
              itone_margin: parseFloat(session.metadata?.itone_margin || '9.00'),
              total_monthly_cost: parseFloat(session.metadata?.total_cost || '53.99'),
              upload_credits_remaining: 10,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });

          if (error) {
            console.error('Error creating Platinum subscription:', error);
          }
        } else {
          // Regular subscription update
          const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            });

          if (error) {
            console.error('Error updating subscription:', error);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Check if this is a Platinum subscription
        const { data: platinumSub } = await supabase
          .from('platinum_subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (platinumSub) {
          // Update Platinum subscription
          const { error } = await supabase
            .from('platinum_subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('Error updating Platinum subscription:', error);
          }
        } else {
          // Update regular subscription
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('Error updating subscription:', error);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update both regular and Platinum subscriptions
        await Promise.all([
          supabase
            .from('user_subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id),
          supabase
            .from('platinum_subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id)
        ]);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Update both regular and Platinum subscriptions
        await Promise.all([
          supabase
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription as string),
          supabase
            .from('platinum_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription as string)
        ]);

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});