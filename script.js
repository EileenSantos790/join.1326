let userInitials;
let greetingUserName;

/**
 * Check the box and activate the button. 
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
 */
function loadSignUp(htmlName) {
    window.location.href = htmlName;
}

/**
 * check if user is logged in and redirect to login page if not.
 */
function isUserLoggedIn() {
    const page = new URLSearchParams(location.search).get('page');
    const allowPublic = page === 'privacyPolicy' || page === 'legalNotice';
    const loggedIn = sessionStorage.getItem('userfound') === 'true';

    if (!loggedIn && allowPublic) {
        const nav = document.querySelector('.navContainer');
        if (nav) nav.innerHTML = `
        <div class="navContainer">
            <div class="navContainerLogo">
                <img class="joinIcon" src="./assets/img/joinSymbolWhite.svg" alt="Join Icon">
            </div>
            <div class="navContainerMenu">
                <div class="navLine" onclick="location.href='index.html'">
                    <img class="navIcon" src="./assets/icons/LogInIcon.svg" alt="Login Icon">
                    <p>Log In</p>
                </div>
            </div>
        </div>
    `;
        return;
    }
    userInitials = document.getElementById('userInitials');
    greetingUserName = document.getElementById('greetingUserName');
    if (!loggedIn && !allowPublic) {
        window.location.href = 'index.html';
    }
    else {
        sessionInit();
    }
}

/**
 * Set focus border on input field and remove error border and message.
 */
function setFocusBorder(containerId, errorMessageId) {
    document.getElementById(containerId).classList.add('inputBorderColorFocus');
    document.getElementById(containerId).classList.remove('inputErrorBorder');
    let errorMessage = document.getElementById(errorMessageId);
    if (errorMessage) {
        errorMessage.innerText = "";
    }
}

function removeFocusBorder(containerId) {
    document.getElementById(containerId).classList.remove('inputBorderColorFocus');
}

function setErrorBorder(containerLoginId, containerPasswordId) {
    document.getElementById(containerLoginId).classList.add('inputErrorBorder');
    if (containerPasswordId) {
        document.getElementById(containerPasswordId).classList.add('inputErrorBorder');
    }
}

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
 * Set greeting message based on the time of day and user name.
 */
function setGreetingMessage() {
    const greetingDayTimeEl = document.getElementById('greetingDayTime');
    const greetingUserNameEl = document.getElementById('greetingUserName');
    const greetingDayTimeElMobile = document.getElementById('greetingDayTimeMobile');
    const greetingUserNameElMobile = document.getElementById('greetingUserNameMobile');
    if (!greetingDayTimeEl || !greetingDayTimeElMobile) return;

    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good Morning, '
        : h < 18 ? 'Good Afternoon, '
            : 'Good Night, ';

    const userName = (sessionStorage.getItem('userName') || '').trim();
    greetingDayTimeEl.innerText = greeting;
    greetingDayTimeElMobile.innerText = greeting;
    if (greetingUserNameEl || greetingUserNameElMobile) {
        greetingUserNameEl.textContent = userName || 'Guest';
        greetingUserNameElMobile.textContent = userName || 'Guest'
    }
}

(function setupGreetingAutoUpdate() {
    const runNow = () => setGreetingMessage();
    const schedule = () => {
        runNow();
        requestAnimationFrame(runNow);
        setTimeout(runNow, 0);
        setTimeout(runNow, 100);
        setTimeout(runNow, 300);
    };
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

function showSubmenu() {
    const submenu = document.getElementById('submenu');
    submenu.classList.toggle('d-none');
}

/**
 * Logout the user and clear session storage.
 */
function logout(){
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function isMobile() {
    return window.innerWidth <= 1024;
}