let selectedContactsAddTask = [];
let contactSearchArray = [];
let subtasks = [];
let subtaskIdCounter = 0;


async function fetchAllContacts() {
    let usersList = await fetch(BASE_URL + "users.json");
    let allUsers = await usersList.json();
    return allUsers;
}


function activatePriorityButton(buttonId, buttonClass, buttonIconOff, buttonIconOn) {
    document.getElementById('addTaskUrgentButton').classList.remove('buttonUrgentActive');
    document.getElementById('addTaskMediumButton').classList.remove('buttonMediumActive');
    document.getElementById('addTaskLowButton').classList.remove('buttonLowActive');
    setPriorityButtonIconToDefault();
    document.getElementById(buttonIconOn).classList.remove('d-none');
    document.getElementById(buttonIconOff).classList.add('d-none');

    let currentBtn = document.getElementById(buttonId);
    currentBtn.classList.add(buttonClass);
}


function setPriorityButtonIconToDefault() {
    document.getElementById('urgentButtonOff').classList.remove('d-none');
    document.getElementById('mediumButtonOff').classList.remove('d-none');
    document.getElementById('lowButtonOff').classList.remove('d-none');
    document.getElementById('urgentButtonOn').classList.add('d-none');
    document.getElementById('mediumButtonOn').classList.add('d-none');
    document.getElementById('lowButtonOn').classList.add('d-none');
}

/**
 * renderContactsInAddTask() function => Execute when opening the "addTask" page so that contacts remain clicked in "Assigned to". (that the dropdown menu works correctly).
 */
