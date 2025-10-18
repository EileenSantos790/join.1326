let usersById = null;
let selectedCardEl = null;
document.addEventListener("DOMContentLoaded", initContactsWhenReady);


/** Fetches all users from the database. */
async function getAllUsers() {
    let usersList = await fetch(BASE_URL + "users.json");
    let allUsers = await usersList.json();
    return allUsers;
}


/** Fetches all users, sorts them by name, and renders their contact information to the DOM. */
async function renderAllContacts() {
    let allUsers = await getAllUsers();
    let contentDiv = document.getElementById('assignedToContactContent');
    contentDiv.innerHTML = "";
    let contacts = getUserDataToArray(allUsers);
    contacts.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    for (let index = 0; index < contacts.length; index++) { contentDiv.innerHTML += getContactTemplate(contacts, index); }
}


/** Initializes the contacts section when it becomes available in the DOM. */
function initContactsWhenReady() {
    const contactsSectionExisting = document.getElementById("contactsSection");
    if (contactsSectionExisting) { safeLoadContacts(); return; }
    const container = document.getElementById("contentContainer");
    if (!container) return;
    const observer = new MutationObserver(() => {
        const section = document.getElementById("contactsSection");
        if (section) { safeLoadContacts(); }
    });
    observer.observe(container, { childList: true, subtree: true });
}


/** Safely loads contacts into the contacts section of the page. */
function safeLoadContacts() {
    const section = document.getElementById("contactsSection");
    if (!section || section.dataset.initialized === "true") return;
    section.dataset.initialized = "true";
    loadContacts();
}


/** Loads contacts from the server and renders them alphabetically. */
async function loadContacts() {
    const response = await fetch(BASE_URL + "users.json");
    usersById = await response.json();
    const contacts = getUserDataToArray(usersById);
    contacts.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    renderContactSection(contacts)
}


/** Converts a users object into an array of user data objects. */
function getUserDataToArray(users) {
    const arr = [];
    if (!users) return arr;

    for (let userID in users) {
        const user = (users[userID] && users[userID].user) ? users[userID].user : {};
        arr.push({ id: userID, name: user.name || "", email: user.email || "", initial: getInitials(user.name), color: user.color });
    }
    return arr;
}


/** Returns the initials of the given name. */
function getInitials(name) {
    if (!name) return "?";
    const fristAndLastName = name.trim().split(/\s+/).slice(0, 2);
    let initials = "";
    for (let i = 0; i < fristAndLastName.length; i++) initials += (fristAndLastName[i][0] || "").toUpperCase();
    return initials || "?";
}


/** Opens the mobile contact overlay if the layout is narrow. */
function openMobileOverlayIfNeeded() {
    if (window.matchMedia('(max-width:1024px)').matches) {
        const section = document.querySelector('.responsiveContactsDetailsSection');
        section.classList.add('is-open');
        section.removeAttribute('aria-hidden');
        document.body.classList.add('scroll-locked');
    }
}


/** Closes the responsive contact overlay and resets mobile UI helpers. */
function closeContactsOverlay() {
    if (isMobile()) {
        document.getElementById("btnEditNewContact").classList.add("d-none");
        document.getElementById("btnAddNeuContact").classList.remove("d-none");
    }
    const section = document.querySelector('.responsiveContactsDetailsSection');
    section.classList.remove('is-open');
    section.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('scroll-locked');
}


/** Generates a random hexadecimal color string in the format "#RRGGBB". */
function getRandomHexColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}


/** Handles the creation of a new contact by displaying the add contact overlay. */
function handleCreateContact() {
    slideinAddContactOverlay();
}


/** Creates a new contact after validating input fields and checking for duplicate emails. */
async function createContact() {
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const phoneInput = document.getElementById("contactPhone");
    const isNameValid = validateField(nameInput);
    const isEmailValid = validateField(emailInput);
    const isPhoneValid = validateField(phoneInput);
    if (!isNameValid || !isEmailValid || !isPhoneValid) return;
    const newContact = { name: capitalizeName(nameInput.value), email: emailInput.value.trim(), phone: phoneInput.value.trim(), color: getRandomHexColor(), initial: getInitials(nameInput.value) };
    const emailExists = await searchContactByEmail(newContact.email);
    if (!emailExists) { saveContact(newContact); }
    else { emailExistsMessage(); }
}


/** Displays an error message indicating that a contact with the entered email already exists. */
function emailExistsMessage() {
    const emailInput = document.getElementById("contactEmail");
    const emailErrorEl = document.getElementById("contactEmailError");
    if (emailErrorEl) {
        emailErrorEl.textContent = "A contact with this email already exists.";
        emailErrorEl.style.display = "block";
    }
    emailInput.classList.add("inputErrrorMessage");
    emailInput.setAttribute("aria-invalid", "true");
}


/** Capitalizes the first letter of each word in a full name and converts the rest to lowercase. */
function capitalizeName(fullName) {
    return fullName
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}


/** Saves a new contact by sending a POST request to the server. */
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


/** Displays a temporary message dialog overlay on the page. */
function showMessageDialog(message, duration = 3000) {
    const existing = document.getElementById("contactCreatedOverlay");
    if (existing) existing.remove();
    const section = document.createElement("section");
    section.id = "contactCreatedOverlay"; section.className = "userConfirmationContainerContacts"; section.setAttribute("aria-live", "polite");
    const btn = document.createElement("button");
    btn.className = "userConfirmationContactCreation";
    btn.textContent = message;
    section.appendChild(btn);
    document.body.appendChild(section);
    initStyleSuccessDialog(section);
    requestAnimationFrame(() => { section.style.opacity = "1"; });
    setTimeout(() => { section.style.opacity = "0"; setTimeout(() => section.remove(), 250); }, duration);
}


