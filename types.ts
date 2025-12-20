export enum AlgorithmType {
  CAESAR = 'Caesar Cipher',
  AFFINE = 'Affine Cipher',
  VIGENERE = 'Vigenère Cipher',
  PLAYFAIR = 'Playfair Cipher',
  VERNAM = 'Vernam Cipher',
  HILL = 'Hill Cipher',
  ROW_TRANSPOSITION = 'Row Transposition',
  RAIL_FENCE = 'Rail Fence',
  RSA = 'RSA (Asymmetric)',
  GEMINI_EDIT = 'AI Image Editor'
}

export interface Step {
  label: string;
  details: string;
  isMath?: boolean;
}

export interface CipherResult {
  text: string;
  steps: Step[];
  details?: string; // Optional steps or matrix visualization
  matrix?: string[][]; // For Playfair/Hill
  error?: string;
}

export interface RSAParams {
  p: number;
  q: number;
  n: number;
  phi: number;
  e: number;
  d: number;
}
