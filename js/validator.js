/** Validates a contact form field and updates its error state. */
function validateField(field) {
  const id = field.id;
  const raw = field.value || "";
  const value = raw.trim();

  let isValid = false;
  let errorMsg = "";

  switch (id) {
    case "addTasktTitleInput": {
      if (/^\s*$/.test(value)) {
        errorMsg = "Title is required.";
        isValid = false;
        break;
      }
      isValid = true;
      break;
    }
    case "contactName": {
      if (/^\s*$/.test(value)) {
        errorMsg = "Name is required.";
        isValid = false;
        break;
      }
      const parts = value.split(/\s+/).filter(Boolean);
      isValid = parts.length >= 2;
      if (!isValid) {
        errorMsg = "Please enter first and last name.";
      }
      break;
    }
    case "contactEmail": {
      if (/^\s*$/.test(value)) {
        errorMsg = "Email is required.";
        isValid = false;
        break;
      }
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@(?!.*\.\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      isValid = emailRegex.test(value);
      if (!isValid) {
        errorMsg = "Please enter a valid email address.";
      }
      break;
    }
        case "contactPhone": {
            if (!value) {
                errorMsg = "Phone number is required.";
        isValid = false;
        break;
      }
      
      isValid = true;
      break;
    }
    case "contactPhone": {
      if (/^\s*$/.test(value)) {
        errorMsg = "Phone number is required.";
        isValid = false;
        break;
      }
      const phoneRegex = /^\+?\d{1,3}?\s?\d{8,13}$/;
      isValid = phoneRegex.test(value);

      if (!isValid) {
        errorMsg = "Please enter a valid phone number.";
      }
      break;
    }
    case "addTaskDate":
    case "addTasktDateInput": { // add-task date input
      if (/^\s*$/.test(value)) {
        errorMsg = "Date is required.";
        isValid = false;
        break;
      }
      const parsed = parseDateStrict(value);
      if (!parsed) {
        isValid = false;
        errorMsg = "Invalid date.";
        break;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of today
      parsed.setHours(0, 0, 0, 0);
      isValid = parsed >= today;
      if (!isValid) {
        errorMsg = "Please enter a valid date (today or future).";
      }
      break;
    }
    default: {
      isValid = field.checkValidity();
    }
  }

  // Toggle error style on the input container (prefer explicit container id)
  const byIdContainer = document.getElementById(`${id}Container`);
  const container = byIdContainer
    || field.closest(".addContactInputContainer")
    || field.closest(".signUpValidationInputContainer")
    || field.closest(".validationInputContainer");
  if (!isValid) {
    if (container) container.classList.add("inputErrorBorder");
    field.setAttribute("aria-invalid", "true");
  } else {
    if (container) container.classList.remove("inputErrorBorder");
    field.removeAttribute("aria-invalid");
  }

  // Show/hide matching error message element
  const derivedErrorId = id.includes("Input")
    ? id.replace("Input", "ErrorContainer")
    : `${id}Error`;
  const errorEl = document.getElementById(derivedErrorId) || document.getElementById(`${id}Error`);
  if (errorEl) {
    errorEl.textContent = isValid ? "" : errorMsg;
    errorEl.style.display = isValid ? "none" : "block";
  }

  return isValid;
}

// Attach validation on blur (when leaving the field)
document.addEventListener("DOMContentLoaded", attachContactValidators);

// Overlays are injected dynamically; expose a function to (re)attach
function attachContactValidators() {
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const phoneInput = document.getElementById("contactPhone");
    const addTaskDateInput = document.getElementById("addTasktDateInput");
    const addTaskTitleInput = document.getElementById("addTasktTitleInput");

    if (nameInput) nameInput.addEventListener("blur", () => validateField(nameInput), { once: false });
    if (emailInput) emailInput.addEventListener("blur", () => validateField(emailInput), { once: false });
    if (phoneInput) phoneInput.addEventListener("blur", () => validateField(phoneInput), { once: false });

    if (addTaskTitleInput) {
      addTaskTitleInput.addEventListener("blur", () => validateField(addTaskTitleInput), { once: false });
      addTaskTitleInput.addEventListener("input", () => validateField(addTaskTitleInput), { once: false });
    }
    if (addTaskDateInput) {
      addTaskDateInput.addEventListener("blur", () => validateField(addTaskDateInput), { once: false });
      addTaskDateInput.addEventListener("input", () => validateField(addTaskDateInput), { once: false });
    }
}

/** Converts a valid DD.MM.YYYY date string to ISO YYYY-MM-DD; returns null if invalid. */
function normalizeDateToISO(str) {
  const parsed = parseDateStrict(str);
  if (!parsed) return null;
  const yyyy = parsed.getFullYear().toString().padStart(4, '0');
  const mm = (parsed.getMonth() + 1).toString().padStart(2, '0');
  const dd = parsed.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Expose helpers globally if running in browser
if (typeof window !== 'undefined') {
  window.normalizeDateToISO = normalizeDateToISO;
}

/**
 * Parses a date string strictly in one of the allowed formats and verifies calendar validity.
 * Allowed formats:
 *  - YYYY-MM-DD
 *  - DD.MM.YYYY (year must have exactly 4 digits)
 * Returns Date on success, else null.
 */
function parseDateStrict(str) {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim();
  // ISO format YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (!isValidYMD(y, m, d)) return null;
    const dt = new Date(y, m - 1, d);
    return sameYMD(dt, y, m, d) ? dt : null;
  }
  // Dotted format DD.MM.YYYY
  const dot = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dot) {
    const d = Number(dot[1]);
    const m = Number(dot[2]);
    const y = Number(dot[3]);
    if (!isValidYMD(y, m, d)) return null;
    const dt = new Date(y, m - 1, d);
    return sameYMD(dt, y, m, d) ? dt : null;
  }

  return null;
}

function isValidYMD(y, m, d) {
  // enforce 4-digit year range
  if (!(y >= 1000 && y <= 9999)) return false;
  if (!(m >= 1 && m <= 12)) return false;
  if (!(d >= 1 && d <= 31)) return false;
  return true;
}

function sameYMD(date, y, m, d) {
  return (
    date.getFullYear() === y &&
    date.getMonth() + 1 === m &&
    date.getDate() === d
  );
}
