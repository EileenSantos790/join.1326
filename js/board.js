function openAddTaskOverlay() {
    let overlay = document.getElementById('addTaskBoardOverlayMainSection');
    overlay.classList.add('show');
    document.getElementById('homeBody').style.overflow = 'hidden';
    renderContactsInAddTask();      //=> for the task overlay when the main task page is rendered correctly
}


function closeAddTaskOverlay() {
    let overlay = document.getElementById('addTaskBoardOverlayMainSection');
    overlay.classList.remove('show');
    document.getElementById('homeBody').style.overflow = 'unset';
    document.getElementById('addTaskBoardOverlay').classList.add('d-none');
}


function createTaskInOverlay() {
    if (!checkRequiredFields()) { return; }
    // const taskData = getTaskData();     => // disabled for testing purposes
    // saveTaskToDatabase(taskData);       =>// disabled for testing purposes
    showAddTaskOverlaySuccessMessage();

    setTimeout(() => {
        closeAddTaskOverlay();
    }, 1000);
}


function showAddTaskOverlaySuccessMessage() {
    document.getElementById('addTaskBoardOverlay').classList.remove('d-none');
}