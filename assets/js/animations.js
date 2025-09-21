/**
 * ETEAS Energy - Animation System
 * Professional animations and interactions
 */

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initCounterAnimations();
    initHeroAnimations();
    initCardHoverAnimations();
    initMobileMenuAnimations();
});

/**
 * Scroll-triggered animations using Intersection Observer
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Trigger counter animations for stat elements
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll([
        '.service-card',
        '.sector-card',
        '.project-card',
        '.feature-item',
        '.stat-card',
        '.stat-number',
        '.contact-method',
        '.team-member',
        '.value-card'
    ].join(','));

    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

/**
 * Counter animations for statistics
 */
function initCounterAnimations() {
    // Add CSS for counter animations if not present
    if (!document.querySelector('#counter-animations-css')) {
        const style = document.createElement('style');
        style.id = 'counter-animations-css';
        style.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            .service-card.animate-on-scroll {
                transition-delay: 0.1s;
            }
            .service-card:nth-child(2).animate-on-scroll {
                transition-delay: 0.2s;
            }
            .service-card:nth-child(3).animate-on-scroll {
                transition-delay: 0.3s;
            }
        `;
        document.head.appendChild(style);
    }
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target')) || parseInt(element.textContent);
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        // Format number with commas for large numbers
        const formattedNumber = Math.floor(current).toLocaleString();
        element.textContent = formattedNumber + (element.textContent.includes('+') ? '+' : '');
    }, 16);
}

/**
 * Hero section animations
 */
function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroActions = document.querySelector('.hero-actions');
    const heroStats = document.querySelector('.hero-stats');

    if (heroTitle) {
        setTimeout(() => heroTitle.classList.add('animate-in'), 300);
    }
    if (heroSubtitle) {
        setTimeout(() => heroSubtitle.classList.add('animate-in'), 600);
    }
    if (heroActions) {
        setTimeout(() => heroActions.classList.add('animate-in'), 900);
    }
    if (heroStats) {
        setTimeout(() => heroStats.classList.add('animate-in'), 1200);
    }

    // Add CSS for hero animations
    if (!document.querySelector('#hero-animations-css')) {
        const style = document.createElement('style');
        style.id = 'hero-animations-css';
        style.textContent = `
            .hero-title,
            .hero-subtitle,
            .hero-actions,
            .hero-stats {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease, transform 0.8s ease;
            }
            .hero-title.animate-in,
            .hero-subtitle.animate-in,
            .hero-actions.animate-in,
            .hero-stats.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Card hover animations
 */
function initCardHoverAnimations() {
    const cards = document.querySelectorAll([
        '.service-card',
        '.sector-card',
        '.project-card',
        '.contact-method',
        '.team-member',
        '.value-card',
        '.stat-card'
    ].join(','));

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

/**
 * Mobile menu animations
 */
function initMobileMenuAnimations() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('active');

            if (isOpen) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            } else {
                navMenu.classList.add('active');
                navToggle.classList.add('active');
            }
        });
    }
}

/**
 * Smooth scroll for anchor links
 */
document.addEventListener('DOMContentLoaded', function() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

/**
 * Header scroll effect
 */
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

/**
 * Loading animations
 */
window.addEventListener('load', function() {
    // Hide loading screen if present
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }

    // Start hero animations
    document.body.classList.add('loaded');
});

/**
 * Form animations and validation
 */
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Floating label effect
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });

            // Check if field has value on load
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
    });
});

/**
 * Parallax effects for hero background
 */
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-bg-image');

    if (hero && heroBackground) {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        const speed = 0.5;

        if (scrolled < heroHeight) {
            heroBackground.style.transform = `translateY(${scrolled * speed}px)`;
        }
    }
});

/**
 * Progressive image loading
 */
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});

// Export functions for use in other scripts
window.ETEASAnimations = {
    initScrollAnimations,
    initCounterAnimations,
    initHeroAnimations,
    animateCounter
};