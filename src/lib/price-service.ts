import useSWR from 'swr';

interface PriceData {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// Base prices for simulation
const BASE_PRICES = {
  'stakerise': 2.51,
  'bitcoin': 40000,
  'ethereum': 2500,
  'litecoin': 100,
  'tether': 1,
  'usd-coin': 1
};

// Current simulated prices
const currentPrices: { [key: string]: number } = { ...BASE_PRICES };
const priceChanges: { [key: string]: number } = {};

// Update simulated prices
function updateSimulatedPrices() {
  Object.keys(BASE_PRICES).forEach(token => {
    const isStablecoin = token === 'tether' || token === 'usd-coin';
    const volatility = isStablecoin ? 0.0001 : token === 'stakerise' ? 0.015 : 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility;
    currentPrices[token] = currentPrices[token] * (1 + change);
    priceChanges[token] = Math.max(-15, Math.min(15, (Math.random() * 10) - 5));
  });
}

// Initialize price changes
updateSimulatedPrices();
setInterval(updateSimulatedPrices, 3000); // Update every 3 seconds for more dynamic display

// Generate historical data for a token
function generateHistoricalData(tokenId: string, days: number = 7): { date: number; price: number }[] {
  const now = Date.now();
  const startTime = now - days * 24 * 60 * 60 * 1000;
  const hourlyIntervals = days * 24;
  
  let price = BASE_PRICES[tokenId];
  const isStablecoin = tokenId === 'tether' || tokenId === 'usd-coin';
  
  return Array.from({ length: hourlyIntervals }, (_, i) => {
    const timestamp = startTime + i * 60 * 60 * 1000;
    const volatility = isStablecoin ? 0.0001 : tokenId === 'stakerise' ? 0.015 : 0.02;
    const trend = Math.sin(i / 24) * 0.01;
    const randomChange = (Math.random() - 0.5) * 2 * volatility + trend;
    price = price * (1 + randomChange);
    
    return {
      date: timestamp,
      price: Number(price.toFixed(2))
    };
  });
}

export function useTokenPrices(tokens: string[]) {
  const { data, error, mutate } = useSWR(
    tokens.length > 0 ? 'simulated-prices' : null,
    () => {
      const prices: PriceData = {};
      tokens.forEach(token => {
        prices[token] = {
          usd: Number(currentPrices[token].toFixed(2)),
          usd_24h_change: priceChanges[token]
        };
      });
      return prices;
    },
    {
      refreshInterval: 3000, // Refresh every 3 seconds
      revalidateOnFocus: true,
      dedupingInterval: 1000
    }
  );

  return {
    prices: data || {},
    isLoading: !error && !data && tokens.length > 0,
    isError: error,
    refresh: mutate
  };
}

export function useTokenChart(token: string, days: number = 7) {
  const { data, error } = useSWR(
    `historical-${token}-${days}`,
    () => generateHistoricalData(token, days),
    {
      refreshInterval: 60000, // Refresh chart data every minute
      revalidateOnFocus: false,
      dedupingInterval: 30000
    }
  );

  return {
    chartData: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

export function subscribeToPrice(callback: (prices: PriceData) => void) {
  const updateCallback = () => {
    const prices: PriceData = {};
    Object.keys(BASE_PRICES).forEach(token => {
      prices[token] = {
        usd: Number(currentPrices[token].toFixed(2)),
        usd_24h_change: priceChanges[token]
      };
    });
    callback(prices);
  };

  updateCallback();
  const intervalId = setInterval(updateCallback, 3000); // Update every 3 seconds
  return () => clearInterval(intervalId);
}