let userInitials;
let greetingUserName;


/** 
 * Toggles the checkbox state and enables/disables the associated button.
 * @param {string} checkId - The ID of the checked checkbox element.
 * @param {string} uncheckId - The ID of the unchecked checkbox element.
 * @param {string} buttonId - The ID of the button to enable/disable.
 */
function toggleCheckbox(checkId, uncheckId, buttonId) {
    let checked = document.getElementById(checkId);
    let unchecked = document.getElementById(uncheckId);
    let buttonStatus = document.getElementById(buttonId);
    checked.classList.toggle('d-none');
    unchecked.classList.toggle('d-none');
    buttonStatus.toggleAttribute('disabled');
}


/** 
 * Switches the password and icon between visible and hidden. 
 * @param {string} inputId - The ID of the password input field.
 * @param {string} iconOffId - The ID of the "eye-off" icon element.
 * @param {string} iconOnId - The ID of the "eye-on" icon element. 
 */
function togglePasswordVisibility(inputId, iconOffId, iconOnId) {
    let input = document.getElementById(inputId);
    let iconOff = document.getElementById(iconOffId);
    let iconOn = document.getElementById(iconOnId);
    iconOff.classList.toggle('d-none');
    iconOn.classList.toggle('d-none');
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}


/**
 * Load the sign-up page.
 * @param {string} htmlName - The name of the HTML file to load.
 */
function loadSignUp(htmlName) {
    window.location.href = htmlName;
}


/** 
 * Adds focus styling to the given input wrapper and clears any error messages.
 * @param {string} containerId - The ID of the input container element.
 * @param {string} errorMessageId - The ID of the error message element.
 */
function setFocusBorder(containerId, errorMessageId) {
    document.getElementById(containerId).classList.add('inputBorderColorFocus');
    document.getElementById(containerId).classList.remove('inputErrorBorder');
    let errorMessage = document.getElementById(errorMessageId);
    if (errorMessage) {
        errorMessage.innerText = "";
    }
}


/** Removes the focus styling from the given input wrapper. 
 * @param {string} containerId - The ID of the input container element.
*/
function removeFocusBorder(containerId) {
    document.getElementById(containerId).classList.remove('inputBorderColorFocus');
}


/** Applies the error border to the provided input wrappers. 
 * @param {string} containerLoginId - The ID of the login input container.
 * @param {string} containerPasswordId - The ID of the password input container.
*/
function setErrorBorder(containerLoginId, containerPasswordId) {
    document.getElementById(containerLoginId).classList.add('inputErrorBorder');
    if (containerPasswordId) {
        document.getElementById(containerPasswordId).classList.add('inputErrorBorder');
    }
}


/** Adds an error border when no category is selected. 
 * @param {string} containerId - The ID of the category input container.
*/
function setErrorBorderForCategory(containerId) {
    let categoryHeader = document.getElementById('categoryDropdownHeader');
    if (categoryHeader.textContent == "Select task category") {
        document.getElementById(containerId).classList.add('inputErrorBorder');
    }
}


/** 
 * Initialize session (Local Storage) and set user initials and greeting message.
*/
async function sessionInit() {
    const user = (sessionStorage.getItem('userName') || '').trim();
    if (typeof userInitials !== 'undefined' && userInitials) {
        userInitials.innerText = user
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }
    setGreetingMessage();
}


/**
 * set greeting message based on the time of day and user's name.
 */
function setGreetingMessage() {
    const greetingDayTimeEl = document.getElementById('greetingDayTime');
    const greetingUserNameEl = document.getElementById('greetingUserName');
    const greetingDayTimeElMobile = document.getElementById('greetingDayTimeMobile');
    const greetingUserNameElMobile = document.getElementById('greetingUserNameMobile');
    if (!greetingDayTimeEl || !greetingDayTimeElMobile) return;

    const { greeting, userName } = getGreetingMessage();

    greetingDayTimeEl.innerText = greeting;
    greetingDayTimeElMobile.innerText = greeting;
    if (greetingUserNameEl) greetingUserNameEl.textContent = userName;
    if (greetingUserNameElMobile) greetingUserNameElMobile.textContent = userName;
}


/**
 * function to get greeting message and user name.
 * @returns {object} - An object containing the greeting message and user name.
 */
function getGreetingMessage() {
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good Morning, '
        : h < 18 ? 'Good Afternoon, '
            : 'Good Night, ';
    const userName = (sessionStorage.getItem('userName') || '').trim();
    const isGuest = userName === '' || userName.toLowerCase() === 'guest';
    if (isGuest) {
        const greetingNoComma = greeting.replace(/,\s*$/, '') + '!';
        return { greeting: greetingNoComma, userName: '' };
    } else {
        return { greeting, userName };
    }
}


/**
 * Setup automatic updates for the greeting message.
 * This ensures the greeting message is always current without requiring a page refresh.
 */
(function setupGreetingAutoUpdate() {
    const runNow = () => setGreetingMessage();
    const schedule = () => { runNow(); requestAnimationFrame(runNow); setTimeout(runNow, 0); setTimeout(runNow, 100); setTimeout(runNow, 300); };
    schedule();
    window.addEventListener('DOMContentLoaded', schedule);
    window.addEventListener('load', schedule);
    window.addEventListener('pageshow', schedule);
    window.addEventListener('visibilitychange', schedule);
    window.addEventListener('hashchange', schedule);
    document.addEventListener('click', () => schedule(), true);
    const observer = new MutationObserver(() => { schedule(); });
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (_) { }
    window.setGreetingMessage = setGreetingMessage;
})();


/** 
 * Toggles visibility of the user submenu. 
*/
function showSubmenu() {
    const submenu = document.getElementById('submenu');
    submenu.classList.toggle('d-none');
}
document.addEventListener('click', (event) => {
    const submenu = document.getElementById('submenu');
    if (!submenu || submenu.classList.contains('d-none')) return;
    if (submenu.contains(event.target)) return;
    if (event.target.closest('.userProfileCirle')) return;
    closeSubmenu();
});


/** 
 * Hides the user submenu. 
*/
function closeSubmenu() {
    const submenu = document.getElementById('submenu');
    submenu.classList.add('d-none');
}


/**
 * Hides the desktop user menu icons. 
*/
function hideUserMenu() {
    const submenu = document.getElementById('menuIcons');
    submenu.classList.add('d-none');
}


/** 
 * Logout the user and clear session storage.
*/
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}


/** 
 * Returns true when the viewport width is in mobile range. 
*/
function isMobile() {
    return window.innerWidth <= 1024;
}


/**
 * Navigates back in the browser history. 
*/
function goBack() {
    const loggedIn = sessionStorage.getItem('userfound') === 'true';
    const aPreviousPage = JSON.parse(sessionStorage.getItem('pageHistory')) || [];
    const previewPage = aPreviousPage[aPreviousPage.length - 2];
    if (loggedIn) {
        if (aPreviousPage.length) {
            const menuItem = document.querySelector(`.navLine[data-file*=${previewPage}], .sitesNavContainer[data-file*=${previewPage}], #btnHelpe[data-file*=${previewPage}]`);
            menuItem.click();
            aPreviousPage.pop();
            storePreviousPage(aPreviousPage);
        } else { window.location.href = 'home.html'; }
    } else { window.location.href = 'index.html'; }
}


/** 
 * Stores the previous page in session storage. 
 * @param {Array} aPreviousPage - An array of previous page identifiers.
*/
function storePreviousPage(aPreviousPage) {
    sessionStorage.setItem('pageHistory', JSON.stringify(aPreviousPage));
}