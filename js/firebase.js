const BASE_URL = "https://join-1326-ga-default-rtdb.europe-west1.firebasedatabase.app/";

let email;
let password;
let loginFormValidationErrorMessage;
let signUpFormValidationErrorMessage;

let userfound = false;

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

async function checkIfDataIsCorrect(containerLoginId, containerPasswordId) {
    let responseUseres = await fetch(BASE_URL + "users.json");
    let users = await responseUseres.json();


    for (let key in users) {
        if (email == users[key].user.email && password == users[key].user.passwort) {
            window.location.href = "home.html";
            userfound = true;
            sessionStorage.setItem("userfound", userfound);
            sessionStorage.setItem("userName", users[key].user.name);
            break;
        }
    }
    if (!userfound) {
        loginFormValidationErrorMessage.innerText = "Wrong email or password!";
        setErrorBorder(containerLoginId, containerPasswordId);
    }
}

function loginAsGuest() {
    sessionStorage.setItem("userfound", true);
    sessionStorage.setItem("userName", "Guest");

    window.location.href = "home.html";
}

function tryToSignUp(confirmId) {
    let signUpName = document.getElementById("signUpNameInput").value;
    let signUpEmail = document.getElementById("signUpEmailInput").value;
    let signUpPassword = document.getElementById("signUpPasswordInput").value;
    let signUpPasswortConfirm = document.getElementById("signUpPasswordConfirmInput").value;
    signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    if (signUpName !== "" && signUpEmail !== "" && signUpPassword !== "" && signUpPasswortConfirm !== "") {
        if (signUpPassword === signUpPasswortConfirm) {
            checkIfUserAlreadyExists(signUpEmail, signUpName, signUpPassword);
        }
        else {
            signUpFormValidationErrorMessage.innerText = "Your passwords don't match. Please try again.";
            setErrorBorder(confirmId);
        }
    }
    else {
        signUpFormValidationErrorMessage.innerText = "Please fill in all fields!";
    }
}

async function checkIfUserAlreadyExists(email, name, password) {
    signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    let response = await fetch(BASE_URL + "users.json");
    let users = await response.json();
    let emailExists = false;
    for (let key in users) {
        if (users[key].user.email === email) {
            emailExists = true;
            break;
        }
    }
    if (emailExists) {
        signUpFormValidationErrorMessage.innerText = "This user is already registered!";
    } else {
        saveNewUserToDB(name, email, password);
    }
}

async function saveNewUserToDB(name, email, password) {
    signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    signUpFormValidationErrorMessage.innerText = "";
    const color = getRandomHexColor();
    const userJson = basicJsonStructure(name, email, password, color);

    let response = await fetch(BASE_URL + "users.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userJson)
    });
}

function basicJsonStructure(name, email, password, color) {
    return {
        user: {
            name: name,
            email: email,
            passwort: password,
            color: color,
            initial: getInitials(name),
            phone: "1234567890123"
        }
    };
}

function getRandomHexColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

function getInitials(name){
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

async function getTasks() {
    const tasks = await fetch(BASE_URL + "tasks.json");
    const results = await tasks.json();
    return results;
}