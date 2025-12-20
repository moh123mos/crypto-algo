import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { Upload, Wand2, Download, AlertCircle, Loader2 } from 'lucide-react';

const GeminiEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) {
        setError("Please upload an image and provide a prompt.");
        return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      // Assuming PNG for simplicity, in a real app check mime type from file
      const result = await editImageWithGemini(image, prompt, 'image/png');
      setResultImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please check API key configuration or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 h-full flex flex-col">
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="text-purple-400" />
            AI Image Editor
        </h2>
        <p className="text-slate-400 text-sm mt-1">Powered by Gemini 2.5 Flash Image</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        
        {/* Left: Inputs */}
        <div className="space-y-6">
            <div 
                className={`
                    border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors
                    ${image ? 'border-purple-500/50 bg-slate-800/50' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                `}
                onClick={() => fileInputRef.current?.click()}
            >
                {image ? (
                    <img src={image} alt="Original" className="h-full w-full object-contain rounded-xl" />
                ) : (
                    <div className="text-center p-6">
                        <Upload size={48} className="mx-auto text-slate-500 mb-2" />
                        <p className="text-slate-400 font-medium">Click to upload original image</p>
                        <p className="text-slate-600 text-xs mt-1">Supports PNG, JPEG (Max 5MB)</p>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Edit Instruction</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Add a retro filter', 'Make it look like a sketch', 'Remove the background'"
                    className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading || !image || !prompt}
                className={`
                    w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                    ${loading || !image || !prompt 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20'}
                `}
            >
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                {loading ? 'Processing...' : 'Generate Edit'}
            </button>

             {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3 text-red-300 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>

        {/* Right: Output */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-1 flex flex-col h-64 lg:h-auto">
             <div className="flex-1 rounded-lg bg-black/20 flex items-center justify-center overflow-hidden relative group">
                {resultImage ? (
                    <>
                        <img src={resultImage} alt="Generated" className="w-full h-full object-contain" />
                        <a 
                            href={resultImage} 
                            download="gemini-edit.png"
                            className="absolute bottom-4 right-4 p-3 bg-slate-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
                            title="Download"
                        >
                            <Download size={20} />
                        </a>
                    </>
                ) : (
                     <div className="text-slate-600 text-center p-4">
                        <Wand2 size={32} className="mx-auto mb-2 opacity-20" />
                        <p>AI generated result will appear here</p>
                    </div>
                )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default GeminiEditor;