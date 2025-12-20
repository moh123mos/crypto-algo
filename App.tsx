import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ClassicCipher from './components/ClassicCipher';
import HillCipher from './components/HillCipher';
import RSACipher from './components/RSACipher';
import GeminiEditor from './components/GeminiEditor';
import { AlgorithmType } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>(AlgorithmType.CAESAR);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (selectedAlgo) {
      case AlgorithmType.HILL:
        return <HillCipher />;
      case AlgorithmType.RSA:
        return <RSACipher />;
      case AlgorithmType.GEMINI_EDIT:
        return <GeminiEditor />;
      default:
        return <ClassicCipher type={selectedAlgo} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <Sidebar 
        selected={selectedAlgo} 
        onSelect={setSelectedAlgo} 
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden p-4 border-b border-slate-800 flex items-center bg-slate-900">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300 mr-4">
            <Menu size={24} />
          </button>
          <span className="font-semibold">{selectedAlgo}</span>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;