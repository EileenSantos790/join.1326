/**
 * Loads and displays the Add Contact overlay panel.
 *
 * Behavior:
 * - Fetches the `addContactOverlay.html` template and injects it into `#overlayPanel`.
 * - Wires up cancel/close button handlers and optional validators.
 * - Shows the overlay with proper body scroll locking.
 *
 * @async
 * @returns {Promise<void>}
 */
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


/**
 * Loads and displays the Edit Contact overlay panel.
 *
 * Behavior:
 * - Fetches the `editContactOverlay.html` template and injects it into `#overlayPanel`.
 * - Wires up cancel/close button handlers and optional validators.
 * - Shows the overlay with proper body scroll locking.
 *
 * @async
 * @returns {Promise<void>}
 */
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


/**
 * Finds and wires close/dismiss buttons inside the current overlay.
 *
 * Elements handled:
 * - `#closeBtnBottom` (button): click closes overlay
 * - `#closeBtnTop` (section): prevents accidental close unless icon clicked
 * - `#closeBtnTop .closeIcon` (svg/icon): click closes overlay
 *
 * @async
 * @returns {Promise<void>}
 */
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


/**
 * Reveals the overlay root and locks body scroll.
 * Also attaches outside-click pointer handlers for reliable dismissal.
 *
 * @param {HTMLElement} root - The overlay root element (`#overlayRoot`).
 * @async
 * @returns {Promise<void>}
 */
async function showoverlay(root) {
  document.body.classList.add('noscroll');
  root.classList.remove('initalHiddenOverlay');
  root.classList.add('show');
  attachOverlayOutsideClickHandler();
}


/**
 * Closes the overlay with a slide-out transition and cleans up listeners/state.
 *
 * Side effects:
 * - Removes `.overflowHidden` from `#homeBody`
 * - Detaches outside-click handlers
 * - Clears panel content after transition
 *
 * @returns {void}
 */
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


/**
 * Loads and displays the Board Details overlay panel.
 *
 * Behavior:
 * - Fetches the `boardoverlay.html` template and injects it into `#overlayPanel`.
 * - Shows the overlay with proper body scroll locking.
 *
 * @async
 * @returns {Promise<void>}
 */
async function slideinBoardDetailsOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTemplates/boardoverlay.html');
  const html = await overlayfile.text();
  panel.innerHTML = html;
  showoverlay(root);
}

/**
 * Tracks whether the pointerdown originated outside the overlay panel.
 * Used to ensure that only a true outside-click (down+up outside) closes the overlay.
 * @type {boolean}
 */
let __overlayPointerDownOutside = false;

/**
 * Attaches pointer handlers so the overlay closes only when both pointerdown and
 * pointerup occur outside the overlay panel (true outside click).
 * Stores handlers on the root element to avoid multiple bindings.
 *
 * @returns {void}
 */
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

/**
 * Detaches the pointer event handlers from the overlay root element and
 * cleans up the stored handler references.
 *
 * @returns {void}
 */
function detachOverlayOutsideClickHandler() {
  const root = document.getElementById('overlayRoot');
  if (!root || !root.__overlayHandlersAttached) return;
  const { onPointerDown, onPointerUp } = root.__overlayHandlersAttached;
  root.removeEventListener('pointerdown', onPointerDown);
  root.removeEventListener('pointerup', onPointerUp);
  root.__overlayHandlersAttached = null;
}
