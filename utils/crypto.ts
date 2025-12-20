import { CipherResult, Step, RSAParams } from '../types';

// Utility functions
const mod = (n: number, m: number) => ((n % m) + m) % m;

const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));

const modInverse = (a: number, m: number): number => {
  let [m0, x0, x1] = [m, 0, 1];
  if (m === 1) return 0;
  while (a > 1) {
    const q = Math.floor(a / m);
    [m, a] = [a % m, m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0 ? x1 + m0 : x1;
};

// -------------------- Classic Ciphers --------------------

export const caesarCipher = (text: string, shift: number, decrypt = false): CipherResult => {
  const steps: Step[] = [];
  const s = decrypt ? (26 - shift) % 26 : shift;
  
  const result = text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const originalCode = char.charCodeAt(0) - base;
    const newCode = (originalCode + s) % 26;
    const newChar = String.fromCharCode(newCode + base);
    
    steps.push({
      label: `Process '${char}'`,
      details: `${char}(${originalCode}) + ${decrypt ? 'Shift(Dec)' : 'Shift'} ${s} = ${newCode} mod 26 -> '${newChar}'`,
      isMath: true
    });
    
    return newChar;
  });

  return { text: result, steps };
};

export const affineCipher = (text: string, a: number, b: number, decrypt = false): CipherResult => {
  const steps: Step[] = [];
  if (gcd(a, 26) !== 1) return { text: "Error: 'a' must be coprime to 26.", steps: [], error: "Invalid 'a' value" };
  const m = 26;
  const aInv = modInverse(a, m);

  const result = text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const x = char.charCodeAt(0) - base;
    let newCharStr = "";
    
    if (decrypt) {
      // D(x) = a^-1 * (x - b) mod m
      const val = mod(aInv * (x - b), m);
      newCharStr = String.fromCharCode(val + base);
      steps.push({
        label: `Decrypt '${char}'`,
        details: `y=${x} | a^-1=${aInv} | ${aInv} * (${x} - ${b}) mod 26 = ${val} -> '${newCharStr}'`,
        isMath: true
      });
    } else {
      // E(x) = (ax + b) mod m
      const val = mod(a * x + b, m);
      newCharStr = String.fromCharCode(val + base);
      steps.push({
        label: `Encrypt '${char}'`,
        details: `x=${x} | (${a} * ${x} + ${b}) mod 26 = ${val} -> '${newCharStr}'`,
        isMath: true
      });
    }
    return newCharStr;
  });

  return { text: result, steps };
};

export const vigenereCipher = (text: string, key: string, decrypt = false): CipherResult => {
  const steps: Step[] = [];
  if (!key) return { text, steps: [] };
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleanKey.length === 0) return { text, steps: [] };

  let keyIndex = 0;
  const result = text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const kChar = cleanKey[keyIndex % cleanKey.length];
    const kCode = kChar.charCodeAt(0) - 65;
    const charCode = char.charCodeAt(0) - base;
    
    const effectiveShift = decrypt ? (26 - kCode) : kCode; 
    
    const newCode = (charCode + effectiveShift) % 26;
    const newChar = String.fromCharCode(newCode + base);
    
    steps.push({
      label: `Char '${char}' with Key '${kChar}'`,
      details: `Text(${charCode}) ${decrypt ? '-' : '+'} Key(${kCode}) = ${newCode} mod 26 -> '${newChar}'`,
      isMath: true
    });

    keyIndex++;
    return newChar;
  });

  return { text: result, steps };
};

export const vernamCipher = (text: string, key: string, decrypt = false): CipherResult => {
  const steps: Step[] = [];
  const cleanText = text.replace(/[^a-zA-Z]/g, '');
  const cleanKey = key.replace(/[^a-zA-Z]/g, '');
  
  if (cleanKey.length < cleanText.length) return { text: "Error: Key too short", steps: [], error: "Key length < Text length" };

  let result = "";
  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    const base = charCode <= 90 ? 65 : 97;
    const p = charCode - base;
    
    const kBase = cleanKey.charCodeAt(i) <= 90 ? 65 : 97;
    const k = cleanKey.charCodeAt(i) - kBase;

    let c;
    if (decrypt) {
      c = mod(p - k, 26);
      steps.push({
        label: `Pos ${i}: '${cleanText[i]}' ^ '${cleanKey[i]}'`,
        details: `(${p} - ${k}) mod 26 = ${c} -> '${String.fromCharCode(c + base)}'`,
        isMath: true
      });
    } else {
      c = mod(p + k, 26);
      steps.push({
        label: `Pos ${i}: '${cleanText[i]}' + '${cleanKey[i]}'`,
        details: `(${p} + ${k}) mod 26 = ${c} -> '${String.fromCharCode(c + base)}'`,
        isMath: true
      });
    }
    result += String.fromCharCode(c + base);
  }
  return { text: result, steps };
};

