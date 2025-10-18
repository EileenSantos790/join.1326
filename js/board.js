let allTasks = [];
let subtasksListOnEdit = [];
let usersListOnEdit = [];
let draggedTaskId = null;
let selectedTaskId = null;
let dropPlaceholder = document.createElement('div');
dropPlaceholder.className = 'dropPlaceholder';

/** Watches the DOM for a selector and runs a callback when it appears. */
function onElementAppear(selector, cb) {
    let present = false;
    const check = () => { const el = document.querySelector(selector); if (el && !present) { present = true; cb(el); } else if (!el && present) { present = false; } };
    check();
    const observer = new MutationObserver(() => check());
    observer.observe(document.documentElement, { childList: true, subtree: true });
}
onElementAppear('#boardTodoContainer', () => { loadBoard(); });


/** Fetches tasks, caches them locally, and renders the board. */
async function loadBoard() {
    const tasks = await getTasks();
    const arrTasks = getTasksToArray(tasks)
    allTasks = arrTasks;
    arrTasks.length && renderBoard(arrTasks);
}


/** Clears status lanes and renders task cards into each lane. */
function renderBoard(tasks) {
    const statuses = ['Todo', 'Progress', 'Feedback', 'Done'];
    statuses.forEach(s => { const lane = document.getElementById(`board${s}Container`); const ph = document.getElementById(`spaceHolder${s}Container`);
        if (lane) {
            lane.innerHTML = ''; lane.classList.remove('dropActive', 'dropAtEnd');
            if (!lane.dataset.dndBound) { lane.addEventListener('dragover', onDragOver); lane.addEventListener('drop', onDrop); lane.addEventListener('dragleave', onDragLeave); lane.dataset.dndBound = '1'; }
            if (ph && !ph.dataset.dndBound) { ph.addEventListener('dragover', onDragOver); ph.addEventListener('drop', onDrop); ph.addEventListener('dragleave', onDragLeave); ph.dataset.dndBound = '1'; } 
        } if (ph) ph.classList.remove('d-none');
    });
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]; const lane = document.getElementById(`board${task.status}Container`);
        if (!lane) continue; document.getElementById(`spaceHolder${task.status}Container`)?.classList.add('d-none') ; renderCard(task, lane);
    }
}


/** Updates the task status locally and persists the change to the backend. */
async function changeBoardStatus(taskId, newStatus) {
    const task = allTasks.find(t => t.id === taskId);
    task.status = newStatus;
    const overlay = document.getElementById("overlayLoading");
    overlay.style.display = "block";
    await updateTaskOnDatabase(taskId, task);
    overlay.style.display = "none";  
}

/** Toggles the Move To overlay for the clicked task card. */
function openBoardMoveToOverlay() {
    event.stopPropagation();
    const icon = event.currentTarget;
    const overlay = icon.nextElementSibling;
    document.querySelectorAll('.boardMoveToOverlay').forEach(o => o.classList.add('d-none'));
    if (overlay) overlay.classList.remove('d-none');
    closeOverlayClickOutside(icon, overlay);
}

/** Closes the overlay when clicking outside of the icon or overlay. */
function closeOverlayClickOutside(icon, overlay) {
    if (overlay) {
        overlay.classList.remove('d-none');
        const closeOverlay = (e) => { if (!overlay.contains(e.target) && !icon.contains(e.target)) { overlay.classList.add('d-none'); document.removeEventListener('click', closeOverlay); } };
        document.addEventListener('click', closeOverlay);
    }
}

/** Converts the tasks object from the backend into an array of task objects. */
function getTasksToArray(tasks) {
    const arr = [];
    if (!tasks) return arr;
    for (let taskID in tasks) {
        const task = tasks[taskID];
        arr.push({ id: taskID, title: task.title || "", description: task.description || "", status: task.status || "", assignedTo: task.assignedTo, category: task.category, dueDate: task.dueDate, priority: task.priority, subtasks: task.subtasks });
    }
    return arr;
}

/** Opens the add-task overlay with the given status selected on desktop. */
function openAddTaskOverlay(status) {
    const minWidth = window.innerWidth;
    if (minWidth > 1024) {
        let overlay = document.getElementById('addTaskBoardOverlayMainSection');
        overlay.classList.add('show');
        document.getElementById('homeBody').style.overflow = 'hidden';
        overlay.querySelector('span[data-status]').dataset.status = status;
        resetAddTaskSide();
    } else return;
}


/** Closes the add-task overlay and restores body scrolling. */
function closeAddTaskOverlay() {
    document.getElementById('addTaskBoardOverlayMainSection').classList.remove('show');
    document.getElementById('homeBody').style.overflow = 'unset';
    document.getElementById('addTaskBoardOverlay').classList.add('d-none');
}

/** Displays the success message overlay after adding a task. */
function showAddTaskOverlaySuccessMessage() {
    document.getElementById('addTaskBoardOverlay').classList.remove('d-none');
}

