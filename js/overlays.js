async function slideinAddContactOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTamplates/addContactOverlay.html');
  const html = await overlayfile.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  panel.innerHTML = doc.body.innerHTML;
  const cancelBtn = document.getElementById('closeBtnBottom');
  const closeIcon = document.getElementById('closeBtnTop');

  if (cancelBtn) cancelBtn.addEventListener('click', closeAddContactOverlay);
  if (closeIcon) closeIcon.addEventListener('click', closeAddContactOverlay);

  document.body.classList.add('noscroll');
  root.classList.remove('initalHiddenOverlay');
  root.classList.add('show');
}

function closeAddContactOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');

  panel.style.transform = 'translateX(100vw)';

  setTimeout(() => {
    root.classList.remove('show');
    document.body.classList.remove('noscroll');
    panel.innerHTML = '';
    panel.style.transform = '';
  }, 350);
}