// -------------------- Playfair --------------------

const generatePlayfairMatrix = (key: string): string[][] => {
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // No 'J'
  const cleanKey = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const matrix: string[] = [];
  const seen = new Set<string>();

  for (const char of (cleanKey + alphabet)) {
    if (!seen.has(char)) {
      seen.add(char);
      matrix.push(char);
    }
  }

  const grid: string[][] = [];
  for (let i = 0; i < 5; i++) grid.push(matrix.slice(i * 5, i * 5 + 5));
  return grid;
};

const findPos = (matrix: string[][], char: string) => {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (matrix[r][c] === char) return { r, c };
    }
  }
  return { r: 0, c: 0 };
};

export const playfairCipher = (text: string, key: string, decrypt = false): CipherResult => {
  const matrix = generatePlayfairMatrix(key);
  let cleanText = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const steps: Step[] = [];

  // Pad text
  if (!decrypt) {
    let padded = "";
    for (let i = 0; i < cleanText.length; i++) {
      padded += cleanText[i];
      if (i + 1 < cleanText.length && cleanText[i] === cleanText[i + 1]) {
        padded += 'X';
        steps.push({ label: 'Padding', details: `Inserted 'X' between double '${cleanText[i]}'` });
      }
    }
    if (padded.length % 2 !== 0) {
      padded += 'X';
      steps.push({ label: 'Padding', details: `Appended 'X' to make length even` });
    }
    cleanText = padded;
  }

  let result = "";
  for (let i = 0; i < cleanText.length; i += 2) {
    const a = cleanText[i];
    const b = cleanText[i + 1];
    const posA = findPos(matrix, a);
    const posB = findPos(matrix, b);
    let rule = "";

    if (posA.r === posB.r) { // Same row
      const shift = decrypt ? 4 : 1;
      result += matrix[posA.r][(posA.c + shift) % 5];
      result += matrix[posB.r][(posB.c + shift) % 5];
      rule = "Same Row";
    } else if (posA.c === posB.c) { // Same col
      const shift = decrypt ? 4 : 1;
      result += matrix[(posA.r + shift) % 5][posA.c];
      result += matrix[(posB.r + shift) % 5][posB.c];
      rule = "Same Column";
    } else { // Rectangle
      result += matrix[posA.r][posB.c];
      result += matrix[posB.r][posA.c];
      rule = "Rectangle";
    }

    steps.push({
      label: `Pair '${a}${b}' -> '${result.slice(result.length - 2)}'`,
      details: `${rule}: ${a}(${posA.r},${posA.c}) & ${b}(${posB.r},${posB.c})`,
      isMath: true
    });
  }

  return { text: result, steps, matrix };
};

// -------------------- Transposition --------------------

export const railFenceCipher = (text: string, rails: number, decrypt = false): CipherResult => {
  const steps: Step[] = [];
  if (rails < 2) return { text, steps: [] };
  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0;
  let direction = 1;

  if (!decrypt) {
    steps.push({ label: 'Build Fence', details: `Placing characters on ${rails} rails in zig-zag pattern.` });
    for (const char of text) {
      fence[rail].push(char);
      rail += direction;
      if (rail === 0 || rail === rails - 1) direction *= -1;
    }
    // Visualization of rails
    fence.forEach((r, idx) => {
        steps.push({ label: `Rail ${idx + 1}`, details: r.join(' '), isMath: true });
    });
    return { text: fence.flat().join(''), steps };
  } else {
    // Reconstruct
    const lens = Array(rails).fill(0);
    let r = 0;
    let d = 1;
    for (let i = 0; i < text.length; i++) {
      lens[r]++;
      r += d;
      if (r === 0 || r === rails - 1) d *= -1;
    }

    let index = 0;
    for (let i = 0; i < rails; i++) {
      for (let j = 0; j < lens[i]; j++) {
        fence[i].push(text[index++]);
      }
    }
    
    steps.push({ label: 'Reconstruct Fence', details: `Filled rails based on zig-zag lengths` });
    fence.forEach((row, idx) => {
        steps.push({ label: `Rail ${idx + 1}`, details: row.join(''), isMath: true });
    });

    let result = "";
    r = 0;
    d = 1;
    for (let i = 0; i < text.length; i++) {
      result += fence[r].shift();
      r += d;
      if (r === 0 || r === rails - 1) d *= -1;
    }
    return { text: result, steps };
  }
};

