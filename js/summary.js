let loadedTasks = [];

onElementAppear('#summaryContainer', () => {
    ensureTodoIconSvg();
    setPageLoad();
});

function ensureTodoIconSvg() {
    const container = document.querySelector('.smallWindows');
    if (!container) return;

    const existingSvg = container.querySelector('svg.summaryPenIconNormal');
    if (existingSvg) return;

    const img = container.querySelector('img.summaryPenIconNormal');
    if (!img) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'summaryIcon summaryPenIconNormal');
    svg.setAttribute('width', '69');
    svg.setAttribute('height', '69');
    svg.setAttribute('viewBox', '0 0 69 70');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('class', 'icon-bg');
    circle.setAttribute('cx', '34.5');
    circle.setAttribute('cy', '35');
    circle.setAttribute('r', '34.5');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', 'icon-fg-fill');
    path.setAttribute('d', 'M25.1667 44.3332H27.0333L38.5333 32.8332L36.6667 30.9665L25.1667 42.4665V44.3332ZM44.2333 30.8998L38.5667 25.2998L40.4333 23.4332C40.9444 22.9221 41.5722 22.6665 42.3167 22.6665C43.0611 22.6665 43.6889 22.9221 44.2 23.4332L46.0667 25.2998C46.5778 25.8109 46.8444 26.4276 46.8667 27.1498C46.8889 27.8721 46.6444 28.4887 46.1333 28.9998L44.2333 30.8998ZM42.3 32.8665L28.1667 46.9998H22.5V41.3332L36.6333 27.1998L42.3 32.8665Z');
    path.style.fill = 'var(--icon-fg)';

    svg.appendChild(circle);
    svg.appendChild(path);
    img.replaceWith(svg);
}

async function setPageLoad() {
    await setStatusQuantity();
    await setUrgentPriorityQuantity();
    await setTotalTasksQuantity();
    setNextUrgentTaskDate();
}

async function getAllTasksByStatus(status) {
    try {
        const res = await fetch(BASE_URL + "tasks.json");
        const data = await res.json();
        const tasks = await getTasksToArray(data);
        loadedTasks = tasks;

        return tasks.filter(task => task.status === status).length;

        // const results = Object.entries(data)
        //     .filter(([id, task]) => task.status === status)
        //     .map(([id, task]) => ({ id, ...task }));
        // return results.length;
    } catch (err) {
        console.error(err);
    }
}

function getAllUrgentTasks() {
    return loadedTasks.filter(task => task.priority === "Urgent").length;
}

async function setStatusQuantity() {
    document.getElementById("todoNumber").innerHTML = await getAllTasksByStatus("Todo");
    document.getElementById("doneNumber").innerHTML = await getAllTasksByStatus("Done");
    document.getElementById("tasksInProgressNumber").innerHTML = await getAllTasksByStatus("Progress");
    document.getElementById("awaitingFeedbackNumber").innerHTML = await getAllTasksByStatus("Feedback");
}

async function setUrgentPriorityQuantity() {
    document.getElementById("urgentNumber").innerHTML = getAllUrgentTasks();
}

async function setTotalTasksQuantity() {
    document.getElementById("tasksOnBoardNumber").innerHTML = loadedTasks.length;
}

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