document.addEventListener("DOMContentLoaded", initContactsWhenReady);

let usersById = null;
let selectedCardEl = null;

/**
 * Initializes the contacts section when it becomes available in the DOM.
 * If the contacts section already exists, loads contacts immediately.
 * Otherwise, observes the container for DOM changes and loads contacts when the section appears.
 *
 * @function
 */
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

/**
 * Safely loads contacts into the contacts section of the page.
 * Ensures that contacts are loaded only once by checking and setting an initialization flag.
 * If the section is already initialized or not found, the function does nothing.
 */
function safeLoadContacts() {
    const section = document.getElementById("contactsSection");
    if (!section || section.dataset.initialized === "true") return;
    section.dataset.initialized = "true";
    loadContacts();
}


/**
 * Loads user contacts from a remote JSON file, processes the data,
 * sorts the contacts alphabetically by name, and renders the contact section.
 * 
 * @async
 * @function
 * @returns {Promise<void>} Resolves when contacts are loaded and rendered.
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
 * Converts a users object into an array of user data objects.
 *
 * @param {Object} users - An object where each key is a user ID and each value is an object containing user data.
 * @returns {Array<Object>} An array of user data objects, each containing:
 *   - {string} id: The user ID.
 *   - {string} name: The user's name (empty string if not available).
 *   - {string} email: The user's email (empty string if not available).
 *   - {string} initial: The initials of the user's name.
 *   - {string} color: A randomly generated hex color.
 */
function getUserDataToArray(users) {
    const arr = [];
    if (!users) return arr;

    for (let userID in users) {
        const user = (users[userID] && users[userID].user) ? users[userID].user : {};
        arr.push({ id: userID, name: user.name || "", email: user.email || "", initial: getInitials(user.name), color: user.color });
    }
    return arr;
}

/**
 * Returns the initials of the given name.
 * Extracts the first character from up to two words (first and last name).
 * If the name is empty or invalid, returns "?".
 *
 * @param {string} name - The full name to extract initials from.
 * @returns {string} The initials (up to two characters) or "?" if not available.
 */
function getInitials(name) {
    if (!name) return "?";
    const fristAndLastName = name.trim().split(/\s+/).slice(0, 2);
    let initials = "";
    for (let i = 0; i < fristAndLastName.length; i++) initials += (fristAndLastName[i][0] || "").toUpperCase();
    return initials || "?";
}

/**
 * Renders the contact section by grouping contacts by their initial letter and displaying them in the DOM.
 * Inserts separation lines between groups of contacts with different initials.
 *
 * @param {Array<Object>} contacts - Array of contact objects to render.
 * @param {string} contacts[].id - Unique identifier for the contact.
 * @param {string} contacts[].initial - Initial(s) of the contact's name.
 * @param {string} contacts[].color - Background color for the contact's avatar.
 * @param {string} contacts[].name - Full name of the contact.
 * @param {string} contacts[].email - Email address of the contact.
 */
function renderContactSection(contacts) {
    const section = document.getElementById("contactsSection");
    let lastInitial, html = "";
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const initial = contacts[i].initial.charAt(0);
        if (initial !== lastInitial) {
            html += `<div class="section">${initial}</div>
                     <div class="separationLineContactListContainer">
                        <div class="separationLineContactList"></div>
                    </div>`
            lastInitial = initial;
        }
        html += `<div id="${contact.id}" class="card" onclick="openContactDetails('${contact.id}')">
                    <div id="avatar" class="avatar" style="background:${contact.color};color:#fff;">${contact.initial}</div>
                    <div>
                        <div id="name" class="name">${contact.name}</div>
                        <a class="email">${contact.email}</a>
                    </div>
                </div>`;
    }
    section.innerHTML = html
}

/**
 * Opens the contact details overlay for a given user.
 * Highlights the selected contact card, displays user information,
 * and shows edit/delete options in the overlay.
 *
 * @param {string} userID - The unique identifier of the user whose details are to be displayed.
 */