function toggleDropdownAssignedTo() {
    document.getElementById('addTaskDropdownAssignedTo').classList.toggle('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.toggle('d-none');
    document.getElementById('addTaskAddedContactIcons').classList.toggle('d-none');
    renderContactsInAddTask();
}

/**
 * marks the clicked contact.
 */

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

/**
 * Displays all or filtered contacts in the assigned to dropdown container.
 */
async function renderContactsInAddTask(searchArray) {
    let contentDiv = document.getElementById('assignedToContactContent');
    contentDiv.innerHTML = "";
    if (searchArray) {
        for (let index = 0; index < searchArray.length; index++) {
            contentDiv.innerHTML += getContactTemplate(searchArray, index);
        }
    } else {
        renderAllContacts();
    }
}


async function renderAllContacts() {
    let allUsers = await fetchAllContacts();
    let contentDiv = document.getElementById('assignedToContactContent');
    contentDiv.innerHTML = "";
    let contacts = getUserDataToArray(allUsers);
    contacts.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    for (let index = 0; index < contacts.length; index++) {
        contentDiv.innerHTML += getContactTemplate(contacts, index);
    }
}

/**
 * Adds the contact to a separate array and sorts them alphabetically.
 */

function saveClickedContact(initial, color, userId, name) {
    let index = selectedContactsAddTask.findIndex(c => c.id === userId);

    if (index !== -1) {
        selectedContactsAddTask.splice(index, 1);
    } else {
        selectedContactsAddTask.push({ initial, color, "id": userId, name });
    }
    selectedContactsAddTask.sort((a, b) => a.initial.localeCompare(b.initial));
}

/**
 * Displays selected contacts when the dropdown menu is closed.
 */
function addContactToTask() {
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    contentDiv.innerHTML = "";
    selectedContactsAddTask.forEach((contact) => {
        contentDiv.innerHTML += getSelectedContactTemplate(contact.initial, contact.color, contact.id, contact.name);
    });
}

/**
 * filter function to search for contacts.
 */
async function searchContactsForTask() {
    let inputRef = document.getElementById('addTaskSearchInput');
    let searchInput = inputRef.value;
    let allUsers = await fetchAllContacts();
    let contacts = getUserDataToArray(allUsers);

    if (searchInput.length > 0) {
        contactSearchArray = contacts.filter(contact => contact.name.toLowerCase().includes(searchInput.toLowerCase()));
        renderContactsInAddTask(contactSearchArray);
    } else {
        renderContactsInAddTask();
    }
}
/**
 * The filter function is not yet working properly because the render function must be called elsewhere. (when opening the addTask page)
 */


function toggleDropdownCategory() {
    document.getElementById('categoryDropdownContent').classList.toggle('d-none');
    document.getElementById('dropdownDownIcon').classList.toggle('d-none');
    document.getElementById('dropdownUpIcon').classList.toggle('d-none');
    document.getElementById('addTaskCategoryDropdownContent').classList.toggle('boxShadow');
    document.getElementById('addTaskCategoryHeaderContainer').classList.remove('inputErrorBorder');
}


function selectedCategory(option) {
    let header = document.getElementById('categoryDropdownHeader');
    header.textContent = option.textContent;
    header.dataset.value = option.dataset.value;
    toggleDropdownCategory();
}


/**
 * close the assigned to and category dropdown when click outside.
 */
document.onclick = function (click) {
    closeAssignedToClickOutside(click);
    closeCategoryClickOutside(click);
}


function closeAssignedToClickOutside(click) {
    const dropdownAssignedTo = document.getElementById('addTaskAssignedToDropdownContent');

    if (dropdownAssignedTo && !dropdownAssignedTo.contains(click.target)) {
        document.getElementById('addTaskDropdownAssignedTo').classList.remove('d-none');
        document.getElementById('addTaskDropdownSearchContent').classList.add('d-none');
        document.getElementById('addTaskAddedContactIcons').classList.remove('d-none');
    }
}


function closeCategoryClickOutside(click) {
    const dropdownCategory = document.getElementById('addTaskCategoryDropdownContent');

    if (dropdownCategory && !dropdownCategory.contains(click.target)) {
        document.getElementById('categoryDropdownContent').classList.add('d-none');
        document.getElementById('dropdownDownIcon').classList.remove('d-none');
        document.getElementById('dropdownUpIcon').classList.add('d-none');
        document.getElementById('addTaskCategoryDropdownContent').classList.remove('boxShadow');
    }
}


function removeFocusBorderCheckInputValue(containerId, inputId, errorId) {
    document.getElementById(containerId).classList.remove('inputBorderColorFocus');
    let input = document.getElementById(inputId);
    let errorMessage = document.getElementById(errorId);
    if (!input.value) {
        document.getElementById(containerId).classList.add('inputErrorBorder');
        errorMessage.textContent = "This field is required";
    }
}


function addSubtaskToList() {
    let inputRef = document.getElementById('subtaskInput');
    let input = inputRef.value.trim();
    subtaskIdCounter++;
    let newSubtask = { "id": subtaskIdCounter, "text": input, "done": false };
    subtasks.push(newSubtask);
    renderSubtasks();
    inputRef.value = "";
}


function clearSubtaskInput() {
    let inputRef = document.getElementById('subtaskInput');
    inputRef.value = "";
}


function renderSubtasks() {
    let list = document.getElementById('subtaskListContent');
    list.innerHTML = "";
    let arr = [];

    if (subtasks.length) {
        arr = subtasks
    } else { arr = subtasksListOnEdit }
    arr.forEach(subtask => {
        list.innerHTML += getSubtaskListTemplate(subtask);
    })
}


function deleteSubtask(id) {
    subtasks = subtasks?.filter(s => s.id !== id);
    subtasksListOnEdit = subtasksListOnEdit?.filter(s => s.id !== id);
    renderSubtasks();
}


function editSubtask(id) {
    let subtask = subtasks?.find(s => s.id === id) || subtasksListOnEdit.find(s => s.id === id);
    if (!subtask) return;

    let element = document.getElementById(`subtask${id}`);
    element.outerHTML = getSubtaskEditTemplate(subtask);

    let input = document.getElementById(`editInput${id}`);
    let inputlength = input.value.length;
    input.focus();
    input.setSelectionRange(inputlength, inputlength);
}


function saveSubtask(id) {
    let input = document.getElementById(`editInput${id}`);
    if (!input) return;

    let newText = input.value.trim() || "untitled";
    let subtask = subtasks?.find(s => s.id === id) || subtasksListOnEdit.find(s => s.id === id);
    if (subtask) subtask.text = newText;

    renderSubtasks();
}


function handleBlurSubtask(id) {
    setTimeout(() => {
        const input = document.getElementById(`editInput${id}`);
        if (input) {
            saveSubtask(id);
        }
    }, 100);
}


function resetAddTaskSide() {
    resetInput('addTasktTitleInput', 'addTasktTitleErrorContainer', 'addTasktTitleInputContainer');
    resetInput('addTaskTextarea', '', 'addTaskDescriptionInputContainer');
    resetInput('addTasktDateInput', 'addTasktDateErrorContainer', 'addTasktDateInputContainer');
    resetPriority();
    resetAssignedTo();
    resetCategory();
    resetSubtask();
}


function resetInput(inputId, errorId, containerId) {
    let input = document.getElementById(inputId);
    input.value = "";
    if (errorId) {
        let errorMessage = document.getElementById(errorId);
        errorMessage.innerText = "";
    }

    removeFocusBorder(containerId);
    document.getElementById(containerId).classList.remove('inputErrorBorder');
}


function resetPriority() {
    activatePriorityButton('addTaskMediumButton', 'buttonMediumActive', 'mediumButtonOff', 'mediumButtonOn');
}


function resetAssignedTo() {
    document.getElementById('addTaskDropdownAssignedTo').classList.remove('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.add('d-none');
    let addedContacts = document.getElementById('addTaskAddedContactIcons');
    addedContacts.classList.remove('d-none');
    addedContacts.innerHTML = "";
    selectedContactsAddTask = [];
    renderContactsInAddTask();
}


function resetCategory() {
    document.getElementById('categoryDropdownContent').classList.add('d-none');
    document.getElementById('dropdownDownIcon').classList.remove('d-none');
    document.getElementById('dropdownUpIcon').classList.add('d-none');
    document.getElementById('addTaskCategoryHeaderContainer').classList.remove('inputErrorBorder');
    document.getElementById('addTaskCategoryDropdownContent').classList.remove('boxShadow');
    let header = document.getElementById('categoryDropdownHeader');
    header.textContent = "Select task category";
}


function resetSubtask() {
    clearSubtaskInput();
    let list = document.getElementById('subtaskListContent');
    list.innerHTML = "";
    subtasks = [];
    subtaskIdCounter = 0;
}

/* Create task function */
function createTask() {
    if (!checkRequiredFields()) { return; }
    const taskData = getTaskData();
    saveTaskToDatabase(taskData);
    showAddTaskDialog();
    goToBoardHtml();
    selectedContactsAddTask = [];
}


function checkRequiredFields() {
    let inputTitle = document.getElementById('addTasktTitleInput');
    let inputDate = document.getElementById('addTasktDateInput');
    let categoryHeader = document.getElementById('categoryDropdownHeader');
    if (inputTitle.value == "" || inputDate.value == "" || categoryHeader.textContent == "Select task category") {
        removeFocusBorderCheckInputValue('addTasktTitleInputContainer', 'addTasktTitleInput', 'addTasktTitleErrorContainer');
        removeFocusBorderCheckInputValue('addTasktDateInputContainer', 'addTasktDateInput', 'addTasktDateErrorContainer');
        setErrorBorderForCategory('addTaskCategoryHeaderContainer');
        return false;
    } else {
        return true;
    }
}


function getTaskData(editTask = false) {
    const title = document.getElementById('addTasktTitleInput').value;
    const description = document.getElementById('addTaskTextarea').value;
    const dueDate = document.getElementById('addTasktDateInput').value;
    const priority = getSelectedPriority();
    const category = document.getElementById('categoryDropdownHeader').dataset.value;
    const assignedTo = selectedContactsAddTask.length
        ? selectedContactsAddTask.map(contact => ({ id: contact.id, initial: contact.initial, name: contact.name, color: contact.color }))
        : usersListOnEdit.map(contact => ({ id: contact.id, initial: contact.initial, name: contact.name, color: contact.color }));
    const oSubtasks = !editTask
        ? subtasks.map(subtask => ({ id: subtask.id, text: subtask.text, done: subtask.done }))
        : subtasksListOnEdit.map(subtask => ({ id: subtask.id, text: subtask.text, done: subtask.done }));
    const status = "Todo";
    return { title, description, dueDate, priority, category, assignedTo, subtasks: oSubtasks, status };
}


function getSelectedPriority() {
    if (document.getElementById('addTaskUrgentButton').classList.contains('buttonUrgentActive')) {
        return 'Urgent';
    } else if (document.getElementById('addTaskMediumButton').classList.contains('buttonMediumActive')) {
        return 'Medium';
    } else if (document.getElementById('addTaskLowButton').classList.contains('buttonLowActive')) {
        return 'Low';
    } else { return null; }
}

/* Save task on DB */
function saveTaskToDatabase(taskData) {
    fetch(BASE_URL + "tasks.json", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(taskData) })
        .then(response => { if (!response.ok) { throw new Error("Erro on save contact"); } return response.json(); })
        .then(data => {
            assignedToUser(data.name);
        })
        .catch(error => {
            console.error("Erro:", error);
            showMessageDialog("Erro:", error);
        });
}

/* Handle update befor update on database */
async function handleUpdateTask(taskId) {
    const task = await getTaskById(taskId);
    const updatedTask = getTaskData(true);
    updatedTask.status = task.status;
    updatedTask.category = task.category;

    const oldUSersIds = task?.assignedTo?.map(u => u.id) || [];
    const newUsersIds = updatedTask?.assignedTo?.map(u => u.id) || [];
    const removedUsersIds = oldUSersIds.filter(id => !newUsersIds.includes(id));
    const addedUsersIds = newUsersIds.filter(id => !oldUSersIds.includes(id));

    if (removedUsersIds.length || addedUsersIds.length) {
        removeTaskFromUsers(removedUsersIds, taskId);
        addTaskToUsers(addedUsersIds, taskId);
    }
    updateTaskOnDatabase(taskId, updatedTask);
}

/* Updated edited task on database */
function updateTaskOnDatabase(taskId, task) {
    fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(task) })
        .then(response => { if (!response.ok) { throw new Error("Error updating contact"); } return response.json(); })
        .then(() => {
            openTaskDetails(taskId, task);
            goToBoardHtml();
            usersListOnEdit = [];
        })
        .catch(error => { console.error("Error:", error); });
}

