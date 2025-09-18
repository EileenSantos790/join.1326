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

    checkSessionStorage();
    if (!loggedIn && !allowPublic) {
        window.location.href = 'index.html';
    }
}


function getContactTemplate(contact, index) {
    return `
        <div onclick="addTaskSelectContact('assignedToContact${index}','assignedToCheckbox${index}','assignedToCheckboxWhite${index}')" id="assignedToContact${index}" class="dropdownItem dropdownItemOff">
            ${contact}<img id="assignedToCheckbox${index}" class="checkboxImg" src="../assets/icons/check-button.svg" alt="checkbox empty"><img
            id="assignedToCheckboxWhite${index}" class="d-none" src="../assets/icons/checked_white.svg" alt="">
        </div>
    `;
}
