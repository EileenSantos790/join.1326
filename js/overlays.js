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
  attachOverlayOutsideClickHandler();
}


/** Closes the overlay:. */
function closeOverlay() {
  document.getElementById('homeBody').classList.remove('overflowHidden');
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  detachOverlayOutsideClickHandler();
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

/** Attaches pointer handlers so the overlay closes only when both pointerdown and pointerup occur outside the overlay panel (true outside click) */
let __overlayPointerDownOutside = false;
function attachOverlayOutsideClickHandler() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  if (!root || !panel) return;
  if (root.__overlayHandlersAttached) return;
  const onPointerDown = (e) => { const target = e.target; __overlayPointerDownOutside = !(target instanceof Element && panel.contains(target)); };
  const onPointerUp = (e) => { const target = e.target; const upOutside = !(target instanceof Element && panel.contains(target)); if (__overlayPointerDownOutside && upOutside) { closeOverlay();}};
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointerup', onPointerUp);
  root.__overlayHandlersAttached = { onPointerDown, onPointerUp };
}

/** Detaches the pointer event handlers from the overlay root element and cleans up the stored handler references. */
function detachOverlayOutsideClickHandler() {
  const root = document.getElementById('overlayRoot');
  if (!root || !root.__overlayHandlersAttached) return;
  const { onPointerDown, onPointerUp } = root.__overlayHandlersAttached;
  root.removeEventListener('pointerdown', onPointerDown);
  root.removeEventListener('pointerup', onPointerUp);
  root.__overlayHandlersAttached = null;
}
