/**
 * function renderMainContent can only be used when HTML is loaded
 */
window.addEventListener('DOMContentLoaded', renderMainContent);


/**
 * Initializes the main content area and navigation.
 *
 * - Finds the main content container and all navigation elements.
 * - Attaches click events to the main menu items (left sidebar).
 * - Attaches click events to the site menu items (privacy policy, legal notice).
 * - Attaches click event to the help icon in the header.
 * - If a "page" URL parameter is present, it opens that page.
 * - Otherwise, it automatically opens the first main menu item.
 */
function renderMainContent() {
  const content = document.getElementById('contentContainer');
  const items = document.querySelectorAll('.navLine');
  const sites = document.querySelectorAll('.sitesNavContainer');

  setClickEvents(items, content);
  setClickEvents(sites, content);
  attachHelp(content);

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('page')) openPageFromUrl(content);
  else if (items.length > 0) items[0].click();
}

/**
 * Adds click events to each menu item.
 * On click, it marks the item as active and loads the corresponding page.
 *
 * @param {NodeList} items
 * @param {HTMLElement} content
 */
function setClickEvents(items, content) {
  for (const item of items) {
    item.addEventListener('click', () => {
      markActive(items, item);
      const file = item.getAttribute('data-file');
      loadPage(file, content);
    });
  }
}


/**
 * Highlights the clicked menu item and removes highlight from others.
 *
 * @param {NodeList} items
 * @param {HTMLElement} activeItem
 */
function markActive(items, activeItem) {
  for (const item of items) {
    item.classList.remove('active');
  }
  activeItem.classList.add('active');
}


/**
 * Loads the HTML content of the given file into the content container.
 * Shows a loading message and handles errors if the file cannot be loaded.
 *
 * @param {string} file
 * @param {HTMLElement} content
 */
function loadPage(file, content) {
  content.innerHTML = 'Lade...';

  fetch(file)
    .then(response => checkFile(response, file))
    .then(html => content.innerHTML = html)
    .catch(error => showError(error, content));
}


/**
 * Checks if the fetched file response is OK.
 * Throws an error if the file cannot be loaded.
 *
 * @param {Response} response
 * @param {string} file
 * @returns {Promise<string>}
 */
function checkFile(response, file) {
  if (!response.ok) {
    throw new Error('Loading was not successful → ' + file);
  }
  return response.text();
}


/**
 * Displays an error message in the content container.
 *
 * @param {Error} error
 * @param {HTMLElement} content
 */
function showError(error, content) {
  content.innerHTML = '<p style="color:red;">' + error.message + '</p>';
}


/**
 * Opens a specific page based on the URL parameter "page".
 *
 * - Supports the values "privacyPolicy" and "legalNotice".
 * - Looks up the corresponding HTML file path in the `files` map.
 * - If a matching navigation item exists, it triggers a click on that item
 *   (so it also gets marked as active).
 * - If no navigation item exists, it directly loads the file into the content container.
 * - If the "page" parameter is missing or invalid, nothing happens.
 *
 * @param {HTMLElement} content
 */
function openPageFromUrl(content) {
  const page = new URLSearchParams(window.location.search).get("page");

  const files = {
    privacyPolicy: "./htmlTamplates/privacyPolicy.html",
    legalNotice: "./htmlTamplates/legalNotice.html"
  };

  const fileToOpen = files[page];
  if (!fileToOpen) return;

  const menuItem = document.querySelector(`[data-file="${fileToOpen}"]`);
  if (menuItem) menuItem.click();
  else loadPage(fileToOpen, content);
}


/**
 * Attaches a click event to the help icon in the header.
 * When clicked, it loads the HTML file specified in the icon's "data-file" attribute
 * into the given content container.
 *
 * Removes the "active" class from all navigation and site menu items,
 *   so the help icon acts independently of the side navigation.
 * Uses the loadPage() function to fetch and display the file.
 *
 * @param {HTMLElement} content
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