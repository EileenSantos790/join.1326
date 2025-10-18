/** Starts rendering once the DOM content is loaded. */
window.addEventListener('DOMContentLoaded', renderMainContent);


/** Initializes the main content area and navigation. */
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


/** Adds click events to each menu item. */
function setClickEvents(items, content) {
  for (const item of items) {
    item.addEventListener('click', () => {
      const file = item.getAttribute('data-file');
      const isStaticInfoPage = file === "./htmlTemplates/privacyPolicy.html" || file === "./htmlTemplates/legalNotice.html";
      const shouldClearActive = typeof isMobile === 'function' && isMobile() && isStaticInfoPage;
      if (shouldClearActive) {clearAllActiveStates();
      } else {markActive(items, item); }
      if (file) {loadPage(file, content); }
    });
  }
}


/** Highlights the clicked menu item and removes highlight from others. */
function markActive(items, activeItem) {
  for (const item of items) {
    item.classList.remove('active');
  }
  activeItem.classList.add('active');
}


/** Clears the active state from all navigation-related elements. */
function clearAllActiveStates() {
  document
    .querySelectorAll('.navLine.active, .sitesNavContainer.active, .submenuButton.active')
    .forEach(el => el.classList.remove('active'));
}


/** Loads the HTML content of the given file into the content container. */
function loadPage(file, content) {
  content.innerHTML = 'Lade...';
  fetch(file)
    .then(response => checkFile(response, file))
    .then(html => content.innerHTML = html)
    .catch(error => showError(error, content));
  if (file === "./htmlTemplates/addTask.html") {
    resetAddTaskSide();
  }
}


/** Checks if the fetched file response is OK. */
function checkFile(response, file) {
  if (!response.ok) {
    throw new Error('Loading was not successful → ' + file);
  }
  return response.text();
}


/** Displays an error message in the content container. */
function showError(error, content) {
  content.innerHTML = '<p style="color:red;">' + error.message + '</p>';
}


/** Opens a specific page based on the URL parameter "page". */
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


/** Attaches a click event to the help icon in the header. */
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


/** Loads the add-task template and highlights its menu item. */
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
