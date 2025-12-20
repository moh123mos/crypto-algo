import React, { useState, useEffect } from 'react';
import { hillCipher } from '../utils/crypto';
import { AlgorithmType, Step } from '../types';
import { Copy, Lock, Unlock } from 'lucide-react';
import ExplanationViewer from './ExplanationViewer';
import AlgorithmInfo from './AlgorithmInfo';

const HillCipher: React.FC = () => {
  const [input, setInput] = useState('HELP');
  const [size, setSize] = useState<2 | 3>(2);
  const [matrix, setMatrix] = useState<string[]>(['3', '3', '2', '5']); // Default valid 2x2 key
  const [isEncrypt, setIsEncrypt] = useState(true);
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);

  const handleMatrixChange = (index: number, val: string) => {
    const newM = [...matrix];
    newM[index] = val;
    setMatrix(newM);
  };

  useEffect(() => {
    // Resize matrix if size changes
    if (size === 2 && matrix.length !== 4) setMatrix(['3', '3', '2', '5']);
    if (size === 3 && matrix.length !== 9) setMatrix(['6', '24', '1', '13', '16', '10', '20', '17', '15']); // valid 3x3 key GYBNQKURP
  }, [size]);

  useEffect(() => {
    const matrixStr = matrix.join(',');
    const res = hillCipher(input, matrixStr, size, !isEncrypt);
    setResult(res.text);
    setSteps(res.steps || []);
  }, [input, matrix, size, isEncrypt]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-white">Hill Cipher</h2>
        <button
          onClick={() => setIsEncrypt(!isEncrypt)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"
        >
          {isEncrypt ? <Lock size={16} /> : <Unlock size={16} />}
          <span>{isEncrypt ? 'Mode: Encrypt' : 'Mode: Decrypt'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
             <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-400">Key Matrix Size</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setSize(2)}
                        className={`px-3 py-1 text-xs rounded ${size===2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >2x2</button>
                    <button 
                        onClick={() => setSize(3)} 
                        className={`px-3 py-1 text-xs rounded ${size===3 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >3x3</button>
                </div>
             </div>
             <div 
                className="grid gap-2 p-4 bg-slate-800 rounded-lg border border-slate-700 w-fit mx-auto"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
             >
                {matrix.map((val, i) => (
                    <input
                        key={i}
                        type="number"
                        value={val}
                        onChange={(e) => handleMatrixChange(i, e.target.value)}
                        className="w-12 h-12 text-center bg-slate-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                ))}
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Input Text</label>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Result</label>
            <div className="relative">
              <textarea
                readOnly
                value={result}
                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-3 text-green-400 font-mono resize-none focus:outline-none"
              />
              <button 
                onClick={() => navigator.clipboard.writeText(result)}
                className="absolute top-2 right-2 p-2 bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
            {result.startsWith('Error') && (
                <p className="text-red-400 text-sm mt-2">{result}</p>
            )}
        </div>
      </div>
      
      <ExplanationViewer steps={steps} />
      <AlgorithmInfo type={AlgorithmType.HILL} />
    </div>
  );
};

export default HillCipher;