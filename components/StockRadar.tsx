import React, { useState } from 'react';
import { StockData } from '../types';
import { analyzeStocks } from '../services/geminiService';
import { ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp, AlertCircle, Radio, AlertTriangle } from 'lucide-react';

interface Props {
  initialData: StockData[];
}

export const StockRadar: React.FC<Props> = ({ initialData }) => {
  const [stocks, setStocks] = useState<StockData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updated = await analyzeStocks(stocks);
      setStocks(updated);
      setLastUpdated(new Date());
    } catch (e) {
      alert("Failed to update market data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Portfolio Radar</h2>
          <p className="text-gray-500 text-sm mt-1">
            Real-time tracking and AI optimization for entry/exit points.
            {lastUpdated && <span className="ml-2 text-green-600 text-xs font-semibold">Updated: {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-200'
          }`}
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {loading ? 'Scanning Market...' : 'Update & Optimize'}
        </button>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 relative">
        <table className="w-full text-sm text-left">
        <thead className="sticky top-0 z-10 text-xs text-gray-500 uppercase bg-gray-50 border-b shadow-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Company</th>
              <th className="px-6 py-4 font-medium text-gray-400">Ref Price (PDF)</th>
              <th className="px-6 py-4 font-medium text-blue-700">Live Market Price</th>
              <th className="px-6 py-4 font-medium text-red-600">Target Exit (Sell)</th>
              <th className="px-6 py-4 font-medium text-green-600">Target Entry (Buy)</th>
              <th className="px-6 py-4 font-medium">ALERTA ACTIVA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock, idx) => {
              const isUpdated = stock.updated;
              // Comparison logic: Compare MARKET price (if available) with targets, otherwise fallback to reference
              const comparePrice = stock.marketPrice || stock.currentPrice;
              
              // Logic requested:
              // If real price >= SELL value (exitPrice) -> VENDE!
              // If real price <= BUY value (accumulativePrice) -> COMPRA!
              
              let alertLabel = "MANTENER";
              let alertStyle = "bg-gray-100 text-gray-600 border border-gray-200";
              let alertIcon = null;

              if (comparePrice >= stock.exitPrice) {
                alertLabel = "VENDE!";
                alertStyle = "bg-red-100 text-red-700 border border-red-200 font-bold animate-pulse";
                alertIcon = <TrendingUp className="w-3 h-3" />;
              } else if (comparePrice <= stock.accumulativePrice) {
                alertLabel = "COMPRA!";
                alertStyle = "bg-green-100 text-green-700 border border-green-200 font-bold animate-pulse";
                alertIcon = <ArrowDownRight className="w-3 h-3" />;
              }

              // Visual cues for price proximity
              const profitPotential = comparePrice < stock.accumulativePrice;
              const sellSignal = comparePrice > stock.exitPrice;

              return (
                <tr key={idx} className={`hover:bg-gray-50 transition-colors ${isUpdated ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4 font-semibold text-gray-900">{stock.name}</td>
                  
                  {/* Original PDF Price */}
                  <td className="px-6 py-4 text-gray-400">
                    {stock.currentPrice.toFixed(2)} {stock.currency}
                  </td>

                  {/* Live Market Price */}
                  <td className="px-6 py-4">
                     {stock.marketPrice ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-gray-900">{stock.marketPrice.toFixed(2)}</span>
                            <span className="text-xs text-gray-500">{stock.currency}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-green-600">LIVE</span>
                          </div>
                        </div>
                     ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs italic">
                           <Radio className="w-3 h-3" />
                           Waiting for update
                        </span>
                     )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono ${sellSignal && stock.marketPrice ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                         {stock.exitPrice.toFixed(2)} {stock.currency}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono ${profitPotential && stock.marketPrice ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                         {stock.accumulativePrice.toFixed(2)} {stock.currency}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs tracking-wide uppercase shadow-sm ${alertStyle}`}>
                      {alertIcon}
                      {alertLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};