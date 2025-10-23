/**
 * Fetch all users from the database.
 * @returns {Promise<Record<string, {user: {name:string,email:string,phone?:string,color?:string,initial?:string,tasks?:string[]}}>>}
 */
async function getAllUsers() {
    let usersList = await fetch(BASE_URL + "users.json");
    let allUsers = await usersList.json();
    return allUsers;
}


/**
 * Fetch all users, sort by name, and render the contact list into the dropdown container.
 * @returns {Promise<void>}
 */
async function renderAllContacts() {
    let allUsers = await getAllUsers();
    let contentDiv = document.getElementById('assignedToContactContent');
    contentDiv.innerHTML = "";
    let contacts = getUserDataToArray(allUsers);
    contacts.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    for (let index = 0; index < contacts.length; index++) { contentDiv.innerHTML += getContactTemplate(contacts, index); }
}


/**
 * Load contacts from the backend, normalize and sort them, then render the section.
 * @returns {Promise<void>}
 */
async function loadContacts() {
    const response = await fetch(BASE_URL + "users.json");
    usersById = await response.json();
    const contacts = getUserDataToArray(usersById);
    contacts.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    renderContactSection(contacts)
}

/**
 * Persist a new contact to the backend database.
 * @param {{name:string,email:string,phone?:string,color:string,initial:string}} newContact
 * @returns {void}
 */
function saveContact(newContact) {
    fetch(BASE_URL + "users.json", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: newContact }) })
        .then(response => { if (!response.ok) { throw new Error("Erro on save contact"); } return response.json(); })
        .then(data => {
            closeOverlay();
            loadContacts();
            showMessageDialog("Contact successfully created");
        })
        .catch(error => {
            console.error("Erro:", error);
        });
}


/**
 * Check if a contact email exists in the database.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
async function searchContactByEmail(email) {
    const url = `${BASE_URL}users.json?orderBy=${encodeURIComponent('"user/email"')}&equalTo=${encodeURIComponent(`"${email}"`)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data && Object.keys(data).length > 0;
}


/**
 * Fetch a contact by id from the backend.
 * @param {string} userID
 * @returns {Promise<{name:string,email:string,phone?:string,color?:string,initial?:string,tasks?:string[]}|null>}
 */
async function searchContactById(userID) {
    const url = `${BASE_URL}users/${userID}.json`;
    const res = await fetch(url);
    const data = await res.json();
    return data && data.user ? data.user : null;
}


/**
 * Delete a contact by id and update UI.
 * @param {string} userID
 * @returns {Promise<void>}
 */
async function deleteContact(userID) {
    const avatarContainer = document.getElementById("avatarEdit");
    const fallbackId = avatarContainer && avatarContainer.firstElementChild ? avatarContainer.firstElementChild.id : null;
    const targetId = userID || fallbackId;
    if (!targetId) return;
    await removeUserFromAllTasks(targetId);
    try {
        const response = await fetch(`${BASE_URL}users/${targetId}.json`, { method: "DELETE" });
        if (!response.ok) { throw new Error("Error deleting contact"); }
        await response.json(); const overlay = document.getElementById("contactOverlay");
        if (overlay) { overlay.classList.remove("active"); overlay.innerHTML = ""; }
        await loadContacts(); closeContactsOverlay(); showMessageDialog("Contact successfully deleted");
    } catch (error) { console.error("Error:", error); }
}


/**
 * Remove a user from every task assignment in the system.
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function removeUserFromAllTasks(userId) {
    if (!userId) return;
    try {
        const user = await searchContactById(userId); if (user && Array.isArray(user.tasks) && user.tasks.length) { user.tasks = []; updateContact(userId, user, true); }
        const response = await fetch(`${BASE_URL}tasks.json`); if (!response.ok) { throw new Error("Error loading tasks"); }
        const tasks = await response.json(); if (!tasks) return; const operations = [];
        for (const taskId in tasks) {
            const task = tasks[taskId]; if (!task) continue; const assigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];const filtered = assigned.filter(assignee => assignee && assignee.id !== userId);
            if (filtered.length === assigned.length) continue;
            operations.push(fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignedTo: filtered }) }));
        }
        if (operations.length) await Promise.allSettled(operations);
    } catch (error) { console.error(`Error removing user ${userId} from tasks:`, error); }
}


/**
 * Update a contact's data on the backend and refresh UI on success.
 * @param {string} userID
 * @param {{name:string,email:string,phone?:string,color?:string,initial?:string,tasks?:string[]}} user
 * @param {boolean} [createTask=false] When true, skip UI flows (used by task updates)
 * @returns {Promise<void>}
 */
async function updateContact(userID, user, createTask = false) {
    fetch(`${BASE_URL}users/${userID}.json`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user }) })
        .then(response => { if (!response.ok) { throw new Error("Error updating contact"); } return response.json(); })
        .then(async () => {
            if (!createTask) {
                closeOverlay();
                await loadContacts();
                openContactDetails(userID)
                showMessageDialog("Contact successfully updated");
            }
        })
        .catch(error => { console.error("Error:", error); });
}