function openContactDetails(userID) {
    const overlay = document.getElementById("contactOverlay");
    if (!overlay) return;
    const card = document.querySelector(`#${userID}`);
    const avatarDiv = document.querySelector(`#${userID} #avatar`);
    if (selectedCardEl && selectedCardEl !== card) { selectedCardEl.style.backgroundColor = ""; selectedCardEl.style.color = "#000000"; }
    const contact = usersById[userID].user;
    if (!contact) return;
    const initials = avatarDiv.innerText;

    if (isMobile()) {
        document.getElementById("btnAddNeuContact").classList.add("d-none");
        document.getElementById("btnEditNewContact").classList.remove("d-none");
        document.getElementById("contactDetailsResponsive").setAttribute('data-edited-contactId', userID);
    }
    card.style.backgroundColor = "#293647";
    card.style.color = "#FFFFFF";
    selectedCardEl = card;
    overlay.innerHTML = `
        <div class="detailsCard">
            <div class="sizeAvatarDetails" style="background:${contact.color}">${initials}</div>
            <div>
                <div class="nameDetailsContact">${contact.name}</div>
                    <div class="containerEditContact">
                         <div class="editContactBtn" onclick="editContact('${userID}')">
                             <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z" fill="currentColor"/>
                             </svg>
                                <p>Edit</p>
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
                             <p>Delete</p>
                         </div>
                    </div>
                    
                </div>
            </div>
            <div class="contactInformationContainer">
                <div>Contact Information</div>
            </div>
            <div class="mailAndPhoneContainer">
                <div class="subclassMailPhone">E-Mail</div>
                <a class="email">${contact.email}</a>
                <div class="subclassMailPhone">Phone</div>
                <div>${contact.phone || "-"}</div>
            </div>
        </div>
    `;

    requestAnimationFrame(() => { overlay.classList.add("active"); });
    openMobileOverlayIfNeeded();
}

function openMobileOverlayIfNeeded() {
    if (window.matchMedia('(max-width:1024px)').matches) {
        const section = document.querySelector('.responsiveContactsDetailsSection');
        section.classList.add('is-open');
        section.removeAttribute('aria-hidden');
        document.body.classList.add('scroll-locked');
    }
}

// Overlay schließen (mobil)
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

/**
 * Generates a random hexadecimal color string in the format "#RRGGBB".
 * @returns {string} A random hex color string.
 */
function getRandomHexColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

/**
 * Handles the creation of a new contact by displaying the add contact overlay.
 * Invokes the slideinAddContactOverlay function to show the overlay UI.
 */
function handleCreateContact() {
    slideinAddContactOverlay();
}

/**
 * Creates a new contact after validating input fields and checking for duplicate emails.
 * - Validates name, email, and phone fields.
 * - Capitalizes the contact name.
 * - Checks if the email already exists.
 * - Saves the contact if the email is unique, otherwise shows an error message.
 * 
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the contact is created or validation fails.
 */
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

/**
 * Displays an error message indicating that a contact with the entered email already exists.
 * Adds error styling and sets ARIA attributes for accessibility.
 *
 * @function
 */
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

/**
 * Capitalizes the first letter of each word in a full name and converts the rest to lowercase.
 *
 * @param {string} fullName - The full name to be capitalized.
 * @returns {string} The capitalized full name.
 */
