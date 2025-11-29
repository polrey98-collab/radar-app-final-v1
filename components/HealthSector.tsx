import React, { useState } from 'react';
import { HealthSectorData } from '../types';
import { analyzeHealthSector } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Zap, ShieldAlert, TrendingUp, Timer } from 'lucide-react';

interface Props {
  initialData: HealthSectorData[];
}

export const HealthSector: React.FC<Props> = ({ initialData }) => {
  const [data, setData] = useState<HealthSectorData[]>(initialData);
  const [loading, setLoading] = useState(false);

  const chartData = data.map(d => ({
    name: d.company,
    growth: parseInt(d.growthProb.replace('%', '')),
    subsector: d.subsector
  })).sort((a, b) => b.growth - a.growth);

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const updated = await analyzeHealthSector(data);
      setData(updated);
    } catch (e) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Strategy Banner */}
      <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg border-l-4 border-blue-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-300">
            <ShieldAlert className="w-6 h-6" />
            Strategy: Tech Bubble Rotation Radar
          </h2>
          <p className="text-slate-300 mt-1 text-sm max-w-2xl">
            These companies are tracked as defensive "Safe Havens". The <strong>Buy Signal</strong> indicates the optimal moment to rotate capital from Technology into Health, providing stability when the market corrects.
          </p>
        </div>
        <button
            onClick={handleAnalysis}
            disabled={loading}
            className="whitespace-nowrap px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/50"
          >
            {loading ? <Activity className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
            {loading ? 'Analyzing Defensive Value...' : 'Check Buy Signals'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              Growth Probability vs Defensive Value
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="%" />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fontWeight: 500}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="growth" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.growth >= 70 ? '#10b981' : entry.growth >= 60 ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Subsector / Country</th>
              <th className="px-6 py-4 text-center">Growth Prob.</th>
              <th className="px-6 py-4 text-right">Current Price</th>
              <th className="px-6 py-4 text-center bg-blue-50/50 border-l border-blue-100">
                <span className="text-blue-700 font-bold">Tech Rotation Signal</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, i) => {
              const isBuy = item.buySignal?.toUpperCase().includes("BUY");
              const isWait = item.buySignal?.toUpperCase().includes("WAIT");
              
              return (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                   <div className="font-semibold text-gray-900">{item.company}</div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="flex flex-col">
                    <span>{item.subsector}</span>
                    <span className="text-xs text-gray-400">{item.country}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    parseInt(item.growthProb) >= 70 ? 'bg-green-100 text-green-700' :
                    parseInt(item.growthProb) >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.growthProb}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  {item.currentPrice ? (
                    <div className="flex flex-col items-end">
                      <span className="font-bold">{item.currentPrice} {item.currency || ''}</span>
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        LIVE
                      </span>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 border-l border-gray-100 bg-gray-50/30">
                  {item.buySignal ? (
                    <div className="flex flex-col items-center gap-1">
                       <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                         ${isBuy ? 'bg-green-100 text-green-700 border border-green-200 animate-pulse' : 
                           isWait ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                           'bg-gray-100 text-gray-600'
                         }
                       `}>
                         {isBuy && <TrendingUp className="w-3 h-3" />}
                         {isWait && <Timer className="w-3 h-3" />}
                         {item.buySignal}
                       </span>
                       {item.defensiveNote && (
                         <span className="text-[10px] text-gray-500 text-center max-w-[150px] leading-tight">
                           {item.defensiveNote}
                         </span>
                       )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs italic">
                      Click analyze for signal
                    </div>
                  )}
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
};