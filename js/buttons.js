let testContactArray = ['Anton A','Bernd B','Clara C','Dori D'];
let selectedContactsAddTask = [];


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


function toggleDropdownAssignedTo() {
    document.getElementById('addTaskDropdownAssignedTo').classList.toggle('d-none');
    document.getElementById('addTaskDropdownSearchContent').classList.toggle('d-none');
    document.getElementById('addTaskAddedContactIcons').classList.toggle('d-none');
    renderContactsInAddTask();
}


function addTaskSelectContact(containerId, checkboxOffId, checkboxOnId) {
    document.getElementById(containerId).classList.toggle('dropdownItemOff');
    document.getElementById(containerId).classList.toggle('dropdownItemOn');
    document.getElementById(checkboxOffId).classList.toggle('d-none');
    document.getElementById(checkboxOnId).classList.toggle('d-none');
    saveClickedContact(containerId);
    addContactToTask();
}

function renderContactsInAddTask() {
    let contentDiv = document.getElementById('assignedToContactContent');
    contentDiv.innerHTML = "";
    testContactArray.forEach((contact, index) => {
        contentDiv.innerHTML += getContactTemplate(contact, index)
    });
}


function saveClickedContact(containerId) {
    let contactContent = document.getElementById(containerId).textContent;
    // console.log(contactContent);
    let index = selectedContactsAddTask.indexOf(contactContent);

    if(selectedContactsAddTask.includes(contactContent)) {
        selectedContactsAddTask.splice(index, 1);
    } else {
        selectedContactsAddTask.push(contactContent);
    }

    selectedContactsAddTask.sort();
    // console.log(selectedContactsAddTask);
}


function addContactToTask() {
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    contentDiv.innerHTML = "";
    selectedContactsAddTask.forEach((contact) => {
        contentDiv.innerHTML += getSelectedContactTemplate(contact)
    });
}