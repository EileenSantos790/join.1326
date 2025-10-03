// Trigger callback every time the element appears (e.g., when navigating to Board)
function onElementAppear(selector, cb) {
  let present = false;
  const check = () => {
    const el = document.querySelector(selector);
    if (el && !present) {
      present = true;
      cb(el);
    } else if (!el && present) { present = false;} // element removed; allow future appearances to trigger again
  };
  check(); // initial check in case it's already there
  const observer = new MutationObserver(() => check()); // observe DOM changes to detect future inserts/removals
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

onElementAppear('#boardContainer', () => {
  loadBoard();
});

async function loadBoard () {
    const tasks = await getTasks();
    const arrTasks = getTasksToArray(tasks)
    renderBoard(arrTasks);
}

function renderBoard(tasks) {
    const noTaskSection = document.getElementById("noTasks");
    if (!tasks.length){ noTaskSection.innerHTML = `<div class="spaceHolderContainer">No tasks to do</div>`; return}
    
    const section = document.getElementById("boardContainer");
    let html = "";
    for (let i = 0; i < tasks.length; i++) {
        html += '<div class="boardCardContainer">';
        const task = tasks[i];
        const description = task.description.length > 7 ?  task.description.split(" ", 7).join(" ").concat("...") : task.description
        if (task.category === 'User Story'){html += `<div class="categoryFieldUserStory">User Story</div>`
        }else{ html += `<div class="categoryFieldTechnicalTask">Technical Task</div>` }
    
        html += `<div class="titleOfTask">${task.title}</div>
                <div class="descriptionOfTask">${description || ""}</div>
                ${renderProgressBar(task)}
                <div class="contactsAndPriorityContainer">
                    <div>${renderContactsOnBoard(task.assignedTo)}</div>
                    <div>${renderPriorityOnBoard(task.priority)}</div>
                </div>
                </div>`;
    }
    section.innerHTML = html
}

function renderProgressBar(task) {
    if (!task.subtasks) return ""
    const total = task.subtasks.length;
    const done = task.subtasks.filter(sb => sb.done === true).length;
    const percent = (done / total) * 100;
    return `
        <div class="processBarContainer">
        <div class="progress">
            <div class="progressBar" style="width: ${percent}%"></div>
        </div>
        <span class="progressLabel">${done}/${total} Subtasks</span>
        </div>
    `;
}

function renderContactsOnBoard(users) {
    if (!users) return `<div id="avatarBoard">No users assigned</div>`
    let template = '<div class="boardContactsContainer">'
    users.forEach(user => {
        template += `<div id="avatarBoard" class="avatarBoard" style="background:${user.color};color:#fff;">${user.initial}</div>`
    });
    template += "</div>";
    return template;
}

function renderPriorityOnBoard(priority) {
    switch (priority) {
        case "Urgent":
            return `<img class="priorityIconBoard"src="../assets/icons/prio_high.svg"></img>`
        case "Low":
            return `<img class="priorityIconBoard"src="../assets/icons/prio_low.svg">`
        default:
            return `<img class="priorityIconBoard"src="../assets/icons/prio_media.svg"></img>`
    }
}

function getTasksToArray(tasks) {
    const arr = [];
    if (!tasks) return arr;

    for (let taskID in tasks) {
        const task = tasks[taskID];
        arr.push({ id: taskID, title: task.title || "", description: task.description || "", status: task.status || "", assignedTo: task.assignedTo, category: task.category, dueDate: task.dueDate, priority: task.priority, subtasks: task.subtasks });
    }
    return arr;
}

function openAddTaskOverlay() {
    let overlay = document.getElementById('addTaskBoardOverlayMainSection');
    overlay.classList.add('show');
    document.getElementById('homeBody').style.overflow = 'hidden';
    // renderContactsInAddTask();      //=> Only needed if addTask is not reset
    resetAddTaskSide();
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