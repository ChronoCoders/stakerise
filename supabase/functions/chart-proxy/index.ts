import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Generate simulated STR price history
function generateStrPriceHistory(days: number) {
  const now = Date.now();
  const data = [];
  const basePrice = 2.51;
  const volatility = 0.05;
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice * (1 + randomChange);
    data.push([timestamp, price]);
  }
  
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    if (!token) {
      throw new Error('No token specified');
    }

    let priceData;

    if (token === 'stakerise') {
      priceData = { prices: generateStrPriceHistory(days) };
    } else {
      const response = await fetch(
        `${COINGECKO_API_URL}/coins/${token}/market_chart?vs_currency=usd&days=${days}&interval=hourly`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      priceData = await response.json();
    }

    return new Response(JSON.stringify(priceData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Chart proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});