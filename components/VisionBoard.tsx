import React, { useState, useRef } from 'react';
import { editVisionImage } from '../services/geminiService';
import { Wand2, Upload, Image as ImageIcon, Download, Lightbulb } from 'lucide-react';

export const VisionBoard: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;
    
    setLoading(true);
    try {
      // Extract mime type and base64
      const matches = selectedImage.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid image format");
      }
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      const resultBase64 = await editVisionImage(base64Data, prompt, mimeType);
      setResultImage(`data:image/png;base64,${resultBase64}`);
    } catch (e) {
      console.error(e);
      alert("Error al generar la imagen. Intenta con otro texto.");
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "Añade una línea de tendencia alcista verde brillante",
    "Pon un Ferrari rojo aparcado delante de la casa",
    "Haz que el gráfico parezca futurista con neones",
    "Añade una lluvia de monedas de oro en el fondo"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Vision Board Financiero</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Sube un gráfico o una foto de tus objetivos y usa <span className="text-purple-600 font-semibold">Gemini 2.5 Flash Image</span> para visualizar tu éxito.
          <br/>
          <span className="text-sm italic">Sirve para proyectar tendencias o motivarte visualizando tus metas.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden
              ${selectedImage ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
            `}
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Original" className="h-full w-full object-contain rounded-lg p-2" />
            ) : (
              <div className="text-center text-gray-400 px-4">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p>Haz clic para subir un gráfico bursátil o una foto</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="flex flex-col gap-3">
             {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((p, i) => (
                <button 
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="text-xs bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 px-2 py-1 rounded-md transition-colors border border-gray-200"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: 'Añade una flecha verde hacia arriba...'"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !selectedImage || !prompt}
                className="bg-purple-600 text-white px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Wand2 className="animate-spin" /> : <Wand2 />}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="border border-gray-200 rounded-xl h-80 md:h-auto bg-gray-50 flex items-center justify-center relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
              <p className="text-purple-600 font-medium">Gemini está creando tu visión...</p>
            </div>
          )}
          
          {resultImage ? (
            <div className="relative w-full h-full p-2 group">
              <img src={resultImage} alt="Generated" className="w-full h-full object-contain rounded-lg" />
              <a 
                href={resultImage} 
                download="vision-board-gemini.png"
                className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:text-purple-600"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>La imagen generada aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
