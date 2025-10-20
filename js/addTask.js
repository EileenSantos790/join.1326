let selectedContactsAddTask = [];
let contactSearchArray = [];
let subtasks = [];
let subtaskIdCounter = 0;


/** Activates a priority button by updating its style and icon based on the selected priority. */
function activatePriorityButton(buttonId, buttonClass, buttonIconOff, buttonIconOn) {
    document.getElementById('addTaskUrgentButton').classList.remove('buttonUrgentActive');
    document.getElementById('addTaskMediumButton').classList.remove('buttonMediumActive');
    document.getElementById('addTaskLowButton').classList.remove('buttonLowActive');
    setPriorityButtonIconToDefault();
    document.getElementById(buttonIconOn).classList.remove('d-none');
    document.getElementById(buttonIconOff).classList.add('d-none');
    document.getElementById(buttonId).classList.add(buttonClass);
}


/** Resets all priority button icons to their default (unselected) state. */
function setPriorityButtonIconToDefault() {
    document.getElementById('urgentButtonOff').classList.remove('d-none');
    document.getElementById('mediumButtonOff').classList.remove('d-none');
    document.getElementById('lowButtonOff').classList.remove('d-none');
    document.getElementById('urgentButtonOn').classList.add('d-none');
    document.getElementById('mediumButtonOn').classList.add('d-none');
    document.getElementById('lowButtonOn').classList.add('d-none');
}


/** Toggles the assigned-to dropdown in the add-task view. */
async function toggleDropdownAssignedTo() {
    document.getElementById('addTaskDropdownAssignedTo').classList.toggle('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.toggle('d-none');
    document.getElementById('addTaskAddedContactIcons').classList.toggle('d-none');
}


/** Toggles the selection state of a contact in the assigned list. */
function addTaskSelectContact(userId, initial, color, name) {
    const container = document.getElementById(`assignedToContact-${userId}`);
    const checkboxOff = document.getElementById(`assignedToCheckbox-${userId}`);
    const checkboxOn = document.getElementById(`assignedToCheckboxWhite-${userId}`);
    container.classList.toggle('dropdownItemOff');
    container.classList.toggle('dropdownItemOn');
    checkboxOff.classList.toggle('d-none');
    checkboxOn.classList.toggle('d-none');
    saveClickedContact(initial, color, userId, name);
    addContactToTask();
}


/** Displays all or filtered contacts in the assigned to dropdown container. */
async function renderContactsInAddTask(searchArray = []) {
    if (searchArray.length) {
        let contentDiv = document.getElementById('assignedToContactContent');
        contentDiv.innerHTML = "";
        for (let index = 0; index < searchArray.length; index++) { contentDiv.innerHTML += getContactTemplate(searchArray, index); }
        return
    }
    await renderAllContacts();
}


/** Adds the contact to a separate array and sorts them alphabetically. */
function saveClickedContact(initial, color, id, name) {
    let index = selectedContactsAddTask?.findIndex(c => c.id === id);
    if (index !== -1 && index != undefined) { selectedContactsAddTask.splice(index, 1); }
    else { selectedContactsAddTask.push({ id, name, initial, color }); }
    selectedContactsAddTask.sort((a, b) => a.initial.localeCompare(b.initial));
}


/** Displays selected contacts when the dropdown menu is closed. */
function addContactToTask() {
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    contentDiv.innerHTML = "";
    selectedContactsAddTask.forEach((contact) => { contentDiv.innerHTML += getSelectedContactTemplate(contact.initial, contact.color, contact.id, contact.name); });
}


/** Filters contacts for the assigned-to dropdown. */
async function searchContactsForTask() {
    let inputRef = document.getElementById('addTaskSearchInput');
    let searchInput = inputRef.value;
    let allUsers = await getAllUsers();
    let contacts = getUserDataToArray(allUsers);
    if (searchInput.length > 0) { contactSearchArray = contacts.filter(contact => contact.name.toLowerCase().includes(searchInput.toLowerCase())); renderContactsInAddTask(contactSearchArray); }
    else { renderContactsInAddTask(); }
}


/** Toggles the visibility of the category dropdown and its associated icons. */
function toggleDropdownCategory() {
    document.getElementById('categoryDropdownContent').classList.toggle('d-none');
    document.getElementById('dropdownDownIcon').classList.toggle('d-none');
    document.getElementById('dropdownUpIcon').classList.toggle('d-none');
    document.getElementById('addTaskCategoryDropdownContent').classList.toggle('boxShadow');
    document.getElementById('addTaskCategoryHeaderContainer').classList.remove('inputErrorBorder');
}


/** Selects a category from the dropdown and updates the header. */
function selectedCategory(option) {
    let header = document.getElementById('categoryDropdownHeader');
    header.textContent = option.textContent;
    header.dataset.value = option.dataset.value;
    toggleDropdownCategory();
}


/** close the assigned to and category dropdown when click outside. */
document.onclick = function (click) {
    closeAssignedToClickOutside(click);
    closeCategoryClickOutside(click);
}


/** Closes the assigned-to dropdown when clicking outside its container. */
function closeAssignedToClickOutside(click) {
    const dropdownAssignedTo = document.getElementById('addTaskAssignedToDropdownContent');
    if (dropdownAssignedTo && !dropdownAssignedTo.contains(click.target)) {
        document.getElementById('addTaskDropdownAssignedTo').classList.remove('d-none');
        document.getElementById('addTaskDropdownSearchContent').classList.add('d-none');
        document.getElementById('addTaskAddedContactIcons').classList.remove('d-none');
    }
}


/** Closes the category dropdown if a click occurs outside of it. */
function closeCategoryClickOutside(click) {
    const dropdownCategory = document.getElementById('addTaskCategoryDropdownContent');
    if (dropdownCategory && !dropdownCategory.contains(click.target)) {
        document.getElementById('categoryDropdownContent').classList.add('d-none');
        document.getElementById('dropdownDownIcon').classList.remove('d-none');
        document.getElementById('dropdownUpIcon').classList.add('d-none');
        document.getElementById('addTaskCategoryDropdownContent').classList.remove('boxShadow');
    }
}


/** Removes focus border from the container and checks if the input value is empty, displaying an error message if so. */
function removeFocusBorderCheckInputValue(containerId, inputId, errorId) {
    document.getElementById(containerId).classList.remove('inputBorderColorFocus');
    let input = document.getElementById(inputId);
    let errorMessage = document.getElementById(errorId);
    if (!input.value) {
        document.getElementById(containerId).classList.add('inputErrorBorder');
        errorMessage.textContent = "This field is required";
    }
}


/** Adds a new subtask to the list and updates the display. */
function addSubtaskToList() {
    let inputRef = document.getElementById('subtaskInput');
    let input = inputRef.value.trim();
    if (checkSubtaskValue(input)) {
        subtaskIdCounter++;
        let newSubtask = { "id": subtaskIdCounter, "text": input, "done": false };
        subtasks = subtasks || [];
        subtasks.push(newSubtask);
        renderSubtasks();
        inputRef.value = "";
    } else {
        inputRef.value = "";
    }
}

/**checks whether the input is empty */
function checkSubtaskValue(input) {
    if (input.length > 0) {
        return true;
    } else return false;
}


//** Add a new substask when enter is pressed  */
function addSubtaskWithEnter() {
    const input = document.getElementById('subtaskInput');
    input.onkeydown = function (event) {
        if (event.key === 'Enter' && input.value) addSubtaskToList();
    };
}


/** Clears the value of the subtask input field. */
function clearSubtaskInput() {
    let inputRef = document.getElementById('subtaskInput');
    inputRef.value = "";
}


/** Renders the subtasks into the subtask list element. */
function renderSubtasks() {
    let list = document.getElementById('subtaskListContent');
    list.innerHTML = "";
    let arr = [];
    if (subtasks.length) { arr = subtasks } else { arr = subtasksListOnEdit }
    arr.forEach(subtask => { list.innerHTML += getSubtaskListTemplate(subtask); })
}


/** Deletes a subtask by its ID from the subtasks list and updates the display. */
function deleteSubtask(id) {
    subtasks = subtasks?.filter(s => s.id !== id);
    subtasksListOnEdit = subtasksListOnEdit?.filter(s => s.id !== id);
    renderSubtasks();
}


/** Edits a subtask by replacing its HTML and focusing on the input field. */
function editSubtask(id) {
    let subtask = subtasks?.find(s => s.id === id) || subtasksListOnEdit.find(s => s.id === id);
    if (!subtask) return;
    document.getElementById(`subtask${id}`).outerHTML = getSubtaskEditTemplate(subtask);
    const input = document.getElementById(`editInput${id}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}


/** Updates a subtask's text by id from its edit input and re-renders. */
function saveSubtask(id) {
    const input = document.getElementById(`editInput${id}`);
    if (!input) return;
    const newText = input.value.trim() || "untitled";
    const subtask = subtasks?.find(s => s.id === id) || subtasksListOnEdit.find(s => s.id === id);
    if (subtask) subtask.text = newText;
    renderSubtasks();
}


/** On blur, briefly delays and saves the subtask if its input exists. */
function handleBlurSubtask(id) {
    setTimeout(() => {
        const input = document.getElementById(`editInput${id}`);
        if (input) saveSubtask(id);
    }, 100);
}


/** Resets the Add Task side panel to its default input and selection state. */
function resetAddTaskSide() {
    resetInput('addTasktTitleInput', 'addTasktTitleErrorContainer', 'addTasktTitleInputContainer');
    resetInput('addTaskTextarea', '', 'addTaskDescriptionInputContainer');
    resetInput('addTasktDateInput', 'addTasktDateErrorContainer', 'addTasktDateInputContainer');
    resetPriority();
    resetAssignedTo();
    resetCategory();
    resetSubtask();
}


/** Resets the input field and clears any associated error messages. */
function resetInput(inputId, errorId, containerId) {
    document.getElementById(inputId).value = "";
    if (errorId) document.getElementById(errorId).innerText = "";
    removeFocusBorder(containerId);
    document.getElementById(containerId).classList.remove('inputErrorBorder');
}


/** Resets the priority to medium by activating the corresponding button. */
function resetPriority() {
    activatePriorityButton('addTaskMediumButton', 'buttonMediumActive', 'mediumButtonOff', 'mediumButtonOn');
}


/** Resets the assigned contacts dropdown and clears added contact icons. */
function resetAssignedTo() {
    document.getElementById('addTaskDropdownAssignedTo').classList.remove('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.add('d-none');
    const addedContacts = document.getElementById('addTaskAddedContactIcons');
    addedContacts.classList.remove('d-none');
    addedContacts.innerHTML = "";
    selectedContactsAddTask = [];
    renderContactsInAddTask();
}


/** Resets the category dropdown to its default state. */
function resetCategory() {
    document.getElementById('categoryDropdownContent').classList.add('d-none');
    document.getElementById('dropdownDownIcon').classList.remove('d-none');
    document.getElementById('dropdownUpIcon').classList.add('d-none');
    document.getElementById('addTaskCategoryHeaderContainer').classList.remove('inputErrorBorder');
    document.getElementById('addTaskCategoryDropdownContent').classList.remove('boxShadow');
    document.getElementById('categoryDropdownHeader').textContent = "Select task category";
}


/** Resets the subtask input and clears the subtask list. */
function resetSubtask() {
    clearSubtaskInput();
    let list = document.getElementById('subtaskListContent').innerHTML = "";
    subtasks = [];
    subtaskIdCounter = 0;
}


/** Builds a task payload from the form and saves it. */
function createTask() {
    if (!checkRequiredFields()) { return; }
    const taskData = getTaskData();
    saveTaskToDatabase(taskData);
    showAddTaskDialog();
    goToBoardHtml();
    selectedContactsAddTask = [];
}


/** Validates required title, date, and category; returns true if all are set, else false. */
function checkRequiredFields() {
    const inputTitle = document.getElementById('addTasktTitleInput');
    const inputDate = document.getElementById('addTasktDateInput');
    const categoryHeader = document.getElementById('categoryDropdownHeader');
    if (inputTitle.value === "" || inputDate.value === "" || categoryHeader.textContent === "Select task category") {
        removeFocusBorderCheckInputValue('addTasktTitleInputContainer', 'addTasktTitleInput', 'addTasktTitleErrorContainer');
        removeFocusBorderCheckInputValue('addTasktDateInputContainer', 'addTasktDateInput', 'addTasktDateErrorContainer');
        setErrorBorderForCategory('addTaskCategoryHeaderContainer');
        return false;
    } else { return true; }
}


/** Retrieves task data from input fields for creating or editing a task. */
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


/** Returns the selected task priority as a string: 'Urgent', 'Medium', 'Low', or null if none is selected. */
function getSelectedPriority() {
    if (document.getElementById('addTaskUrgentButton').classList.contains('buttonUrgentActive')) { return 'Urgent'; }
    else if (document.getElementById('addTaskMediumButton').classList.contains('buttonMediumActive')) { return 'Medium'; }
    else if (document.getElementById('addTaskLowButton').classList.contains('buttonLowActive')) { return 'Low'; }
    else { return null; }
}


/** Persists a new task to the database. */
function saveTaskToDatabase(taskData) {
    fetch(BASE_URL + "tasks.json", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(taskData) })
        .then(response => { if (!response.ok) { throw new Error("Erro on save contact"); } return response.json(); })
        .then(data => { assignedToUser(data.name); })
        .catch(error => { console.error("Erro:", error); showMessageDialog("Erro:", error); });
}


/** Updates a task in the database using the provided task ID. */
function handleUpdateTask(taskId) {
    const task = getTaskData(true);
    updateTaskOnDatabase(taskId, task);
}


/** Asynchronously updates a task by ID in the database and handles UI flow based on the subtask toggle. */
async function updateTaskOnDatabase(taskId, task, SubtaskToggle = false) {
    await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(task) })
        .then(response => { if (!response.ok) { throw new Error("Error updating contact"); } return response.json(); })
        .then(() => {
            if (!SubtaskToggle) closeOverlay();
            usersListOnEdit = [];
            goToBoardHtml(0);
        })
        .catch(error => { console.error("Error:", error); });
}


/** Navigates to the board page after an optional delay. */
function goToBoardHtml(timeout = 2000) {
    const boardMenuItem = document.querySelector('.navLine[data-file*="board"], .navLine[data-file*="Board"]');
    setTimeout(() => {
        if (boardMenuItem) { boardMenuItem.click(); return; }
    }, timeout);
}


/** Adds the created task to each assigned user's task list. */
async function assignedToUser(taskId) {
    const task = await getTaskById(taskId);
    const users = task.assignedTo;
    if (!users) return [];
    for (let index = 0; index < users.length; index++) {
        const userId = users[index].id;
        const user = await searchContactById(userId);
        if (user.tasks?.length) { user.tasks.push(taskId) } else { user.tasks = [taskId] }
        updateContact(userId, user, true);
    }
}


/** Fetches a task by ID from the database. */
async function getTaskById(taskId) {
    const url = `${BASE_URL}tasks/${taskId}.json`;
    const res = await fetch(url);
    return await res.json();
}


/** Displays the add-task success overlay. */
function showAddTaskDialog() {
    const overlay = document.getElementById("addTaskOverlay");
    overlay.classList.add("show");
    const taskOverlay = document.getElementById('addTaskOverlayBackground');
    if (taskOverlay) { taskOverlay.style.display = "flex"; } else {
        showAddTaskOverlaySuccessMessage();
        setTimeout(() => {
            closeAddTaskOverlay();
        }, 1000);
    }
}