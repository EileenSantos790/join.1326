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
function addTaskSelectContact(containerId, checkboxOffId, checkboxOnId, initial, color) {
    document.getElementById(containerId).classList.toggle('dropdownItemOff');
    document.getElementById(containerId).classList.toggle('dropdownItemOn');
    document.getElementById(checkboxOffId).classList.toggle('d-none');
    document.getElementById(checkboxOnId).classList.toggle('d-none');
    saveClickedContact(initial, color);
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

function saveClickedContact(initial, color) {
    let index = selectedContactsAddTask.findIndex(c => c.initial === initial);

    if (index !== -1) {
        selectedContactsAddTask.splice(index, 1);
    } else {
        selectedContactsAddTask.push({ "initial": initial, "color": color });
    }
    selectedContactsAddTask.sort();
}

/**
 * Displays selected contacts when the dropdown menu is closed.
 */
function addContactToTask() {
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    contentDiv.innerHTML = "";
    selectedContactsAddTask.forEach((contact) => {
        contentDiv.innerHTML += getSelectedContactTemplate(contact.initial, contact.color);
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
    subtasks.forEach(subtask => {
        list.innerHTML += getSubtaskListTemplate(subtask);
    })
}


function deleteSubtask(id) {
    subtasks = subtasks.filter(s => s.id !== id);
    renderSubtasks();
}


function editSubtask(id) {
    let subtask = subtasks.find(s => s.id === id);
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
    let subtask = subtasks.find(s => s.id === id);
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
    if (errorId){
        let errorMessage = document.getElementById(errorId);
    errorMessage.innerText = "";
    }

    removeFocusBorder(containerId);
    document.getElementById(containerId).classList.remove('inputErrorBorder');
}


function resetPriority() {
    activatePriorityButton('addTaskMediumButton','buttonMediumActive','mediumButtonOff','mediumButtonOn');
}


function resetAssignedTo() {
    document.getElementById('addTaskDropdownAssignedTo').classList.remove('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.add('d-none');
    let addedContacts = document.getElementById('addTaskAddedContactIcons');
    addedContacts.classList.remove('d-none');
    addedContacts.innerHTML = "";
    selectedContactsAddTask = [];
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


function createTask() {
    if (!checkRequiredFields()) {return;}
    // saveTaskToDatabase();
    // showSuccessMessage();
    // goToBoardHtml();
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