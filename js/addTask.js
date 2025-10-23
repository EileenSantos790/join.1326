let selectedContactsAddTask = [];
let contactSearchArray = [];
let subtasks = [];
let subtaskIdCounter = 0;


/**
 * Activates a priority button by updating its style and icon based on the selected priority. 
 * 
 * @param {string} buttonId - The ID of the respective button.
 * @param {string} buttonClass - A CSS class to be added.
 * @param {string} buttonIconOff - The ID of an activated button icon.
 * @param {string} buttonIconOn - The ID of a disabled button icon.
 */
function activatePriorityButton(buttonId, buttonClass, buttonIconOff, buttonIconOn) {
    document.getElementById('addTaskUrgentButton').classList.remove('buttonUrgentActive');
    document.getElementById('addTaskMediumButton').classList.remove('buttonMediumActive');
    document.getElementById('addTaskLowButton').classList.remove('buttonLowActive');
    setPriorityButtonIconToDefault();
    document.getElementById(buttonIconOn).classList.remove('d-none');
    document.getElementById(buttonIconOff).classList.add('d-none');
    document.getElementById(buttonId).classList.add(buttonClass);
}


/** 
 * Resets all priority button icons to their default (unselected) state. 
 */
function setPriorityButtonIconToDefault() {
    document.getElementById('urgentButtonOff').classList.remove('d-none');
    document.getElementById('mediumButtonOff').classList.remove('d-none');
    document.getElementById('lowButtonOff').classList.remove('d-none');
    document.getElementById('urgentButtonOn').classList.add('d-none');
    document.getElementById('mediumButtonOn').classList.add('d-none');
    document.getElementById('lowButtonOn').classList.add('d-none');
}


/** 
 * Toggles the assigned-to dropdown in the add-task view. 
 */
