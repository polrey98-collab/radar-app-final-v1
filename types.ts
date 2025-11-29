
export interface StockData {
  name: string;
  currentPrice: number; // Reference price from PDF
  marketPrice?: number; // Live price from API
  currency: string;
  exitPrice: number;
  accumulativePrice: number;
  updated?: boolean; // To flag if updated by AI
  recommendation?: string; // AI recommendation
}

export interface DividendData {
  name: string;
  paymentMonths: string[];
  lastUpdated?: string;
}

export interface HealthSectorData {
  company: string;
  subsector: string;
  country: string;
  growthProb: string; // "70%"
  currentPrice?: number;
  currency?: string;
  targetPrice?: number;
  buySignal?: string; // e.g. "BUY NOW", "ACCUMULATE", "WAIT"
  defensiveNote?: string; // Reason for the signal relative to tech bubble
}

export interface PortfolioItem {
  isin?: string; // Unique identifier for precise lookup
  company: string;
  quantity: number;
  avgPrice: number;
  // Analysis fields
  currentPrice?: number;
  currentValue?: number;
  action?: string; // "SELL" | "ACCUMULATE" | "HOLD"
  forecast3to5Years?: string; // e.g. "+35% (approx 120€)"
  optimizationTip?: string;
}

export enum AppTab {
  RADAR = 'RADAR',
  DIVIDENDS = 'DIVIDENDS',
  HEALTH = 'HEALTH',
  PORTFOLIO = 'PORTFOLIO'
}