export const rowTranspositionCipher = (text: string, key: string, decrypt = false): CipherResult => {
  const steps: Step[] = [];
  const cleanKeyStr = key.replace(/[^0-9\s]/g, '');
  let order: number[] = [];
  
  if (cleanKeyStr.trim().length > 0) {
      const parts = cleanKeyStr.trim().split(/\s+/).map(Number);
      const sorted = [...parts].sort((a,b) => a-b);
      if (sorted[0] === 1 && sorted[sorted.length-1] === parts.length && new Set(parts).size === parts.length) {
          order = parts.map(n => n - 1); 
      }
  }
  
  if (order.length === 0) {
      const k = key.replace(/[^a-zA-Z]/g, '').toUpperCase();
      if (!k) return { text: "Error: Invalid key", steps: [], error: "Invalid Key" };
      const sortedK = k.split('').map((c, i) => ({c, i})).sort((a, b) => a.c.localeCompare(b.c));
      order = sortedK.map(x => x.i);
  }

  const numCols = order.length;
  const numRows = Math.ceil(text.length / numCols);

  steps.push({ label: 'Configuration', details: `Grid: ${numRows} rows x ${numCols} cols. Key Order: ${order.map(i=>i+1).join(' ')}` });

  if (!decrypt) {
    const grid: string[][] = [];
    let idx = 0;
    for(let r=0; r<numRows; r++) {
        const row = [];
        for(let c=0; c<numCols; c++) {
            row.push(idx < text.length ? text[idx++] : 'X'); 
        }
        grid.push(row);
        steps.push({ label: `Row ${r+1}`, details: row.join(' | '), isMath: true });
    }
    
    let res = "";
    for(let i=0; i<numCols; i++) {
        const colIdx = order[i]; 
        for(let r=0; r<numRows; r++) {
            res += grid[r][colIdx];
        }
    }
    steps.push({ label: 'Read Columns', details: 'Read columns in key order' });
    return { text: res, steps };
  } else {
    const totalLen = text.length;
    if (totalLen % numCols !== 0) return { text: "Error length", steps: [], error: "Text length mismatch" };
    const calculatedRows = totalLen / numCols;
    const grid = Array.from({length: calculatedRows}, () => Array(numCols).fill(''));
    
    let currentIdx = 0;
    for (let i = 0; i < numCols; i++) {
        const colIdx = order[i];
        for (let r = 0; r < calculatedRows; r++) {
            grid[r][colIdx] = text[currentIdx++];
        }
    }
    
    steps.push({ label: 'Reconstruct Grid', details: 'Filled columns based on key order' });
    for(let r=0; r<calculatedRows; r++) {
         steps.push({ label: `Row ${r+1}`, details: grid[r].join(' | '), isMath: true });
    }
    
    return { text: grid.flat().join('').replace(/X+$/, ''), steps };
  }
};

// -------------------- Hill --------------------

