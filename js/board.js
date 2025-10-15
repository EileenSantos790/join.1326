let allTasks = [];
let subtasksListOnEdit = [];
let usersListOnEdit = [];
let draggedTaskId = null;
let dropPlaceholder = document.createElement('div');
dropPlaceholder.className = 'dropPlaceholder';

function onElementAppear(selector, cb) {
    let present = false;
    const check = () => {
        const el = document.querySelector(selector);
        if (el && !present) {
            present = true;
            cb(el);
        } else if (!el && present) { present = false; }
    };
    check();
    const observer = new MutationObserver(() => check());
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

onElementAppear('#boardTodoContainer', () => {
    loadBoard();
});

async function loadBoard() {
    const tasks = await getTasks();
    const arrTasks = getTasksToArray(tasks)
    allTasks = arrTasks;
    arrTasks.length && renderBoard(arrTasks);
}

function renderBoard(tasks) {
    const statuses = ['Todo', 'Progress', 'Feedback', 'Done'];

    statuses.forEach(s => {
        const lane = document.getElementById(`board${s}Container`);
        const ph = document.getElementById(`spaceHolder${s}Container`);
        if (lane) {
            lane.innerHTML = '';
            lane.classList.remove('dropActive', 'dropAtEnd');
            if (!lane.dataset.dndBound) {
                lane.addEventListener('dragover', onDragOver);
                lane.addEventListener('drop', onDrop);
                lane.addEventListener('dragleave', onDragLeave);
                lane.dataset.dndBound = '1';
            }
            if (ph && !ph.dataset.dndBound) {
                ph.addEventListener('dragover', onDragOver);
                ph.addEventListener('drop', onDrop);
                ph.addEventListener('dragleave', onDragLeave);
                ph.dataset.dndBound = '1';
            }
        }
        if (ph) ph.classList.remove('d-none');
    });

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const status = task.status;
        const lane = document.getElementById(`board${status}Container`);
        if (!lane) continue;
        const ph = document.getElementById(`spaceHolder${status}Container`);
        if (ph) ph.classList.add('d-none');
        renderCard(task, lane);
    }
}

function renderCard(task, card) {
    let html = `<div id="${task.id}" class="boardCardContainer drag" draggable="true" ondragstart="onDragStart(event)" ondragend="onDragEnd(event)" onclick="openTaskDetails('${task.id}')">`;
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

    card.innerHTML += html;
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

function openAddTaskOverlay(status) {
    const minWidth = window.innerWidth;
    if (minWidth > 1024) {
    let overlay = document.getElementById('addTaskBoardOverlayMainSection');
    overlay.classList.add('show');
    document.getElementById('homeBody').style.overflow = 'hidden';

    const span = overlay.querySelector('span[data-status]');
    span.dataset.status = status;

    resetAddTaskSide();
    } else return;
}


function closeAddTaskOverlay() {
    let overlay = document.getElementById('addTaskBoardOverlayMainSection');
    overlay.classList.remove('show');
    document.getElementById('homeBody').style.overflow = 'unset';
    document.getElementById('addTaskBoardOverlay').classList.add('d-none');
}

function showAddTaskOverlaySuccessMessage() {
    document.getElementById('addTaskBoardOverlay').classList.remove('d-none');
}

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
            <div class="editContactBtn" onclick="editTask('${task.id}')">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z"
                        fill="currentColor" />
                </svg>
                <p>Edit</p>
            </div>
            <div class="separationLineGrey"></div>
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

        if (!task?.id){
            task.id = label?.dataset.taskId;
        }

        onSubtaskToggle(task, subtaskId, isDone);
        }, { once: false });
}

