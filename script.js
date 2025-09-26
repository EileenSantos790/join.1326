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


function loadSignUp(htmlName) {
    window.location.href = htmlName;
}

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

    //sessionInit();
    if (!loggedIn && !allowPublic) {
        window.location.href = 'index.html';
    }
}

function sessionInit() {
    userInitials.innerText = sessionStorage.getItem('userName').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    setGreetingMessage();
}

async function setGreetingMessage() {

    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        document.getElementById("greetingDayTime").innerText = 'Good Morning, ';
    }
    else if (currentHour < 18) {
        document.getElementById("greetingDayTime").innerText = 'Good Afternoon, ';
    }
    else if (currentHour < 24) {
        document.getElementById("greetingDayTime").innerText = 'Good Night, ';
    }

    if (sessionStorage.getItem('userName') == 'Guest') {

        greetingDayTime.innerText = greetingDayTime.innerText.slice(0, -1) + '!';
        greetingUserName.innerHTML = "";
    }
    else {
        greetingUserName.innerHTML = sessionStorage.getItem('userName');
    }
}

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