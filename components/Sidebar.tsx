import React from 'react';
import { AlgorithmType } from '../types';
import { 
  KeyRound, FileKey, Shield, Grip, 
  Table2, TextCursor, Hash, Image as ImageIcon,
  Menu, X
} from 'lucide-react';

interface SidebarProps {
  selected: AlgorithmType;
  onSelect: (algo: AlgorithmType) => void;
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selected, onSelect, isOpen, toggle }) => {
  const algos = [
    { type: AlgorithmType.CAESAR, icon: KeyRound, label: 'Caesar Cipher' },
    { type: AlgorithmType.AFFINE, icon: Hash, label: 'Affine Cipher' },
    { type: AlgorithmType.VIGENERE, icon: TextCursor, label: 'Vigenère Cipher' },
    { type: AlgorithmType.PLAYFAIR, icon: Table2, label: 'Playfair Cipher' },
    { type: AlgorithmType.VERNAM, icon: FileKey, label: 'Vernam Cipher' },
    { type: AlgorithmType.HILL, icon: Grip, label: 'Hill Cipher' },
    { type: AlgorithmType.ROW_TRANSPOSITION, icon: Table2, label: 'Row Transposition' },
    { type: AlgorithmType.RAIL_FENCE, icon: Grip, label: 'Rail Fence' },
    { type: AlgorithmType.RSA, icon: Shield, label: 'RSA (Asymmetric)' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 border-r border-slate-700
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400 tracking-wider">CryptoLab</h1>
          <button onClick={toggle} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase">
            Classic Ciphers
          </div>
          <ul className="space-y-1 mb-6">
            {algos.slice(0, 5).map((algo) => (
              <li key={algo.type}>
                <button
                  onClick={() => { onSelect(algo.type); toggle(); }}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    selected === algo.type 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <algo.icon size={18} className="mr-3" />
                  {algo.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase">
            Advanced & Transposition
          </div>
          <ul className="space-y-1 mb-6">
             {algos.slice(5).map((algo) => (
              <li key={algo.type}>
                <button
                  onClick={() => { onSelect(algo.type); toggle(); }}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    selected === algo.type 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <algo.icon size={18} className="mr-3" />
                  {algo.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          v1.0.0 &copy; 2025
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
