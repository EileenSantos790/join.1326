/** Checks if the user is logged in and redirects or modifies the navigation bar. */
function isUserLoggedIn() {
    const page = new URLSearchParams(location.search).get('page');
    const allowPublic = page === 'privacyPolicy' || page === 'legalNotice';
    const loggedIn = sessionStorage.getItem('userfound') === 'true';

    if (!loggedIn && allowPublic) {
        const nav = document.querySelector('.navContainer');
        if (nav) nav.innerHTML = `
        <div class="navContainer">
            <div class="navContainerLogo">
                <img class="joinIcon" src="assets/img/joinSymbolWhite.svg" alt="Join Icon">
            </div>
            <div class="navContainerMenu">
                <div class="navLine" onclick="location.href='index.html'">
                    <img class="navIcon" src="assets/icons/LogInIcon.svg" alt="Login Icon">
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

/** Generates the HTML template for a subtask in the subtask list. */
function getSubtaskListTemplate(subtask) {
    return `<div class="subtaskItem" id="subtask${subtask.id}" ondblclick="editSubtask(${subtask.id})">
        <li class="subtaskText" id="subtaskText${subtask.id}">${subtask.text}</li>
        <div class="subtaskActions">
          <img src="assets/icons/subtask_edit.svg" alt="Edit" onclick="editSubtask(${subtask.id})">
          <div class="subtaskSeperator"></div>
          <img src="assets/icons/subtask_delete.svg" alt="Delete" onclick="deleteSubtask(${subtask.id})">
        </div>
      </div>`;
}


/** Generates the HTML template for editing a subtask. */
function getSubtaskEditTemplate(subtask) {
    return `
      <div class="subtaskItemEdit" id="subtask${subtask.id}">
        <input onblur="handleBlurSubtask(${subtask.id})" class="subtaskInput" type="text" id="editInput${subtask.id}" value="${subtask.text}">
        <div class="subtaskActionsEdit">
          <img src="assets/icons/subtask_delete.svg" alt="Save" onclick="deleteSubtask(${subtask.id})">
          <div class="subtaskSeperator"></div>
          <img src="assets/icons/check_black.svg" alt="Cancel" onclick="saveSubtask(${subtask.id})">
        </div>
      </div>
    `;
}


/** Generates the HTML template for the board overlay to edit a task. */
function getBoardOverlayEditTaskTemplate(taskId) {
    return `
        <div class="addTaskEditBoardOverlay">
            <div class="editBoardOverlayCloseSection"><img src="assets/icons/close.svg" alt="close Icon" onclick="closeOverlay()"></div>
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
                                <img src="assets/icons/textarea_icon.svg" alt="resize icon">
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
                                    oninput="if(window.validateField){ validateField(this); }"
                                    onblur="if(window.validateField){ validateField(this); } else { removeFocusBorderCheckInputValue('addTasktDateInputContainer', 'addTasktDateInput', 'addTasktDateErrorContainer'); }"
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
                                    src="assets/icons/prio_high.svg" alt="Urgent Button Icon"><img
                                    id="urgentButtonOn" class="buttonUrgentIcon d-none"
                                    src="assets/icons/prio_high_white.svg" alt="Urgent Button Icon"></button>
                            <button id="addTaskMediumButton"
                                onclick="activatePriorityButton('addTaskMediumButton','buttonMediumActive','mediumButtonOff','mediumButtonOn')"
                                class="buttonMedium prioButtonAddTask">Medium <img id="mediumButtonOff"
                                    class="buttonMediumIcon d-none" src="assets/icons/prio_media.svg"
                                    alt="Medium Button Icon"><img id="mediumButtonOn" class="buttonMediumIcon"
                                    src="assets/icons/prio_media_white.svg" alt="Medium Button Icon"></button>
                            <button id="addTaskLowButton"
                                onclick="activatePriorityButton('addTaskLowButton','buttonLowActive','lowButtonOff','lowButtonOn')"
                                class="buttonLow prioButtonAddTask">Low <img id="lowButtonOff" class="buttonLowIcon"
                                    src="assets/icons/prio_low.svg" alt="Low Button Icon"><img id="lowButtonOn"
                                    class="buttonLowIcon d-none" src="assets/icons/prio_low_white.svg"
                                    alt="Low Button Icon"></button>
                        </div>
                    </div>

                    <div class="paddingBottom24">
                        <p>Assigned to</p>
                        <div id="addTaskAssignedToDropdownContent" class="dropdown" data-task-id="null">
                            <div onclick="toggleDropdownAssignedTo()" id="addTaskDropdownAssignedTo"
                                class="addTaskDropdownContainer bgWhite">
                                <span>Select contacts to assign</span>
                                <img class="dropdownDownIcon" src="assets/icons/dropdown-down.svg" alt="Arrown down">
                            </div>
                            <div id="addTaskAddedContactIcons" class="addTaskAddedContactIcons"></div>
                            <div id="addTaskDropdownSearchContent"
                                class="addTaskDropDownSection bgWhite boxShadow d-none">
                                <div class="addTaskDropdownContainerSearch">
                                    <input onkeyup="searchContactsForTask()" id="addTaskSearchInput"
                                        class="addTaskSearchInput" type="text">
                                    <img onclick="toggleDropdownAssignedTo()" class="dropdownDownIcon"
                                        src="assets/icons/dropdown-up.svg" alt="Arrown up">
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
                                        class="subtaskInputIcon" src="assets/icons/cancle.svg" alt="cancel x Icon">
                                    <div class="subtaskSeperator"></div>
                                    <img onclick="addSubtaskToList()" id="subtaskInputCheckButton"
                                        class="subtaskInputIcon" src="assets/icons/check_black.svg" alt="check Icon">
                                </div>
                            </div>
                            <div>
                                <div id="subtaskListContent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="editBoardOverlayButton"><button class="buttonOk" onclick="handleUpdateTask('${taskId}')">Ok <img src="assets/icons/check.svg"
                        alt="check Icon"></button></div>
        </div>
    `;
}


/** Returns the Move To overlay options based on the task status. */
function getNewStatus(taskId, currentStatus) {
    const aStatus = ["Todo", "Progress", "Feedback", "Done"];
    let currentIndex = aStatus.findIndex(s => s.includes(currentStatus));
    if (currentStatus === "Todo") return `<div class="boardMoveToButtonContent" onclick="changeBoardStatus('${taskId}', 'Progress')"><img src="assets/icons/arrow_move_to_downward.svg" alt="arrow down">${aStatus[currentIndex + 1]}</div>`
    if (currentStatus === "Done") return `<div class="boardMoveToButtonContent" onclick="changeBoardStatus('${taskId}', 'Feedback')"><img src="assets/icons/arrow_move_to_upward.svg" alt="arrow up">${aStatus[currentIndex - 1]}</div>`
    return `<div class="boardMoveToButtonContent" onclick="event.stopPropagation(); changeBoardStatus('${taskId}', '${aStatus[currentIndex - 1]}')"><img src="assets/icons/arrow_move_to_upward.svg" alt="arrow up">${aStatus[currentIndex - 1]}</div>
            <div class="boardMoveToButtonContent" onclick="event.stopPropagation(); changeBoardStatus('${taskId}', '${aStatus[currentIndex + 1]}')"><img src="assets/icons/arrow_move_to_downward.svg" alt="arrow down">${aStatus[currentIndex + 1]}</div>`
}


/** Returns the priority label and icon markup for the overlay. */
function getPriorityDetailsTemplate(priority) {
    switch (priority) {
        case "Urgent": return `<div class="priorityImg">Urgent <img src="assets/icons/prio_high.svg"></div>`
        case "Low": return `<div class="priorityImg">Low <img src="assets/icons/prio_low.svg"></div>`
        default: return `<div class="priorityImg">Medium <img src="assets/icons/prio_media.svg"></div>`
    }
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
        case "Urgent": return { buttonId: "addTaskUrgentButton", buttonClass: "buttonUrgentActive", buttonIconOn: "urgentButtonOn", buttonIconOff: "urgentButtonOff" };
        case "Medium": return { buttonId: "addTaskMediumButton", buttonClass: "buttonMediumActive", buttonIconOn: "mediumButtonOn", buttonIconOff: "urgentButtonOff" };
        default: return { buttonId: "addTaskLowButton", buttonClass: "buttonLowActive", buttonIconOn: "lowButtonOn", buttonIconOff: "lowButtonOff" };
    }
}


/** Ensures the summary pen icon uses an inline SVG. */
function ensureTodoIconSvg() {
    const container = document.querySelector('.smallWindows');
    if (!container) return;
    const existingSvg = container.querySelector('svg.summaryPenIconNormal');
    if (existingSvg) return;
    const img = container.querySelector('img.summaryPenIconNormal');
    if (!img) return;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'summaryIcon summaryPenIconNormal');
    svg.setAttribute('width', '69');
    svg.setAttribute('height', '69');
    svg.setAttribute('viewBox', '0 0 69 70');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('class', 'icon-bg');
    circle.setAttribute('cx', '34.5');
    circle.setAttribute('cy', '35');
    circle.setAttribute('r', '34.5');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', 'icon-fg-fill');
    path.setAttribute('d', 'M25.1667 44.3332H27.0333L38.5333 32.8332L36.6667 30.9665L25.1667 42.4665V44.3332ZM44.2333 30.8998L38.5667 25.2998L40.4333 23.4332C40.9444 22.9221 41.5722 22.6665 42.3167 22.6665C43.0611 22.6665 43.6889 22.9221 44.2 23.4332L46.0667 25.2998C46.5778 25.8109 46.8444 26.4276 46.8667 27.1498C46.8889 27.8721 46.6444 28.4887 46.1333 28.9998L44.2333 30.8998ZM42.3 32.8665L28.1667 46.9998H22.5V41.3332L36.6333 27.1998L42.3 32.8665Z');
    path.style.fill = 'var(--icon-fg)';
    svg.appendChild(circle);
    svg.appendChild(path);
    img.replaceWith(svg);
}

/** check if user is logged in and redirect to login page if not. */
function isUserLoggedIn() {
    const page = new URLSearchParams(location.search).get('page');
    const allowPublic = page === 'privacyPolicy' || page === 'legalNotice';
    const loggedIn = sessionStorage.getItem('userfound') === 'true';
    const mobile = isMobile();

    if (!loggedIn && allowPublic) {
        const nav = document.querySelector('.navContainer');
        if (nav) nav.innerHTML = `
        <div class="navContainer">
            <div class="navContainerLogo">
                <img class="joinIcon" src="assets/img/joinSymbolWhite.svg" alt="Join Icon">
            </div>
            <div class="navContainerMenu">
                <div class="navLine" onclick="location.href='index.html'">
                    <img class="navIcon" src="assets/icons/logInIcon.svg" alt="Login Icon">
                    <p>Log In</p>
                </div>

                <div id="policeAndNoticeMobile" class="policeAndNoticeMobile d-none">
                    <div id="privacePolicy" class="navLine" onclick="location.href='home.html?page=privacyPolicy&mobile=true'">
                        <p>Privacy Policy</p>
                    </div>

                    <div id="legalNotice" class="navLine" onclick="location.href='home.html?page=legalNotice&mobile=true'">
                        <p>Legal Notice</p>
                    </div>
                </div>

                <div class="navContainerSites">
                    <a class="sitesNavContainer" href="home.html?page=privacyPolicy&mobile=false">Privacy Policy</a>
                    <a class="sitesNavContainer" href="home.html?page=legalNotice&mobile=false">Legal Notice</a>
                </div>

            </div>
        </div>`;
        if (mobile) {
            page === "privacyPolicy" 
                ? document.getElementById("privacePolicy")?.classList.add('active')
                : document.getElementById("legalNotice")?.classList.add('active');

            document.getElementById("policeAndNoticeMobile")?.classList.remove('d-none');
            hideUserMenu(); // For mobile
        }else {
            nav.getElementsByClassName("navContainerMenu")[0].style.gap = "150px"
            nav.getElementsByClassName("sitesNavContainer")[0].style.paddingBottom = "20px"
        }
        return;
    }
    userInitials = document.getElementById('userInitials');
    greetingUserName = document.getElementById('greetingUserName');
    if (!loggedIn && !allowPublic) {
        window.location.href = 'index.html';
    }
    else {
        sessionInit();
        document.getElementById("navContainerMenu").classList.remove("d-none");
        document.getElementById("sitesNavContainer").classList.remove("d-none");
    }
}