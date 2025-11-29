import React, { useState } from 'react';
import { AppTab } from './types';
import { INITIAL_STOCKS, INITIAL_HEALTH_SECTOR, DIVIDEND_COMPANIES_LIST } from './constants';
import { StockRadar } from './components/StockRadar';
import { DividendTracker } from './components/DividendTracker';
import { HealthSector } from './components/HealthSector';
import { PortfolioAnalyzer } from './components/PortfolioAnalyzer';
import { LineChart, LayoutDashboard, HeartPulse, Sparkles, PieChart, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.RADAR);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-slate-900 text-white flex flex-col justify-between z-20 transition-all">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold hidden md:block tracking-tight">MarketRadar</span>
          </div>

          <div className="mt-8 flex flex-col gap-2 px-3">
            <NavButton 
              active={activeTab === AppTab.RADAR} 
              onClick={() => setActiveTab(AppTab.RADAR)}
              icon={<LayoutDashboard />}
              label="Stock Radar"
            />
            <NavButton 
              active={activeTab === AppTab.DIVIDENDS} 
              onClick={() => setActiveTab(AppTab.DIVIDENDS)}
              icon={<Sparkles />} 
              label="Dividends"
            />
            <NavButton 
              active={activeTab === AppTab.HEALTH} 
              onClick={() => setActiveTab(AppTab.HEALTH)}
              icon={<HeartPulse />}
              label="Health Sector"
            />
            <NavButton 
              active={activeTab === AppTab.PORTFOLIO} 
              onClick={() => setActiveTab(AppTab.PORTFOLIO)}
              icon={<PieChart />}
              label="Portfolio Optimize"
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer px-3 py-2">
             <LogOut className="w-5 h-5" />
             <span className="hidden md:block text-sm font-medium">Log out</span>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pl-20 md:pl-64 min-h-screen transition-all">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === AppTab.RADAR && "Market Radar"}
            {activeTab === AppTab.DIVIDENDS && "Dividend Tracker"}
            {activeTab === AppTab.HEALTH && "Health Sector Opportunities"}
            {activeTab === AppTab.PORTFOLIO && "Portfolio AI Optimizer"}
          </h1>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Gemini 2.5 Active</span>
             <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
               JD
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === AppTab.RADAR && <StockRadar initialData={INITIAL_STOCKS} />}
          {activeTab === AppTab.DIVIDENDS && <DividendTracker companies={DIVIDEND_COMPANIES_LIST} />}
          {activeTab === AppTab.HEALTH && <HealthSector initialData={INITIAL_HEALTH_SECTOR} />}
          {activeTab === AppTab.PORTFOLIO && <PortfolioAnalyzer />}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    <span className="hidden md:block font-medium">{label}</span>
  </button>
);

export default App;