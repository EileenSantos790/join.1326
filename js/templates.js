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


function getContactTemplate(contacts, index) {
    const contact = contacts[index];
    const isSelected = selectedContactsAddTask.some(c => c.id === contact.id);

    return `
        <div onclick="addTaskSelectContact('${contact.id}', '${contact.initial}', '${contact.color}', '${contact.name}')"
             id="assignedToContact-${contact.id}" 
             class="dropdownItem ${isSelected ? 'dropdownItemOn' : 'dropdownItemOff'}">
             
            <div style="display: flex; align-items: center; gap: 16px">
                <div class="avatar" style="background:${contact.color}; color:#fff;">
                    ${contact.initial}
                </div>
                <div>${contact.name}</div>
            </div> 
            
            <img id="assignedToCheckbox-${contact.id}" 
                 class="checkboxImg ${isSelected ? 'd-none' : ''}" 
                 src="../assets/icons/check-button.svg" 
                 alt="checkbox empty">
                 
            <img id="assignedToCheckboxWhite-${contact.id}" 
                 class="${isSelected ? '' : 'd-none'}" 
                 src="../assets/icons/checked_white.svg" 
                 alt="">
        </div>
    `;
}


function getSelectedContactTemplate(contact, color) {
    return `
            <div class="margin_top8 avatar" style="background:${color};color:#fff;">${contact}</div>
    `;
}


