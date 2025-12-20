import React from 'react';
import { AlgorithmType } from '../types';
import { BookOpen } from 'lucide-react';

interface Props {
  type: AlgorithmType;
}

const AlgorithmInfo: React.FC<Props> = ({ type }) => {
  const infoMap: Record<string, { desc: string; history: string; complexity: string }> = {
    [AlgorithmType.CAESAR]: {
      desc: "A simple substitution cipher where each letter is shifted by a fixed number of positions down the alphabet.",
      history: "Named after Julius Caesar, who used it with a shift of 3 to communicate with his generals.",
      complexity: "Extremely low (O(n)). Vulnerable to frequency analysis and brute force (only 25 possible keys)."
    },
    [AlgorithmType.AFFINE]: {
      desc: "A type of monoalphabetic substitution cipher, where each letter is mapped to its numeric equivalent, encrypted using a linear function (ax + b) mod 26.",
      history: "Generalization of the Caesar cipher. Provides a slightly larger key space.",
      complexity: "Low. Vulnerable to frequency analysis. Key space is 12 × 26 = 312."
    },
    [AlgorithmType.VIGENERE]: {
      desc: "A polyalphabetic substitution cipher using a series of interwoven Caesar ciphers based on the letters of a keyword.",
      history: "Described by Giovan Battista Bellaso in 1553, but misattributed to Blaise de Vigenère. Known as 'le chiffre indéchiffrable' (the indecipherable cipher) for 3 centuries.",
      complexity: "Moderate. Harder than monoalphabetic ciphers but vulnerable to Kasiski examination and Friedman test."
    },
    [AlgorithmType.PLAYFAIR]: {
      desc: "A digraph substitution cipher using a 5x5 grid. Encrypts pairs of letters instead of single letters.",
      history: "Invented by Charles Wheatstone in 1854, but popularized by Lord Playfair. Used by the British in WWI and WWII.",
      complexity: "Significantly harder to break than monoalphabetic ciphers because frequency analysis must be done on 600 digraphs."
    },
    [AlgorithmType.VERNAM]: {
      desc: "Also known as the One-Time Pad. Combines plaintext with a random key of the same length.",
      history: "Invented by Gilbert Vernam in 1917. If the key is truly random, used only once, and kept secret, it is mathematically unbreakable.",
      complexity: "Perfect Secrecy (unbreakable), but requires key distribution and management that is as hard as the message transmission itself."
    },
    [AlgorithmType.HILL]: {
      desc: "A polygraphic substitution cipher based on linear algebra. Uses matrix multiplication modulo 26.",
      history: "Invented by Lester S. Hill in 1929. One of the first ciphers to process blocks of letters simultaneously.",
      complexity: "Strong against frequency analysis of single letters. Vulnerable to known-plaintext attacks which can reveal the matrix."
    },
    [AlgorithmType.ROW_TRANSPOSITION]: {
      desc: "A transposition cipher where text is written in rows and read by columns according to a key.",
      history: "Widely used in various forms throughout history for military communication.",
      complexity: "Does not change letter frequencies (anagrams). Vulnerable to multiple anagramming if messages are similar."
    },
    [AlgorithmType.RAIL_FENCE]: {
      desc: "A transposition cipher that writes message letters in a zig-zag pattern across a 'rail'.",
      history: "An ancient transposition cipher. Also known as a zig-zag cipher.",
      complexity: "Very low. Easy to break by hand by guessing the number of rails."
    },
    [AlgorithmType.RSA]: {
      desc: "An asymmetric crypto-system using a public key for encryption and a private key for decryption. Based on the difficulty of factoring the product of two large prime numbers.",
      history: "Published by Rivest, Shamir, and Adleman in 1977. Fundamental to modern internet security (HTTPS, SSL).",
      complexity: "Security depends on the integer factorization problem. Secure with sufficiently large keys (e.g., 2048-bit or 4096-bit)."
    },
  };

  const info = infoMap[type] || { desc: "Algorithm details unavailable.", history: "", complexity: "" };

  return (
    <div className="mt-8 bg-slate-800/30 rounded-xl border border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-4 text-slate-200">
        <BookOpen size={20} className="text-blue-400" />
        <h3 className="text-lg font-bold">How it Works: {type}</h3>
      </div>
      <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
        <div>
          <span className="font-semibold text-slate-400 uppercase text-xs tracking-wider block mb-1">Mechanism</span>
          {info.desc}
        </div>
        {info.history && (
          <div>
            <span className="font-semibold text-slate-400 uppercase text-xs tracking-wider block mb-1">History</span>
            {info.history}
          </div>
        )}
        {info.complexity && (
          <div>
            <span className="font-semibold text-slate-400 uppercase text-xs tracking-wider block mb-1">Security & Complexity</span>
            {info.complexity}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmInfo;