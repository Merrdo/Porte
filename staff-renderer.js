// ============================================================
// Porte (Staff) SVG Render Motoru
// ============================================================

const SVG_NS = 'http://www.w3.org/2000/svg';
const LINE_GAP = 14; // İki çizgi arası mesafe (px)
const STAFF_WIDTH = 280;
const STAFF_LEFT_PAD = 70;
const NOTE_X = 190; // Notanın yatayda konumlanacağı yer (tekli nota modu)

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

// Bir nota kafası + sap + (gerekiyorsa) yardımcı çizgileri belirli bir x konumunda çizer
function drawNoteAt(g, x, staffPosition, baseY, { className = 'note-head', style = null } = {}) {
  // Yardımcı çizgiler (ledger lines)
  if (staffPosition < 0) {
    for (let p = -2; p >= staffPosition; p -= 2) {
      const y = staffPositionToY(p, baseY);
      g.appendChild(el('line', { x1: x - 12, y1: y, x2: x + 12, y2: y, class: 'ledger-line' }));
    }
  } else if (staffPosition > 8) {
    for (let p = 10; p <= staffPosition; p += 2) {
      const y = staffPositionToY(p, baseY);
      g.appendChild(el('line', { x1: x - 12, y1: y, x2: x + 12, y2: y, class: 'ledger-line' }));
    }
  }

  const noteY = staffPositionToY(staffPosition, baseY);
  const noteGroup = el('g', style ? { class: `note-float ${className}-wrap`, style } : { class: `note-float ${className}-wrap` });

  const noteHead = el('ellipse', {
    cx: x, cy: noteY, rx: 8, ry: 6,
    class: className,
    transform: `rotate(-20 ${x} ${noteY})`,
  });
  noteGroup.appendChild(noteHead);

  const stemUp = staffPosition < 4;
  const stemX = stemUp ? x + 7.5 : x - 7.5;
  const stemY2 = stemUp ? noteY - 32 : noteY + 32;
  noteGroup.appendChild(el('line', {
    x1: stemX, y1: noteY, x2: stemX, y2: stemY2,
    class: 'note-stem',
  }));

  g.appendChild(noteGroup);
  return { x, y: noteY, stemUp, stemX, stemTopY: stemY2 };
}

/**
 * Porteyi ve üzerinde nota(lar)ı SVG olarak render eder.
 * @param {SVGElement} svgEl - İçine çizilecek <svg> elementi
 * @param {Object} opts
 *   - staffPosition: tekli nota modu (quiz ekranı) için nota konumu
 *   - clefId: 'treble' | 'bass' | 'alto' | 'tenor'
 *   - showNote: tekli nota gösterilsin mi
 *   - clefScale: anahtar sembolü ölçeği
 *   - notes: [{ staffPosition, x? }] — birden fazla nota (örn. giriş ekranı süslemesi)
 *   - animated: notes verildiğinde her birine hafif "süzülme" animasyonu ekler
 */
function renderStaff(svgEl, { staffPosition = null, clefId = 'treble', showNote = true, clefScale = 1, notes = null, animated = false } = {}) {
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

  if (notes && notes.length) {
    // Çoklu nota modu (dekoratif): notaları yatayda dağıt
    const usableWidth = STAFF_WIDTH - 60;
    const startX = STAFF_LEFT_PAD + 40;
    const spacing = notes.length > 1 ? usableWidth / (notes.length - 1) : 0;
    const drawn = notes.map((n, i) => {
      const x = n.x != null ? n.x : startX + i * spacing;
      const style = animated ? `--float-delay:${(i * 0.35).toFixed(2)}s` : null;
      return drawNoteAt(g, x, n.staffPosition, baseY, { className: 'note-head note-head-accent', style });
    });

    // Ardışık notaları zarif bir "bağ" (slur) çizgisiyle birleştir
    if (drawn.length > 1) {
      const topY = Math.min(...drawn.map(d => Math.min(d.y, d.stemTopY))) - 14;
      const startPt = drawn[0];
      const endPt = drawn[drawn.length - 1];
      const midX = (startPt.x + endPt.x) / 2;
      const slur = el('path', {
        d: `M ${startPt.x} ${topY + 20} Q ${midX} ${topY} ${endPt.x} ${topY + 20}`,
        class: 'note-slur',
        fill: 'none',
      });
      g.appendChild(slur);
    }
  } else if (showNote && staffPosition !== null) {
    drawNoteAt(g, NOTE_X, staffPosition, baseY, { className: 'note-head' });
  }

  svgEl.appendChild(g);
}

export { renderStaff, staffPositionToY };
