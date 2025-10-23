/**
 * Starts rendering once the DOM content is loaded.
 * Attaches the main initialization handler for the navigation-driven layout.
 */
window.addEventListener('DOMContentLoaded', renderMainContent);

/**
 * Stack of visited page identifiers stored in sessionStorage under 'pageHistory'.
 * Used to support goBack() navigation across reloads or within the SPA.
 * @type {string[]}
 */
let aPreviousPage = JSON.parse(sessionStorage.getItem('pageHistory')) || [];


/**
 * Initializes the main content area and navigation bindings.
 *
 * - Binds click handlers to navigation elements
 * - Supports deep-linking via `?page=` URL param
 * - Defaults to clicking the first nav item if no param is present
 *
 * @async
 * @returns {Promise<void>}
 */
async function renderMainContent() {
  const content = document.getElementById('contentContainer');
  const items = document.querySelectorAll('.navLine');
  const sites = document.querySelectorAll('.sitesNavContainer');
  const buttons = document.querySelectorAll('.submenuButton');
  setClickEvents(items, content);
  setClickEvents(sites, content);
  setClickEvents(buttons, content);
  attachHelp(content);
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('page')) openPageFromUrl(content);
  else if (items.length > 0) items[0].click();
}


/**
 * Adds click handlers that update active state, load target content, and record history.
 *
 * Side effects:
 * - Mutates the DOM by toggling `.active` classes
 * - Calls {@link loadPage} to fetch and render HTML
 * - Updates `aPreviousPage` and persists via `storePreviousPage`
 *
 * @param {NodeListOf<Element>|Element[]} items - List of menu elements that trigger navigation.
 * @param {HTMLElement} content - Container where fetched HTML will be injected.
 * @returns {void}
 */
function setClickEvents(items, content) {
  for (const item of items) {
    item.addEventListener('click', () => {
      const file = item.getAttribute('data-file');
      const isStaticInfoPage = file === "./htmlTemplates/privacyPolicy.html" || file === "./htmlTemplates/legalNotice.html" || file === "./htmlTemplates/help.html";
      const shouldClearActive = typeof isMobile === 'function' && isMobile() && isStaticInfoPage;
      if (shouldClearActive) {clearAllActiveStates();
      } else {markActive(items, item); }
      if (file) {loadPage(file, content); }
      aPreviousPage.push(file.replace("./htmlTemplates/", "").replace(".html", ""));
      storePreviousPage(aPreviousPage);
    });
  }
}


/**
 * Highlights the clicked menu item and removes highlight from others.
 *
 * @param {NodeListOf<Element>|Element[]} items - All menu items to clear.
 * @param {Element} activeItem - The item to mark as active.
 * @returns {void}
 */
function markActive(items, activeItem) {
  for (const item of items) {
    item.classList.remove('active');
  }
  activeItem.classList.add('active');
}


/**
 * Clears the active state from all navigation-related elements.
 * Targets `.navLine`, `.sitesNavContainer`, and `.submenuButton`.
 * @returns {void}
 */
function clearAllActiveStates() {
  document
    .querySelectorAll('.navLine.active, .sitesNavContainer.active, .submenuButton.active')
    .forEach(el => el.classList.remove('active'));
}


/**
 * Loads the HTML content of the given file into the content container.
 * Removes the `board-page` class when the target isn't the board.
 * When opening Add Task, triggers `resetAddTaskSide()` hook.
 *
 * @param {string} file - Relative path to an HTML fragment/template.
 * @param {HTMLElement} content - Container where the content will be rendered.
 * @returns {void}
 */
function loadPage(file, content) {
  content.innerHTML = '';
  if (file !== "./htmlTemplates/board.html") { document.documentElement.classList.remove('board-page'); }
  fetch(file)
    .then(response => checkFile(response, file))
    .then(html => content.innerHTML = html)
    .catch(error => showError(error, content));
  if (file === "./htmlTemplates/addTask.html") {
    resetAddTaskSide();
  }
}


/**
 * Validates a fetch Response and returns its text content on success.
 * Throws an Error with file context when the response is not ok.
 *
 * @param {Response} response - Fetch Response to validate.
 * @param {string} file - File path used for error context.
 * @returns {Promise<string>} The response body as text.
 * @throws {Error} When the response status is not ok.
 */
function checkFile(response, file) {
  if (!response.ok) {
    throw new Error('Loading was not successful → ' + file);
  }
  return response.text();
}


/**
 * Displays a red error message in the content container.
 *
 * @param {Error} error - Error instance containing a message to show.
 * @param {HTMLElement} content - Container where the error will be injected.
 * @returns {void}
 */
function showError(error, content) {
  content.innerHTML = '<p style="color:red;">' + error.message + '</p>';
}


/**
 * Opens a specific page based on the URL parameter `page`.
 * Supports `privacyPolicy` and `legalNotice` identifiers.
 *
 * Behavior:
 * - If a corresponding menu item exists, triggers its click (ensures active states)
 * - Otherwise loads the file directly (and clears actives on mobile)
 *
 * @param {HTMLElement} content - Container to render the requested page.
 * @returns {void}
 */
function openPageFromUrl(content) {
  const page = new URLSearchParams(window.location.search).get("page");
  const files = { privacyPolicy: "./htmlTemplates/privacyPolicy.html", legalNotice: "./htmlTemplates/legalNotice.html"};
  const fileToOpen = files[page];
  if (!fileToOpen) return;
  const menuItem = document.querySelector(`[data-file="${fileToOpen}"]`);
  if (menuItem) {
    menuItem.click(); 
    const path = menuItem.dataset.file;
    if (path === "./htmlTemplates/privacyPolicy.html" || path === "./htmlTemplates/legalNotice.html") { hideUserMenu(); } //For desktop
  }
  else {
    if (typeof isMobile === 'function' && isMobile()) {
      clearAllActiveStates();
    }
    loadPage(fileToOpen, content);
  }
}


/**
 * Attaches a click event to the help icon in the header to open the help page.
 * Clears active states for main navigation items when opening help.
 *
 * @param {HTMLElement} content - Container where the help page will be rendered.
 * @returns {void}
 */
function attachHelp(content) {
  const helpIcon = document.querySelector('.helpIcon');
  if (!helpIcon) return;
  helpIcon.addEventListener('click', () => {
    const file = helpIcon.getAttribute('data-file');
    if (!file) return;
    document.querySelectorAll('.navLine, .sitesNavContainer').forEach(el => el.classList.remove('active'));
    loadPage(file, content);
  });
}


/**
 * Loads the add-task template and highlights its menu item (mobile only).
 *
 * @param {string} sideLink - The HTML template link to load for Add Task.
 * @returns {void}
 */
function openAddTaskSide(sideLink) {
  if (isMobile()) {
    const content = document.getElementById('contentContainer');
    const items = document.querySelectorAll('.navLine');
    const addTask = document.getElementById('navLineAddTask');

    loadPage(sideLink, content);

    for (const item of items) {
      item.classList.remove('active');
    }
    addTask.classList.add('active');
  }
}


/**
 * On window load, if the user is logged in and there is a prior page history,
 * attempts to navigate back to the last registered page via `goBack()`.
 */
window.addEventListener('load', () => {
    try {
        const historyArr = JSON.parse(sessionStorage.getItem('pageHistory') || '[]');
        const loggedIn = sessionStorage.getItem('userfound') === 'true';
        if (historyArr?.length >= 2 && loggedIn) {
            goBack();
        }
    } catch (error) {
        console.error("Error occurred while navigating:", error);
    }
});