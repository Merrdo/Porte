// ============================================================
// Vektörel İkon Seti (SVG) — emoji kullanılmaz
// Her ikon 24x24 viewBox üzerinde, currentColor ile boyanır
// ============================================================

const ICONS = {
  // Geri ok
  back: `<svg viewBox="0 0 24 24" fill="none"><path d="M15 5L8 12L15 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Kapat (X)
  close: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

  // İleri ok
  arrowRight: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Kilit
  lock: `<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V7.5C8 5 9.8 3 12 3C14.2 3 16 5 16 7.5V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

  // Onay (check) — tamamlanmış ders
  check: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 13L10 18L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Göz (görsel tanıma modu)
  eye: `<svg viewBox="0 0 24 24" fill="none"><path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>`,

  // Kulak (kulakla tanıma modu)
  ear: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 15C6 13.5 5 11.3 5 9C5 5.5 8 3 12 3C16 3 19 5.8 19 9.5C19 12.5 17.3 13.8 16 15.5C15.2 16.6 15 17.5 15 19C15 20.1 14.1 21 13 21C11.9 21 11 20.1 11 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8C13.1 8 14 8.9 14 10C14 11 13.3 11.4 12.7 11.9C12.3 12.3 12 12.6 12 13.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,

  // Hoparlör / sesi çal
  speaker: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 9V15H8L13 19V5L8 9H4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16.5 8.5C17.5 9.5 18 10.7 18 12C18 13.3 17.5 14.5 16.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6C20.7 7.7 21.5 9.7 21.5 12C21.5 14.3 20.7 16.3 19 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

  // Ateş / seri (streak)
  flame: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 8 6.5 8 11C8 13.2 9.8 15 12 15C14.2 15 16 13.2 16 11C16 9.5 15 8 15 8C15 8 15.5 10 14 11.5C14 11.5 14.5 8.5 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 14C7 15.2 6.5 16.5 6.5 18C6.5 20.5 9 22.5 12 22.5C15 22.5 17.5 20.5 17.5 18C17.5 16.5 17 15.2 16 14C16 16 14.2 17.5 12 17.5C9.8 17.5 8 16 8 14Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,

  // Ay/güneş (tema değiştir)
  theme: `<svg viewBox="0 0 24 24" fill="none"><path d="M20 14.5C18.9 15 17.7 15.2 16.5 15C13 14.3 10.5 11.2 10.5 7.5C10.5 6 10.9 4.6 11.6 3.4C7.3 4 4 7.7 4 12.3C4 17.4 8.1 21.5 13.2 21.5C17 21.5 20.2 19.2 21.6 15.9C21 16.1 20.5 16.3 20 14.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`,

  // Kupa / başarı rozeti (sonuç ekranı - geçti)
  trophy: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 4H17V9C17 12 14.8 14 12 14C9.2 14 7 12 7 9V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 5H4V7C4 8.7 5.3 10 7 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M17 5H20V7C20 8.7 18.7 10 17 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 14V17" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 20.5H15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9.5 17.5C9.5 17.5 10 20.5 12 20.5C14 20.5 14.5 17.5 14.5 17.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Yükselen enerji/çaba (sonuç ekranı - kaçırdı)
  spark: `<svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14H11L10 22L20 9H13L13 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
};

/**
 * Belirtilen ikonu bir CSS sınıfıyla birlikte döndürür (HTML string olarak kullanmak için)
 */
function icon(name, extraClass = '') {
  const svgMarkup = ICONS[name];
  if (!svgMarkup) {
    console.warn(`İkon bulunamadı: ${name}`);
    return '';
  }
  return svgMarkup.replace('<svg ', `<svg class="icon ${extraClass}" `);
}

export { icon, ICONS };
