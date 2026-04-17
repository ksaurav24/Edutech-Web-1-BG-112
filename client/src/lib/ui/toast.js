function getToastContainer() {
  return document.getElementById('toast-container');
}

export function initToasts() {
  let container = getToastContainer();
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

export function showToast(msg, type = 'success') {
  const container = getToastContainer();
  if (!container) {
    return;
  }

  const el = document.createElement('div');
  el.className = 'toast flex items-start gap-2';
  el.innerHTML = `<span>${type === 'error' ? '❌' : (type === 'info' ? 'ℹ️' : '✅')}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }, 3000);
}

