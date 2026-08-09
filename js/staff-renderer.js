// ============================================================
// Porte (Staff) SVG Render Motoru
// ============================================================

const SVG_NS = 'http://www.w3.org/2000/svg';
const LINE_GAP = 14; // İki çizgi arası mesafe (px)
const STAFF_WIDTH = 280;
const STAFF_LEFT_PAD = 70;
const NOTE_X = 190; // Notanın yatayda konumlanacağı yer

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// staffPosition -> Y koordinatı
// staffPosition 0 = en alt çizgi, 8 = en üst çizgi
// Y ekseni SVG'de aşağı doğru arttığı için ters çeviriyoruz
function staffPositionToY(staffPosition, baseY) {
  return baseY - (staffPosition * (LINE_GAP / 2));
}

function clefSymbolPath(clefId) {
  // Basit, tanınabilir clef sembolleri: Unicode müzik sembolleri büyük boyutta çizilir
  const symbols = { treble: '𝄞', bass: '𝄢', alto: '𝄡', tenor: '𝄡' };
  return symbols[clefId] || '𝄞';
}

/**
 * Porteyi ve üzerinde bir notayı SVG olarak render eder.
 * @param {SVGElement} container - İçine çizilecek <svg> elementi
 * @param {Object} opts - { staffPosition, clefId, showNote }
 */
function renderStaff(svgEl, { staffPosition = null, clefId = 'treble', showNote = true, clefScale = 1 } = {}) {
  svgEl.innerHTML = '';
  svgEl.setAttribute('viewBox', '0 0 320 200');
  svgEl.setAttribute('width', '100%');
  svgEl.setAttribute('height', '100%');

  const baseY = 140; // En alt çizginin Y konumu
  const g = el('g', { class: 'staff-group' });

  // 5 çizgiyi çiz (staffPosition 0,2,4,6,8)
  for (let i = 0; i < 5; i++) {
    const y = staffPositionToY(i * 2, baseY);
    g.appendChild(el('line', {
      x1: STAFF_LEFT_PAD, y1: y, x2: STAFF_LEFT_PAD + STAFF_WIDTH, y2: y,
      class: 'staff-line',
    }));
  }

  // Clef sembolü
  const clefBaseSize = 52;
  const clefX = STAFF_LEFT_PAD - 45 - (clefScale - 1) * 16;
  const clefText = el('text', {
    x: clefX,
    y: clefId === 'bass' ? baseY - LINE_GAP * 3 : baseY + 6,
    class: `clef-symbol clef-${clefId}`,
    style: clefScale !== 1 ? `font-size:${clefBaseSize * clefScale}px` : '',
  });
  clefText.textContent = clefSymbolPath(clefId);
  g.appendChild(clefText);

  if (showNote && staffPosition !== null) {
    // Yardımcı çizgiler (ledger lines) - staff dışına taşan notalar için
    if (staffPosition < 0) {
      for (let p = -2; p >= staffPosition; p -= 2) {
        const y = staffPositionToY(p, baseY);
        g.appendChild(el('line', {
          x1: NOTE_X - 12, y1: y, x2: NOTE_X + 12, y2: y,
          class: 'ledger-line',
        }));
      }
    } else if (staffPosition > 8) {
      for (let p = 10; p <= staffPosition; p += 2) {
        const y = staffPositionToY(p, baseY);
        g.appendChild(el('line', {
          x1: NOTE_X - 12, y1: y, x2: NOTE_X + 12, y2: y,
          class: 'ledger-line',
        }));
      }
    }

    // Nota kafası (elips)
    const noteY = staffPositionToY(staffPosition, baseY);
    const noteHead = el('ellipse', {
      cx: NOTE_X, cy: noteY, rx: 8, ry: 6,
      class: 'note-head',
      transform: `rotate(-20 ${NOTE_X} ${noteY})`,
    });
    g.appendChild(noteHead);

    // Sap (stem) - orta çizginin altındaysa yukarı, üstündeyse aşağı yönlü
    const stemUp = staffPosition < 4;
    const stemX = stemUp ? NOTE_X + 7.5 : NOTE_X - 7.5;
    const stemY2 = stemUp ? noteY - 32 : noteY + 32;
    g.appendChild(el('line', {
      x1: stemX, y1: noteY, x2: stemX, y2: stemY2,
      class: 'note-stem',
    }));
  }

  svgEl.appendChild(g);
}

export { renderStaff, staffPositionToY };
