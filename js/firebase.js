const BASE_URL = "https://join-1326-ga-default-rtdb.europe-west1.firebasedatabase.app/";

let email;
let password;
let loginFormValidationErrorMessage;


function tryToLogin() {
    email = document.getElementById("emailInput").value;
    password = document.getElementById("passwordInput").value;
    loginFormValidationErrorMessage = document.getElementById("loginFormValidationErrorMessage");

    if (email !== "" && password !== "") {
        checkIfDataIsCorrect();
    }
    else {
        loginFormValidationErrorMessage.innerText = "Please fill in all fields!";
    }
}

async function checkIfDataIsCorrect() {
    let responseUseres = await fetch(BASE_URL + ".json");
    let responseUsersToJson = await responseUseres.json();
    let userfound = false;
    let users = responseUsersToJson.users;
    for (let key in users) {
        if (email == users[key].email && password == users[key].passwort) {
            window.location.href = "home.html";
            userfound = true;
            break;
        }
    }
    if (!userfound) {
        loginFormValidationErrorMessage.innerText = "Wrong email or password!";
    }
}

function tryToSignUp() {
    let signUpName = document.getElementById("signUpNameInput").value;
    let signUpEmail = document.getElementById("signUpEmailInput").value;
    let signUpPassword = document.getElementById("signUpPasswordInput").value;
    let signUpPasswortConfirm = document.getElementById("signUpPasswordConfirmInput").value;
    let signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");

    if (signUpName !== "" && signUpEmail !== "" && signUpPassword !== "" && signUpPasswortConfirm !== "") {
        if (signUpPassword === signUpPasswortConfirm) {
            checkIfUserAlreadyExists(signUpEmail, signUpName, signUpPassword);
        }
        else {
            signUpFormValidationErrorMessage.innerText = "Passwords do not match!";
        }
    }
    else {
        signUpFormValidationErrorMessage.innerText = "Please fill in all fields!";
    }
}

async function checkIfUserAlreadyExists(email, name, password) {
    let signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    let response = await fetch(BASE_URL + "users.json");
    let users = await response.json();
    let emailExists = false;
    for (let key in users) {
        if (users[key].email === email) {
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
    let signUpFormValidationErrorMessage = document.getElementById("signUpFormValidationErrorMessage");
    signUpFormValidationErrorMessage.innerText = "";
    let response = await fetch(BASE_URL + "users.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            email: email,
            passwort: password
        })
    });
}