export const hillCipher = (text: string, matrixStr: string, size: 2 | 3, decrypt = false): CipherResult => {
  const steps: Step[] = [];
  const matrixValues = matrixStr.split(',').map(x => parseInt(x.trim()));
  if (matrixValues.some(isNaN) || matrixValues.length !== size * size) {
    return { text: "Error: Invalid Matrix", steps: [], error: "Invalid Matrix" };
  }
  
  const K: number[][] = [];
  for(let i=0; i<size; i++) K.push(matrixValues.slice(i*size, (i+1)*size));

  // Determine Determinant and Inverse
  let det = 0;
  if (size === 2) {
    det = K[0][0]*K[1][1] - K[0][1]*K[1][0];
  } else {
     det = K[0][0]*(K[1][1]*K[2][2] - K[1][2]*K[2][1]) 
        - K[0][1]*(K[1][0]*K[2][2] - K[1][2]*K[2][0]) 
        + K[0][2]*(K[1][0]*K[2][1] - K[1][1]*K[2][0]);
  }
  det = mod(det, 26);
  const detInv = modInverse(det, 26);
  
  steps.push({ label: 'Matrix Analysis', details: `Determinant: ${det}, Modular Inverse: ${detInv}`, isMath: true });

  if (detInv === 0) return { text: "Error: Matrix not invertible", steps, error: "Not Invertible" };

  let usedMatrix = K;

  if (decrypt) {
    if (size === 2) {
      const KInv: number[][] = Array.from({length: size}, () => Array(size).fill(0));
      KInv[0][0] = mod(K[1][1] * detInv, 26);
      KInv[0][1] = mod(-K[0][1] * detInv, 26);
      KInv[1][0] = mod(-K[1][0] * detInv, 26);
      KInv[1][1] = mod(K[0][0] * detInv, 26);
      usedMatrix = KInv;
      steps.push({ label: 'Inverse Matrix', details: `[${KInv[0]}], [${KInv[1]}]`, isMath: true });
    } else {
       return { text: "Error: 3x3 Decryption not implemented", steps: [], error: "3x3 Decryption unavailable" };
    }
  }

  const cleanText = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
  let paddedText = cleanText;
  while (paddedText.length % size !== 0) paddedText += 'X';

  let result = "";
  for (let i = 0; i < paddedText.length; i += size) {
    const vector = [];
    for (let j = 0; j < size; j++) vector.push(paddedText.charCodeAt(i+j) - 65);
    
    const resVec = [];
    let calcStr = "";
    
    for (let r = 0; r < size; r++) {
      let sum = 0;
      let rowStr = "[";
      for (let c = 0; c < size; c++) {
        sum += usedMatrix[r][c] * vector[c];
        rowStr += `${usedMatrix[r][c]}*${vector[c]}${c<size-1?'+':''}`;
      }
      resVec.push(mod(sum, 26));
      calcStr += `${rowStr}] = ${sum} -> ${mod(sum, 26)}; `;
    }
    
    const chars = resVec.map(c => String.fromCharCode(c + 65)).join('');
    steps.push({ 
        label: `Block '${paddedText.slice(i, i+size)}'`, 
        details: `Vector [${vector}] x Matrix -> [${resVec}] -> '${chars}'`, 
        isMath: true 
    });
    result += chars;
  }

  return { text: result, steps, matrix: K.map(row => row.map(String)) };
};

// -------------------- RSA --------------------

const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const generatePrime = (min: number, max: number): number => {
  let p = 0;
  while (!isPrime(p)) {
    p = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return p;
};

export const rsaGenerateKeys = (): RSAParams => {
  // Use small primes for demonstration purposes
  const p = generatePrime(50, 100);
  let q = generatePrime(50, 100);
  while (q === p) q = generatePrime(50, 100);

  const n = p * q;
  const phi = (p - 1) * (q - 1);

  let e = 3;
  while (gcd(e, phi) !== 1) {
    e += 2;
  }

  const d = modInverse(e, phi);

  return { p, q, n, phi, e, d };
};

export const rsaEncrypt = (text: string, e: number, n: number): CipherResult => {
  const steps: Step[] = [];
  const result = text.split('').map(char => {
    const m = char.charCodeAt(0);
    // c = m^e mod n
    let c = BigInt(1);
    const bigM = BigInt(m);
    const bigE = BigInt(e);
    const bigN = BigInt(n);
    
    // Modular exponentiation
    let base = bigM;
    let exp = bigE;
    while(exp > 0) {
        if (exp % 2n === 1n) c = (c * base) % bigN;
        base = (base * base) % bigN;
        exp /= 2n;
    }
    
    steps.push({
        label: `Char '${char}'`,
        details: `m=${m} | c = ${m}^${e} mod ${n} = ${c}`,
        isMath: true
    });
    
    return c.toString();
  }).join(' ');
  
  return { text: result, steps };
};

export const rsaDecrypt = (ciphertext: string, d: number, n: number): CipherResult => {
  const steps: Step[] = [];
  const parts = ciphertext.trim().split(/\s+/);
  let result = "";
  
  for (const part of parts) {
      if(!part) continue;
      const c = BigInt(part);
      const bigD = BigInt(d);
      const bigN = BigInt(n);
      
      let m = BigInt(1);
      let base = c;
      let exp = bigD;
      
      while(exp > 0) {
        if (exp % 2n === 1n) m = (m * base) % bigN;
        base = (base * base) % bigN;
        exp /= 2n;
    }
    const char = String.fromCharCode(Number(m));
    result += char;
    
    steps.push({
        label: `Cipher ${part}`,
        details: `c=${part} | m = ${part}^${d} mod ${n} = ${m} -> '${char}'`,
        isMath: true
    });
  }
  return { text: result, steps };
};