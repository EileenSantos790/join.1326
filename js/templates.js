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
    const contacts = contact[index];
    const isSelected = selectedContactsAddTask.some(c => c.id === contacts.id);

    return `
        <div onclick="addTaskSelectContact('assignedToContact${index}','assignedToCheckbox${index}','assignedToCheckboxWhite${index}','${contact[index].initial}','${contact[index].color}','${contact[index].id}', '${contact[index].name}')" id="assignedToContact${index}" class="dropdownItem ${isSelected ? 'dropdownItemOn' : 'dropdownItemOff'}">
            <div style="display: flex;align-items: center;gap: 16px">
                <div id="" class="avatar" style="background:${contact[index].color};color:#fff;">${contact[index].initial}</div>
                <div>${contact[index].name}</div>
            </div> 
            <img id="assignedToCheckbox${index}" class="checkboxImg ${isSelected ? 'd-none' : ''}" src="../assets/icons/check-button.svg" alt="checkbox empty">
            <img id="assignedToCheckboxWhite${index}" class="${isSelected ? '' : 'd-none'}" src="../assets/icons/checked_white.svg" alt="">
        </div>
    `;
}


function getSelectedContactTemplate(contact, color) {
    return `
            <div class="margin_top8 avatar" style="background:${color};color:#fff;">${contact}</div>
    `;
}


function getSubtaskListTemplate(subtask) {
    return `
      <div class="subtaskItem" id="subtask${subtask.id}" ondblclick="editSubtask(${subtask.id})">
        <li class="subtaskText" id="subtaskText${subtask.id}">${subtask.text}</li>
        <div class="subtaskActions">
          <img src="../assets/icons/subtask_edit.svg" alt="Edit" onclick="editSubtask(${subtask.id})">
          <div class="subtaskSeperator"></div>
          <img src="../assets/icons/subtask_delete.svg" alt="Delete" onclick="deleteSubtask(${subtask.id})">
        </div>
      </div>
    `;
}


function getSubtaskEditTemplate(subtask) {
    return `
      <div class="subtaskItemEdit" id="subtask${subtask.id}">
        <input onblur="handleBlurSubtask(${subtask.id})" class="subtaskInput" type="text" id="editInput${subtask.id}" value="${subtask.text}">
        <div class="subtaskActionsEdit">
          <img src="../assets/icons/subtask_delete.svg" alt="Save" onclick="deleteSubtask(${subtask.id})">
          <div class="subtaskSeperator"></div>
          <img src="../assets/icons/check_black.svg" alt="Cancel" onclick="saveSubtask(${subtask.id})">
        </div>
      </div>
    `;
}