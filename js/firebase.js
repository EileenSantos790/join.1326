const BASE_URL = "https://join-1326-ga-default-rtdb.europe-west1.firebasedatabase.app/";

let email;
let password;
let loginFormValidationErrorMessage;
let signUpFormValidationErrorMessage;

let userfound = false;


/** Check if User is already logged in and redirect to home page if true. */
function isUserAlreadyLogedIn() {
    const loggedIn = sessionStorage.getItem('userfound') === 'true';
    if (loggedIn) {
        window.location.href = 'home.html';
    }
}


/** Try to login with the provided email and password. */
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


/** Check if the provided email and password are correct. */
async function checkIfDataIsCorrect(containerLoginId, containerPasswordId) {
    let responseUseres = await fetch(BASE_URL + "users.json"); let users = await responseUseres.json();
    for (let key in users) {
        if (email == users[key].user.email && password == users[key].user.password) {
            window.location.href = "home.html";
            userfound = true;
            sessionStorage.setItem("userfound", userfound);
            sessionStorage.setItem("userName", users[key].user.name);
            break;
        }
    }
    if (!userfound) { loginFormValidationErrorMessage.innerText = "Wrong email or password!"; setErrorBorder(containerLoginId, containerPasswordId); }
}


/** Login as a guest user (no authentication, just for demo purposes). */
function loginAsGuest() {
    sessionStorage.setItem("userfound", true);
    sessionStorage.setItem("userName", "Guest");
    window.location.href = "home.html";
}


/** Try to sign up a new user with the provided data. */
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


/** Attempts to sign up a new user after validating inputs. */
function tryToSignUp(confirmId) {
    let signUpName = document.getElementById("signUpNameInput").value;
    let signUpEmail = document.getElementById("signUpEmailInput").value;
    let signUpPassword = document.getElementById("signUpPasswordInput").value;
    let signUpPasswordConfirm = document.getElementById("signUpPasswordConfirmInput").value;

    if (validatePasswordsAndFields(signUpName, signUpEmail, signUpPassword, signUpPasswordConfirm, confirmId)) {
        checkIfUserAlreadyExists(signUpEmail, signUpName, signUpPassword);
    }
}


/** Check if the user already exists in the database. */
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


/** Save the new user to the database. */
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


/** Basic JSON structure for a new user. */
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


/** Get a random hex color. */
function getRandomHexColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}


/** Get initials from a name (first two letters). */
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}


/** Get all tasks from the database. */
async function getTasks() {
    const tasks = await fetch(BASE_URL + "tasks.json");
    const results = await tasks.json();
    return results;
}