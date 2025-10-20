/** Validates a contact form field and updates its error state. */
function validateField(field) {
  const id = field.id;
  const raw = field.value || "";
  const value = raw.trim();

  let isValid = false;
  let errorMsg = "";

  switch (id) {
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
    default: {
      isValid = field.checkValidity();
    }
  }

  // Toggle error style on the input container (not on the input itself)
  const container = field.closest(".addContactInputContainer");
  if (!isValid) {
    if (container) container.classList.add("inputErrorBorder");
    field.setAttribute("aria-invalid", "true");
  } else {
    if (container) container.classList.remove("inputErrorBorder");
    field.removeAttribute("aria-invalid");
  }

  // Show/hide matching error message element
  const errorEl = document.getElementById(`${id}Error`);
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

    if (nameInput) nameInput.addEventListener("blur", () => validateField(nameInput), { once: false });
    if (emailInput) emailInput.addEventListener("blur", () => validateField(emailInput), { once: false });
    if (phoneInput) phoneInput.addEventListener("blur", () => validateField(phoneInput), { once: false });
}
