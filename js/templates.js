/**
 * Checks if the user is logged in and redirects or modifies the navigation bar
 * If not logged in, redirects to index.html unless on public pages (privacyPolicy or legalNotice)
 */
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

/**
 * Generates the HTML template for a contact in the assigned to dropdown
 * @param {Array} contacts - Array of contact objects
 */
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

/**
 * Generates the HTML template for a selected contact avatar
 */
function getSelectedContactTemplate(contact, color) {
    return `
            <div class="margin_top8 avatar" style="background:${color};color:#fff;">${contact}</div>
    `;
}

/**
 * Generates the HTML template for a subtask in the subtask list
 * @param {Object} subtask - The subtask object containing id and text
*/
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

/** 
 * Generates the HTML template for editing a subtask
 * @param {Object} subtask - The subtask object containing id and text
 */
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

/**
 * Generates the HTML template for the board overlay to edit a task
 * @param {string} taskId - The ID of the task to be edited
*/
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
                    <div class="addTaskDateContainer">
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
                                class="buttonUrgent prioButtonAddTask">Urgent <img id="urgentButtonOff" class="buttonUrgentIcon"
                                    src="../assets/icons/prio_high.svg" alt="Urgent Button Icon"><img
                                    id="urgentButtonOn" class="buttonUrgentIcon d-none"
                                    src="../assets/icons/prio_high_white.svg" alt="Urgent Button Icon"></button>
                            <button id="addTaskMediumButton"
                                onclick="activatePriorityButton('addTaskMediumButton','buttonMediumActive','mediumButtonOff','mediumButtonOn')"
                                class="buttonMedium prioButtonAddTask">Medium <img id="mediumButtonOff"
                                    class="buttonMediumIcon d-none" src="../assets/icons/prio_media.svg"
                                    alt="Medium Button Icon"><img id="mediumButtonOn" class="buttonMediumIcon"
                                    src="../assets/icons/prio_media_white.svg" alt="Medium Button Icon"></button>
                            <button id="addTaskLowButton"
                                onclick="activatePriorityButton('addTaskLowButton','buttonLowActive','lowButtonOff','lowButtonOn')"
                                class="buttonLow prioButtonAddTask">Low <img id="lowButtonOff" class="buttonLowIcon"
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
                                <input onkeydown="addSubtaskWithEnter()" onfocus="setFocusBorder('subtaskInputContainer')"
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

/** Builds and appends a task card element into the target lane. */
function renderCard(task, card) {
    let html = `<div id="${task.id}" class="boardCardContainer drag" draggable="true" ondragstart="onDragStart(event)" ondragend="onDragEnd(event)" onclick="openTaskDetails('${task.id}')">`;
    const description = task.description.length > 7 ? task.description.split(" ", 7).join(" ").concat("...") : task.description
    if (task.category === 'User Story') { html += `<div class="categoryFieldUserStory">User Story</div>` } 
    else { html += `<div class="categoryFieldTechnicalTask">Technical Task</div>` }
    html += `<div class="titleOfTask">${task.title}</div>
                <div class="descriptionOfTask">${description || ""}</div>
                ${renderProgressBar(task)}
                <div class="contactsAndPriorityContainer">
                    <div>${renderContactsOnBoard(task.assignedTo)}</div>
                    <div>${renderPriorityOnBoard(task.priority)}</div>
                </div>

                    <div class="boardMoveToIcon" onclick="openBoardMoveToOverlay(event)"><img src="../assets/icons/board_task_move_to.svg" alt="Move To Icon"></div>
                    <div class="boardMoveToOverlay d-none" onclick="event.stopPropagation()">
                        <div class="boardMoveToHeadline">Move To</div>
                        <div class="boardMoveToOverlayButtons">
                            ${getNewStatus(task.id, task.status)}
                        </div>
                    </div>
            </div>`;
    card.innerHTML += html;
}

/** Returns the Move To overlay options based on the task status. */
function getNewStatus(taskId, currentStatus) {
    const aStatus = ["Todo", "Progress", "Feedback", "Done"];
    let currentIndex = aStatus.findIndex(s => s.includes(currentStatus));

    if (currentStatus === "Todo") return `<div class="boardMoveToButtonContent" onclick="changeBoardStatus('${taskId}', 'Progress')"><img src="../assets/icons/arrow_move_to_downward.svg" alt="arrow down">${aStatus[currentIndex + 1]}</div>`
    if (currentStatus === "Done") return `<div class="boardMoveToButtonContent" onclick="changeBoardStatus('${taskId}', 'Feedback')"><img src="../assets/icons/arrow_move_to_upward.svg" alt="arrow up">${aStatus[currentIndex - 1]}</div>`

    return `<div class="boardMoveToButtonContent" onclick="event.stopPropagation(); changeBoardStatus('${taskId}', '${aStatus[currentIndex - 1]}')"><img src="../assets/icons/arrow_move_to_upward.svg" alt="arrow up">${aStatus[currentIndex - 1]}</div>
            <div class="boardMoveToButtonContent" onclick="event.stopPropagation(); changeBoardStatus('${taskId}', '${aStatus[currentIndex + 1]}')"><img src="../assets/icons/arrow_move_to_downward.svg" alt="arrow down">${aStatus[currentIndex + 1]}</div>`
}

