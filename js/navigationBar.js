/**
 * function renderMainContent can only be used when HTML is loaded
 */
window.addEventListener('DOMContentLoaded', renderMainContent);


/**
 * Finds the main content container and all menu items.
 * Sets up click events and opens the first menu automatically.
 */
function renderMainContent() {
  const content = document.getElementById('contentContainer');
  const items = document.querySelectorAll('.navLine');

  setClickEvents(items, content);

  if (items.length > 0) {
    items[0].click();
  }
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
  } activeItem.classList.add('active');
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