import React, { useState, useEffect } from 'react';
import { fetchDividends } from '../services/geminiService';
import { Calendar, Search, DollarSign, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { DividendData } from '../types';

interface Props {
  companies: string[];
}

export const DividendTracker: React.FC<Props> = ({ companies }) => {
  const [dividendData, setDividendData] = useState<DividendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadDividends = async () => {
    setLoading(true);
    setDividendData([]);
    setProgress(0);
    
    try {
      // Process in batches of 3 to ensure reliability
      const BATCH_SIZE = 3;
      const chunks = [];
      for (let i = 0; i < companies.length; i += BATCH_SIZE) {
        chunks.push(companies.slice(i, i + BATCH_SIZE));
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkData = await fetchDividends(chunk);
        
        if (chunkData.length === 0) {
            console.warn("Batch returned no data:", chunk);
        }

        setDividendData(prev => {
          // Merge avoiding duplicates
          const filtered = chunkData.filter(newD => !prev.some(p => p.name === newD.name));
          return [...prev, ...filtered];
        });
        
        // Update progress bar
        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
      setHasLoaded(true);
    } catch (e) {
      console.error(e);
      alert("Could not complete dividend scan completely. Some data might be missing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadDividends();
    }
  }, []);

  // Group by month for a calendar view
  const getCompaniesByMonth = (month: string) => {
    return dividendData.filter(d => 
      d.paymentMonths.some(m => m.toLowerCase().includes(month.toLowerCase()))
    );
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dividend Calendar</h2>
            <div className="text-purple-100 opacity-90 max-w-4xl">
              <p className="font-medium mb-1">
                AI-powered scan of payment dates for {companies.length} tracked companies:
              </p>
              <p className="text-xs leading-relaxed opacity-80">
                {companies.join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={loadDividends}
            disabled={loading}
            className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-75 disabled:transform-none flex items-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Scanning {progress}%
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Refresh Data
              </>
            )}
          </button>
        </div>
        {loading && (
          <div className="mt-6 w-full bg-purple-900/30 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {!loading && hasLoaded && dividendData.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Data Returned</h3>
          <p className="text-gray-500 mb-4">The AI could not confirm payment dates.</p>
          <button onClick={loadDividends} className="text-purple-600 font-semibold hover:underline">
             Try Again
          </button>
        </div>
      )}

      {dividendData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map(month => {
            const payers = getCompaniesByMonth(month);
            const isCurrentMonth = new Date().toLocaleString('default', { month: 'long' }) === month;
            
            return (
              <div key={month} className={`bg-white rounded-xl border ${isCurrentMonth ? 'border-purple-500 ring-4 ring-purple-50' : 'border-gray-200'} shadow-sm overflow-hidden flex flex-col`}>
                <div className={`px-4 py-3 border-b ${isCurrentMonth ? 'bg-purple-50' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold ${isCurrentMonth ? 'text-purple-700' : 'text-gray-700'}`}>{month}</h3>
                </div>
                <div className="p-4 flex-1">
                  {payers.length > 0 ? (
                    <ul className="space-y-2">
                      {payers.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="truncate font-semibold">{d.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No expected payments</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};