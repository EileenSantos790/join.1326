let userInitials;
let greetingUserName;


/** Check the box and activate the button. */
function toggleCheckbox(checkId, uncheckId, buttonId) {
    let checked = document.getElementById(checkId);
    let unchecked = document.getElementById(uncheckId);
    let buttonStatus = document.getElementById(buttonId);
    checked.classList.toggle('d-none');
    unchecked.classList.toggle('d-none');
    buttonStatus.toggleAttribute('disabled');
}


/** Switches the password and icon between visible and hidden. */
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


/** Load the sign-up page. */
function loadSignUp(htmlName) {
    window.location.href = htmlName;
}


/** Set focus border on input field and remove error border and message. */
function setFocusBorder(containerId, errorMessageId) {
    document.getElementById(containerId).classList.add('inputBorderColorFocus');
    document.getElementById(containerId).classList.remove('inputErrorBorder');
    let errorMessage = document.getElementById(errorMessageId);
    if (errorMessage) {
        errorMessage.innerText = "";
    }
}


/** Removes the focus styling from the given input wrapper. */
function removeFocusBorder(containerId) {
    document.getElementById(containerId).classList.remove('inputBorderColorFocus');
}


/** Applies the error border to the provided input wrappers. */
function setErrorBorder(containerLoginId, containerPasswordId) {
    document.getElementById(containerLoginId).classList.add('inputErrorBorder');
    if (containerPasswordId) {
        document.getElementById(containerPasswordId).classList.add('inputErrorBorder');
    }
}


/** Adds an error border when no category is selected. */
function setErrorBorderForCategory(containerId) {
    let categoryHeader = document.getElementById('categoryDropdownHeader');
    if (categoryHeader.textContent == "Select task category") {
        document.getElementById(containerId).classList.add('inputErrorBorder');
    }
}


/** Initialize session (Local Storage) and set user initials and greeting message. */
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


/** Toggles visibility of the user submenu. */
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


/** Hides the user submenu. */
function closeSubmenu() {
    const submenu = document.getElementById('submenu');
    submenu.classList.add('d-none');
}


/** Hides the desktop user menu icons. */
function hideUserMenu() {
    const submenu = document.getElementById('menuIcons');
    submenu.classList.add('d-none');
}


/** Logout the user and clear session storage. */
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}


/** Returns true when the viewport width is in mobile range. */
function isMobile() {
    return window.innerWidth <= 1024;
}


/** Navigate back to home or login page based on session status. */
function goBack() {
    const userName = sessionStorage.getItem('userName');
    if (userName !== null && userName.trim() !== "") {
       window.location.href = 'home.html';
    } else {
        window.location.href = 'index.html';
    }
}