function onSubtaskToggle(task, subtaskId, isDone) {
    const idx = (task.subtasks || []).findIndex(s => String(s.id) === String(subtaskId));
    if (idx === -1) return;
    if (task.subtasks[idx].done === isDone) return;
    task.subtasks[idx].done = isDone;
    updateTaskOnDatabase(task.id, task, true);
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
    return data.toLocaleDateString("en-GB", {
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

async function deleteTask(taskId) {
    try {
        await updateContactTask(taskId);
        await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
        closeOverlay();
        goToBoardHtml();
    } catch (err) {
        console.error("Error on delete task", err);
    }
}

async function updateContactTask(taskId) {
    try {
        const resp = await fetch(`${BASE_URL}users.json`);
        const users = await resp.json();
        if (!users) return [];
        for (const userId in users) {
            const user = users[userId].user;
            const tasksNode = user.tasks || [];
            if (tasksNode.includes(taskId)) {
                const updatedTasks = tasksNode.filter(id => id !== taskId);
                refreshContactTasksOnDb(userId, updatedTasks);
            }
        }
    } catch (err) {
        console.error("Error getUsersTasks:", err);
        return [];
    }
}

function refreshContactTasksOnDb(userId, updatedTasks) {
    try {
        fetch(`${BASE_URL}users/${userId}/user/tasks.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTasks)
        });
    } catch (error) {
        console.error("Erro update contact tasks:", err);
        return [];
    }
}

async function removeAllTasksFromUser(userId) {
    if (!userId) return;
    try {
        const res = await fetch(BASE_URL + "tasks.json");
        if (!res.ok) throw new Error("Error loading tasks");
        const tasks = await res.json();
        if (!tasks) return;

        const ops = [];
        for (const taskId in tasks) {
            const task = tasks[taskId] || {};
            const assigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
            const filtered = assigned.filter(a => a && a.id !== userId);

            if (filtered.length !== assigned.length) {
                if (filtered.length === 0) {
                    ops.push(fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" }));
                } else {
                    ops.push(fetch(`${BASE_URL}tasks/${taskId}.json`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ assignedTo: filtered })
                    }));
                }
            }
        }
        await Promise.all(ops);
    } catch (err) {
        console.error("Error removing user's tasks:", err);
    }
}

function onDragStart(ev) {
    const card = ev.currentTarget;
    draggedTaskId = card.id;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', draggedTaskId);
    card.classList.add('dragging');
    dropPlaceholder.style.height = card.offsetHeight + 'px';
    dropPlaceholder.style.width = '100%';
}

function onDragEnd(ev) {
    const card = ev.currentTarget;
    card.classList.remove('dragging');
    if (dropPlaceholder.parentElement) dropPlaceholder.parentElement.removeChild(dropPlaceholder);
    draggedTaskId = null;
}

function onDragOver(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    let container = null;
    const ct = ev.currentTarget;
    if (ct.classList && ct.classList.contains('boardLaneBody')) {
        container = ct;
    } else if (ct.id && ct.id.startsWith('spaceHolder')) {
        const mappedId = ct.id.replace('spaceHolder', 'board');
        container = document.getElementById(mappedId);
    } else { container = ct.closest('.boardLaneBody'); }
    if (!container) return;
    container.classList.add('dropActive');
    container.classList.remove('dropAtEnd');
    container.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore'));
    const afterElement = getDragAfterElement(container, ev.clientY);

    if (afterElement == null) {
        if (dropPlaceholder.parentElement !== container) container.appendChild(dropPlaceholder);
        else container.appendChild(dropPlaceholder); // move to end if not already there
        container.classList.add('dropAtEnd');
    } else {
        afterElement.classList.add('insertionBefore');
        if (afterElement.previousSibling !== dropPlaceholder) {
            container.insertBefore(dropPlaceholder, afterElement);
        }
    }
}

async function onDrop(ev) {
    ev.preventDefault();
    let container = null;
    const ct = ev.currentTarget;
    if (ct.classList && ct.classList.contains('boardLaneBody')) {
        container = ct;
    } else if (ct.id && ct.id.startsWith('spaceHolder')) {
        const mappedId = ct.id.replace('spaceHolder', 'board');
        container = document.getElementById(mappedId);
    } else {
        container = ct.closest('.boardLaneBody');
    }
    if (!container) return;

    const targetStatus = container.dataset.status || '';
    const droppedId = ev.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!droppedId) return;

    const dragging = document.getElementById(droppedId);
    if (dragging && dropPlaceholder.parentElement === container) {
        container.insertBefore(dragging, dropPlaceholder);
    } else if (dragging && !dropPlaceholder.parentElement) {
        container.appendChild(dragging);
    }
    const byId = new Map(allTasks.map(t => [t.id, t]));
    Array.from(container.querySelectorAll('.boardCardContainer')).forEach(el => {
        const t = byId.get(el.id);
        if (t) t.status = targetStatus;
    });

    try {
        await fetch(`${BASE_URL}tasks/${droppedId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetStatus })
        });
    } catch (e) {
        console.error('Failed to update task status:', e);
    }

    if (dropPlaceholder.parentElement) dropPlaceholder.parentElement.removeChild(dropPlaceholder);
    container.classList.remove('dropActive', 'dropAtEnd');
    container.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore'));
    renderBoard(allTasks);
}

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.boardCardContainer:not(.dragging)')];
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function onDragLeave(ev) {
    const lane = ev.currentTarget;
    if (lane && lane.classList) {
        lane.classList.remove('dropActive');
        lane.classList.remove('dropAtEnd');
        lane.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore'));
    }
}


async function editTask(taskId) {
    resetAddTaskSide()
    const content = document.getElementById("boardOverlayContent");
    content.innerHTML = getBoardOverlayEditTaskTemplate(taskId);
    const task = await getTaskById(taskId)
    updateListSelectedContacts(task.assignedTo);

    if (task) {
        document.getElementById("addTasktTitleInput").value = task.title;
        document.getElementById("addTaskTextarea").innerHTML = task.description;
        document.getElementById("addTasktDateInput").value = task.dueDate;

        const oPriority = mapPriority(task.priority)
        document.getElementById(oPriority.buttonIconOn).classList.remove('d-none');
        document.getElementById(oPriority.buttonIconOff).classList.add('d-none');
        document.getElementById(oPriority.buttonId)?.classList.add(oPriority.buttonClass);

        //subtasksListOnEdit = task.subtasks;
        subtasks = task.subtasks;
        renderSubtasksOnEdit(task.subtasks);
        content.dataset.overlayStatus = task.status;
        getContactsOnEditBoardTemplate(task.assignedTo);
        selectedContactsAddTask = task.assignedTo;
    }
}

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

function getContactsOnEditBoardTemplate(users) {
    if (!users) return "";
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    let template = ''
    users.forEach(user => {
        usersListOnEdit.push(user)
        template += `<div class="margin_top8 avatar" style="background:${user.color}">${user.initial}</div>`
    });
    contentDiv.innerHTML = template;
}

let selectedTaskId = null;

function selectTaskCard(taskId) {
    document.querySelectorAll('.boardCardContainer.is-selected')
        .forEach(el => el.classList.remove('is-selected'));
    const el = document.getElementById(taskId);
    if (el) { el.classList.add('is-selected'); selectedTaskId = taskId; }
}

function clearSelectedCard() {
    document.querySelectorAll('.boardCardContainer.is-selected')
        .forEach(el => el.classList.remove('is-selected'));
    selectedTaskId = null;
}

function renderSubtasksOnEdit(subtasks) {
    let list = document.getElementById('subtaskListContent');
    list.innerHTML = "";
    subtasks?.forEach(subtask => {
        list.innerHTML += getSubtaskListTemplate(subtask);
    })
}

/**
 * Filter tasks based on search input.
 */
function filterTasks() {
    let search = document.getElementById('searchTasks').value.toLowerCase();

    if (search.trim() === '') {
        //goToBoardHtml();
        removeOverlayTaskNotFound()
        renderBoard(allTasks);
    } else {
        clearTasksContainer();
        for (let i = 0; i < allTasks.length; i++) {
            const task = allTasks[i];
            const title = task.title;
            const description = task.description;
            if (title.toLowerCase().includes(search) || description.toLowerCase().includes(search)) {
                const card = document.getElementById(`board${task.status}Container`);
                document.getElementById(`spaceHolder${task.status}Container`).classList.add('d-none');
                renderCard(task, card)
            }
        }
    }
}

/**
 * Clear the task containers on the board.
 */
function clearTasksContainer() {
    document.getElementById('boardTodoContainer').innerHTML = ``;
    document.getElementById('boardProgressContainer').innerHTML = ``;
    document.getElementById('boardFeedbackContainer').innerHTML = ``;
    document.getElementById('boardDoneContainer').innerHTML = ``;

    addOverlayTaskNotFound();
}

function addOverlayTaskNotFound() {
    const aStatus = ['Todo', 'Progress', 'Feedback', 'Done'];

    aStatus.forEach(status => {
        document.getElementById(`spaceHolder${status}Container`).innerHTML = `No tasks found in ${status}`;
        document.getElementById(`spaceHolder${status}Container`).classList.remove('d-none');
        document.getElementById(`spaceHolder${status}Container`).style.borderColor = "red";
        document.getElementById(`spaceHolder${status}Container`).style.backgroundColor = "#F6E1E1";
    })
}

function removeOverlayTaskNotFound() {
    const aStatus = ['Todo', 'Progress', 'Feedback', 'Done'];

    aStatus.forEach(status => {
        document.getElementById(`spaceHolder${status}Container`).innerHTML = `No tasks in ${status}`;
        document.getElementById(`spaceHolder${status}Container`).classList.add('d-none');
        document.getElementById(`spaceHolder${status}Container`).style.borderColor = "";
        document.getElementById(`spaceHolder${status}Container`).style.backgroundColor = "rgba(42,54,71,0.06)";
    })
}