import { StockData, HealthSectorData, DividendData } from './types';

export const INITIAL_STOCKS: StockData[] = [
  { name: "Repsol", currentPrice: 15.7, currency: "€", exitPrice: 17.5, accumulativePrice: 13.5 },
  { name: "Endesa", currentPrice: 30.6, currency: "€", exitPrice: 35.0, accumulativePrice: 27.5 },
  { name: "Enagás", currentPrice: 14.1, currency: "€", exitPrice: 16.5, accumulativePrice: 13.0 },
  { name: "Iberdrola", currentPrice: 18.0, currency: "€", exitPrice: 20.5, accumulativePrice: 16.0 },
  { name: "BAE Systems PLC", currentPrice: 18.9, currency: "€", exitPrice: 21.5, accumulativePrice: 18.0 },
  { name: "Danone", currentPrice: 77.2, currency: "€", exitPrice: 88.0, accumulativePrice: 72.0 },
  { name: "Nestlé", currentPrice: 80.56, currency: "CHF", exitPrice: 85.00, accumulativePrice: 80.00 },
  { name: "Viscofan", currentPrice: 52.8, currency: "€", exitPrice: 58.0, accumulativePrice: 48.0 },
  { name: "Logista", currentPrice: 29.0, currency: "€", exitPrice: 32.5, accumulativePrice: 27.0 },
  { name: "Cisco Systems", currentPrice: 76.2, currency: "USD", exitPrice: 80.0, accumulativePrice: 65.0 },
  { name: "Indra Sistemas", currentPrice: 45.6, currency: "€", exitPrice: 54.5, accumulativePrice: 44.0 },
  { name: "LVMH", currentPrice: 622.90, currency: "€", exitPrice: 700.00, accumulativePrice: 570.00 },
  { name: "ASML", currentPrice: 870.60, currency: "€", exitPrice: 1050.00, accumulativePrice: 800.00 },
  { name: "SAP", currentPrice: 206.10, currency: "€", exitPrice: 260.00, accumulativePrice: 200.00 },
  { name: "Alphabet Inc Class C", currentPrice: 318.5, currency: "USD", exitPrice: 320.0, accumulativePrice: 250.0 },
  { name: "Zurich Insurance Group", currentPrice: 563.2, currency: "€", exitPrice: 600.0, accumulativePrice: 510.0 },
  { name: "Enterprise Products Partners", currentPrice: 32.6, currency: "€", exitPrice: 35.0, accumulativePrice: 28.0 },
  { name: "Altria Group (MO)", currentPrice: 57.3, currency: "€", exitPrice: 65.0, accumulativePrice: 53.0 },
  { name: "Verizon Communications", currentPrice: 40.2, currency: "€", exitPrice: 45.0, accumulativePrice: 36.0 },
  { name: "LyondellBasell (LYB)", currentPrice: 45.4, currency: "€", exitPrice: 48.0, accumulativePrice: 38.0 },
  { name: "Unilever PLC", currentPrice: 51.9, currency: "€", exitPrice: 56.0, accumulativePrice: 47.0 },
  { name: "St. Galler Kantonalbank", currentPrice: 527.00, currency: "CHF", exitPrice: 585.00, accumulativePrice: 495.00 },
  { name: "Groupe CRIT", currentPrice: 60.6, currency: "€", exitPrice: 68.0, accumulativePrice: 55.0 },
  { name: "Legal & General Group", currentPrice: 239.1, currency: "€", exitPrice: 270.0, accumulativePrice: 210.0 },
  { name: "The Coca-Cola Company", currentPrice: 72.6, currency: "USD", exitPrice: 78.0, accumulativePrice: 65.0 },
  { name: "Johnson & Johnson", currentPrice: 206.1, currency: "€", exitPrice: 220.0, accumulativePrice: 180.0 },
  { name: "PepsiCo", currentPrice: 145.5, currency: "€", exitPrice: 158.0, accumulativePrice: 135.0 },
  { name: "Icade", currentPrice: 20.3, currency: "€", exitPrice: 26.0, accumulativePrice: 18.0 },
];

export const INITIAL_HEALTH_SECTOR: HealthSectorData[] = [
  { company: "Roche", subsector: "Farma / Diagnóstico", country: "Suiza", growthProb: "70%" },
  { company: "AstraZeneca", subsector: "Farma / Biotecnología", country: "UK", growthProb: "65%" },
  { company: "Grifols", subsector: "Derivados plasma", country: "España", growthProb: "60%" },
  { company: "Novo Nordisk", subsector: "Diabetes / Obesidad", country: "Dinamarca", growthProb: "80%" },
  { company: "Fresenius SE", subsector: "Servicios sanitarios", country: "Alemania", growthProb: "58%" },
  { company: "Lonza Group", subsector: "Biofarma / Outsourcing", country: "Suiza", growthProb: "55%" },
  { company: "EssilorLuxottica", subsector: "Óptica / salud visual", country: "Francia", growthProb: "65%" },
  { company: "Sanofi", subsector: "Farma generalista", country: "Francia", growthProb: "60%" },
  { company: "GN Store Nord", subsector: "Tecnología auditiva", country: "Dinamarca", growthProb: "50%" },
  { company: "Coloplast", subsector: "Salud urológica", country: "Dinamarca", growthProb: "63%" },
];

export const DIVIDEND_COMPANIES_LIST: string[] = [
  "LyondellBasell", "Logista", "Viscofan", "Enagás", "Icade", "Altria", "Verizon",
  "Legal & General", "Enterprise Products", "Banco Sabadell", "Repsol", "Cisco",
  "St. Galler Kantonalbank", "Danone", "Atria Oyj", "Groupe CRIT", "Zurich Insurance",
  "Indra", "Nestlé", "Johnson & Johnson", "Iberdrola", "Unilever", "Stanley Black & Decker",
  "LVMH", "ASML", "PepsiCo", "SAP", "Coca-Cola", "Alphabet", "Endesa"
];