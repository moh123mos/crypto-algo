import React, { useState } from 'react';
import { rsaGenerateKeys, rsaEncrypt, rsaDecrypt } from '../utils/crypto';
import { AlgorithmType, Step, RSAParams } from '../types';
import { Copy, RefreshCw, ArrowRight, Lock, Unlock } from 'lucide-react';
import ExplanationViewer from './ExplanationViewer';
import AlgorithmInfo from './AlgorithmInfo';

const RSACipher: React.FC = () => {
  const [params, setParams] = useState<RSAParams | null>(null);
  const [input, setInput] = useState('ABC');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [steps, setSteps] = useState<Step[]>([]);

  const generate = () => {
    const keys = rsaGenerateKeys();
    setParams(keys);
    setOutput('');
    setSteps([{
      label: 'Key Generation',
      details: `Generated Primes: p=${keys.p}, q=${keys.q}. Modulus n=${keys.n}. Phi=${keys.phi}. Public e=${keys.e}, Private d=${keys.d}.`,
      isMath: true
    }]);
  };

  const process = () => {
    if (!params) return;
    if (mode === 'encrypt') {
      const res = rsaEncrypt(input, params.e, params.n);
      setOutput(res.text);
      setSteps(res.steps || []);
    } else {
      const res = rsaDecrypt(input, params.d, params.n);
      setOutput(res.text);
      setSteps(res.steps || []);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-white">RSA Simulation</h2>
        <button
          onClick={generate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors shadow-lg shadow-blue-900/20"
        >
          <RefreshCw size={16} />
          <span>Generate New Keys</span>
        </button>
      </div>

      {!params ? (
        <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
          <p>Click "Generate New Keys" to start the RSA simulation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Info Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">Key Generation Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-500">Prime p:</div>
                <div className="text-blue-400 font-mono text-right">{params.p}</div>
                <div className="text-slate-500">Prime q:</div>
                <div className="text-blue-400 font-mono text-right">{params.q}</div>
                <div className="text-slate-500">Modulus n (p×q):</div>
                <div className="text-green-400 font-bold font-mono text-right">{params.n}</div>
                <div className="text-slate-500">Totient φ(n):</div>
                <div className="text-slate-300 font-mono text-right">{params.phi}</div>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">Public Key (e, n)</h3>
               <div className="flex justify-between items-center text-sm font-mono bg-slate-900 p-2 rounded">
                 <span className="text-slate-500">({params.e}, {params.n})</span>
                 <Lock size={14} className="text-yellow-500"/>
               </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">Private Key (d, n)</h3>
               <div className="flex justify-between items-center text-sm font-mono bg-slate-900 p-2 rounded">
                 <span className="text-slate-500">({params.d}, {params.n})</span>
                 <Unlock size={14} className="text-red-500"/>
               </div>
            </div>
          </div>

          {/* Operation Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-4 p-1 bg-slate-800 rounded-lg w-fit">
              <button
                onClick={() => { setMode('encrypt'); setInput(''); setOutput(''); setSteps([]); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'encrypt' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Encrypt
              </button>
              <button
                onClick={() => { setMode('decrypt'); setInput(''); setOutput(''); setSteps([]); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'decrypt' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Decrypt
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {mode === 'encrypt' ? 'Message (Plaintext)' : 'Ciphertext (Space separated numbers)'}
              </label>
              <div className="flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'encrypt' ? "e.g., HELLO" : "e.g., 123 456 789"}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
                <button 
                  onClick={process}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-medium transition-colors flex items-center"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">
                 Result
               </label>
               <div className="relative">
                  <textarea
                    readOnly
                    value={output}
                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-green-400 font-mono resize-none focus:outline-none"
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="absolute top-2 right-2 p-2 bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
            </div>
            
            <ExplanationViewer steps={steps} />
            <AlgorithmInfo type={AlgorithmType.RSA} />

             <div className="text-xs text-slate-500 bg-slate-800/30 p-4 rounded border border-slate-700/50">
               <strong>Note:</strong> This is a simplified demonstration using small prime numbers. In real-world RSA, primes are hundreds of digits long. The encryption here converts characters to ASCII/Unicode before applying modular exponentiation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RSACipher;