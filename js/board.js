let allTasks = [];
let subtasksListOnEdit = [];
let usersListOnEdit = [];
let draggedTaskId = null;
let selectedTaskId = null;
let dropPlaceholder = document.createElement('div');
dropPlaceholder.className = 'dropPlaceholder';


/**
 * Observe the DOM and invoke a callback once a selector appears.
 * @param {string} selector CSS selector to watch for
 * @param {(el: Element) => void} cb Callback invoked with the found element
 */
function onElementAppear(selector, cb) {
    let present = false;
    const check = () => { const el = document.querySelector(selector); if (el && !present) { present = true; cb(el); } else if (!el && present) { present = false; } };
    check();
    const observer = new MutationObserver(() => check());
    observer.observe(document.documentElement, { childList: true, subtree: true });
}
onElementAppear('#boardTodoContainer', () => { 
    document.documentElement.classList.add('board-page');
    loadBoard(); 
});


/**
 * Load tasks from backend, cache them into `allTasks`, and render the board lanes.
 * @returns {Promise<void>}
 */
async function loadBoard() {
    const tasks = await getTasks();
    const arrTasks = getTasksToArray(tasks)
    allTasks = arrTasks;
    arrTasks.length && renderBoard(arrTasks);
}


/**
 * Clear lanes and render provided tasks into their status lanes.
 * @param {Array<{id:string,status:string}>} tasks Array of task objects
 */
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


/**
 * Update a task status locally and persist to backend.
 * @param {string} taskId Task identifier
 * @param {string} newStatus One of: Todo | Progress | Feedback | Done
 */
async function changeBoardStatus(taskId, newStatus) {
    const task = allTasks.find(t => t.id === taskId);
    task.status = newStatus;
    const overlay = document.getElementById("overlayLoading");
    overlay.style.display = "block";
    await updateTaskOnDatabase(taskId, task);
    overlay.style.display = "none";  
}


/** Toggle the "Move To" overlay for the clicked task card. */
function openBoardMoveToOverlay() {
    event.stopPropagation();
    const icon = event.currentTarget;
    const overlay = icon.nextElementSibling;
    document.querySelectorAll('.boardMoveToOverlay').forEach(o => o.classList.add('d-none'));
    if (overlay) overlay.classList.remove('d-none');
    closeOverlayClickOutside(icon, overlay);
}


/**
 * Close a small overlay if a click occurs outside of its bounds.
 * @param {HTMLElement} icon The icon element that opened the overlay
 * @param {HTMLElement} overlay The overlay element to close
 */
function closeOverlayClickOutside(icon, overlay) {
    if (overlay) {
        overlay.classList.remove('d-none');
        const closeOverlay = (e) => { if (!overlay.contains(e.target) && !icon.contains(e.target)) { overlay.classList.add('d-none'); document.removeEventListener('click', closeOverlay); } };
        document.addEventListener('click', closeOverlay);
    }
}


/**
 * Convert tasks response object into an array of normalized task objects.
 * @param {Record<string, any>} tasks Keyed object from backend
 * @returns {Array<{id:string,title:string,description:string,status:string,assignedTo:any,category:string,dueDate:string,priority:string,subtasks:Array}>}
 */
function getTasksToArray(tasks) {
    const arr = [];
    if (!tasks) return arr;
    for (let taskID in tasks) {
        const task = tasks[taskID];
        arr.push({ id: taskID, title: task.title || "", description: task.description || "", status: task.status || "", assignedTo: task.assignedTo, category: task.category, dueDate: task.dueDate, priority: task.priority, subtasks: task.subtasks });
    }
    return arr;
}


/**
 * Open the Add Task overlay with given status preselected (desktop only).
 * @param {string} status Initial status for new task
 */
function openAddTaskOverlay(status) {
    const minWidth = window.innerWidth;
    if (minWidth > 1024) {
        let overlay = document.getElementById('addTaskBoardOverlayMainSection');
        overlay.classList.add('show');
        document.getElementById('homeBody').classList.add('overflowHidden');
        overlay.querySelector('span[data-status]').dataset.status = status;
        resetAddTaskSide();
        attachBoardAddTaskOutsideClickHandler();
    } else return;
}


/** Close the Add Task overlay and restore scrolling. */
function closeAddTaskOverlay() {
    document.getElementById('addTaskBoardOverlayMainSection').classList.remove('show');
    document.getElementById('homeBody').classList.remove('overflowHidden');
    document.getElementById('addTaskBoardOverlay').classList.add('d-none');
    detachBoardAddTaskOutsideClickHandler();
}


/** Show the success message overlay after adding a task. */
function showAddTaskOverlaySuccessMessage() {
    document.getElementById('addTaskBoardOverlay').classList.remove('d-none');
}

// Add Task overlay (board) outside-click handling
let __boardAddTaskPointerDownOutside = false;
function attachBoardAddTaskOutsideClickHandler() {
    const root = document.getElementById('addTaskBoardOverlayMainSection');
    const panel = root?.querySelector('.addTaskOverlayMainContainer');
    if (!root || !panel) return;
    if (root.__handlersAttached) return;
    const onPointerDown = (e) => { const target = e.target; __boardAddTaskPointerDownOutside = !(target instanceof Element && panel.contains(target)); };
    const onPointerUp = (e) => { const target = e.target; const upOutside = !(target instanceof Element && panel.contains(target)); if (__boardAddTaskPointerDownOutside && upOutside) { closeAddTaskOverlay(); }};
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointerup', onPointerUp);
    root.__handlersAttached = { onPointerDown, onPointerUp };
}


