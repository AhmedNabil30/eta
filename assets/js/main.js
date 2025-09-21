/**
 * ETEAS Energy - Main JavaScript File
 * Production-ready JavaScript with modern ES6+ features
 */

"use strict";

// Global app object to avoid pollution
const ETEASApp = {
  // Configuration
  config: {
    animationDuration: 300,
    scrollOffset: 100,
    lazyLoadOffset: 200,
    debounceDelay: 250,
  },

  // State management
  state: {
    isMenuOpen: false,
    hasScrolled: false,
    currentLanguage: "en",
    isLoading: true,
  },

  // Initialize the application
  init() {
    this.bindEvents();
    this.initializeComponents();
    this.handlePageLoad();
  },

  // Event listeners
  bindEvents() {
    // DOM content loaded
    document.addEventListener("DOMContentLoaded", () => {
      this.handleDOMReady();
    });

    // Window events
    window.addEventListener(
      "scroll",
      this.debounce(this.handleScroll.bind(this), this.config.debounceDelay)
    );
    window.addEventListener(
      "resize",
      this.debounce(this.handleResize.bind(this), this.config.debounceDelay)
    );
    window.addEventListener("load", this.handleWindowLoad.bind(this));

    // Navigation events
    this.bindNavigationEvents();

    // Form events
    this.bindFormEvents();

    // Accessibility events
    this.bindAccessibilityEvents();
  },

  // Handle DOM ready
  handleDOMReady() {
    this.initNavigation();
    this.initAnimations();
    this.initCounters();
    this.initLazyLoading();
    this.initLanguageSwitcher();
    this.state.isLoading = false;

    // Remove loading class if present
    document.body.classList.remove("loading");

    console.log("ETEAS Website initialized successfully");
  },

  // Handle window load
  handleWindowLoad() {
    // Initialize performance observers
    this.initPerformanceObservers();

    // Initialize contact forms
    this.initContactForms();

    // Initialize analytics
    this.initAnalytics();
  },

  // Initialize components
  initializeComponents() {
    this.initSmoothScroll();
    this.initBackToTop();
    this.initImageOptimization();
  },

  // Navigation functionality
  initNavigation() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    const header = document.getElementById("header");

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        this.toggleMenu();
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.state.isMenuOpen) {
          this.closeMenu();
          navToggle.focus();
        }
      });
    }

    // Active navigation highlighting
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");

        // Handle internal anchor links
        if (href.startsWith("#")) {
          e.preventDefault();
          this.scrollToSection(href);
          this.closeMenu();
        }
      });
    });

    // Update active navigation on scroll
    this.updateActiveNavigation();
  },

  // Toggle mobile menu
  toggleMenu() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    this.state.isMenuOpen = !this.state.isMenuOpen;

    navToggle.setAttribute("aria-expanded", this.state.isMenuOpen.toString());
    navMenu.classList.toggle("active", this.state.isMenuOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.state.isMenuOpen ? "hidden" : "";

    // Focus management
    if (this.state.isMenuOpen) {
      navMenu.focus();
    }
  },

  // Close mobile menu
  closeMenu() {
    if (this.state.isMenuOpen) {
      const navToggle = document.getElementById("navToggle");
      const navMenu = document.getElementById("navMenu");

      this.state.isMenuOpen = false;
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  // Handle scroll events
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.getElementById("header");

    // Header scroll effect
    if (scrollTop > 50 && !this.state.hasScrolled) {
      header?.classList.add("scrolled");
      this.state.hasScrolled = true;
    } else if (scrollTop <= 50 && this.state.hasScrolled) {
      header?.classList.remove("scrolled");
      this.state.hasScrolled = false;
    }

    // Update active navigation
    this.updateActiveNavigation();

    // Trigger scroll animations
    this.triggerScrollAnimations();

    // Update back to top button
    this.updateBackToTop(scrollTop);
  },

  // Update active navigation based on scroll position
  updateActiveNavigation() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    let current = "";
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - this.config.scrollOffset;
      const sectionHeight = section.offsetHeight;

      if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  },

  // Handle window resize
  handleResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > 1023 && this.state.isMenuOpen) {
      this.closeMenu();
    }

    // Recalculate animations
    this.initAnimations();
  },

  // Smooth scroll functionality
  initSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href !== "#" && href.length > 1) {
          e.preventDefault();
          this.scrollToSection(href);
        }
      });
    });
  },

  // Scroll to section with smooth animation
  scrollToSection(target) {
    const element = document.querySelector(target);
    if (!element) return;

    const headerHeight = document.getElementById("header")?.offsetHeight || 80;
    const elementTop = element.offsetTop - headerHeight;

    window.scrollTo({
      top: elementTop,
      behavior: "smooth",
    });
  },

  // Initialize animations
  initAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Add animation classes to elements
    const animatedElements = document.querySelectorAll(
      ".service-card, .sector-card, .project-card, .feature-item, .stat-card"
    );
    animatedElements.forEach((element, index) => {
      element.style.animationDelay = `${index * 100}ms`;
      animateOnScroll.observe(element);
    });
  },

  // Trigger scroll animations
  triggerScrollAnimations() {
    const elements = document.querySelectorAll("[data-animate-on-scroll]");
    const triggerBottom = window.innerHeight * 0.8;

    elements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;

      if (
        elementTop < triggerBottom &&
        !element.classList.contains("animated")
      ) {
        element.classList.add("animated");
      }
    });
  },

  // Initialize counters
  initCounters() {
    const counters = document.querySelectorAll("[data-target]");

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !entry.target.classList.contains("counted")
          ) {
            this.animateCounter(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    counters.forEach((counter) => {
      countObserver.observe(counter);
    });
  },

  // Animate counter
  animateCounter(element) {
    const target = parseInt(element.getAttribute("data-target"));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    element.classList.add("counted");

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    updateCounter();
  },

  // Initialize lazy loading
  initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
              }
              img.classList.add("loaded");
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: `${this.config.lazyLoadOffset}px`,
        }
      );

      images.forEach((img) => {
        imageObserver.observe(img);
      });
    }
  },

  // Initialize language switcher
  initLanguageSwitcher() {
    const langButtons = document.querySelectorAll(".lang-btn");

    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        this.switchLanguage(lang);
      });
    });
  },

  // Switch language
  switchLanguage(lang) {
    if (lang === this.state.currentLanguage) return;

    this.state.currentLanguage = lang;

    // Update active language button
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    // Update document attributes
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    // Store language preference
    localStorage.setItem("preferred-language", lang);

    // Trigger language change event
    document.dispatchEvent(
      new CustomEvent("languageChange", { detail: { language: lang } })
    );

    console.log(`Language switched to: ${lang}`);
  },

  // Initialize back to top button
  initBackToTop() {
    // Create back to top button if it doesn't exist
    if (!document.getElementById("backToTop")) {
      const backToTop = document.createElement("button");
      backToTop.id = "backToTop";
      backToTop.className = "back-to-top";
      backToTop.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14l5-5 5 5z"/>
        </svg>
      `;
      backToTop.setAttribute("aria-label", "Back to top");
      backToTop.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 1000;
        width: 3rem;
        height: 3rem;
        border: none;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
        color: white;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });

      document.body.appendChild(backToTop);
    }
  },

  // Update back to top button visibility
  updateBackToTop(scrollTop) {
    const backToTop = document.getElementById("backToTop");
    if (!backToTop) return;

    if (scrollTop > 300) {
      backToTop.style.opacity = "1";
      backToTop.style.visibility = "visible";
    } else {
      backToTop.style.opacity = "0";
      backToTop.style.visibility = "hidden";
    }
  },

  // Initialize image optimization
  initImageOptimization() {
    // Support for WebP images
    const supportsWebP = () => {
      return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
          resolve(webP.height === 2);
        };
        webP.src =
          "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
      });
    };

    supportsWebP().then((supported) => {
      if (supported) {
        document.documentElement.classList.add("webp");
      }
    });
  },

  // Bind navigation events
  bindNavigationEvents() {
    // Handle navigation link clicks
    document.addEventListener("click", (e) => {
      if (e.target.matches(".nav-link")) {
        const href = e.target.getAttribute("href");

        if (href.startsWith("#")) {
          e.preventDefault();
          this.scrollToSection(href);
          this.closeMenu();
        }
      }
    });
  },

  // Bind form events
  bindFormEvents() {
    const forms = document.querySelectorAll("form");

    forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        this.handleFormSubmit(e);
      });

      // Real-time validation
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        input.addEventListener("blur", () => {
          this.validateField(input);
        });

        input.addEventListener("input", () => {
          this.clearFieldError(input);
        });
      });
    });
  },

  // Bind accessibility events
  bindAccessibilityEvents() {
    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      // Handle escape key
      if (e.key === "Escape") {
        this.closeMenu();
      }

      // Handle tab navigation in mobile menu
      if (this.state.isMenuOpen && e.key === "Tab") {
        this.handleMenuTabNavigation(e);
      }
    });
  },

  // Handle form submission
  handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Validate form
    if (!this.validateForm(form)) {
      return;
    }

    // Show loading state
    this.showFormLoading(form);

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Submit form (replace with actual submission logic)
    this.submitForm(form, data);
  },

  // Validate form
  validateForm(form) {
    const inputs = form.querySelectorAll("[required]");
    let isValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  },

  // Validate individual field
  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = "";

    // Required validation
    if (input.hasAttribute("required") && !value) {
      isValid = false;
      message = "This field is required";
    }

    // Email validation
    if (input.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = "Please enter a valid email address";
      }
    }

    // Phone validation
    if (input.type === "tel" && value) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = "Please enter a valid phone number";
      }
    }

    // Show/hide error
    if (isValid) {
      this.clearFieldError(input);
    } else {
      this.showFieldError(input, message);
    }

    return isValid;
  },

  // Show field error
  showFieldError(input, message) {
    input.classList.add("error");

    let errorElement = input.parentNode.querySelector(".field-error");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "field-error";
      input.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
  },

  // Clear field error
  clearFieldError(input) {
    input.classList.remove("error");
    const errorElement = input.parentNode.querySelector(".field-error");
    if (errorElement) {
      errorElement.remove();
    }
  },

  // Show form loading state
  showFormLoading(form) {
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Sending...
      `;
    }
  },

  // Hide form loading state
  hideFormLoading(form) {
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn && submitBtn.dataset.originalText) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText;
      delete submitBtn.dataset.originalText;
    }
  },

  // Submit form (placeholder - replace with actual implementation)
  async submitForm(form, data) {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      this.showFormSuccess(form);

      // Reset form
      form.reset();

      // Track form submission
      this.trackEvent("form_submit", {
        form_name: form.getAttribute("name") || "contact",
        form_id: form.id,
      });
    } catch (error) {
      this.showFormError(
        form,
        "There was an error submitting your message. Please try again."
      );
      console.error("Form submission error:", error);
    } finally {
      this.hideFormLoading(form);
    }
  },

  // Show form success message
  showFormSuccess(form) {
    const message = document.createElement("div");
    message.className = "form-message success";
    message.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Thank you! Your message has been sent successfully.
    `;

    form.parentNode.insertBefore(message, form);

    setTimeout(() => {
      message.remove();
    }, 5000);
  },

  // Show form error message
  showFormError(form, errorMessage) {
    const message = document.createElement("div");
    message.className = "form-message error";
    message.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      ${errorMessage}
    `;

    form.parentNode.insertBefore(message, form);

    setTimeout(() => {
      message.remove();
    }, 5000);
  },

  // Initialize contact forms
  initContactForms() {
    const contactForms = document.querySelectorAll(".contact-form");

    contactForms.forEach((form) => {
      // Add additional form enhancements
      this.enhanceForm(form);
    });
  },

  // Enhance form with additional features
  enhanceForm(form) {
    // Add floating labels
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      if (input.value) {
        input.classList.add("has-value");
      }

      input.addEventListener("input", () => {
        input.classList.toggle("has-value", input.value.length > 0);
      });
    });
  },

  // Initialize performance observers
  initPerformanceObservers() {
    if ("PerformanceObserver" in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log("LCP:", lastEntry.startTime);
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          console.log("FID:", entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ["first-input"] });
    }
  },

  // Initialize analytics
  initAnalytics() {
    // Track page view
    this.trackPageView();

    // Track scroll depth
    this.trackScrollDepth();

    // Track user engagement
    this.trackUserEngagement();
  },

  // Track page view
  trackPageView() {
    this.trackEvent("page_view", {
      page_title: document.title,
      page_location: window.location.href,
    });
  },

  // Track scroll depth
  trackScrollDepth() {
    const milestones = [25, 50, 75, 100];
    const trackedMilestones = new Set();

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );

      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);
          this.trackEvent("scroll_depth", {
            percent: milestone,
          });
        }
      });
    };

    window.addEventListener("scroll", this.debounce(trackScroll, 500));
  },

  // Track user engagement
  trackUserEngagement() {
    let startTime = Date.now();
    let isActive = true;

    // Track time on page
    const trackTimeOnPage = () => {
      if (isActive) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        this.trackEvent("user_engagement", {
          engagement_time: timeSpent,
        });
      }
    };

    // Track visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        isActive = false;
        trackTimeOnPage();
      } else {
        isActive = true;
        startTime = Date.now();
      }
    });

    // Track before unload
    window.addEventListener("beforeunload", trackTimeOnPage);
  },

  // Track events (placeholder - replace with actual analytics implementation)
  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4 example
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, parameters);
    }

    console.log("Event tracked:", eventName, parameters);
  },

  // Handle tab navigation in mobile menu
  handleMenuTabNavigation(e) {
    const navMenu = document.getElementById("navMenu");
    const focusableElements = navMenu.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  },

  // Handle page load
  handlePageLoad() {
    // Load saved preferences
    this.loadUserPreferences();

    // Initialize theme
    this.initTheme();
  },

  // Load user preferences
  loadUserPreferences() {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage) {
      this.switchLanguage(savedLanguage);
    }
  },

  // Initialize theme (if dark mode is added later)
  initTheme() {
    // Placeholder for theme functionality
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light"
    );
  },

  // Utility: Debounce function
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

  // Utility: Throttle function
  throttle(func, wait) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), wait);
      }
    };
  },

  // Error handling
  handleError(error, context = "") {
    console.error(`ETEAS App Error ${context}:`, error);

    // Track error
    this.trackEvent("javascript_error", {
      error_message: error.message,
      error_context: context,
      error_stack: error.stack,
    });
  },
};

// Error boundary
window.addEventListener("error", (e) => {
  ETEASApp.handleError(e.error, "Global");
});

window.addEventListener("unhandledrejection", (e) => {
  ETEASApp.handleError(e.reason, "Promise Rejection");
});

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ETEASApp.init());
} else {
  ETEASApp.init();
}

// Export for potential external use
window.ETEASApp = ETEASApp;
