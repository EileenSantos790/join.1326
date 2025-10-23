let usersById = null;
let selectedCardEl = null;
document.addEventListener("DOMContentLoaded", initContactsWhenReady);


/** Initialize the contacts section when the element appears in the DOM. */
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


/** Safely load contacts into the contacts section (once). */
function safeLoadContacts() {
    const section = document.getElementById("contactsSection");
    if (!section || section.dataset.initialized === "true") return;
    section.dataset.initialized = "true";
    loadContacts();
}


/**
 * Convert a keyed users object into a flat array of user data.
 * @param {Record<string, {user?: {name?:string,email?:string,phone?:string,color?:string,initial?:string}}>} users
 * @returns {Array<{id:string,name:string,email:string,initial:string,color:string}>}
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
 * Get initials from a full name (first two words).
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
    if (!name) return "?";
    const fristAndLastName = name.trim().split(/\s+/).slice(0, 2);
    let initials = "";
    for (let i = 0; i < fristAndLastName.length; i++) initials += (fristAndLastName[i][0] || "").toUpperCase();
    return initials || "?";
}


/** Open the mobile contact overlay if viewport is <= 1024px. */
function openMobileOverlayIfNeeded() {
    if (window.matchMedia('(max-width:1024px)').matches) {
        const section = document.querySelector('.responsiveContactsDetailsSection');
        section.classList.add('is-open');
        section.removeAttribute('aria-hidden');
        document.body.classList.add('scroll-locked');
    }
}


/** Close the responsive contact overlay and reset mobile UI helpers. */
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
 * Generate a random hexadecimal color string (#RRGGBB).
 * @returns {string}
 */
function getRandomHexColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}


/** Handle the create-contact action by opening the add contact overlay. */
function handleCreateContact() {
    slideinAddContactOverlay();
}


/**
 * Create a new contact after validating inputs and checking duplicate email.
 * @returns {Promise<void>}
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


/** Display an error message indicating an email conflict for contact creation. */
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
 * Capitalize each word in a full name; rest in lowercase.
 * @param {string} fullName
 * @returns {string}
 */
function capitalizeName(fullName) {
    return fullName
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}


/**
 * Display a temporary message dialog overlay on the page.
 * @param {string} message
 * @param {number} [duration=3000]
 */
function showMessageDialog(message, duration = 3000) {
    const existing = document.getElementById("contactCreatedOverlay");
    if (existing) existing.remove();
    const section = document.createElement("section");
    section.id = "contactCreatedOverlay"; section.className = "userConfirmationContainerContacts"; section.setAttribute("aria-live", "polite");
    const msg = document.createElement("div");
    msg.className = "userConfirmationContactCreation";
    msg.textContent = message;
    msg.setAttribute("role", "alert");
    section.appendChild(msg);
    document.body.appendChild(section);
    initStyleSuccessDialog(section);
    requestAnimationFrame(() => { section.style.opacity = "1"; });
    setTimeout(() => { section.style.opacity = "0"; setTimeout(() => section.remove(), 250); }, duration);
}


/**
 * Initialize inline styles for the success dialog element.
 * @param {HTMLElement} section
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
 * Open the contact edit overlay and preload its data.
 * @param {string} userID
 * @returns {Promise<void>}
 */
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


/** Handle updating a contact with the current form values. */
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
 * Detach a single task from a specific user.
 * @param {string} userId
 * @param {string} taskId
 * @returns {Promise<void>}
 */
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


/**
 * Detach a task from multiple users at once.
 * @param {string[]} userIds
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function removeTaskFromUsers(userIds, taskId) {
    if (!Array.isArray(userIds) || !taskId) return;
    const ops = userIds.map(uid => removeTaskFromUser(uid, taskId));
    await Promise.allSettled(ops);
}


/**
 * Assign a task to a specific user if not already linked.
 * @param {string} userId
 * @param {string} taskId
 * @returns {Promise<void>}
 */
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


/**
 * Assign a task to several users in parallel.
 * @param {string[]} userIds
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function addTaskToUsers(userIds, taskId) {
    if (!Array.isArray(userIds) || !taskId) return;
    const ops = userIds.map(uid => addTaskToUser(uid, taskId));
    await Promise.allSettled(ops);
}


/** Toggle the responsive edit overlay for contacts. */
function openResponsiveOverlayEdit() {
    const editOverlay = document.getElementById('responsiveOverlayEdit');
    const editContactBtn = document.getElementById('btnEditNewContact')
    editOverlay.classList.toggle('is-open');
    renderEditOverlay(editOverlay);
}


/** Close the responsive edit overlay. */
function closeResponsiveOverlayEdit() {
    const editOverlay = document.getElementById('responsiveOverlayEdit');
    editOverlay && editOverlay.classList.remove('is-open');
}


/** Navigate to the contacts view in the navigation menu. */
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
