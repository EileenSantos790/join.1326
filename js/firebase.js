const BASE_URL = "https://join-1326-ga-default-rtdb.europe-west1.firebasedatabase.app/";

let email;
let password;
let loginFormValidationErrorMessage;
let signUpFormValidationErrorMessage;
let userfound = false;


/**
 * check if the user is already logged in by looking for a session variable.
 */
function isUserAlreadyLogedIn() {
    const loggedIn = sessionStorage.getItem('userfound') === 'true';
    if (loggedIn) {
        window.location.href = 'home.html';
    }
}


/**
 * try to log in the user with the provided email and password.
 * @param {string} containerLoginId - The ID of the login input container.
 * @param {string} containerPasswordId - The ID of the password input container.
 */
function tryToLogin(containerLoginId, containerPasswordId) {
    email = document.getElementById("emailInput").value;
    password = document.getElementById("passwordInput").value;
    loginFormValidationErrorMessage = document.getElementById("loginFormValidationErrorMessage");

    if (email !== "" && password !== "") {
        checkIfDataIsCorrect(containerLoginId, containerPasswordId);
    }
    else {
        loginFormValidationErrorMessage.innerText = "Check your email and password. Please try again.";
        setErrorBorder(containerLoginId, containerPasswordId);
    }
}


/** 
 * check if the provided email and password are correct.
 * @param {string} containerLoginId - The ID of the login input container.
 * @param {string} containerPasswordId - The ID of the password input container.
*/
async function checkIfDataIsCorrect(containerLoginId, containerPasswordId) {
    let responseUseres = await fetch(BASE_URL + "users.json"); let users = await responseUseres.json();
    for (let key in users) {
        if (email == users[key].user.email && password == users[key].user.password) {
            window.location.href = "home.html";
            userfound = true;
            sessionStorage.setItem("userfound", userfound);
            sessionStorage.setItem("userName", users[key].user.name);
            sessionStorage.removeItem("pageHistory");
            break;
        }
    }
    if (!userfound) { loginFormValidationErrorMessage.innerText = "Wrong email or password!"; setErrorBorder(containerLoginId, containerPasswordId); }
}


/**
 * log in as a guest user.
 * sets session variables and redirects to home page.
*/
function loginAsGuest() {
    sessionStorage.setItem("userfound", true);
    sessionStorage.setItem("userName", "Guest");
    sessionStorage.removeItem("pageHistory");
    window.location.href = "home.html";
}


/**
 * Validate passwords and fields for sign up.
 * @param {string} signUpName - The name input value.
 * @param {string} signUpEmail - The email input value.
 * @param {string} signUpPassword - The password input value.
 * @param {string} signUpPasswordConfirm - The password confirmation input value.
 * @param {string} confirmId - The ID of the password confirmation input container.
 * @returns {boolean} - True if validation passes, false otherwise.
 */
function validatePasswordsAndFields(signUpName, signUpEmail, signUpPassword, signUpPasswordConfirm, confirmId) {
    let signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    if (signUpName !== "" && signUpEmail !== "" && signUpPassword !== "" && signUpPasswordConfirm !== "") {
        if (signUpPassword === signUpPasswordConfirm) { return true; } 
        else {
            signUpFormValidationErrorMessage.innerText = "Your passwords don't match. Please try again.";
            setErrorBorder(confirmId);
            return false;
        }
    } else {
        signUpFormValidationErrorMessage.innerText = "Please fill in all fields!";
        return false;
    }
}


/**
 * Try to sign up a new user.
 * @param {string} confirmId - The ID of the password confirmation input container.
*/
function tryToSignUp(confirmId) {
    let signUpName = document.getElementById("signUpNameInput").value;
    let signUpEmail = document.getElementById("signUpEmailInput").value;
    let signUpPassword = document.getElementById("signUpPasswordInput").value;
    let signUpPasswordConfirm = document.getElementById("signUpPasswordConfirmInput").value;

    if (validatePasswordsAndFields(signUpName, signUpEmail, signUpPassword, signUpPasswordConfirm, confirmId)) {
        checkIfUserAlreadyExists(signUpEmail, signUpName, signUpPassword);
    }
}


/**
 * Check if a user with the given email already exists in the database.
 * @param {string} email - The email to check.
 * @param {string} name - The name of the new user.
 * @param {string} password - The password of the new user.
*/
async function checkIfUserAlreadyExists(email, name, password) {
    signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    let response = await fetch(BASE_URL + "users.json");
    let users = await response.json();
    let emailExists = false;
    for (let key in users) {
        if (users[key].user.email === email) {
            emailExists = true;
            break;}}
    if (emailExists) {
        signUpFormValidationErrorMessage.innerText = "This user is already registered!";
    } else { saveNewUserToDB(name, email, password); }
}


/**
 * Save a new user to the database.
 * @param {string} name - The name of the new user.
 * @param {string} userEmail - The email of the new user.
 * @param {string} userPassword - The password of the new user.
 */
async function saveNewUserToDB(name, userEmail, userPassword) {
    signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    signUpFormValidationErrorMessage.innerText = "";
    const color = getRandomHexColor();
    const userJson = basicJsonStructure(name, userEmail, userPassword, color);
    await fetch(BASE_URL + "users.json", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userJson) });
    let popUp = document.getElementById("popupOverlay");
    popUp.classList.remove("d-none");
    email = userEmail;
    password = userPassword;
    setTimeout(async () => { popUp.classList.add("d-none"); await checkIfDataIsCorrect("signUpEmailInputContainer", "signUpPasswordInputContainer"); }, 2000);
}


/** 
 * Create a basic JSON structure for a new user.
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @param {string} color - The color associated with the user.
 * @returns {object} - The JSON structure for the new user.
*/
function basicJsonStructure(name, email, password, color) {
    return {
        user: {
            name: name,
            email: email,
            password: password,
            color: color,
            initial: getInitials(name),
            phone: "1234567890123"
        }
    };
}


/** 
 * Generate a random hex color.
 * @returns {string} - A random hex color string.
*/
function getRandomHexColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}


/** 
 * Get initials from a name.
 * @param {string} name - The full name of the user.
 * @returns {string} - The initials of the user.
 */
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}


/** 
 * Fetch tasks from the database.
 * @returns {object} - The tasks retrieved from the database.
 */
async function getTasks() {
    const tasks = await fetch(BASE_URL + "tasks.json");
    const results = await tasks.json();
    return results;
}