async function toggleDropdownAssignedTo() {
    await renderAllContacts();
    document.getElementById('addTaskDropdownAssignedTo').classList.toggle('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.toggle('d-none');
    document.getElementById('addTaskAddedContactIcons').classList.toggle('d-none');
}


/** 
 * Toggles the selection state of a contact in the assigned list. 
 * 
 * @param {string} userId - The ID of a user.
 * @param {string} initial - A user's initials.
 * @param {string} color - The respective color of a user.
 * @param {string} name - the respective name of a user.
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
 * 
 * @param {array} searchArray - The contact search array for the filter function.
 */
async function renderContactsInAddTask(searchArray = []) {
    if (searchArray.length) {
        let contentDiv = document.getElementById('assignedToContactContent');
        contentDiv.innerHTML = "";
        for (let index = 0; index < searchArray.length; index++) { contentDiv.innerHTML += getContactTemplate(searchArray, index); }
        return
    }
    await renderAllContacts();
}


/** 
 * Adds the contact to a separate array and sorts them alphabetically. 
 * 
 * @param {string} initial - A user's initials.
 * @param {string} color - The respective color of a user.
 * @param {string} id - The ID of a user.
 * @param {string} name - the respective name of a user.
 */
function saveClickedContact(initial, color, id, name) {
    let index = selectedContactsAddTask?.findIndex(c => c.id === id);
    if (index !== -1 && index != undefined) { selectedContactsAddTask.splice(index, 1); }
    else { selectedContactsAddTask.push({ id, name, initial, color }); }
    selectedContactsAddTask.sort((a, b) => a.initial.localeCompare(b.initial));
}


/** 
 * Displays selected contacts when the dropdown menu is closed. 
 */
function addContactToTask() {
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    contentDiv.innerHTML = ""; const MAX_VISIBLE = 5; const visible = selectedContactsAddTask.slice(0, MAX_VISIBLE);
    visible.forEach((contact) => { contentDiv.innerHTML += getSelectedContactTemplate(contact.initial, contact.color, contact.id, contact.name);});
    const remaining = selectedContactsAddTask.length - MAX_VISIBLE;
    if (remaining > 0) { if (typeof getMoreAvatarTemplate === 'function') { contentDiv.innerHTML += getMoreAvatarTemplate(remaining);} else {contentDiv.innerHTML += `<div class="margin_top8 avatar" style="background:#2A3647;color:#fff;">${remaining}</div>`;}}
}


/** 
 * Filters contacts for the assigned-to dropdown. 
 */
async function searchContactsForTask() {
    let inputRef = document.getElementById('addTaskSearchInput');
    let searchInput = inputRef.value;
    let allUsers = await getAllUsers();
    let contacts = getUserDataToArray(allUsers);
    if (searchInput.length > 0) { contactSearchArray = contacts.filter(contact => contact.name.toLowerCase().includes(searchInput.toLowerCase())); renderContactsInAddTask(contactSearchArray); }
    else { renderContactsInAddTask(); }
}


/** 
 * Toggles the visibility of the category dropdown and its associated icons. 
 */
function toggleDropdownCategory() {
    document.getElementById('categoryDropdownContent').classList.toggle('d-none');
    document.getElementById('dropdownDownIcon').classList.toggle('d-none');
    document.getElementById('dropdownUpIcon').classList.toggle('d-none');
    document.getElementById('addTaskCategoryDropdownContent').classList.toggle('boxShadow');
    document.getElementById('addTaskCategoryHeaderContainer').classList.remove('inputErrorBorder');
}


/** 
 * Selects a category from the dropdown and updates the header. 
 * 
 * @param {string} option - The selected option in the dropdown menu.
 */
function selectedCategory(option) {
    let header = document.getElementById('categoryDropdownHeader');
    header.textContent = option.textContent;
    header.dataset.value = option.dataset.value;
    toggleDropdownCategory();
}


/** 
 * close the assigned to and category dropdown when click outside. 
 * 
 * @param {MouseEvent} click - The click event object, which contains information about the mouse action.
 */
document.onclick = function (click) {
    closeAssignedToClickOutside(click); closeCategoryClickOutside(click);
}


/** 
 * Closes the assigned-to dropdown when clicking outside its container. 
 * 
 * @param {MouseEvent} click - The click event triggered by the user.
 */
function closeAssignedToClickOutside(click) {
    const dropdownAssignedTo = document.getElementById('addTaskAssignedToDropdownContent');
    if (dropdownAssignedTo && !dropdownAssignedTo.contains(click.target)) {
        document.getElementById('addTaskDropdownAssignedTo').classList.remove('d-none');
        document.getElementById('addTaskDropdownSearchContent').classList.add('d-none');
        document.getElementById('addTaskAddedContactIcons').classList.remove('d-none');
    }
}


/** 
 * Closes the category dropdown if a click occurs outside of it. 
 * 
 * @param {MouseEvent} click - The click event triggered by the user.
 */
function closeCategoryClickOutside(click) {
    const dropdownCategory = document.getElementById('addTaskCategoryDropdownContent');
    if (dropdownCategory && !dropdownCategory.contains(click.target)) {
        document.getElementById('categoryDropdownContent').classList.add('d-none');
        document.getElementById('dropdownDownIcon').classList.remove('d-none');
        document.getElementById('dropdownUpIcon').classList.add('d-none');
        document.getElementById('addTaskCategoryDropdownContent').classList.remove('boxShadow');
    }
}


/** 
 * Removes focus border from the container and checks if the input value is empty, displaying an error message if so. 
 * 
 * @param {string} containerId - The ID of the container element that visually wraps the input field.
 * @param {string} inputId - The ID of the input element to validate.
 * @param {string} errorId - The ID of the element where the error message should be displayed.
 */
function removeFocusBorderCheckInputValue(containerId, inputId, errorId) {
    document.getElementById(containerId).classList.remove('inputBorderColorFocus');
    let input = document.getElementById(inputId);
    let errorMessage = document.getElementById(errorId);
    if (!input.value.trim()) { input.value = ""; document.getElementById(containerId).classList.add('inputErrorBorder'); errorMessage.textContent = "This field is required"; }
}


/** 
 * Adds a new subtask to the list and updates the display. 
 */
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

/**
 * checks whether the input is empty 
 * 
 * @param {string} input - The subtask input value to validate.
 * @returns {boolean} `true` if the input is not empty, otherwise `false`.
 */
function checkSubtaskValue(input) {
    if (input.length > 0) {
        return true;
    } else return false;
}


/** 
 * Add a new substask when enter is pressed  
 */
function addSubtaskWithEnter() {
    const input = document.getElementById('subtaskInput');
    input.onkeydown = function (event) {
        if (event.key === 'Enter' && input.value) addSubtaskToList();
    };
}


/** 
 * Clears the value of the subtask input field. 
 */
function clearSubtaskInput() {
    let inputRef = document.getElementById('subtaskInput');
    inputRef.value = "";
}


/** 
 * Renders the subtasks into the subtask list element. 
 */
function renderSubtasks() {
    let list = document.getElementById('subtaskListContent');
    list.innerHTML = "";
    let arr = [];
    if (subtasks.length) { arr = subtasks } else { arr = subtasksListOnEdit }
    arr.forEach(subtask => { list.innerHTML += getSubtaskListTemplate(subtask); })
}


/** 
 * Deletes a subtask by its ID from the subtasks list and updates the display. 
 * 
 * @param {string} id - The unique identifier of the subtask to delete.
 */
function deleteSubtask(id) {
    subtasks = subtasks?.filter(s => s.id !== id);
    subtasksListOnEdit = subtasksListOnEdit?.filter(s => s.id !== id);
    renderSubtasks();
}


/** 
 * Edits a subtask by replacing its HTML and focusing on the input field. 
 * 
 * @param {string} id - The unique identifier of the subtask to edit.
 */
function editSubtask(id) {
    let subtask = subtasks?.find(s => s.id === id) || subtasksListOnEdit.find(s => s.id === id);
    if (!subtask) return;
    document.getElementById(`subtask${id}`).outerHTML = getSubtaskEditTemplate(subtask);
    const input = document.getElementById(`editInput${id}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}


/** 
 * Updates a subtask's text by id from its edit input and re-renders. 
 * 
 * @param {string} id - The unique identifier of the subtask being edited.
 */
function saveSubtask(id) {
    const input = document.getElementById(`editInput${id}`);
    if (!input) return;
    const newText = input.value.trim() || "untitled";
    const subtask = subtasks?.find(s => s.id === id) || subtasksListOnEdit.find(s => s.id === id);
    if (subtask) subtask.text = newText;
    renderSubtasks();
}


/** 
 * On blur, briefly delays and saves the subtask if its input exists. 
 * 
 * @param {number|string} id - The unique identifier of the subtask whose input lost focus.
 */
function handleBlurSubtask(id) {
    setTimeout(() => {
        const input = document.getElementById(`editInput${id}`);
        if (input) saveSubtask(id);
    }, 100);
}


/** 
 * Resets the Add Task side panel to its default input and selection state. 
 */
function resetAddTaskSide() {
    resetInput('addTasktTitleInput', 'addTasktTitleErrorContainer', 'addTasktTitleInputContainer');
    resetInput('addTaskTextarea', '', 'addTaskDescriptionInputContainer');
    resetInput('addTasktDateInput', 'addTasktDateErrorContainer', 'addTasktDateInputContainer');
    resetPriority();
    resetAssignedTo();
    resetCategory();
    resetSubtask();
}


/** 
 * Resets the input field and clears any associated error messages. 
 * 
 * @param {string} inputId - The ID of the input element to reset.
 * @param {string} errorId - The ID of the element displaying an error message.
 * @param {string} containerId - The ID of the container element wrapping the input.
 */
function resetInput(inputId, errorId, containerId) {
    document.getElementById(inputId).value = "";
    if (errorId) document.getElementById(errorId).innerText = "";
    removeFocusBorder(containerId);
    document.getElementById(containerId).classList.remove('inputErrorBorder');
}


/** 
 * Resets the priority to medium by activating the corresponding button. 
 */
function resetPriority() {
    activatePriorityButton('addTaskMediumButton', 'buttonMediumActive', 'mediumButtonOff', 'mediumButtonOn');
}


/** 
 * Resets the assigned contacts dropdown and clears added contact icons. 
 */
function resetAssignedTo() {
    document.getElementById('addTaskDropdownAssignedTo').classList.remove('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.add('d-none');
    const addedContacts = document.getElementById('addTaskAddedContactIcons');
    addedContacts.classList.remove('d-none');
    addedContacts.innerHTML = "";
    selectedContactsAddTask = [];
    renderContactsInAddTask();
}


/** 
 * Resets the category dropdown to its default state. 
 */
function resetCategory() {
    document.getElementById('categoryDropdownContent').classList.add('d-none');
    document.getElementById('dropdownDownIcon').classList.remove('d-none');
    document.getElementById('dropdownUpIcon').classList.add('d-none');
    document.getElementById('addTaskCategoryHeaderContainer').classList.remove('inputErrorBorder');
    document.getElementById('addTaskCategoryDropdownContent').classList.remove('boxShadow');
    document.getElementById('categoryDropdownHeader').textContent = "Select task category";
}


/** 
 * Resets the subtask input and clears the subtask list. 
 */
function resetSubtask() {
    clearSubtaskInput();
    let list = document.getElementById('subtaskListContent').innerHTML = "";
    subtasks = [];
    subtaskIdCounter = 0;
}