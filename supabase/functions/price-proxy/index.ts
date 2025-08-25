import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

// Simulated STR token data
const strTokenData = {
  usd: 2.51,
  usd_24h_change: 3.99,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokens = url.searchParams.get("tokens")?.split(",") || [];

    if (tokens.length === 0) {
      throw new Error("No tokens specified");
    }

    // Filter out STR token for CoinGecko API
    const geckoTokens = tokens.filter((token) => token !== "stakerise");

    let prices: Record<string, any> = {};

    // Add STR token data
    if (tokens.includes("stakerise")) {
      prices["stakerise"] = strTokenData;
    }

    // Fetch other token prices from CoinGecko
    if (geckoTokens.length > 0) {
      const response = await fetch(
        `${COINGECKO_API_URL}/simple/price?ids=${geckoTokens.join(",")}&vs_currencies=usd&include_24hr_change=true`,
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      prices = { ...prices, ...data };
    }

    return new Response(JSON.stringify(prices), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Price proxy error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
