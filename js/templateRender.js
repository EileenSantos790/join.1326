/** Builds and appends a task card element into the target lane. */
function renderCard(task, card) {
    let html = `<div id="${task.id}" class="boardCardContainer drag" draggable="true" ondragstart="onDragStart(event)" ondragend="onDragEnd(event)" onclick="openTaskDetails('${task.id}')">`;
    const description = task.description.length > 7 ? task.description.split(" ", 7).join(" ").concat("...") : task.description
    if (task.category === 'User Story') { html += `<div class="categoryFieldUserStory">User Story</div>` } 
    else { html += `<div class="categoryFieldTechnicalTask">Technical Task</div>` }
    html += `<div class="titleOfTask">${task.title}</div>
                <div class="descriptionOfTask">${description || ""}</div>
                ${renderProgressBar(task)}
                <div class="contactsAndPriorityContainer">
                    <div>${renderContactsOnBoard(task.assignedTo)}</div>
                    <div>${renderPriorityOnBoard(task.priority)}</div>
                </div>

                    <div class="boardMoveToIcon" onclick="openBoardMoveToOverlay(event)"><img src="../assets/icons/board_task_move_to.svg" alt="Move To Icon"></div>
                    <div class="boardMoveToOverlay d-none" onclick="event.stopPropagation()">
                        <div class="boardMoveToHeadline">Move To</div>
                        <div class="boardMoveToOverlayButtons">
                            ${getNewStatus(task.id, task.status)}
                        </div>
                    </div>
            </div>`;
    card.innerHTML += html;
}


/** Renders a subtasks progress bar if the task contains subtasks. */
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


/** Returns the priority icon markup based on task priority. */
function renderPriorityOnBoard(priority) {
    switch (priority) {
        case "Urgent": return `<img class="priorityIconBoard"src="../assets/icons/prio_high.svg"></img>`
        case "Low": return `<img class="priorityIconBoard"src="../assets/icons/prio_low.svg">`
        default: return `<img class="priorityIconBoard"src="../assets/icons/prio_media.svg"></img>`
    }
}


/** Renders the responsive edit overlay with actions. */
function renderEditOverlay(editOverlay){
    const userID = document.getElementById("contactDetailsResponsive").getAttribute('data-edited-contactId');
    editOverlay.innerHTML = `
                    <div>
                         <div class="editContactBtn" onclick="editContact('${userID}')">
                             <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z" fill="currentColor"/>
                             </svg>
                                <p class="editMenuRes">Edit</p>
                         </div>
                         <div class="editContactBtn" onclick="deleteContact('${userID}')">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="deleteAndEditIcon">
                                 <mask id="mask0_369895_4535" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                     <rect width="24" height="24" fill="#D9D9D9"/>
                                 </mask>
                                 <g mask="url(#mask0_369895_4535)">
                                     <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="currentColor"/>
                                 </g>
                             </svg>
                             <p class="editMenuRes">Delete</p>
                        </div>
                    </div>`
}


/** Opens the task details overlay for the given task. */
async function openTaskDetails(taskId, editedTask = null) {
    const task = !editedTask ? allTasks.find(task => task.id === taskId) : editedTask;
    await slideinBoardDetailsOverlay()
    const content = document.getElementById("boardOverlayContent");
    const categoryColor = task.category === 'User Story' ? '#0038FF' : '#1FD7C1';
    const html = `<div class="overlineHeadline" onclick="closeOverlay()">
            <div class="categoryFieldUserStoryOverlay" style="background:${categoryColor}"}>${task.category}</div>
            <svg class="closeOverlayBoardImg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_367575_1084" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_367575_1084)">
                    <path d="M12 13.4L7.10005 18.3C6.91672 18.4834 6.68338 18.575 6.40005 18.575C6.11672 18.575 5.88338 18.4834 5.70005 18.3C5.51672 18.1167 5.42505 17.8834 5.42505 17.6C5.42505 17.3167 5.51672 17.0834 5.70005 16.9L10.6 12L5.70005 7.10005C5.51672 6.91672 5.42505 6.68338 5.42505 6.40005C5.42505 6.11672 5.51672 5.88338 5.70005 5.70005C5.88338 5.51672 6.11672 5.42505 6.40005 5.42505C6.68338 5.42505 6.91672 5.51672 7.10005 5.70005L12 10.6L16.9 5.70005C17.0834 5.51672 17.3167 5.42505 17.6 5.42505C17.8834 5.42505 18.1167 5.51672 18.3 5.70005C18.4834 5.88338 18.575 6.11672 18.575 6.40005C18.575 6.68338 18.4834 6.91672 18.3 7.10005L13.4 12L18.3 16.9C18.4834 17.0834 18.575 17.3167 18.575 17.6C18.575 17.8834 18.4834 18.1167 18.3 18.3C18.1167 18.4834 17.8834 18.575 17.6 18.575C17.3167 18.575 17.0834 18.4834 16.9 18.3L12 13.4Z" fill="#2A3647"/>
                </g>
            </svg>
        </div>
        <div class="titleOfTaskOverlay">${task.title}</div>
        <div class="descriptionOfTaskOverlay">${task.description}</div>
        <div class="detailsOverlayContainer">
            <span>Due date: </span>
            <span>${formatDate(task.dueDate)}</span>
        </div>
        <div class="detailsOverlayContainer">
            <span>Priority:</span>
            ${getPriorityDetailsTemplate(task.priority)}
        </div>
        <div class="detailsOverlayContainer">
            <span>Assigned To:</span>
        </div>
        ${getContactsOnBoardDetailsTemplate(task.assignedTo)}
        <div class="detailsOverlayContainer">Subtasks:</div>
        ${getSubtasksOnBoardDetails(taskId, task.subtasks)}
        <div class="containerEditTaskOverlay">
            <div class="editContactBtn" onclick="deleteTask('${task.id}')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    class="deleteAndEditIcon">
                    <mask id="mask0_369895_4535" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                        width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_369895_4535)">
                        <path
                            d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z"
                            fill="currentColor" />
                    </g>
                </svg>
                <p>Delete</p>
            </div>
            <div class="separationLineGrey"></div>
            <div class="editContactBtn" onclick="editTask('${taskId}')">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z"
                        fill="currentColor" />
                </svg>
                <p>Edit</p>
            </div>

        </div>`
    content.innerHTML = html;

    // add event to capture checkbox subtasks (delegation scoped to the overlay)
    content.addEventListener('change', (ev) => {
        const input = ev.target.closest('input.cbInput');
        if (!input) return;
        const label = input.closest('label.cb');
        const subtaskId = label?.dataset.subtaskId;
        const isDone = input.checked;
        if (!task?.id) { task.id = label?.dataset.taskId; }
        onSubtaskToggle(task, subtaskId, isDone);
    }, { once: false });
}