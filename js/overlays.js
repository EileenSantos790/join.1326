/** Displays the add-contact overlay panel. */
async function slideinAddContactOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTemplates/addContactOverlay.html');
  const html = await overlayfile.text();
  panel.innerHTML = html;

  callCancelBtns();
  if (typeof attachContactValidators === 'function') {
    attachContactValidators();
  }
  showoverlay(root);
}


/** Displays the edit-contact overlay panel. */
async function slideinEditContactOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTemplates/editContactOverlay.html');
  const html = await overlayfile.text();
  panel.innerHTML = html;
  callCancelBtns();
  if (typeof attachContactValidators === 'function') {
    attachContactValidators();
  }
  showoverlay(root);
}


/** Finds the close buttons inside the overlay. */
async function callCancelBtns() {
  const cancelBtn = document.getElementById('closeBtnBottom');
  const closeSection = document.getElementById('closeBtnTop');
  const closeSvg = document.querySelector('#closeBtnTop .closeIcon');
  if (cancelBtn) cancelBtn.addEventListener('click', closeOverlay);
  if (closeSection) {
    closeSection.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element && target.closest('.closeIcon'))) { e.stopPropagation(); e.preventDefault(); }
    });
  }
  if (closeSvg) closeSvg.addEventListener('click', closeOverlay);
}


/** Shows the overlay:. */
async function showoverlay(root) {
  document.body.classList.add('noscroll');
  root.classList.remove('initalHiddenOverlay');
  root.classList.add('show');
}


/** Closes the overlay:. */
function closeOverlay() {
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


/** Displays the board details overlay panel. */
async function slideinBoardDetailsOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTemplates/boardoverlay.html');
  const html = await overlayfile.text();
  panel.innerHTML = html;
  showoverlay(root);
}