function capitalizeName(fullName) {
    return fullName
        .trim()
        .split(/\s+/) // separa por espaços múltiplos
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

/**
 * Saves a new contact by sending a POST request to the server.
 * On success, closes the add contact overlay, reloads contacts, and shows a success message.
 * On failure, logs the error to the console.
 *
 * @param {Object} newContact - The contact object to be saved.
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
 * Displays a temporary message dialog overlay on the page.
 * Removes any existing overlay before showing the new message.
 * The overlay fades in and out, and is automatically removed after the specified duration.
 *
 * @param {string} message - The message to display in the dialog.
 * @param {number} [duration=3000] - Duration in milliseconds before the dialog fades out.
 */
function showMessageDialog(message, duration = 3000) {
    const existing = document.getElementById("contactCreatedOverlay");
    if (existing) existing.remove();
    const section = document.createElement("section");
    section.id = "contactCreatedOverlay";
    section.className = "userConfirmationContainerContacts";
    section.setAttribute("aria-live", "polite");
    const btn = document.createElement("button");
    btn.className = "userConfirmationContactCreation";
    btn.textContent = message;
    section.appendChild(btn);
    document.body.appendChild(section);
    initStyleSuccessDialog(section);
    requestAnimationFrame(() => { section.style.opacity = "1"; });
    setTimeout(() => { section.style.opacity = "0"; setTimeout(() => section.remove(), 250); }, duration);
}

/**
 * Initializes the style properties for a success dialog section element.
 * Sets position, left, bottom, transform, z-index, opacity, and transition styles
 * if the position style is not already set.
 *
 * @param {HTMLElement} section - The DOM element representing the dialog section to style.
 */
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

/**
 * Searches for a contact by email in the users database.
 *
 * @async
 * @param {string} email - The email address to search for.
 * @returns {Promise<boolean>} Resolves to true if a contact with the given email exists, otherwise false.
 */
async function searchContactByEmail(email) {
    const url = `${BASE_URL}users.json?orderBy=${encodeURIComponent('"user/email"')}&equalTo=${encodeURIComponent(`"${email}"`)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data && Object.keys(data).length > 0;
}

async function searchContactById(userID) {
    const url = `${BASE_URL}users/${userID}.json`;
    const res = await fetch(url);
    const data = await res.json();
    return data && data.user ? data.user : null;
}

/**
 * Deletes a contact by user ID from the server and updates the UI accordingly.
 *
 * @param {string|number} userID - The unique identifier of the user to delete.
 * @returns {void}
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
        await response.json();
        const overlay = document.getElementById("contactOverlay");
        if (overlay) { overlay.classList.remove("active"); overlay.innerHTML = ""; }
        await loadContacts();
        closeContactsOverlay();
        showMessageDialog("Contact successfully deleted");
    } catch (error) {
        console.error("Error:", error);
    }
}

async function removeUserFromAllTasks(userId) {
    if (!userId) return;
    try {
        const user = await searchContactById(userId);
        if (user && Array.isArray(user.tasks) && user.tasks.length) {
            user.tasks = [];
            updateContact(userId, user, true);
        }

        const response = await fetch(`${BASE_URL}tasks.json`);
        if (!response.ok) { throw new Error("Error loading tasks"); }
        const tasks = await response.json();
        if (!tasks) return;

        const operations = [];
        for (const taskId in tasks) {
            const task = tasks[taskId];
            if (!task) continue;
            const assigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
            const filtered = assigned.filter(assignee => assignee && assignee.id !== userId);
            if (filtered.length === assigned.length) continue;
            operations.push(fetch(`${BASE_URL}tasks/${taskId}.json`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assignedTo: filtered })
            }));
        }

        if (operations.length) await Promise.allSettled(operations);
    } catch (error) {
        console.error(`Error removing user ${userId} from tasks:`, error);
    }
}

/**
 * Edits a contact by user ID. Fetches the contact data, displays the edit overlay,
 * and populates the form fields and avatar with the user's information.
 *
 * @async
 * @param {string} userID - The unique identifier of the user to edit.
 * @returns {Promise<void>} Resolves when the contact edit overlay is populated.
 */
async function editContact(userID) {
    const user = await searchContactById(userID)
    if (user) {
        await slideinEditContactOverlay();
        const div = document.createElement("div");
        div.id = userID
        div.classList.add("sizeAvatarDetails", "contactImg");
        div.style.background = user.color;
        div.textContent = user.initial;
        document.getElementById("avatarEdit").appendChild(div);
        document.getElementById("contactName").value = user.name || "";
        document.getElementById("contactEmail").value = user.email || "";
        document.getElementById("contactPhone").value = user.phone || "";
    }
    if (isMobile()) {
        const avatar =  document.getElementById(userID);
        avatar.style.width = "120px";
        avatar.style.height = "120px";
        avatar.style.fontSize = "47px";
    }
}

/**
 * Handles updating a contact's information based on user input.
 * - Retrieves the contact by ID.
 * - Validates the input fields for name, email, and phone.
 * - Checks if any changes were made to the contact's data.
 * - If changes are detected and inputs are valid, updates the contact.
 * - Shows a message dialog if no changes are detected.
 *
 * @async
 * @function handleUpdateContact
 * @returns {Promise<void>} Resolves when the update process is complete.
 */
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

/**
 * Updates a contact's information on the server and refreshes the contact list UI.
 *
 * @param {string|number} userID - The unique identifier of the user to update.
 * @param {Object} user - The updated user data to be sent to the server.
 * @returns {void}
 */
async function updateContact(userID, user, createTask = false) {
    fetch(`${BASE_URL}users/${userID}.json`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user }) })
        .then(response => { if (!response.ok) { throw new Error("Error updating contact"); } return response.json(); })
        .then(async () => {
            if (!createTask) {
                closeOverlay();
                //const overlay = document.getElementById("contactOverlay");
                //if (overlay) { overlay.classList.remove("active"); overlay.innerHTML = ""; }
                //if (selectedCardEl) { selectedCardEl.style.backgroundColor = ""; selectedCardEl.style.color = "#000000"; selectedCardEl = null; }
                await loadContacts();
                openContactDetails(userID)
                showMessageDialog("Contact successfully updated");
                //removeAllTasksFromUser(userID)
            }
        })
        .catch(error => { console.error("Error:", error); });
}

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

async function removeTaskFromUsers(userIds, taskId) {
    if (!Array.isArray(userIds) || !taskId) return;
    const ops = userIds.map(uid => removeTaskFromUser(uid, taskId));
    await Promise.allSettled(ops);
}

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

async function addTaskToUsers(userIds, taskId) {
    if (!Array.isArray(userIds) || !taskId) return;
    const ops = userIds.map(uid => addTaskToUser(uid, taskId));
    await Promise.allSettled(ops);
}

function openResponsiveOverlayEdit() {
    const editOverlay = document.getElementById('responsiveOverlayEdit');
    const editContactBtn = document.getElementById('btnEditNewContact')
    //editContactBtn.classList.add('d-none');
    editOverlay.classList.toggle('is-open');
    renderEditOverlay(editOverlay);
}

function closeResponsiveOverlayEdit() {
    const editOverlay = document.getElementById('responsiveOverlayEdit');
    editOverlay && editOverlay.classList.remove('is-open');
}

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

