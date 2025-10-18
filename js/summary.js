let loadedTasks = [];

onElementAppear('#summaryContainer', () => {
    ensureTodoIconSvg();
    setPageLoad();
});


/** Populates the summary counters when the page loads. */
async function setPageLoad() {
    await setStatusQuantity();
    await setUrgentPriorityQuantity();
    await setTotalTasksQuantity();
    setNextUrgentTaskDate();
}


/** Returns how many tasks currently have the given status. */
async function getAllTasksByStatus(status) {
    try {
        const res = await fetch(BASE_URL + "tasks.json");
        const data = await res.json();
        const tasks = await getTasksToArray(data);
        loadedTasks = tasks;

        return tasks.filter(task => task.status === status).length;
    } catch (err) {
        console.error(err);
    }
}


/** Counts loaded tasks marked with urgent priority. */
function getAllUrgentTasks() {
    return loadedTasks.filter(task => task.priority === "Urgent").length;
}


/** Updates the DOM with task totals per status. */
async function setStatusQuantity() {
    document.getElementById("todoNumber").innerHTML = await getAllTasksByStatus("Todo");
    document.getElementById("doneNumber").innerHTML = await getAllTasksByStatus("Done");
    document.getElementById("tasksInProgressNumber").innerHTML = await getAllTasksByStatus("Progress");
    document.getElementById("awaitingFeedbackNumber").innerHTML = await getAllTasksByStatus("Feedback");
}


/** Updates the urgent task counter. */
async function setUrgentPriorityQuantity() {
    document.getElementById("urgentNumber").innerHTML = getAllUrgentTasks();
}


/** Updates the overall task count in the summary. */
async function setTotalTasksQuantity() {
    document.getElementById("tasksOnBoardNumber").innerHTML = loadedTasks.length;
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
  document.getElementById("calenderDate").textContent = formattedDate;
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