function getSubtaskListTemplate(subtask) {
    return `<div class="subtaskItem" id="subtask${subtask.id}" ondblclick="editSubtask(${subtask.id})">
        <li class="subtaskText" id="subtaskText${subtask.id}">${subtask.text}</li>
        <div class="subtaskActions">
          <img src="../assets/icons/subtask_edit.svg" alt="Edit" onclick="editSubtask(${subtask.id})">
          <div class="subtaskSeperator"></div>
          <img src="../assets/icons/subtask_delete.svg" alt="Delete" onclick="deleteSubtask(${subtask.id})">
        </div>
      </div>`;
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


function getBoardOverlayEditTaskTemplate(taskId) {
    return `
        <div class="addTaskEditBoardOverlay">
            <div onclick="closeOverlay()" class="editBoardOverlayCloseSection"><img src="../assets/icons/close.svg"
                    alt="close Icon"></div>
            <div class="editBoardOverlayMainContent">
                <div class="addTaskMainContent">
                    <div class="addTaskTitleInputContent">
                        <p>Title</p>
                        <div class="addTaskInputContainerWithValidation">
                            <div id="addTasktTitleInputContainer" class="signUpValidationInputContainer bgWhite">
                                <input
                                    onfocus="setFocusBorder('addTasktTitleInputContainer', 'addTasktTitleErrorContainer')"
                                    onblur="removeFocusBorderCheckInputValue('addTasktTitleInputContainer', 'addTasktTitleInput', 'addTasktTitleErrorContainer')"
                                    id="addTasktTitleInput" class="addTaskInputs defaultInput" type="title"
                                    placeholder="Enter a title">
                            </div>
                            <div id="addTasktTitleErrorContainer" class="loginFormValidationErrorMessage"></div>
                        </div>
                    </div>
                    <div class="addTaskDescriptionInputContent">
                        <p>Description</p>
                        <div class="addTaskDescriptionContainerWithValidation">
                            <div id="addTaskDescriptionInputContainer" class="addTaskDescriptionInputContainer bgWhite">
                                <textarea onfocus="setFocusBorder('addTaskDescriptionInputContainer')"
                                    onblur="removeFocusBorder('addTaskDescriptionInputContainer')"
                                    class="addTaskTextarea" name="Description" placeholder="Enter a Description"
                                    id="addTaskTextarea"></textarea>
                                <img src="../assets/icons/textarea_icon.svg" alt="resize icon">
                            </div>
                            <div class="loginFormValidationErrorMessage"></div>
                        </div>
                    </div>
                    <div>
                        <p>Due date</p>
                        <div class="addTaskInputContainerWithValidation">
                            <div id="addTasktDateInputContainer" class="signUpValidationInputContainer bgWhite">
                                <input
                                    onfocus="setFocusBorder('addTasktDateInputContainer', 'addTasktDateErrorContainer')"
                                    onblur="removeFocusBorderCheckInputValue('addTasktDateInputContainer', 'addTasktDateInput', 'addTasktDateErrorContainer')"
                                    id="addTasktDateInput" class="addTaskInputs defaultInput placeholderStyle" required
                                    type="date">
                            </div>
                            <div id="addTasktDateErrorContainer" class="loginFormValidationErrorMessage"></div>
                        </div>
                    </div>
                    <div class="paddingBottom24">
                        <p>Priority</p>
                        <div class="addTaskPriorityButtons">
                            <button id="addTaskUrgentButton"
                                onclick="activatePriorityButton('addTaskUrgentButton','buttonUrgentActive','urgentButtonOff','urgentButtonOn')"
                                class="buttonUrgent">Urgent <img id="urgentButtonOff" class="buttonUrgentIcon"
                                    src="../assets/icons/prio_high.svg" alt="Urgent Button Icon"><img
                                    id="urgentButtonOn" class="buttonUrgentIcon d-none"
                                    src="../assets/icons/prio_high_white.svg" alt="Urgent Button Icon"></button>
                            <button id="addTaskMediumButton"
                                onclick="activatePriorityButton('addTaskMediumButton','buttonMediumActive','mediumButtonOff','mediumButtonOn')"
                                class="buttonMedium">Medium <img id="mediumButtonOff"
                                    class="buttonMediumIcon d-none" src="../assets/icons/prio_media.svg"
                                    alt="Medium Button Icon"><img id="mediumButtonOn" class="buttonMediumIcon"
                                    src="../assets/icons/prio_media_white.svg" alt="Medium Button Icon"></button>
                            <button id="addTaskLowButton"
                                onclick="activatePriorityButton('addTaskLowButton','buttonLowActive','lowButtonOff','lowButtonOn')"
                                class="buttonLow">Low <img id="lowButtonOff" class="buttonLowIcon"
                                    src="../assets/icons/prio_low.svg" alt="Low Button Icon"><img id="lowButtonOn"
                                    class="buttonLowIcon d-none" src="../assets/icons/prio_low_white.svg"
                                    alt="Low Button Icon"></button>
                        </div>
                    </div>

                    <div class="paddingBottom24">
                        <p>Assigned to</p>
                        <div id="addTaskAssignedToDropdownContent" class="dropdown" data-task-id="null">
                            <div onclick="toggleDropdownAssignedTo()" id="addTaskDropdownAssignedTo"
                                class="addTaskDropdownContainer bgWhite">
                                <span>Select contacts to assign</span>
                                <img class="dropdownDownIcon" src="../assets/icons/dropdown-down.svg" alt="Arrown down">
                            </div>
                            <div id="addTaskAddedContactIcons" class="addTaskAddedContactIcons"></div>
                            <div id="addTaskDropdownSearchContent"
                                class="addTaskDropDownSection bgWhite boxShadow d-none">
                                <div class="addTaskDropdownContainerSearch">
                                    <input onkeyup="searchContactsForTask()" id="addTaskSearchInput"
                                        class="addTaskSearchInput" type="text">
                                    <img onclick="toggleDropdownAssignedTo()" class="dropdownDownIcon"
                                        src="../assets/icons/dropdown-up.svg" alt="Arrown up">
                                </div>
                                <div class="dropdownContent">
                                    <div id="assignedToContactContent" class="dropdownItemContainer">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                        <p>Subtasks</p>
                        <div>
                            <div id="subtaskInputContainer" class="subtaskInputContainer">
                                <input onfocus="setFocusBorder('subtaskInputContainer')"
                                    onblur="removeFocusBorder('subtaskInputContainer')" id="subtaskInput"
                                    class="subtaskInput" type="text" placeholder="Add new subtask">
                                <div class="subtaskInputIconContainer">
                                    <img onclick="clearSubtaskInput()" id="subtaskInputCancelButton"
                                        class="subtaskInputIcon" src="../assets/icons/cancle.svg" alt="cancel x Icon">
                                    <div class="subtaskSeperator"></div>
                                    <img onclick="addSubtaskToList()" id="subtaskInputCheckButton"
                                        class="subtaskInputIcon" src="../assets/icons/check_black.svg" alt="check Icon">
                                </div>
                            </div>
                            <div>
                                <div id="subtaskListContent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="editBoardOverlayButton"><button class="buttonOk" onclick="handleUpdateTask('${taskId}')">Ok <img src="../assets/icons/check.svg"
                        alt="check Icon"></button></div>
        </div>
    `;
}