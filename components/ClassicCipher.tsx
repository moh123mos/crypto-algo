import React, { useState, useEffect } from 'react';
import { AlgorithmType, CipherResult, Step } from '../types';
import { 
  caesarCipher, vigenereCipher, railFenceCipher, 
  rowTranspositionCipher, vernamCipher, affineCipher, playfairCipher 
} from '../utils/crypto';
import { Copy, Lock, Unlock } from 'lucide-react';
import ExplanationViewer from './ExplanationViewer';
import AlgorithmInfo from './AlgorithmInfo';

interface Props {
  type: AlgorithmType;
}

const ClassicCipher: React.FC<Props> = ({ type }) => {
  const [input, setInput] = useState('HELLO WORLD');
  const [key, setKey] = useState<string>('3');
  const [affineA, setAffineA] = useState(5);
  const [affineB, setAffineB] = useState(8);
  const [isEncrypt, setIsEncrypt] = useState(true);
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [playfairMatrix, setPlayfairMatrix] = useState<string[][]>([]);

  useEffect(() => {
    // Reset defaults when switching
    if (type === AlgorithmType.CAESAR) setKey('3');
    if (type === AlgorithmType.VIGENERE) setKey('KEY');
    if (type === AlgorithmType.RAIL_FENCE) setKey('3');
    if (type === AlgorithmType.ROW_TRANSPOSITION) setKey('3 1 4 2');
    if (type === AlgorithmType.VERNAM) setKey('SECRET');
    if (type === AlgorithmType.PLAYFAIR) setKey('MONARCHY');
    setInput('HELLO WORLD');
    setResult('');
    setSteps([]);
  }, [type]);

  useEffect(() => {
    let res: CipherResult = { text: '', steps: [] };
    try {
      switch (type) {
        case AlgorithmType.CAESAR:
          res = caesarCipher(input.toUpperCase(), parseInt(key) || 0, !isEncrypt);
          break;
        case AlgorithmType.VIGENERE:
          res = vigenereCipher(input.toUpperCase(), key, !isEncrypt);
          break;
        case AlgorithmType.RAIL_FENCE:
          res = railFenceCipher(input.toUpperCase().replace(/[^A-Z]/g,''), parseInt(key) || 2, !isEncrypt);
          break;
        case AlgorithmType.ROW_TRANSPOSITION:
          res = rowTranspositionCipher(input.toUpperCase().replace(/[^A-Z]/g,''), key, !isEncrypt);
          break;
        case AlgorithmType.VERNAM:
          res = vernamCipher(input.toUpperCase(), key.toUpperCase(), !isEncrypt);
          break;
        case AlgorithmType.AFFINE:
          res = affineCipher(input.toUpperCase(), affineA, affineB, !isEncrypt);
          break;
        case AlgorithmType.PLAYFAIR:
          res = playfairCipher(input, key, !isEncrypt);
          if (res.matrix) setPlayfairMatrix(res.matrix);
          break;
      }
    } catch (e) {
      res = { text: "Error processing", steps: [] };
    }
    setResult(res.text);
    setSteps(res.steps || []);
  }, [input, key, affineA, affineB, isEncrypt, type]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-white">{type}</h2>
        <button
          onClick={() => setIsEncrypt(!isEncrypt)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"
        >
          {isEncrypt ? <Lock size={16} /> : <Unlock size={16} />}
          <span>{isEncrypt ? 'Mode: Encrypt' : 'Mode: Decrypt'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Plaintext / Ciphertext
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono"
              placeholder="Enter text..."
            />
          </div>

          {/* Key Inputs */}
          {type === AlgorithmType.AFFINE ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Slope (a)</label>
                <input
                  type="number"
                  value={affineA}
                  onChange={(e) => setAffineA(parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
                <span className="text-xs text-slate-500">Must be coprime to 26</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Intercept (b)</label>
                <input
                  type="number"
                  value={affineB}
                  onChange={(e) => setAffineB(parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {type === AlgorithmType.CAESAR ? 'Shift Amount' : 
                 type === AlgorithmType.RAIL_FENCE ? 'Number of Rails' : 
                 'Key'}
              </label>
              <input
                type={type === AlgorithmType.CAESAR || type === AlgorithmType.RAIL_FENCE ? 'number' : 'text'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Result
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={result}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-green-400 font-mono resize-none focus:outline-none"
              />
              <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {type === AlgorithmType.PLAYFAIR && playfairMatrix.length > 0 && (
             <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700 w-fit mx-auto">
               <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase text-center">Key Matrix</h3>
               <div className="grid grid-cols-5 gap-1">
                 {playfairMatrix.flat().map((char, i) => (
                   <div key={i} className="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-200 font-mono text-sm rounded">
                     {char}
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>
      
      <ExplanationViewer steps={steps} />
      <AlgorithmInfo type={type} />
    </div>
  );
};

export default ClassicCipher;