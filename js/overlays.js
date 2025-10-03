/**
 * Opens the "Add Contact" overlay:
 * - loads the HTML file with the form
 * - puts it inside the overlay panel
 * - calls further functions to connects the close buttons and to show the overlay
 */
async function slideinAddContactOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTemplates/addContactOverlay.html');
  const html = await overlayfile.text();
  panel.innerHTML = html;

  callCancelBtns();
  showoverlay(root);
}

async function slideinEditContactOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTemplates/editContactOverlay.html');
  const html = await overlayfile.text();
  panel.innerHTML = html;
  callCancelBtns();
  showoverlay(root);
}


/**
 * Finds the close buttons inside the overlay
 * and adds click events to close it.
 */
async function callCancelBtns(){
  const cancelBtn = document.getElementById('closeBtnBottom');
  const closeIcon = document.getElementById('closeBtnTop');

  if (cancelBtn) cancelBtn.addEventListener('click', closeOverlay);
  if (closeIcon) closeIcon.addEventListener('click', closeOverlay);
}


/**
 * Shows the overlay:
 * - stops background scrolling
 * - adds the "show" class so CSS runs the slide-in animation
 */
async function showoverlay(root){
  document.body.classList.add('noscroll');
  root.classList.remove('initalHiddenOverlay');
  root.classList.add('show');
}

/**
 * Closes the overlay:
 * - slides the panel back to the right
 * - removes the "show" class after the animation
 * - clears the panel content
 */
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

async function slideinBoardDetailsOverlay() {
  const root = document.getElementById('overlayRoot');
  const panel = document.getElementById('overlayPanel');
  const overlayfile = await fetch('./htmlTemplates/boardoverlay.html');
  const html = await overlayfile.text();
  panel.innerHTML = html;
  showoverlay(root);
}