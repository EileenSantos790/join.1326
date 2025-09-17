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


function checkSessionStorage() {
    userInitials.innerText = sessionStorage.getItem('userName').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    greetingUserName.innerHTML = sessionStorage.getItem('userName');
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