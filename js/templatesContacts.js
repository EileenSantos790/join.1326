/** Generates the HTML template for a contact in the assigned to dropdown. */
function getContactTemplate(contacts, index) {
    const contact = contacts[index];
    const isSelected = selectedContactsAddTask.some(c => c.id === contact.id);

    return `
        <div onclick="addTaskSelectContact('${contact.id}', '${contact.initial}', '${contact.color}', '${contact.name}')"
             id="assignedToContact-${contact.id}" 
             class="dropdownItem ${isSelected ? 'dropdownItemOn' : 'dropdownItemOff'}">

            <div style="display: flex; align-items: center; gap: 16px">
                <div class="avatar" style="background:${contact.color}; color:#fff;">
                    ${contact.initial}
                </div>
                <div>${contact.name}</div>
            </div> 

            <img id="assignedToCheckbox-${contact.id}" 
                 class="checkboxImg ${isSelected ? 'd-none' : ''}" 
                 src="assets/icons/check-button.svg" 
                 alt="checkbox empty">

            <img id="assignedToCheckboxWhite-${contact.id}" 
                 class="${isSelected ? '' : 'd-none'}" 
                 src="assets/icons/checked_white.svg" 
                 alt="">
        </div>
    `;
}


/** Generates the HTML template for a selected contact avatar. */
function getSelectedContactTemplate(contact, color) {
    return `
            <div class="margin_top8 avatar" style="background:${color};color:#fff;">${contact}</div>
    `;
}

/** Builds the assigned contacts list for the details overlay. */
function getContactsOnBoardDetailsTemplate(users) {
    if (!users) return "";
    let template = ''
    users.forEach(user => {
        template += `<div class="contactBoardDetailsContainer">
                        <div class="avatarBoardDetails" style="background:${user.color}">
                        ${user.initial}</div>
                        <div>${user.name}</div>
                    </div>`
    });
    return template;
}

/** Renders assigned contact avatars inside the edit overlay. */
function getContactsOnEditBoardTemplate(users) {
    let contentDiv = document.getElementById('addTaskAddedContactIcons');
    if (!users) {
        contentDiv.innerHTML = "No users assigned";
        return
    }
    let template = ''
    users.forEach(user => {
        usersListOnEdit.push(user)
        template += `<div class="margin_top8 avatar" style="background:${user.color}">${user.initial}</div>`
    });
    contentDiv.innerHTML = template;
}


/** Renders the contact section by grouping contacts by their initial letter and displaying them in the DOM. */
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
                        <div class="email">${contact.email}</div>
                    </div>
                </div>`;
    }
    section.innerHTML = html
}


/** Opens the contact details overlay for a given user. */
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
                <div class="email">${contact.email}</div>
                <div class="subclassMailPhone">Phone</div>
                <div>${contact.phone || "-"}</div>
            </div>
        </div>
    `;

    requestAnimationFrame(() => { overlay.classList.add("active"); });
    openMobileOverlayIfNeeded();
}


/** Builds the assigned contacts avatar strip for a task card. */
function renderContactsOnBoard(users) {
    if (!users) return `<div id="avatarBoard">No users assigned</div>`
    let template = '<div class="boardContactsContainer">'
    users.forEach(user => {
        template += `<div id="avatarBoard" class="avatarBoard" style="background:${user.color};color:#fff;">${user.initial}</div>`
    });
    template += "</div>";
    return template;
}