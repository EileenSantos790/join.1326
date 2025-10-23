/** 
 * Builds a task payload from the form and saves it.
 */
function createTask() {
    if (!checkRequiredFields()) { return; }
    const taskData = getTaskData();
    saveTaskToDatabase(taskData);
    showAddTaskDialog();
    goToBoardHtml();
    selectedContactsAddTask = [];
}


/** 
 * Validates required title, date, and category; returns true if all are set and date is valid. 
 */
function checkRequiredFields() {
    const inputTitle = document.getElementById('addTasktTitleInput');
    const inputDate = document.getElementById('addTasktDateInput');
    const categoryHeader = document.getElementById('categoryDropdownHeader');
    if (typeof validateField === 'function') { validateField(inputTitle); }
    if (!inputTitle.value || !inputTitle.value.trim()) { removeFocusBorderCheckInputValue('addTasktTitleInputContainer', 'addTasktTitleInput', 'addTasktTitleErrorContainer'); }
    if (!inputDate.value) { removeFocusBorderCheckInputValue('addTasktDateInputContainer', 'addTasktDateInput', 'addTasktDateErrorContainer');}
    if (categoryHeader.textContent === "Select task category") { setErrorBorderForCategory('addTaskCategoryHeaderContainer');}
    const isDateValid = typeof validateField === 'function' ? validateField(inputDate) : !!inputDate.value;
    const isTitleValid = !!(inputTitle.value && inputTitle.value.trim());
    const isCategoryValid = categoryHeader.textContent !== "Select task category";
    return isTitleValid && isDateValid && isCategoryValid;
}


/** 
 * Retrieves task data from input fields for creating or editing a task. 
 * 
 * @param {boolean} [editTask=false] - Indicates whether the task is being edited. If true, the status is read from the overlay; otherwise, from the main status element.
 * 
 * @returns {Object} An object containing all task data:
 *   @property {string} title - The task title.
 *   @property {string} description - The task description.
 *   @property {string} dueDate - The due date of the task.
 *   @property {string} priority - The selected priority level.
 *   @property {string} category - The selected category.
 *   @property {Array} assignedTo - Array of selected contacts.
 *   @property {Array} subtasks - Array of subtasks (may be empty).
 *   @property {string} status - The task status.
 */
function getTaskData(editTask = false) {
    const title = document.getElementById('addTasktTitleInput').value;
    const description = document.getElementById('addTaskTextarea').value;
    const dueDate = document.getElementById('addTasktDateInput').value;
    const priority = getSelectedPriority();
    const category = document.getElementById('categoryDropdownHeader').dataset.value;
    const assignedTo = selectedContactsAddTask || [];
    const status = !editTask ? document.getElementById('status').getAttribute('data-status') : document.getElementById('boardOverlayContent').getAttribute('data-overlay-status');
    return { title, description, dueDate, priority, category, assignedTo, subtasks: subtasks || [], status };
}


/** 
 * Returns the selected task priority as a string: 'Urgent', 'Medium', 'Low', or null if none is selected. 
 */
function getSelectedPriority() {
    if (document.getElementById('addTaskUrgentButton').classList.contains('buttonUrgentActive')) { return 'Urgent'; }
    else if (document.getElementById('addTaskMediumButton').classList.contains('buttonMediumActive')) { return 'Medium'; }
    else if (document.getElementById('addTaskLowButton').classList.contains('buttonLowActive')) { return 'Low'; }
    else { return null; }
}


/** 
 * Persists a new task to the database. 
 * 
 * @param {Object} taskData - The task data object to save, as returned by {@link getTaskData}.
 */
function saveTaskToDatabase(taskData) {
    fetch(BASE_URL + "tasks.json", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(taskData) })
        .then(response => { if (!response.ok) { throw new Error("Erro on save contact"); } return response.json(); })
        .then(data => { assignedToUser(data.name); })
        .catch(error => { console.error("Erro:", error); showMessageDialog("Erro:", error); });
}


/** 
 * Updates a task in the database using the provided task ID. 
 * 
 * @param {number|string} taskId - The unique identifier of the task to update.
 */
function handleUpdateTask(taskId) { const task = getTaskData(true); updateTaskOnDatabase(taskId, task); }


/** 
 * Asynchronously updates a task by ID in the database and handles UI flow based on the subtask toggle. 
 * 
 * @async
 * @param {number|string} taskId - The unique identifier of the task to update.
 * @param {Object} task - The task object containing updated data.
 * @param {boolean} [SubtaskToggle=false] - If true, prevents closing the overlay and navigation; useful when updating subtasks without closing the UI
 */
async function updateTaskOnDatabase(taskId, task, SubtaskToggle = false) {
    await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(task) })
        .then(response => { if (!response.ok) { throw new Error("Error updating contact"); } return response.json(); })
        .then(() => { if (!SubtaskToggle) closeOverlay(); usersListOnEdit = []; goToBoardHtml(0); })
        .catch(error => { console.error("Error:", error); });
}


/** 
 * Navigates to the board page after an optional delay. 
 * 
 * @param {number} [timeout=2000] - Delay in milliseconds before navigating to the board.
 */
function goToBoardHtml(timeout = 2000) {
    const boardMenuItem = document.querySelector('.navLine[data-file*="board"], .navLine[data-file*="Board"]');
    setTimeout(() => { if (boardMenuItem) { boardMenuItem.click(); return; } }, timeout);
}


/** 
 * Adds the created task to each assigned user's task list. 
 * 
 * @async
 * @param {number|string} taskId - The unique identifier of the task to assign to users.
 * @returns {Promise<void>} Resolves once all users have been updated.
 */
async function assignedToUser(taskId) {
    const task = await getTaskById(taskId);
    const users = task.assignedTo;
    if (!users) return [];
    for (let index = 0; index < users.length; index++) { const userId = users[index].id; const user = await searchContactById(userId); if (user.tasks?.length) { user.tasks.push(taskId) } else { user.tasks = [taskId] } updateContact(userId, user, true);}
}


/** 
 * Fetches a task by ID from the database. 
 * 
 * @async
 * @param {number|string} taskId - The unique identifier of the task to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the task object.
 */
async function getTaskById(taskId) {
    const url = `${BASE_URL}tasks/${taskId}.json`;
    const res = await fetch(url);
    return await res.json();
}


/** 
 * Displays the add-task success overlay. 
 */
function showAddTaskDialog() {
    const overlay = document.getElementById("addTaskOverlay");
    overlay.classList.add("show");
    const taskOverlay = document.getElementById('addTaskOverlayBackground');
    if (taskOverlay) { taskOverlay.style.display = "flex"; } else { showAddTaskOverlaySuccessMessage(); setTimeout(() => { closeAddTaskOverlay(); }, 1000); }
}