/** Initializes the style properties for a success dialog section element. */
function initStyleSuccessDialog(section) {
    if (!section.style.position) {
        section.style.position = "fixed";
        section.style.left = "55%";
        section.style.bottom = "15px";
        section.style.transform = "translateX(-50%)";
        section.style.zIndex = "9999";
        section.style.opacity = "0";
        section.style.transition = "opacity 200ms ease";
    }
}


/** Searches for a contact by email in the users database. */
async function searchContactByEmail(email) {
    const url = `${BASE_URL}users.json?orderBy=${encodeURIComponent('"user/email"')}&equalTo=${encodeURIComponent(`"${email}"`)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data && Object.keys(data).length > 0;
}


/** Fetches a contact entry by ID from the database. */
async function searchContactById(userID) {
    const url = `${BASE_URL}users/${userID}.json`;
    const res = await fetch(url);
    const data = await res.json();
    return data && data.user ? data.user : null;
}


/** Deletes a contact by user ID from the server and updates the UI accordingly. */
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


/** Removes a user from every task assignment in the system. */
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


/** Opens the edit overlay for a contact and preloads its data. */
async function editContact(userID) {
    const user = await searchContactById(userID)
    if (user) {
        await slideinEditContactOverlay();
        const div = document.createElement("div");
        div.id = userID; div.classList.add("sizeAvatarDetails", "contactImg"); div.style.background = user.color; div.textContent = user.initial;
        document.getElementById("avatarEdit").appendChild(div); document.getElementById("contactName").value = user.name || ""; document.getElementById("contactEmail").value = user.email || ""; document.getElementById("contactPhone").value = user.phone || "";
    }
    if (isMobile()) {
        const avatar =  document.getElementById(userID); avatar.style.width = "120px"; avatar.style.height = "120px"; avatar.style.fontSize = "47px";
    }
}


/** Handles updating a contact's information based on user input. */
async function handleUpdateContact() {
    const userID = document.getElementById("avatarEdit").firstElementChild.id;
    const user = await searchContactById(userID);
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const phoneInput = document.getElementById("contactPhone");
    const isNameValid = validateField(nameInput);
    const isEmailValid = validateField(emailInput);
    const isPhoneValid = validateField(phoneInput);
    let changed = false;
    if (user.name !== nameInput.value) { user.name = capitalizeName(nameInput.value); changed = true; } if (user.email !== emailInput.value) { user.email = emailInput.value.trim(); changed = true; } if (user.phone !== phoneInput.value) { user.phone = phoneInput.value.trim(); changed = true; }
    if (!changed) { showMessageDialog("No changes detected"); return; } if (!isNameValid || !isEmailValid || !isPhoneValid) return;
    updateContact(userID, user);
}


/** Updates a contact's information on the server and refreshes the contact list UI. */
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


/** Detaches a single task from a specific user. */
async function removeTaskFromUser(userId, taskId) {
    try {
        const user = await searchContactById(userId);
        if (!user) return;
        const tasks = Array.isArray(user.tasks) ? user.tasks : [];
        const newTasks = tasks.filter(tid => tid !== taskId);
        if (newTasks.length === tasks.length) return;
        user.tasks = newTasks;
        await updateContact(userId, user, true);
    } catch (error) {
        console.error(`Error removing task ${taskId} from user ${userId}:`, error);
    }
}


/** Detaches a task from multiple users at once. */
async function removeTaskFromUsers(userIds, taskId) {
    if (!Array.isArray(userIds) || !taskId) return;
    const ops = userIds.map(uid => removeTaskFromUser(uid, taskId));
    await Promise.allSettled(ops);
}


/** Assigns a task to a specific user if not already linked. */
async function addTaskToUser(userId, taskId) {
    try {
        const user = await searchContactById(userId);
        if (!user) return;
        const tasks = Array.isArray(user.tasks) ? user.tasks : [];
        if (!tasks.includes(taskId)) {
            tasks.push(taskId);
            user.tasks = tasks;
            await updateContact(userId, user, true);
        }
    } catch (error) {
        console.error(`Error adding task ${taskId} to user ${userId}:`, error);
    }
}


/** Assigns a task to several users in parallel. */
async function addTaskToUsers(userIds, taskId) {
    if (!Array.isArray(userIds) || !taskId) return;
    const ops = userIds.map(uid => addTaskToUser(uid, taskId));
    await Promise.allSettled(ops);
}


/** Toggles the responsive edit overlay for contacts. */
function openResponsiveOverlayEdit() {
    const editOverlay = document.getElementById('responsiveOverlayEdit');
    const editContactBtn = document.getElementById('btnEditNewContact')
    editOverlay.classList.toggle('is-open');
    renderEditOverlay(editOverlay);
}


/** Closes the responsive edit overlay. */
function closeResponsiveOverlayEdit() {
    const editOverlay = document.getElementById('responsiveOverlayEdit');
    editOverlay && editOverlay.classList.remove('is-open');
}


/** Navigates to the contacts view in the navigation menu. */
function goToContacts() {
    const contactsMenuItem = document.querySelector('.navLine[data-file*="contacts"], .navLine[data-file*="Contacts"]');
    const content = document.getElementById('contentContainer');
    const openContacts = () => {
        if (contactsMenuItem) {
            contactsMenuItem.click();
        } else if (content) {
            loadPage("./htmlTemplates/contacts.html", content);
        }
    };
    openContacts();
}
