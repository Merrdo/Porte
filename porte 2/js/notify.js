// ============================================================
// Uygulama İçi Bildirim Sistemi
// Native confirm()/alert() yerine kullanılır
// ============================================================

import { icon } from './icons.js';

let overlayRoot = null;

function getOverlayRoot() {
  if (!overlayRoot) {
    overlayRoot = document.createElement('div');
    overlayRoot.id = 'overlayRoot';
    document.body.appendChild(overlayRoot);
  }
  return overlayRoot;
}

/**
 * Uygulama içi onay modalı gösterir. Native confirm() yerine kullanılır.
 * @param {Object} opts - { title, message, confirmText, cancelText }
 * @returns {Promise<boolean>} - kullanıcı onayladıysa true
 */
function showConfirm({ title = '', message, confirmText = 'Tamam', cancelText = 'Vazgeç' }) {
  return new Promise((resolve) => {
    const root = getOverlayRoot();
    const modal = document.createElement('div');
    modal.className = 'app-modal-backdrop';
    modal.innerHTML = `
      <div class="app-modal" role="alertdialog" aria-modal="true">
        ${title ? `<h3 class="app-modal-title">${title}</h3>` : ''}
        <p class="app-modal-message">${message}</p>
        <div class="app-modal-actions">
          <button class="btn btn-secondary app-modal-cancel">${cancelText}</button>
          <button class="btn btn-primary app-modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;
    root.appendChild(modal);

    // Giriş animasyonunu tetiklemek için bir sonraki frame'de class ekle
    requestAnimationFrame(() => modal.classList.add('open'));

    function cleanup(result) {
      modal.classList.remove('open');
      setTimeout(() => modal.remove(), 200);
      resolve(result);
    }

    modal.querySelector('.app-modal-cancel').addEventListener('click', () => cleanup(false));
    modal.querySelector('.app-modal-confirm').addEventListener('click', () => cleanup(true));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cleanup(false);
    });
  });
}

/**
 * Kısa süreli, kendi kendine kapanan bildirim (toast) gösterir. Native alert() yerine kullanılır.
 * @param {Object} opts - { message, variant: 'success'|'error'|'info', duration }
 */
function showToast({ message, variant = 'info', duration = 2400 }) {
  const root = getOverlayRoot();
  const toast = document.createElement('div');
  toast.className = `app-toast app-toast-${variant}`;

  const iconName = variant === 'success' ? 'check' : variant === 'error' ? 'close' : 'spark';
  toast.innerHTML = `${icon(iconName, 'app-toast-icon')}<span>${message}</span>`;

  root.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('open'));

  setTimeout(() => {
    toast.classList.remove('open');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

export { showConfirm, showToast };
