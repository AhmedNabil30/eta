/**
 * ETEAS Energy - Contact Form JavaScript
 * Handles contact form interactions and validation
 */

"use strict";

const ContactForm = {
  init() {
    this.bindContactFormEvents();
    this.initFormEnhancements();
    this.initMapInteraction();
  },

  bindContactFormEvents() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    // Enhanced form submission
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleContactFormSubmit(contactForm);
    });

    // Real-time validation
    const inputs = contactForm.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input);
      });

      input.addEventListener("input", () => {
        this.clearFieldError(input);
        this.updateFloatingLabel(input);
      });

      input.addEventListener("focus", () => {
        this.updateFloatingLabel(input);
      });
    });

    // Project type change handler
    const projectTypeSelect = document.getElementById("projectType");
    if (projectTypeSelect) {
      projectTypeSelect.addEventListener("change", (e) => {
        this.handleProjectTypeChange(e.target.value);
      });
    }
  },

  initFormEnhancements() {
    // Add floating labels
    const formGroups = document.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      const input = group.querySelector("input, textarea, select");
      const label = group.querySelector("label");

      if (input && label && !group.classList.contains("checkbox-group")) {
        this.setupFloatingLabel(group, input, label);
      }
    });

    // Add form progress indicator
    this.addFormProgress();

    // Auto-save form data
    this.initAutoSave();
  },

  setupFloatingLabel(group, input, label) {
    group.classList.add("floating-label");

    // Check if field has value on page load
    if (input.value.trim()) {
      group.classList.add("has-value");
    }
  },

  updateFloatingLabel(input) {
    const group = input.closest(".form-group");
    if (group && group.classList.contains("floating-label")) {
      group.classList.toggle("has-value", input.value.trim().length > 0);
    }
  },

  handleProjectTypeChange(projectType) {
    // Show/hide relevant fields based on project type
    const powerRequirementGroup = document
      .querySelector("#powerRequirement")
      .closest(".form-group");
    const timelineGroup = document
      .querySelector("#timeline")
      .closest(".form-group");

    if (projectType === "consultation") {
      powerRequirementGroup.style.display = "none";
      timelineGroup.style.display = "none";
    } else {
      powerRequirementGroup.style.display = "block";
      timelineGroup.style.display = "block";
    }

    // Update message placeholder based on project type
    const messageField = document.getElementById("message");
    const placeholders = {
      "wind-turbine":
        "Please describe your wind energy requirements, site conditions (wind speed, terrain), power needs, and current energy setup...",
      "solar-pv":
        "Please describe your solar energy needs, roof/ground space available, daily power consumption, and current electrical setup...",
      "hybrid-system":
        "Please describe your combined wind and solar requirements, site conditions, power needs, and whether this is for grid-tie or off-grid use...",
      maintenance:
        "Please describe your existing renewable energy system, maintenance requirements, current issues, and service schedule needs...",
      consultation:
        "Please describe what you would like to discuss regarding renewable energy solutions for your project or organization...",
      other:
        "Please describe your renewable energy project requirements and how we can assist you...",
    };

    if (messageField && placeholders[projectType]) {
      messageField.setAttribute("placeholder", placeholders[projectType]);
    }
  },

  addFormProgress() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const progressBar = document.createElement("div");
    progressBar.className = "form-progress";
    progressBar.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <span class="progress-text">0% Complete</span>
    `;

    form.insertBefore(progressBar, form.firstChild);

    // Update progress on input
    const requiredFields = form.querySelectorAll("[required]");
    const updateProgress = () => {
      const filledFields = Array.from(requiredFields).filter((field) => {
        if (field.type === "checkbox") return field.checked;
        return field.value.trim().length > 0;
      });

      const progress = (filledFields.length / requiredFields.length) * 100;
      const progressFill = form.querySelector(".progress-fill");
      const progressText = form.querySelector(".progress-text");

      if (progressFill && progressText) {
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% Complete`;
      }
    };

    requiredFields.forEach((field) => {
      field.addEventListener("input", updateProgress);
      field.addEventListener("change", updateProgress);
    });
  },

  initAutoSave() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const STORAGE_KEY = "eteas_contact_form_data";

    // Load saved data
    this.loadFormData();

    // Save data on input
    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      if (input.type !== "checkbox" || input.name === "newsletter") {
        input.addEventListener(
          "input",
          this.debounce(() => {
            this.saveFormData();
          }, 1000)
        );
      }
    });
  },

  saveFormData() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (key !== "privacy") {
        // Don't save privacy checkbox
        data[key] = value;
      }
    }

    localStorage.setItem("eteas_contact_form_data", JSON.stringify(data));
  },

  loadFormData() {
    const savedData = localStorage.getItem("eteas_contact_form_data");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);
      const form = document.getElementById("contactForm");

      Object.entries(data).forEach(([key, value]) => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field && value) {
          if (field.type === "checkbox") {
            field.checked = value === "on";
          } else {
            field.value = value;
          }
          this.updateFloatingLabel(field);
        }
      });
    } catch (e) {
      console.error("Error loading saved form data:", e);
    }
  },

  clearSavedData() {
    localStorage.removeItem("eteas_contact_form_data");
  },

  async handleContactFormSubmit(form) {
    // Validate form
    if (!this.validateContactForm(form)) {
      this.showFormError(
        form,
        "Please correct the errors below and try again."
      );
      return;
    }

    // Show loading state
    this.showFormLoading(form);

    try {
      // Prepare form data
      const formData = new FormData(form);

      // Submit to Netlify (or your backend)
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        this.handleFormSuccess(form);
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      this.showFormError(
        form,
        "There was an error sending your message. Please try again or contact us directly."
      );
    } finally {
      this.hideFormLoading(form);
    }
  },

  validateContactForm(form) {
    const requiredFields = form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  },

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = "";

    // Clear previous errors
    this.clearFieldError(field);

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      message = "This field is required";
    }

    // Email validation
    else if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = "Please enter a valid email address";
      }
    }

    // Phone validation
    else if (field.type === "tel" && value) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = "Please enter a valid phone number";
      }
    }

    // Checkbox validation
    else if (
      field.type === "checkbox" &&
      field.hasAttribute("required") &&
      !field.checked
    ) {
      isValid = false;
      message = "Please accept the privacy policy to continue";
    }

    // Message length validation
    else if (field.id === "message" && value && value.length < 20) {
      isValid = false;
      message = "Please provide more details (minimum 20 characters)";
    }

    if (!isValid) {
      this.showFieldError(field, message);
    }

    return isValid;
  },

  showFieldError(field, message) {
    field.classList.add("error");

    const group = field.closest(".form-group");
    let errorElement = group.querySelector(".field-error");

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "field-error";
      group.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.opacity = "1";

    // Focus field for accessibility
    field.focus();
  },

  clearFieldError(field) {
    field.classList.remove("error");
    const group = field.closest(".form-group");
    const errorElement = group.querySelector(".field-error");

    if (errorElement) {
      errorElement.style.opacity = "0";
      setTimeout(() => {
        errorElement.remove();
      }, 300);
    }
  },

  showFormLoading(form) {
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Sending Message...
      `;
    }
  },

  hideFormLoading(form) {
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn && submitBtn.dataset.originalText) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText;
      delete submitBtn.dataset.originalText;
    }
  },

  handleFormSuccess(form) {
    // Clear saved data
    this.clearSavedData();

    // Show success message
    this.showFormSuccess(form);

    // Reset form
    form.reset();

    // Update floating labels
    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      this.updateFloatingLabel(input);
    });

    // Track successful submission
    if (typeof gtag !== "undefined") {
      gtag("event", "form_submit", {
        event_category: "Contact",
        event_label: "Contact Form",
      });
    }

    // Scroll to success message
    const successMessage = form.parentNode.querySelector(
      ".form-message.success"
    );
    if (successMessage) {
      successMessage.scrollIntoView({ behavior: "smooth" });
    }
  },

  showFormSuccess(form) {
    const existingMessage = form.parentNode.querySelector(".form-message");
    if (existingMessage) existingMessage.remove();

    const message = document.createElement("div");
    message.className = "form-message success";
    message.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <div>
        <h4>Message Sent Successfully!</h4>
        <p>Thank you for contacting ETEAS Energy. Our team will review your inquiry and get back to you within 24 hours.</p>
      </div>
    `;

    form.parentNode.insertBefore(message, form);

    setTimeout(() => {
      if (message.parentNode) {
        message.style.opacity = "0";
        setTimeout(() => message.remove(), 300);
      }
    }, 10000);
  },

  showFormError(form, errorMessage) {
    const existingMessage = form.parentNode.querySelector(".form-message");
    if (existingMessage) existingMessage.remove();

    const message = document.createElement("div");
    message.className = "form-message error";
    message.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <div>
        <h4>Submission Error</h4>
        <p>${errorMessage}</p>
      </div>
    `;

    form.parentNode.insertBefore(message, form);

    setTimeout(() => {
      if (message.parentNode) {
        message.style.opacity = "0";
        setTimeout(() => message.remove(), 300);
      }
    }, 8000);
  },

  initMapInteraction() {
    const mapPlaceholder = document.querySelector(".map-placeholder");
    if (!mapPlaceholder) return;

    mapPlaceholder.addEventListener("click", () => {
      // Replace with actual interactive map
      const iframe = document.createElement("iframe");
      iframe.src =
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.123!2d31.235!3d30.045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzQyLjAiTiAzMcKwMTQnMDYuMCJF!5e0!3m2!1sen!2seg!4v1234567890";
      iframe.width = "100%";
      iframe.height = "400";
      iframe.style.border = "0";
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";

      mapPlaceholder.parentNode.replaceChild(iframe, mapPlaceholder);
    });
  },

  // Utility function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  ContactForm.init();
});