/* Redirect to board */
function goToBoardHtml() {
    const boardMenuItem = document.querySelector('.navLine[data-file*="board"], .navLine[data-file*="Board"]');
    setTimeout(() => {
        if (boardMenuItem) {
            boardMenuItem.click();
            return;
        }
    }, 2000);
}

/* Save task for all assigned users*/
async function assignedToUser(taskId) {
    const task = await getTaskById(taskId);
    const users = task.assignedTo;
    if (!users) return [];
    for (let index = 0; index < users.length; index++) {
        const userId = users[index].id;
        const user = await searchContactById(userId);
        if (user.tasks?.length) {
            user.tasks.push(taskId)
        } else {
            user.tasks = [taskId]
        }
        updateContact(userId, user, true);
    }

}

/* Get task by id */
async function getTaskById(taskId) {
    const url = `${BASE_URL}tasks/${taskId}.json`;
    const res = await fetch(url);
    const task = await res.json();
    return task
}

/* Show Add Task Success Dialog */
function showAddTaskDialog() {
    const overlay = document.getElementById("addTaskOverlay");
    overlay.classList.add("show");
    const taskOverlay = document.getElementById('addTaskOverlayBackground');

    if (taskOverlay) {
        taskOverlay.style.display = "flex"
    } else {
        showAddTaskOverlaySuccessMessage();
        setTimeout(() => {
            closeAddTaskOverlay();
        }, 1000);
    }
}