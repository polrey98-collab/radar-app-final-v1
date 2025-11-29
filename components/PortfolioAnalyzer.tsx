
import React, { useState } from 'react';
import { PortfolioItem } from '../types';
import { analyzePortfolio } from '../services/geminiService';
import { FileSpreadsheet, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, X, ArrowRight, Wallet, CheckCircle2, Ban } from 'lucide-react';
import * as XLSX from 'xlsx';

export const PortfolioAnalyzer: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasIsin, setHasIsin] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setErrorMsg(null);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const data = e.target?.result;
        try {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get as array of arrays
          parseData(jsonData);
        } catch (error) {
          console.error("Error parsing file:", error);
          alert("Error al leer el archivo. Asegúrate de que sea un Excel o CSV válido.");
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    }
  };

  const parseData = (rows: any[]) => {
    const items: PortfolioItem[] = [];

    // Skip header if first row looks like text headers
    let startIndex = 0;
    if (rows.length > 0 && typeof rows[0][0] === 'string' && isNaN(parseFloat(rows[0][1]))) {
      startIndex = 1;
    }

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= 2) { 
        // Expecting Format: ISIN | Quantity
        // OR: ISIN | CompanyName | Quantity (Common format)

        const col0 = String(row[0]).trim(); // Typically ISIN
        const col1 = String(row[1]).trim();
        
        // Simple check: ISIN is typically alpha-numeric.
        const isin = col0;
        
        // Logic to detect Name vs Quantity in Col 1 vs Col 2
        let quantity = 0;
        let companyName = isin; // Default to ISIN, AI will fix name
        let purchasePrice = 0;

        const val1 = parseFloat(col1.replace(',', '.'));
        
        if (isNaN(val1)) {
            // Col 1 is NOT a number, likely Company Name
            // Then Col 2 must be Quantity
            companyName = col1;
            
            const col2 = String(row[2]).trim();
            const val2 = parseFloat(col2.replace(',', '.'));
            if (!isNaN(val2)) {
                quantity = val2;
            }
        } else {
            // Col 1 IS a number, likely Quantity. 
            // So format was ISIN | Quantity
            quantity = val1;
        }

        if (isin && quantity > 0) {
            items.push({
                isin: isin,
                company: companyName,
                quantity,
                avgPrice: purchasePrice // Keeping 0 as we don't use it anymore
            });
        }
      }
    }
    
    if (items.length === 0) {
        alert("No se encontraron datos válidos. El archivo debe contener al menos columnas con ISIN y Cantidad.");
        setFileName(null);
    }
    setPortfolio(items);
  };

  const runAnalysis = async () => {
    if (portfolio.length === 0) return;
    setAnalyzing(true);
    setProgress(0);
    setErrorMsg(null);
    
    try {
      // Pass the progress callback
      const analyzed = await analyzePortfolio(portfolio, (p) => setProgress(p));
      
      // Check if any prices were actually updated
      const hasUpdates = analyzed.some(item => item.currentPrice !== undefined && item.currentPrice !== null);
      if (!hasUpdates) {
          console.warn("Analysis completed but no prices found.");
      }

      setPortfolio(analyzed);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Error en el análisis. Inténtalo de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Calculations
  const totalValue = portfolio.reduce((acc, curr) => {
    const price = curr.currentPrice || 0; 
    return acc + (price * curr.quantity);
  }, 0);
  
  // --- Render Logic for Pre-Check ---

  if (hasIsin === null) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Verificación de Datos</h2>
        <p className="text-lg text-gray-600 mb-8">
          ¿El archivo de tu cartera contiene los códigos <strong>ISIN</strong> (International Securities Identification Number) de las empresas?
        </p>
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => setHasIsin(true)}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 transform hover:-translate-y-1"
          >
            <CheckCircle2 className="w-5 h-5" />
            SÍ, contiene ISIN
          </button>
          <button 
            onClick={() => setHasIsin(false)}
            className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all border border-gray-200"
          >
            <X className="w-5 h-5" />
            NO
          </button>
        </div>
      </div>
    );
  }

  if (hasIsin === false) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-red-100 text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis No Disponible</h2>
        <p className="text-gray-600 mb-8">
          Para garantizar la precisión de los cálculos de mercado y la valoración de tu patrimonio, el sistema <strong>requiere estrictamente</strong> el código ISIN de cada activo. Sin este identificador, no podemos proceder con el análisis fiable.
        </p>
        <button 
          onClick={() => setHasIsin(null)}
          className="text-blue-600 font-semibold hover:underline"
        >
          Volver a empezar
        </button>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="flex justify-between items-start mb-4">
             <button onClick={() => setHasIsin(null)} className="text-xs text-gray-400 hover:text-gray-600">← Volver</button>
             <div className="flex-1"></div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Optimizador de Cartera IA</h2>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
          Análisis de precisión basado en ISIN. Sube tu archivo para recibir consejos estratégicos.
        </p>

        {!fileName ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:bg-gray-50 transition-colors relative group">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="transform group-hover:scale-105 transition-transform duration-300">
                <FileSpreadsheet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            </div>
            <p className="text-lg font-medium text-gray-700">Arrastra tu archivo Excel o CSV aquí</p>
            <div className="mt-6 flex justify-center gap-2 text-xs text-gray-500 bg-gray-100 py-2 px-4 rounded-lg inline-block">
               <span className="font-mono">Columna 1: ISIN | Columna 2: Cantidad</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 border border-blue-100">
                <FileSpreadsheet className="w-5 h-5" />
                <span className="font-medium">{fileName}</span>
                <span className="text-sm opacity-75">({portfolio.length} activos detectados)</span>
                <button 
                  onClick={() => { setFileName(null); setPortfolio([]); setErrorMsg(null); }}
                  className="ml-2 hover:bg-blue-200 p-1 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            {errorMsg && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 flex items-center gap-2 max-w-lg">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{errorMsg}</span>
                </div>
            )}

            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              {analyzing ? <RefreshCw className="animate-spin" /> : <TrendingUp />}
              {analyzing ? `Analizando (${progress}%)...` : 'Analizar Cartera'}
            </button>
            {analyzing && (
              <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                 <div className="h-full bg-blue-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
              </div>
            )}
            {analyzing && (
                <p className="text-xs text-gray-400 mt-2 max-w-md">
                    Analizando 1 a 1 para asegurar precisión y cumplir límites de API. Esto puede tardar unos segundos por activo.
                </p>
            )}
          </div>
        )}
      </div>

      {portfolio.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                 <Wallet className="w-4 h-4" />
                 <span className="text-sm font-medium uppercase">Valor Total Cartera</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                  {portfolio.some(p => p.currentPrice) ? totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '---'}
              </p>
              {!portfolio.some(p => p.currentPrice) && <span className="text-xs text-orange-500">Esperando análisis ISIN</span>}
            </div>

            {portfolio[0].action && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 text-blue-100 mb-2">
                   <Lightbulb className="w-4 h-4" />
                   <span className="text-sm font-medium uppercase">Estrategia IA</span>
                </div>
                <p className="text-lg font-medium">
                   {portfolio.filter(p => p.action === 'ACUMULAR').length} activos señalizados para ACUMULAR.
                </p>
              </div>
            )}
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ISIN / Empresa</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                  <th className="px-6 py-4 text-right text-blue-600 font-bold">Precio (EUR)</th>
                  <th className="px-6 py-4 text-right font-bold bg-gray-50 border-l border-gray-200">Valor Total</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                  <th className="px-6 py-4">Previsión 3-5 Años</th>
                  <th className="px-6 py-4">Optimización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolio.map((item, i) => {
                  const positionValue = (item.currentPrice || 0) * item.quantity;
                  
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{item.company}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{item.isin}</div>
                      </td>
                      
                      <td className="px-6 py-4 text-right text-gray-600">
                        {item.quantity}
                      </td>
                      
                      <td className="px-6 py-4 text-right font-mono text-base">
                         {item.currentPrice ? (
                           <span className="text-blue-700 font-bold">
                             {item.currentPrice.toFixed(2)}
                           </span>
                         ) : '-'}
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-bold bg-gray-50 border-l border-gray-100">
                        {item.currentPrice ? positionValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '-'}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        {item.action ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                            ${item.action === 'ACUMULAR' ? 'bg-green-100 text-green-700 border border-green-200' : 
                              item.action === 'VENDER' ? 'bg-red-100 text-red-700 border border-red-200' : 
                              'bg-yellow-100 text-yellow-700 border border-yellow-200'}
                          `}>
                            {item.action === 'ACUMULAR' && <TrendingUp className="w-3 h-3" />}
                            {item.action === 'VENDER' && <AlertTriangle className="w-3 h-3" />}
                            {item.action}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">...</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.forecast3to5Years ? (
                          <div className="flex items-start gap-2 max-w-[150px]">
                             <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-gray-700 font-medium text-xs">{item.forecast3to5Years}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {item.optimizationTip ? (
                          <div className="flex items-start gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100 max-w-[150px]">
                             <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                             <span className="text-gray-600 text-[10px] leading-tight">{item.optimizationTip}</span>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
