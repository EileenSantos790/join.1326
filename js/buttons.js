let testContactArray = ['Anton A','Bernd B','Clara C','Dori D'];
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

    if(selectedContactsAddTask.includes(contactContent)) {
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

    if(searchInput.length > 0) {
        contactSearchArray = testContactArray.filter(contact => contact.toLowerCase().includes(searchInput.toLowerCase()));
        renderContactsInAddTask(contactSearchArray);
    } else {
        renderContactsInAddTask(testContactArray);
    }
}

/**
 * The filter function is not yet working properly because the render function must be called elsewhere. (when opening the addTask page)
 *  */ 