let allTasks = [];

// Trigger callback every time the element appears (e.g., when navigating to Board)
function onElementAppear(selector, cb) {
    let present = false;
    const check = () => {
        const el = document.querySelector(selector);
        if (el && !present) {
            present = true;
            cb(el);
        } else if (!el && present) { present = false; } // element removed; allow future appearances to trigger again
    };
    check(); // initial check in case it's already there
    const observer = new MutationObserver(() => check()); // observe DOM changes to detect future inserts/removals
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

onElementAppear('#boardContainer', () => {
    loadBoard();
});

async function loadBoard() {
    const tasks = await getTasks();
    const arrTasks = getTasksToArray(tasks)
    allTasks = arrTasks;
    renderBoard(arrTasks);
}

function renderBoard(tasks) {
    const noTaskSection = document.getElementById("noTasks");
    if (!tasks.length) { noTaskSection.innerHTML = `<div class="spaceHolderContainer">No tasks to do</div>`; return }

    const section = document.getElementById("boardContainer");
    let html = "";
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        html += `<div id=${task.id} class="boardCardContainer" onclick=openTaskDetails('${task.id}')>`;
        const description = task.description.length > 7 ? task.description.split(" ", 7).join(" ").concat("...") : task.description
        if (task.category === 'User Story') {
            html += `<div class="categoryFieldUserStory">User Story</div>`
        } else { html += `<div class="categoryFieldTechnicalTask">Technical Task</div>` }

        html += `<div class="titleOfTask">${task.title}</div>
                <div class="descriptionOfTask">${description || ""}</div>
                ${renderProgressBar(task)}
                <div class="contactsAndPriorityContainer">
                    <div>${renderContactsOnBoard(task.assignedTo)}</div>
                    <div>${renderPriorityOnBoard(task.priority)}</div>
                </div>
                </div>`;
    }
    section.innerHTML = html
}

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

function renderContactsOnBoard(users) {
    if (!users) return `<div id="avatarBoard">No users assigned</div>`
    let template = '<div class="boardContactsContainer">'
    users.forEach(user => {
        template += `<div id="avatarBoard" class="avatarBoard" style="background:${user.color};color:#fff;">${user.initial}</div>`
    });
    template += "</div>";
    return template;
}

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

function getTasksToArray(tasks) {
    const arr = [];
    if (!tasks) return arr;

    for (let taskID in tasks) {
        const task = tasks[taskID];
        arr.push({ id: taskID, title: task.title || "", description: task.description || "", status: task.status || "", assignedTo: task.assignedTo, category: task.category, dueDate: task.dueDate, priority: task.priority, subtasks: task.subtasks });
    }
    return arr;
}

function openAddTaskOverlay() {
    let overlay = document.getElementById('addTaskBoardOverlayMainSection');
    overlay.classList.add('show');
    document.getElementById('homeBody').style.overflow = 'hidden';
    // renderContactsInAddTask();      //=> Only needed if addTask is not reset
    resetAddTaskSide();
}


function closeAddTaskOverlay() {
    let overlay = document.getElementById('addTaskBoardOverlayMainSection');
    overlay.classList.remove('show');
    document.getElementById('homeBody').style.overflow = 'unset';
    document.getElementById('addTaskBoardOverlay').classList.add('d-none');
}


function createTaskInOverlay() {
    if (!checkRequiredFields()) { return; }
    // const taskData = getTaskData();     => // disabled for testing purposes
    // saveTaskToDatabase(taskData);       =>// disabled for testing purposes
    showAddTaskOverlaySuccessMessage();

    setTimeout(() => {
        closeAddTaskOverlay();
    }, 1000);
}


function showAddTaskOverlaySuccessMessage() {
    document.getElementById('addTaskBoardOverlay').classList.remove('d-none');
}

async function openTaskDetails(taskId) {
    const task = allTasks.find(task => task.id === taskId);
    await slideinBoardDetailsOverlay()
    const content = document.getElementById("boardOverlayContent");
    const categoryColor = task.category === 'User Story' ? '#0038FF' : '#1FD7C1';

    const html = `<div class="overlineHeadline" onclick="closeOverlay()">
            <div class="categoryFieldUserStoryOverlay" style="background:${categoryColor}"}>${task.category}</div>
            <img class="closeOverlayBoardImg" src="../assets/icons/close.svg">
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

        ${getSubtasksOnBoardDetails(task.subtasks)}

        <div class="containerEditTaskOverlay">
            <div class="editContactBtn" onclick="editContact('meuID')">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z"
                        fill="currentColor" />
                </svg>
                <p>Edit</p>
            </div>
            <div class="separationLineGrey"></div>
            <div class="editContactBtn" onclick="deleteContact('MEuID')">
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
        </div>`
    content.innerHTML = html;
}

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

function formatDate(date) {
    const data = new Date(date);
    return data.toLocaleDateString("en", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

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

function getSubtasksOnBoardDetails(subtasks) {
    if (!subtasks) return "";
    let template = ''
    subtasks.forEach(subtask => {
        template += `
        <label class="cb">
            <input type="checkbox" class="cbInput">
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

