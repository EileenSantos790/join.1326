let loadedTasks = [];

onElementAppear('#summaryContainer', () => {
    ensureTodoIconSvg();
    setPageLoad();
});


/** Populates the summary counters when the page loads. */
function setPageLoad() {
    loadTasksFromDb().then(() => {
    setStatusQuantity();
    setUrgentPriorityQuantity();
    setTotalTasksQuantity();
    setNextUrgentTaskDate();
});
}


/** Returns how many tasks currently have the given status. */
function getAllTasksByStatus(status) {
    if(loadedTasks.length) return loadedTasks.filter(task => task.status === status).length;
}

/** Loads tasks from the database and stores them in the loadedTasks array. */
async function loadTasksFromDb() {
    try {
        const res = await fetch(BASE_URL + "tasks.json");
        const data = await res.json();
        loadedTasks = getTasksToArray(data);
    } catch (err) { console.error(err); }
}


/** Counts loaded tasks marked with urgent priority. */
function getAllUrgentTasks() {
    if(loadedTasks.length) return loadedTasks.filter(task => task.priority === "Urgent").length;
}


/** Updates the DOM with task totals per status. */
function setStatusQuantity() {
    document.getElementById("todoNumber") && (document.getElementById("todoNumber").innerHTML = getAllTasksByStatus("Todo"));
    document.getElementById("doneNumber") && (document.getElementById("doneNumber").innerHTML = getAllTasksByStatus("Done"));
    document.getElementById("tasksInProgressNumber") && (document.getElementById("tasksInProgressNumber").innerHTML = getAllTasksByStatus("Progress"));
    document.getElementById("awaitingFeedbackNumber") && (document.getElementById("awaitingFeedbackNumber").innerHTML = getAllTasksByStatus("Feedback"));
}


/** Updates the urgent task counter. */
function setUrgentPriorityQuantity() {
    document.getElementById("urgentNumber") && (document.getElementById("urgentNumber").innerHTML = getAllUrgentTasks());
}
    

/** Updates the overall task count in the summary. */
function setTotalTasksQuantity() {
    document.getElementById("tasksOnBoardNumber") && (document.getElementById("tasksOnBoardNumber").innerHTML = loadedTasks.length);
}


/** Shows the due date of the next urgent task or a fallback label. */
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


/** Finds the closest upcoming due date from a list of tasks. */
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
