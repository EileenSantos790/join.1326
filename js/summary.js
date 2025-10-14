let loadedTasks = []

onElementAppear('#summaryContainer', () => {
    setPageLoad()
});

async function setPageLoad() {
    await setStatusQuantity();
    await setUrgentPriorityQuantity();
    await setTotalTasksQuantity();
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