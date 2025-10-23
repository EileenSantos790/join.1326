/**
 * Validates a contact or add-task form field and updates its error state.
 *
 * Behavior:
 * - Field-specific rules by `id` (e.g., contactName, contactEmail, addTasktDateInput)
 * - Falls back to native `checkValidity()` when no explicit rule applies
 * - Toggles error classes on a matching container element and sets ARIA state
 * - Writes error message into a derived `...ErrorContainer`/`...Error` element
 *
 * Note: There are two switch cases for `contactPhone`. The first one only checks presence;
 * the second applies a regex. This function preserves the current behavior.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The input or textarea element to validate.
 * @returns {boolean} True when valid, false otherwise.
 */
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

/**
 * Attaches blur listeners after DOM is ready so fields get validated on leave.
 */
document.addEventListener("DOMContentLoaded", attachContactValidators);

/**
 * Overlays are injected dynamically; expose a function to (re)attach validation handlers.
 * Binds blur/input events for contact and add-task inputs when present in DOM.
 *
 * @returns {void}
 */
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

/**
 * Converts a valid date string (DD.MM.YYYY or YYYY-MM-DD) to ISO format YYYY-MM-DD.
 * Returns null when the input cannot be parsed strictly as a valid calendar date.
 *
 * @param {string} str - Input date string (e.g., "31.01.2025" or "2025-01-31").
 * @returns {string|null} Normalized ISO date or null when invalid.
 */
function normalizeDateToISO(str) {
  const parsed = parseDateStrict(str);
  if (!parsed) return null;
  const yyyy = parsed.getFullYear().toString().padStart(4, '0');
  const mm = (parsed.getMonth() + 1).toString().padStart(2, '0');
  const dd = parsed.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Expose helpers globally when running in a browser environment. */
if (typeof window !== 'undefined') {
  window.normalizeDateToISO = normalizeDateToISO;
}

/**
 * Parses a date string strictly in one of the allowed formats and verifies calendar validity.
 *
 * Allowed formats:
 * - YYYY-MM-DD
 * - DD.MM.YYYY (year must have exactly 4 digits)
 *
 * @param {string} str - The input date string.
 * @returns {Date|null} A Date object on success, else null when invalid.
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

/**
 * Validates that numeric year, month, and day are within acceptable ranges.
 * Year must be 4 digits (1000-9999), month 1-12, day 1-31.
 *
 * @param {number} y - Year (four digits).
 * @param {number} m - Month (1-12).
 * @param {number} d - Day (1-31).
 * @returns {boolean} True if within ranges; false otherwise.
 */
function isValidYMD(y, m, d) {
  // enforce 4-digit year range
  if (!(y >= 1000 && y <= 9999)) return false;
  if (!(m >= 1 && m <= 12)) return false;
  if (!(d >= 1 && d <= 31)) return false;
  return true;
}

/**
 * Ensures the Date instance matches the exact provided Y-M-D (no overflow).
 *
 * @param {Date} date - Date object to inspect.
 * @param {number} y - Expected year.
 * @param {number} m - Expected month (1-12).
 * @param {number} d - Expected day (1-31).
 * @returns {boolean} True when date matches exactly; false otherwise.
 */
function sameYMD(date, y, m, d) {
  return (
    date.getFullYear() === y &&
    date.getMonth() + 1 === m &&
    date.getDate() === d
  );
}
