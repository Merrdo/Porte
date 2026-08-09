// ============================================================
// Müzik Teorisi Modülü
// Nota isimleri, frekanslar, porte pozisyonları
// ============================================================

// Kromatik nota isimleri (diyez ile)
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Türkçe nota isimleri
const TURKISH_NAMES = {
  'C': 'Do', 'D': 'Re', 'E': 'Mi', 'F': 'Fa',
  'G': 'Sol', 'A': 'La', 'B': 'Si'
};

// A4 = 440 Hz referans alınarak herhangi bir notanın frekansını hesaplar
function noteToFrequency(letter, octave, accidental = 0) {
  const noteIndex = CHROMATIC_NOTES.findIndex(n => n[0] === letter);
  const semitonesFromC = noteIndex + accidental;
  const midiNumber = (octave + 1) * 12 + semitonesFromC;
  const a4Midi = 69; // A4'ün MIDI numarası
  return 440 * Math.pow(2, (midiNumber - a4Midi) / 12);
}

// ------------------------------------------------------------
// Anahtar (Clef) Tanımları
// Her anahtar için: porte üzerindeki referans çizgi ve o çizgideki nota
// staffPosition: 0 = en alt çizgi, artan değerler yukarı doğru (yarım adım = boşluk/çizgi)
// ------------------------------------------------------------

const CLEFS = {
  treble: {
    id: 'treble',
    name: 'Sol Anahtarı',
    symbol: '𝄞',
    // Alt çizgiden (E4, staffPosition 0) üst çizgiye (F5, staffPosition 8)
    referenceNote: { letter: 'E', octave: 4, staffPosition: 0 },
  },
  bass: {
    id: 'bass',
    name: 'Fa Anahtarı',
    symbol: '𝄢',
    referenceNote: { letter: 'G', octave: 2, staffPosition: 0 },
  },
  alto: {
    id: 'alto',
    name: 'Do Anahtarı (Alto)',
    symbol: '𝄡',
    referenceNote: { letter: 'F', octave: 3, staffPosition: 0 },
  },
  tenor: {
    id: 'tenor',
    name: 'Do Anahtarı (Tenor)',
    symbol: '𝄡',
    referenceNote: { letter: 'D', octave: 3, staffPosition: 0 },
  },
};

// Do majör gam sırası (diyez/bemol olmadan)
const NATURAL_LETTER_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Bir harf+oktavın "doğal indeksi"ni hesaplar (C0=0, D0=1, ... B0=6, C1=7...)
function letterOctaveToNaturalIndex(letter, octave) {
  const letterIdx = NATURAL_LETTER_ORDER.indexOf(letter);
  return octave * 7 + letterIdx;
}

function naturalIndexToLetterOctave(idx) {
  const octave = Math.floor(idx / 7);
  const letterIdx = ((idx % 7) + 7) % 7;
  return { letter: NATURAL_LETTER_ORDER[letterIdx], octave };
}

// Bir notanın porte üzerindeki staffPosition değerini hesaplar (referans anahtara göre)
function getStaffPosition(letter, octave, clefId) {
  const clef = CLEFS[clefId];
  const refIdx = letterOctaveToNaturalIndex(clef.referenceNote.letter, clef.referenceNote.octave);
  const noteIdx = letterOctaveToNaturalIndex(letter, octave);
  return (noteIdx - refIdx) + clef.referenceNote.staffPosition;
}

// staffPosition'dan harf+oktav bulma (belirli bir anahtar için)
function staffPositionToNote(staffPosition, clefId) {
  const clef = CLEFS[clefId];
  const refIdx = letterOctaveToNaturalIndex(clef.referenceNote.letter, clef.referenceNote.octave);
  const targetIdx = refIdx + (staffPosition - clef.referenceNote.staffPosition);
  return naturalIndexToLetterOctave(targetIdx);
}

// ------------------------------------------------------------
// Ders (Level) Tanımları
// Her seviye: hangi anahtar(lar), hangi staffPosition aralığı kullanılacak
// ------------------------------------------------------------

const LEVELS = [
  {
    id: 1,
    title: 'Sol Anahtarı: Çizgiler',
    description: 'Sol anahtarındaki 5 çizgiyi tanı (Mi-Sol-Si-Re-Fa)',
    clefs: ['treble'],
    // staffPosition: 0,2,4,6,8 çizgiler
    positions: [0, 2, 4, 6, 8],
  },
  {
    id: 2,
    title: 'Sol Anahtarı: Boşluklar',
    description: 'Sol anahtarındaki 4 boşluğu tanı (Fa-La-Do-Mi)',
    clefs: ['treble'],
    positions: [1, 3, 5, 7],
  },
  {
    id: 3,
    title: 'Sol Anahtarı: Tümü',
    description: 'Sol anahtarındaki tüm notaları (çizgi+boşluk) ve yardımcı çizgileri karıştır',
    clefs: ['treble'],
    positions: [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 4,
    title: 'Fa Anahtarı: Çizgiler ve Boşluklar',
    description: 'Fa anahtarındaki temel notaları öğren (çizgiler: Sol-Si-Re-Fa-La, boşluklar: La-Do-Mi-Sol)',
    clefs: ['bass'],
    positions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 5,
    title: 'Sol + Fa Anahtarı Karışık',
    description: 'İki anahtar arasında geçiş yaparak hız kazan',
    clefs: ['treble', 'bass'],
    positions: [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 6,
    title: 'İleri Seviye: Do Anahtarları',
    description: 'Alto ve Tenor Do anahtarlarıyla tanış (viyola, çello, trombon repertuvarı)',
    clefs: ['alto', 'tenor'],
    positions: [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
];

// Rastgele bir nota üretir (verilen seviyeye göre)
function generateRandomNote(level) {
  const clefId = level.clefs[Math.floor(Math.random() * level.clefs.length)];
  const staffPosition = level.positions[Math.floor(Math.random() * level.positions.length)];
  const { letter, octave } = staffPositionToNote(staffPosition, clefId);
  return { letter, octave, staffPosition, clefId };
}

export {
  CHROMATIC_NOTES,
  TURKISH_NAMES,
  CLEFS,
  LEVELS,
  noteToFrequency,
  getStaffPosition,
  staffPositionToNote,
  generateRandomNote,
};
