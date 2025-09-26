function validateField(field) {
    const id = field.id;
    const raw = field.value || "";
    const value = raw.trim();

    let isValid = false;
    let errorMsg = "";

    switch (id) {
        case "contactName": {
            if (!value) {
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
            if (!value) {
                errorMsg = "Email is required.";
                isValid = false;
                break;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
            const MAX_DE_DIGITS = 13;
            const digitsOnly = /^\d+$/.test(value);
            if (!digitsOnly) {
                errorMsg = "Phone number must contain digits only.";
                isValid = false;
                break;
            }
            isValid = value.length <= MAX_DE_DIGITS;
            if (!isValid) {
                errorMsg = `Phone number must be at most ${MAX_DE_DIGITS} digits.`;
            }
            break;
        }
        default: {
            isValid = field.checkValidity();
        }
    }

    // Toggle error style on input
    if (!isValid) {
        field.classList.add("inputErrrorMessage");
        field.setAttribute("aria-invalid", "true");
    } else {
        field.classList.remove("inputErrrorMessage");
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

document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const phoneInput = document.getElementById("contactPhone");

    if (nameInput) nameInput.addEventListener("input", () => validateField(nameInput));
    if (emailInput) emailInput.addEventListener("input", () => validateField(emailInput));
    if (phoneInput) phoneInput.addEventListener("input", () => validateField(phoneInput));
});