/** Renders a subtasks progress bar if the task contains subtasks. */
function renderProgressBar(task) {
    if (!task.subtasks) return ""
    const total = task.subtasks.length;
    const done = task.subtasks.filter(sb => sb.done === true).length;
    const percent = (done / total) * 100;
    return `
        <div class="processBarContainer">
        <div class="progress">
            <div class="progressBar" style="width: ${percent}%"></div>
        </div>
        <span class="progressLabel">${done}/${total} Subtasks</span>
        </div>
    `;
}

/** Builds the assigned contacts avatar strip for a task card. */
function renderContactsOnBoard(users) {
    if (!users) return `<div id="avatarBoard">No users assigned</div>`
    let template = '<div class="boardContactsContainer">'
    users.forEach(user => {
        template += `<div id="avatarBoard" class="avatarBoard" style="background:${user.color};color:#fff;">${user.initial}</div>`
    });
    template += "</div>";
    return template;
}

/** Returns the priority icon markup based on task priority. */
function renderPriorityOnBoard(priority) {
    switch (priority) {
        case "Urgent":
            return `<img class="priorityIconBoard"src="../assets/icons/prio_high.svg"></img>`
        case "Low":
            return `<img class="priorityIconBoard"src="../assets/icons/prio_low.svg">`
        default:
            return `<img class="priorityIconBoard"src="../assets/icons/prio_media.svg"></img>`
    }
}

/** Opens the task details overlay for the given task. */
async function openTaskDetails(taskId, editedTask = null) {
    const task = !editedTask ? allTasks.find(task => task.id === taskId) : editedTask;
    await slideinBoardDetailsOverlay()
    const content = document.getElementById("boardOverlayContent");
    const categoryColor = task.category === 'User Story' ? '#0038FF' : '#1FD7C1';

    const html = `<div class="overlineHeadline" onclick="closeOverlay()">
            <div class="categoryFieldUserStoryOverlay" style="background:${categoryColor}"}>${task.category}</div>
            <svg class="closeOverlayBoardImg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_367575_1084" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_367575_1084)">
                    <path d="M12 13.4L7.10005 18.3C6.91672 18.4834 6.68338 18.575 6.40005 18.575C6.11672 18.575 5.88338 18.4834 5.70005 18.3C5.51672 18.1167 5.42505 17.8834 5.42505 17.6C5.42505 17.3167 5.51672 17.0834 5.70005 16.9L10.6 12L5.70005 7.10005C5.51672 6.91672 5.42505 6.68338 5.42505 6.40005C5.42505 6.11672 5.51672 5.88338 5.70005 5.70005C5.88338 5.51672 6.11672 5.42505 6.40005 5.42505C6.68338 5.42505 6.91672 5.51672 7.10005 5.70005L12 10.6L16.9 5.70005C17.0834 5.51672 17.3167 5.42505 17.6 5.42505C17.8834 5.42505 18.1167 5.51672 18.3 5.70005C18.4834 5.88338 18.575 6.11672 18.575 6.40005C18.575 6.68338 18.4834 6.91672 18.3 7.10005L13.4 12L18.3 16.9C18.4834 17.0834 18.575 17.3167 18.575 17.6C18.575 17.8834 18.4834 18.1167 18.3 18.3C18.1167 18.4834 17.8834 18.575 17.6 18.575C17.3167 18.575 17.0834 18.4834 16.9 18.3L12 13.4Z" fill="#2A3647"/>
                </g>
            </svg>
        </div>
        <div class="titleOfTaskOverlay">${task.title}</div>
        <div class="descriptionOfTaskOverlay">${task.description}</div>
        <div class="detailsOverlayContainer">
            <span>Due date: </span>
            <span>${formatDate(task.dueDate)}</span>
        </div>
        <div class="detailsOverlayContainer">
            <span>Priority:</span>
            ${getPriorityDetailsTemplate(task.priority)}
        </div>
        <div class="detailsOverlayContainer">
            <span>Assigned To:</span>
        </div>
        ${getContactsOnBoardDetailsTemplate(task.assignedTo)}
        <div class="detailsOverlayContainer">Subtasks:</div>

        ${getSubtasksOnBoardDetails(taskId, task.subtasks)}

        <div class="containerEditTaskOverlay">
            <div class="editContactBtn" onclick="deleteTask('${task.id}')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    class="deleteAndEditIcon">
                    <mask id="mask0_369895_4535" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                        width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_369895_4535)">
                        <path
                            d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z"
                            fill="currentColor" />
                    </g>
                </svg>
                <p>Delete</p>
            </div>
            <div class="separationLineGrey"></div>
            <div class="editContactBtn" onclick="editTask('${taskId}')">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z"
                        fill="currentColor" />
                </svg>
                <p>Edit</p>
            </div>
            
        </div>`
    content.innerHTML = html;

    // add event to capture checkbox subtasks (delegation scoped to the overlay)
    content.addEventListener('change', (ev) => {
        const input = ev.target.closest('input.cbInput');
        if (!input) return;
        const label = input.closest('label.cb');
        const subtaskId = label?.dataset.subtaskId;
        const isDone = input.checked;

        if (!task?.id) {
            task.id = label?.dataset.taskId;
        }

        onSubtaskToggle(task, subtaskId, isDone);
    }, { once: false });
}

