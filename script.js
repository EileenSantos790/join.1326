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
    if(input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}