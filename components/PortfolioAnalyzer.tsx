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
    console.log("Iniciando escaneo inteligente (Modo Búsqueda)... Filas:", rows.length);

    // Detección de cabecera
    let startIndex = 0;
    if (rows.length > 0 && typeof rows[0][0] === 'string' && isNaN(parseFloat(String(rows[0][1]).replace(',', '.')))) {
      startIndex = 1;
    }

    // Helper para limpiar números
    const cleanNumber = (val: any) => {
       if (!val) return NaN;
       let str = String(val).trim().replace(/["']/g, '');
       if (str.includes('.') && str.includes(',')) {
           str = str.replace(/\./g, ''); 
       }
       str = str.replace(',', '.');
       return parseFloat(str);
    };

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      
      if (row.length >= 2) { 
        // 1. El ISIN siempre es la primera columna
        const isin = String(row[0]).trim();
        
        // 2. BUSCADOR DE CANTIDAD (Desde el final hacia atrás)
        let quantity = 0;
        let quantityIndex = -1;

        for (let j = row.length - 1; j > 0; j--) {
            const val = cleanNumber(row[j]);
            if (!isNaN(val) && val > 0) {
                quantity = val;
                quantityIndex = j;
                break;
            }
        }

        // 3. RECONSTRUCCIÓN DEL NOMBRE
        let companyName = isin;
        if (quantityIndex > 1) {
            const nameParts = row.slice(1, quantityIndex);
            companyName = nameParts.join(' ').replace(/["']/g, '').trim();
        } else if (quantityIndex === -1 && row.length >= 2) {
             const val = cleanNumber(row[1]);
             if (!isNaN(val)) quantity = val;
        }

        // --- VALIDACIÓN FINAL ---
        if (isin && isin.length > 5 && quantity > 0) {
            items.push({
                isin: isin,
                company: companyName,
                quantity,
                avgPrice: 0
            });
        }
      }
    }
    
    if (items.length === 0) {
        alert("No se encontraron acciones válidas. Revisa el archivo.");
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
      const analyzed = await analyzePortfolio(portfolio, (p) => setProgress(p));
      setPortfolio(analyzed);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Error en el análisis. Inténtalo de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  };

  const totalValue = portfolio.reduce((acc, curr) => {
    const price = curr.currentPrice || 0; 
    return acc + (price * curr.quantity);
  }, 0);
  
  if (hasIsin === null) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Verificación de Datos</h2>
        <p className="text-lg text-gray-600 mb-8">
          ¿El archivo de tu cartera contiene los códigos <strong>ISIN</strong>?
        </p>
        <div className="flex justify-center gap-6">
          <button onClick={() => setHasIsin(true)} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg">
            <CheckCircle2 className="w-5 h-5" /> SÍ, contiene ISIN
          </button>
          <button onClick={() => setHasIsin(false)} className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 border border-gray-200">
            <X className="w-5 h-5" /> NO
          </button>
        </div>
      </div>
    );
  }

  if (hasIsin === false) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-red-100 text-center max-w-2xl mx-auto mt-10">
        <Ban className="w-8 h-8 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis No Disponible</h2>
        <p className="text-gray-600 mb-8">Se requiere código ISIN para el análisis.</p>
        <button onClick={() => setHasIsin(null)} className="text-blue-600 font-semibold hover:underline">Volver a empezar</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="flex justify-between items-start mb-4">
             <button onClick={() => setHasIsin(null)} className="text-xs text-gray-400 hover:text-gray-600">← Volver</button>
             <div className="flex-1"></div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Optimizador de Cartera IA</h2>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto">Análisis de precisión basado en ISIN.</p>

        {!fileName ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:bg-gray-50 transition-colors relative group">
            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <FileSpreadsheet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Arrastra tu archivo Excel o CSV aquí</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 border border-blue-100">
                <FileSpreadsheet className="w-5 h-5" />
                <span className="font-medium">{fileName}</span>
                <button onClick={() => { setFileName(null); setPortfolio([]); setErrorMsg(null); }} className="ml-2 hover:bg-blue-200 p-1 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            {errorMsg && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">{errorMsg}</div>}

            <button onClick={runAnalysis} disabled={analyzing} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg flex items-center gap-2">
              {analyzing ? <RefreshCw className="animate-spin" /> : <TrendingUp />}
              {analyzing ? `Analizando (${progress}%)...` : 'Analizar Cartera'}
            </button>
          </div>
        )}
      </div>

      {portfolio.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2"><Wallet className="w-4 h-4" /><span className="text-sm font-medium uppercase">Valor Total</span></div>
              <p className="text-3xl font-bold text-gray-900">{portfolio.some(p => p.currentPrice) ? totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '---'}</p>
            </div>
            {portfolio[0].action && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 text-blue-100 mb-2"><Lightbulb className="w-4 h-4" /><span className="text-sm font-medium uppercase">Estrategia</span></div>
                <p className="text-lg font-medium">{portfolio.filter(p => p.action === 'ACUMULAR').length} activos para ACUMULAR.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto max-h-[600px] overflow-y-auto relative">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 z-10 bg-gray-50 border-b text-gray-500 uppercase text-xs shadow-sm">
                <tr>
                  <th className="px-6 py-4">ISIN / Empresa</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                  <th className="px-6 py-4 text-right text-blue-600 font-bold">Precio</th>
                  <th className="px-6 py-4 text-right font-bold bg-gray-50 border-l border-gray-200">Total</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                  <th className="px-6 py-4">Previsión</th>
                  <th className="px-6 py-4">Optimización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolio.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{item.company}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{item.isin}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-mono text-base text-blue-700 font-bold">{item.currentPrice ? item.currentPrice.toFixed(2) : '-'}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold bg-gray-50 border-l border-gray-100">{(item.currentPrice || 0) * item.quantity > 0 ? ((item.currentPrice || 0) * item.quantity).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '-'}</td>
                      <td className="px-6 py-4 text-center">
                        {item.action ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.action === 'ACUMULAR' ? 'bg-green-100 text-green-700' : item.action === 'VENDER' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.action}
                          </span>
                        ) : '...'}
                      </td>
                      {/* COLUMNA PREVISIÓN MEJORADA */}
                      <td className="px-6 py-4">
                        {item.forecast3to5Years ? (
                          <div className="flex flex-col gap-1">
                             {/* Detectamos palabras clave para colorear */}
                             <div className={`text-xs font-bold uppercase tracking-wider mb-1
                               ${item.forecast3to5Years.includes('Alcista') ? 'text-green-600' : 
                                 item.forecast3to5Years.includes('Bajista') ? 'text-red-600' : 'text-gray-500'}
                             `}>
                               {item.forecast3to5Years.split('|')[0]} {/* Muestra solo la Tendencia */}
                             </div>
                             <div className="flex items-center gap-1 text-gray-700 text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
                                <TrendingUp className="w-3 h-3 text-blue-500" />
                                <span>{item.forecast3to5Years.split('|')[1] || item.forecast3to5Years}</span>
                             </div>
                          </div>
                        ) : '-'}
                      </td>

                      {/* COLUMNA OPTIMIZACIÓN (ZONAS CLAVE) */}
                      <td className="px-6 py-4">
                        {item.optimizationTip ? (
                          <div className="group relative">
                            <div className="flex flex-col gap-1.5 p-2 rounded-lg border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                               <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase">
                                  <Lightbulb className="w-3 h-3 text-amber-500" />
                                  <span>Estrategia</span>
                               </div>
                               <span className="text-xs font-medium text-gray-800 leading-tight">
                                 {item.optimizationTip}
                               </span>
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};