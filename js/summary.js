/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"Urgent"|"Medium"|"Low"|string} priority
 * @property {"Todo"|"Progress"|"Feedback"|"Done"|string} status
 * @property {string} [dueDate] - ISO date string (YYYY-MM-DD) or other parsable format
 * @property {Array<any>} [assignedTo]
 * @property {Array<{id: string|number, text: string, done?: boolean}>} [subtasks]
 */

/**
 * Cached list of tasks loaded from the backend for summary calculations.
 * @type {Task[]}
 */
let loadedTasks = [];

// Initialize summary widgets when the summary container becomes visible
onElementAppear('#summaryContainer', () => {
    ensureTodoIconSvg();
    setPageLoad();
});


/**
 * Populates the summary counters once tasks are loaded.
 * Loads tasks from the database and updates all numeric widgets.
 * @returns {void}
 */
function setPageLoad() {
    loadTasksFromDb().then(() => {
    setStatusQuantity();
    setUrgentPriorityQuantity();
    setTotalTasksQuantity();
    setNextUrgentTaskDate();
});
}


/**
 * Returns how many loaded tasks currently have the given status.
 *
 * @param {Task["status"]} status - Status to filter by (e.g., "Todo", "Done").
 * @returns {number|undefined} Count of tasks with the status, or undefined if tasks not loaded.
 */
function getAllTasksByStatus(status) {
    if(loadedTasks.length) return loadedTasks.filter(task => task.status === status).length;
}

/**
 * Loads tasks from the database and stores them in the `loadedTasks` array.
 * Uses `getTasksToArray` to convert the Firebase object into a flat array.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadTasksFromDb() {
    try {
        const res = await fetch(BASE_URL + "tasks.json");
        const data = await res.json();
        loadedTasks = getTasksToArray(data);
    } catch (err) { console.error(err); }
}


/**
 * Counts loaded tasks marked with "Urgent" priority.
 * @returns {number|undefined} Count of urgent tasks, or undefined if tasks not loaded.
 */
function getAllUrgentTasks() {
    if(loadedTasks.length) return loadedTasks.filter(task => task.priority === "Urgent").length;
}


/**
 * Updates the DOM with task totals per status if the elements exist.
 * @returns {void}
 */
function setStatusQuantity() {
    document.getElementById("todoNumber") && (document.getElementById("todoNumber").innerHTML = getAllTasksByStatus("Todo"));
    document.getElementById("doneNumber") && (document.getElementById("doneNumber").innerHTML = getAllTasksByStatus("Done"));
    document.getElementById("tasksInProgressNumber") && (document.getElementById("tasksInProgressNumber").innerHTML = getAllTasksByStatus("Progress"));
    document.getElementById("awaitingFeedbackNumber") && (document.getElementById("awaitingFeedbackNumber").innerHTML = getAllTasksByStatus("Feedback"));
}


/**
 * Updates the urgent task counter element if present in the DOM.
 * @returns {void}
 */
function setUrgentPriorityQuantity() {
    document.getElementById("urgentNumber") && (document.getElementById("urgentNumber").innerHTML = getAllUrgentTasks());
}
    

/**
 * Updates the overall task count in the summary if the element exists.
 * @returns {void}
 */
function setTotalTasksQuantity() {
    document.getElementById("tasksOnBoardNumber") && (document.getElementById("tasksOnBoardNumber").innerHTML = loadedTasks.length);
}


/**
 * Shows the due date of the next urgent task or a fallback label when none exist.
 * Formats the date using the browser's locale.
 *
 * @async
 * @returns {Promise<void>}
 */
async function setNextUrgentTaskDate() {
  const urgentTasks = loadedTasks.filter(task => task.priority === "Urgent" && task.dueDate);
  const closestDate = getClosestDueDate(urgentTasks);

  if (!closestDate) {
    document.getElementById("calenderDate").textContent = "No urgent tasks";
    return;
  }

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = closestDate.toLocaleDateString(undefined, options);
  document.getElementById("calenderDate") && (document.getElementById("calenderDate").textContent = formattedDate);
}


/**
 * Finds the closest upcoming due date from a list of tasks relative to now.
 * Returns null when the list is empty or contains no valid dates.
 *
 * @param {Task[]} tasks - Array of tasks with a `dueDate` string.
 * @returns {Date|null} The closest upcoming due date as a Date, or null.
 */
function getClosestDueDate(tasks) {
  const now = new Date();
  if (!tasks || tasks.length === 0) return null;

  const closestTask = tasks.reduce((closest, current) => {
    const currentDate = new Date(current.dueDate);
    if (!closest) return current;
    const closestDate = new Date(closest.dueDate);
    const diffClosest = Math.abs(closestDate - now);
    const diffCurrent = Math.abs(currentDate - now);
    return diffCurrent < diffClosest ? current : closest;
  }, null);

  return closestTask ? new Date(closestTask.dueDate) : null;
}