/** Returns the priority label and icon markup for the overlay. */
function getPriorityDetailsTemplate(priority) {
    switch (priority) {
        case "Urgent":
            return `<div class="priorityImg">Urgent <img src="../assets/icons/prio_high.svg"></div>`
        case "Low":
            return `<div class="priorityImg">Low <img src="../assets/icons/prio_low.svg"></div>`
        default:
            return `<div class="priorityImg">Medium <img src="../assets/icons/prio_media.svg"></div>`
    }
}

/** Builds the assigned contacts list for the details overlay. */
function getContactsOnBoardDetailsTemplate(users) {
    if (!users) return "";
    let template = ''
    users.forEach(user => {
        template += `<div class="contactBoardDetailsContainer">
                        <div class="avatarBoardDetails" style="background:${user.color}">
                        ${user.initial}</div>
                        <div>${user.name}</div>
                    </div>`
    });
    return template;
}

/** Renders the subtasks checklist within the details overlay. */
function getSubtasksOnBoardDetails(taskId, subtasks) {
    if (!subtasks) return "";
    let template = ''
    subtasks.forEach(subtask => {
        template += `
        <label class="cb" data-subtask-id=${subtask.id} data-task-id=${taskId}>
            <input type="checkbox" class="cbInput" ${subtask.done ? 'checked' : ''}>
            <svg class="cbSvg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                    <mask id="cb-notch">
                        <rect x="0" y="0" width="24" height="24" fill="white" />
                        <circle cx="19" cy="5" r="4" fill="black" />
                    </mask>
                </defs>

                <rect class="cbBox" x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#2A3647"
                    stroke-width="2" />

                <rect class="cbBoxMasked" x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#2A3647"
                    stroke-width="2" mask="url(#cb-notch)" />

                <g class="cbCheck" transform="translate(6,2)">
                    <path d="M1 9L5 13L13 1.5" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </g>
            </svg>
            <span class="cbLabel">${subtask.text}</span>
        </label>`
    });
    return template;
}

/** Maps a priority value to the corresponding button configuration. */
function mapPriority(priority) {
    switch (priority) {
        case "Urgent":
            return { buttonId: "addTaskUrgentButton", buttonClass: "buttonUrgentActive", buttonIconOn: "urgentButtonOn", buttonIconOff: "urgentButtonOff" };
        case "Medium":
            return { buttonId: "addTaskMediumButton", buttonClass: "buttonMediumActive", buttonIconOn: "mediumButtonOn", buttonIconOff: "urgentButtonOff" };
        default:
            return { buttonId: "addTaskLowButton", buttonClass: "buttonLowActive", buttonIconOn: "lowButtonOn", buttonIconOff: "lowButtonOff" };
    }
}

/** Renders assigned contact avatars inside the edit overlay. */
function getContactsOnEditBoardTemplate(users) {
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    if (!users) {
        contentDiv.innerHTML = "No users assigned";
        return
    }
    let template = ''
    users.forEach(user => {
        usersListOnEdit.push(user)
        template += `<div class="margin_top8 avatar" style="background:${user.color}">${user.initial}</div>`
    });
    contentDiv.innerHTML = template;
}