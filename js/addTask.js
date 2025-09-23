let testContactArray = ['Anton A', 'Bernd B', 'Clara C', 'Dori D'];
let selectedContactsAddTask = [];
let contactSearchArray = [];


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
    renderContactsInAddTask(testContactArray);
}

/**
 * marks the clicked contact.
 */
function addTaskSelectContact(containerId, checkboxOffId, checkboxOnId) {
    document.getElementById(containerId).classList.toggle('dropdownItemOff');
    document.getElementById(containerId).classList.toggle('dropdownItemOn');
    document.getElementById(checkboxOffId).classList.toggle('d-none');
    document.getElementById(checkboxOnId).classList.toggle('d-none');
    saveClickedContact(containerId);
    addContactToTask();
}

/**
 * Displays all contacts in the assigned to dropdown container.
 */
function renderContactsInAddTask(contactArray) {
    let contentDiv = document.getElementById('assignedToContactContent');
    contentDiv.innerHTML = "";
    contactArray.forEach((contact, index) => {
        contentDiv.innerHTML += getContactTemplate(contact, index)
    });
}

/**
 * Adds the contact to a separate array and sorts them alphabetically.
 */
function saveClickedContact(containerId) {
    let contactContent = document.getElementById(containerId).textContent;
    let index = selectedContactsAddTask.indexOf(contactContent);

    if (selectedContactsAddTask.includes(contactContent)) {
        selectedContactsAddTask.splice(index, 1);
    } else {
        selectedContactsAddTask.push(contactContent);
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
        contentDiv.innerHTML += getSelectedContactTemplate(contact)
    });
}

/**
 * filter function to search for contacts.
 */
function searchContactsForTask() {
    let inputRef = document.getElementById('addTaskSearchInput');
    let searchInput = inputRef.value;

    if (searchInput.length > 0) {
        contactSearchArray = testContactArray.filter(contact => contact.toLowerCase().includes(searchInput.toLowerCase()));
        renderContactsInAddTask(contactSearchArray);
    } else {
        renderContactsInAddTask(testContactArray);
    }
}

/**
 * The filter function is not yet working properly because the render function must be called elsewhere. (when opening the addTask page)
 *  */


function toggleDropdownCategory() {
    document.getElementById('categoryDropdownContent').classList.toggle('d-none');
    document.getElementById('dropdownDownIcon').classList.toggle('d-none');
    document.getElementById('dropdownUpIcon').classList.toggle('d-none');
    document.getElementById('addTaskCategoryDropdownContent').classList.toggle('boxShadow');
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