/** Updates a subtask's done state and saves the task. */
function onSubtaskToggle(task, subtaskId, isDone) {
    const idx = (task.subtasks || []).findIndex(s => String(s.id) === String(subtaskId));
    if (idx === -1) return;
    if (task.subtasks[idx].done === isDone) return;
    task.subtasks[idx].done = isDone;
    updateTaskOnDatabase(task.id, task, true);
}

/** Formats a date string into DD/MM/YYYY format. */
function formatDate(date) {
    const data = new Date(date);
    return data.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

/** Deletes a task and refreshes the board after success. */
async function deleteTask(taskId) {
    try {
        await updateContactTask(taskId);
        await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
        closeOverlay();
        goToBoardHtml();
    } catch (err) { console.error("Error on delete task", err); }
}

/** Removes the task reference from each user that had it assigned. */
async function updateContactTask(taskId) {
    try {
        const resp = await fetch(`${BASE_URL}users.json`);
        const users = await resp.json();
        if (!users) return [];
        for (const userId in users) {
            const user = users[userId].user;
            const tasksNode = user.tasks || [];
            if (tasksNode.includes(taskId)) { const updatedTasks = tasksNode.filter(id => id !== taskId); refreshContactTasksOnDb(userId, updatedTasks); }
        }
    } catch (error) { console.error("Error getUsersTasks:", error); return []; }
}

/** Writes the updated task list for a user back to the database. */
function refreshContactTasksOnDb(userId, updatedTasks) {
    try { fetch(`${BASE_URL}users/${userId}/user/tasks.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedTasks) }); } 
    catch (error) { console.error("Erro update contact tasks:", error); return []; }
}

/** Removes a user from all tasks or deletes tasks with no remaining assignees. */
async function removeAllTasksFromUser(userId) {
    if (!userId) return;
    try {
        const res = await fetch(BASE_URL + "tasks.json"); if (!res.ok) throw new Error("Error loading tasks"); const tasks = await res.json(); if (!tasks) return; const ops = [];
        for (const taskId in tasks) {
            const task = tasks[taskId] || {}; const assigned = Array.isArray(task.assignedTo) ? task.assignedTo : []; const filtered = assigned.filter(a => a && a.id !== userId);
            if (filtered.length !== assigned.length) {
                if (filtered.length === 0) { ops.push(fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" }));}
                else { ops.push(fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignedTo: filtered }) })); }
            }
        }
        await Promise.all(ops);
    } catch (error) { console.error("Error removing user's tasks:", error);}
}

/** Marks a task card as dragging and prepares the placeholder element. */
function onDragStart(ev) {
    const card = ev.currentTarget;
    draggedTaskId = card.id;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', draggedTaskId);
    card.classList.add('dragging');
    dropPlaceholder.style.height = card.offsetHeight + 'px';
    dropPlaceholder.style.width = '100%';
}

/** Clears dragging styles and removes the placeholder after drop ends. */
function onDragEnd(ev) {
    const card = ev.currentTarget;
    card.classList.remove('dragging');
    if (dropPlaceholder.parentElement) dropPlaceholder.parentElement.removeChild(dropPlaceholder);
    draggedTaskId = null;
}

/** Handles dragover to position the placeholder within a lane. */
function onDragOver(ev) {
    ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; let container = null; const ct = ev.currentTarget;
    if (ct.classList && ct.classList.contains('boardLaneBody')) { container = ct; } else if (ct.id && ct.id.startsWith('spaceHolder')) { const mappedId = ct.id.replace('spaceHolder', 'board'); container = document.getElementById(mappedId); } else { container = ct.closest('.boardLaneBody'); }
    if (!container) return;
    container.classList.add('dropActive');
    container.classList.remove('dropAtEnd');
    container.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore'));
    const afterElement = getDragAfterElement(container, ev.clientY);
    if (afterElement == null) {
        if (dropPlaceholder.parentElement !== container) container.appendChild(dropPlaceholder); else container.appendChild(dropPlaceholder);
        container.classList.add('dropAtEnd');
    } else { afterElement.classList.add('insertionBefore'); if (afterElement.previousSibling !== dropPlaceholder) { container.insertBefore(dropPlaceholder, afterElement); }}
}

/** Applies the new status on drop and syncs the task order. */
async function onDrop(ev) {
    ev.preventDefault(); let container = null; const ct = ev.currentTarget;
    if (ct.classList && ct.classList.contains('boardLaneBody')) { container = ct; } else if (ct.id && ct.id.startsWith('spaceHolder')) { const mappedId = ct.id.replace('spaceHolder', 'board'); container = document.getElementById(mappedId); } else { container = ct.closest('.boardLaneBody'); }
    if (!container) return;
    const targetStatus = container.dataset.status || '';
    const droppedId = ev.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!droppedId) return;
    const dragging = document.getElementById(droppedId);
    if (dragging && dropPlaceholder.parentElement === container) { container.insertBefore(dragging, dropPlaceholder); } else if (dragging && !dropPlaceholder.parentElement) {  container.appendChild(dragging); }
    const byId = new Map(allTasks.map(t => [t.id, t])); Array.from(container.querySelectorAll('.boardCardContainer')).forEach(el => { const t = byId.get(el.id); if (t) t.status = targetStatus; });
    try { await fetch(`${BASE_URL}tasks/${droppedId}.json`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: targetStatus }) }); } catch (e) { console.error('Failed to update task status:', e); }
    if (dropPlaceholder.parentElement) dropPlaceholder.parentElement.removeChild(dropPlaceholder);
    container.classList.remove('dropActive', 'dropAtEnd'); container.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore')); renderBoard(allTasks);
}

/** Finds the card element that should follow the dragged placeholder. */
function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.boardCardContainer:not(.dragging)')];
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) { return { offset, element: child }; } else { return closest; }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

/** Removes drag styling when the pointer leaves a lane. */
function onDragLeave(ev) {
    const lane = ev.currentTarget;
    if (lane && lane.classList) { lane.classList.remove('dropActive'); lane.classList.remove('dropAtEnd'); lane.querySelectorAll('.insertionBefore').forEach(el => el.classList.remove('insertionBefore')); }
}


/** Opens the edit overlay populated with the task data. */
async function editTask(taskId) {
    renderContactsInAddTask();
    const content = document.getElementById("boardOverlayContent");
    content.innerHTML = getBoardOverlayEditTaskTemplate(taskId);
    const task = await getTaskById(taskId)
    if (task) {
        document.getElementById("addTasktTitleInput").value = task.title; document.getElementById("addTaskTextarea").innerHTML = task.description; document.getElementById("addTasktDateInput").value = task.dueDate;
        const oPriority = mapPriority(task.priority)
        document.getElementById(oPriority.buttonIconOn).classList.remove('d-none'); document.getElementById(oPriority.buttonIconOff).classList.add('d-none'); document.getElementById(oPriority.buttonId)?.classList.add(oPriority.buttonClass);
        subtasks = task.subtasks;
        renderSubtasksOnEdit(task.subtasks); content.dataset.overlayStatus = task.status; getContactsOnEditBoardTemplate(task.assignedTo);
        selectedContactsAddTask = task.assignedTo || [];
    }
}


/** Highlights the selected task card on the board. */
function selectTaskCard(taskId) {
    document.querySelectorAll('.boardCardContainer.is-selected')
        .forEach(el => el.classList.remove('is-selected'));
    const el = document.getElementById(taskId);
    if (el) { el.classList.add('is-selected'); selectedTaskId = taskId; }
}

/** Removes the selected highlight from any task card. */
function clearSelectedCard() {
    document.querySelectorAll('.boardCardContainer.is-selected')
        .forEach(el => el.classList.remove('is-selected'));
    selectedTaskId = null;
}

/** Lists subtasks inside the edit overlay subtasks section. */
function renderSubtasksOnEdit(subtasks) {
    let list = document.getElementById('subtaskListContent');
    list.innerHTML = "";
    subtasks?.forEach(subtask => {
        list.innerHTML += getSubtaskListTemplate(subtask);
    })
}

/** Filters visible tasks on the board based on the search input. */
function filterTasks() {
    let search = document.getElementById('searchTasks').value.toLowerCase();
    if (search.trim() === '') { removeOverlayTaskNotFound(); renderBoard(allTasks); }  else {
        clearTasksContainer();
        for (let i = 0; i < allTasks.length; i++) {
            const task = allTasks[i]; const title = task.title; const description = task.description; 
            if (title.toLowerCase().includes(search) || description.toLowerCase().includes(search)) {
                const card = document.getElementById(`board${task.status}Container`);
                document.getElementById(`spaceHolder${task.status}Container`).classList.add('d-none');
                renderCard(task, card)
            }
        }
    }
}


/** Clears all board lanes before rendering filtered results. */
function clearTasksContainer() {
    document.getElementById('boardTodoContainer').innerHTML = ``;
    document.getElementById('boardProgressContainer').innerHTML = ``;
    document.getElementById('boardFeedbackContainer').innerHTML = ``;
    document.getElementById('boardDoneContainer').innerHTML = ``;
    addOverlayTaskNotFound();
}

/** Shows a red overlay message when no tasks match the filter. */
function addOverlayTaskNotFound() {
    const aStatus = ['Todo', 'Progress', 'Feedback', 'Done'];
    aStatus.forEach(status => {
        document.getElementById(`spaceHolder${status}Container`).innerHTML = `No tasks found in ${status}`;
        document.getElementById(`spaceHolder${status}Container`).classList.remove('d-none');
        document.getElementById(`spaceHolder${status}Container`).style.borderColor = "red";
        document.getElementById(`spaceHolder${status}Container`).style.backgroundColor = "#F6E1E1";
    })
}

/** Restores the default empty-state overlay styling for each lane. */
function removeOverlayTaskNotFound() {
    const aStatus = ['Todo', 'Progress', 'Feedback', 'Done'];
    aStatus.forEach(status => {
        document.getElementById(`spaceHolder${status}Container`).innerHTML = `No tasks in ${status}`;
        document.getElementById(`spaceHolder${status}Container`).classList.add('d-none');
        document.getElementById(`spaceHolder${status}Container`).style.borderColor = "";
        document.getElementById(`spaceHolder${status}Container`).style.backgroundColor = "rgba(42,54,71,0.06)";
    })
}