/** Detach pointer events previously bound for outside-click close on Add Task overlay. */
function detachBoardAddTaskOutsideClickHandler() {
    const root = document.getElementById('addTaskBoardOverlayMainSection');
    if (!root || !root.__handlersAttached) return;
    const { onPointerDown, onPointerUp } = root.__handlersAttached;
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointerup', onPointerUp);
    root.__handlersAttached = null;
}


/**
 * Toggle a subtask done state and save the parent task.
 * @param {{id:string,subtasks?:Array<{id:number|string,done:boolean}>}} task Parent task
 * @param {number|string} subtaskId Subtask identifier
 * @param {boolean} isDone New done state
 */
function onSubtaskToggle(task, subtaskId, isDone) {
    const idx = (task.subtasks || []).findIndex(s => String(s.id) === String(subtaskId));
    if (idx === -1) return;
    if (task.subtasks[idx].done === isDone) return;
    task.subtasks[idx].done = isDone;
    updateTaskOnDatabase(task.id, task, true);
}


/**
 * Format an ISO date string into DD/MM/YYYY (en-GB locale).
 * @param {string|number|Date} date Input date
 * @returns {string}
 */
function formatDate(date) {
    const data = new Date(date);
    return data.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}


/**
 * Delete a task by id and refresh the board UI.
 * @param {string} taskId
 */
async function deleteTask(taskId) {
    try {
        await updateContactTask(taskId);
        await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
        closeOverlay();
        goToBoardHtml();
    } catch (err) { console.error("Error on delete task", err); }
}


/**
 * Remove the task reference from each user who had it assigned.
 * @param {string} taskId
 */
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


/**
 * Persist updated tasks list into a user's record.
 * @param {string} userId
 * @param {string[]} updatedTasks
 */
function refreshContactTasksOnDb(userId, updatedTasks) {
    try { fetch(`${BASE_URL}users/${userId}/user/tasks.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedTasks) }); } 
    catch (error) { console.error("Erro update contact tasks:", error); return []; }
}


/**
 * Remove a user from all tasks; delete tasks that become unassigned.
 * @param {string} userId
 */
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


/**
 * Open the edit overlay and populate with task data by id.
 * @param {string} taskId
 */
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


/**
 * Highlight a task card as selected in the board.
 * @param {string} taskId
 */
function selectTaskCard(taskId) {
    document.querySelectorAll('.boardCardContainer.is-selected')
        .forEach(el => el.classList.remove('is-selected'));
    const el = document.getElementById(taskId);
    if (el) { el.classList.add('is-selected'); selectedTaskId = taskId; }
}


/** Remove the selected highlight from any task card. */
function clearSelectedCard() {
    document.querySelectorAll('.boardCardContainer.is-selected')
        .forEach(el => el.classList.remove('is-selected'));
    selectedTaskId = null;
}


/**
 * Render the list of subtasks inside the edit overlay section.
 * @param {Array<{id:number|string,text:string,done:boolean}>} subtasks
 */
function renderSubtasksOnEdit(subtasks) {
    let list = document.getElementById('subtaskListContent');
    list.innerHTML = "";
    subtasks?.forEach(subtask => {
        list.innerHTML += getSubtaskListTemplate(subtask);
    })
}


/** Filter visible tasks on the board based on the search input. */
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


/** Clear all board lanes before rendering filtered results. */
function clearTasksContainer() {
    document.getElementById('boardTodoContainer').innerHTML = ``;
    document.getElementById('boardProgressContainer').innerHTML = ``;
    document.getElementById('boardFeedbackContainer').innerHTML = ``;
    document.getElementById('boardDoneContainer').innerHTML = ``;
    addOverlayTaskNotFound();
}


/** Show a red overlay message when no tasks match the filter. */
function addOverlayTaskNotFound() {
    const aStatus = ['Todo', 'Progress', 'Feedback', 'Done'];
    aStatus.forEach(status => {
        document.getElementById(`spaceHolder${status}Container`).innerHTML = `No tasks found in ${status}`;
        document.getElementById(`spaceHolder${status}Container`).classList.remove('d-none');
        document.getElementById(`spaceHolder${status}Container`).style.borderColor = "red";
        document.getElementById(`spaceHolder${status}Container`).style.backgroundColor = "#F6E1E1";
    })
}


/** Restore the default empty-state overlay styling for each lane. */
function removeOverlayTaskNotFound() {
    const aStatus = ['Todo', 'Progress', 'Feedback', 'Done'];
    aStatus.forEach(status => {
        document.getElementById(`spaceHolder${status}Container`).innerHTML = `No tasks in ${status}`;
        document.getElementById(`spaceHolder${status}Container`).classList.add('d-none');
        document.getElementById(`spaceHolder${status}Container`).style.borderColor = "";
        document.getElementById(`spaceHolder${status}Container`).style.backgroundColor = "rgba(42,54,71,0.06)";
    })
}