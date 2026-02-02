interface ExchangeRateResponse {
  rate: number;
  timestamp: string;
}

interface CachedExchangeRate {
  rate: number;
  timestamp: string;
  cachedAt: number;
}

const CACHE_KEY = "jpn-exchange-rate-cache";

export function getCachedRate(): ExchangeRateResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedExchangeRate = JSON.parse(cached);
    console.log("Loaded cached rate from localStorage:", data);
    
    return {
      rate: data.rate,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error("Error loading cached rate:", error);
    return null;
  }
}

function saveCachedRate(rate: number, timestamp: string): void {
  try {
    const cached: CachedExchangeRate = {
      rate,
      timestamp,
      cachedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    console.log("Saved rate to localStorage:", cached);
  } catch (error) {
    console.error("Error saving cached rate:", error);
  }
}

export async function fetchExchangeRate(): Promise<ExchangeRateResponse | null> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/EUR");
    
    if (!response.ok) {
      console.error("Failed to fetch exchange rate:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.rates || !data.rates.JPY) {
      console.error("Invalid API response structure");
      return null;
    }

     const timestamp = new Date(data.time_last_update_unix * 1000);
     const formattedDate = timestamp.toLocaleDateString("de-DE", {
       day: "2-digit",
       month: "2-digit",
       year: "numeric",
     });

     const result = {
       rate: data.rates.JPY,
       timestamp: formattedDate,
     };

     saveCachedRate(result.rate, result.timestamp);
     console.log("Fetched new rate from API:", result);
     
     return result;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}
