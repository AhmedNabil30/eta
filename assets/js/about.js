/* ============================================
   ETEAS Energy - About Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  // Initialize all about page functionality
  initCounters();
  initScrollAnimations();
  initSmoothScrolling();

  // Counter Animation for Hero Stats
  function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '-50px'
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'));
          const increment = target / 50; // Animation duration control
          let current = 0;

          const updateCounter = () => {
            if (current < target) {
              current += increment;
              if (current > target) current = target;

              // Format numbers nicely
              if (target >= 1000) {
                counter.textContent = Math.floor(current).toLocaleString();
              } else {
                counter.textContent = Math.floor(current);
              }

              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target.toLocaleString();
            }
          };

          updateCounter();
          counterObserver.unobserve(counter);
        }
      });
    }, observerOptions);

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  // Scroll Animations for Cards and Sections
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(`
      .team-member,
      .cert-card,
      .commitment-item,
      .benefit-item,
      .mission-card,
      .vision-card,
      .values-card
    `);

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animations for multiple elements
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);

          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-50px'
    });

    animatedElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      animationObserver.observe(element);
    });
  }

  // Smooth Scrolling for Hero Scroll Indicator
  function initSmoothScrolling() {
    const scrollIndicator = document.querySelector('.hero-scroll-indicator a');

    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  }

  // Team Member Card Interactions
  const teamMembers = document.querySelectorAll('.team-member');
  teamMembers.forEach(member => {
    member.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    member.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Certification Cards Hover Effects
  const certCards = document.querySelectorAll('.cert-card');
  certCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      const logo = this.querySelector('.cert-logo img');
      if (logo) {
        logo.style.transform = 'scale(1.1)';
      }
    });

    card.addEventListener('mouseleave', function() {
      const logo = this.querySelector('.cert-logo img');
      if (logo) {
        logo.style.transform = 'scale(1)';
      }
    });
  });

  // Statistics Animation on Scroll
  const companyStats = document.querySelectorAll('.company-stats .stat-number');
  if (companyStats.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statNumber = entry.target;
          const target = parseInt(statNumber.getAttribute('data-target'));

          if (target && !statNumber.classList.contains('animated')) {
            statNumber.classList.add('animated');
            animateValue(statNumber, 0, target, 2000);
          }
        }
      });
    }, { threshold: 0.5 });

    companyStats.forEach(stat => {
      statsObserver.observe(stat);
    });
  }

  // Helper function for value animation
  function animateValue(element, start, end, duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;

    function updateValue() {
      const currentTime = Date.now();
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(start + (end - start) * easeOutQuart);

      if (end >= 1000) {
        element.textContent = currentValue.toLocaleString();
      } else {
        element.textContent = currentValue;
      }

      if (currentTime < endTime) {
        requestAnimationFrame(updateValue);
      } else {
        element.textContent = end.toLocaleString();
      }
    }

    updateValue();
  }

  // Partnership Logo Animation
  const partnershipLogos = document.querySelectorAll('.logo-showcase .logo-item img');
  partnershipLogos.forEach(logo => {
    logo.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05) rotate(2deg)';
    });

    logo.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0deg)';
    });
  });

  // Parallax Effect for Page Header
  function initParallaxEffect() {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader) return;

    function updateParallax() {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;

      if (scrolled < pageHeader.offsetHeight) {
        pageHeader.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      }
    }

    // Throttle scroll events for performance
    let ticking = false;
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
        setTimeout(() => { ticking = false; }, 16);
      }
    }

    window.addEventListener('scroll', requestTick);
  }

  // Initialize parallax effect if user prefers motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initParallaxEffect();
  }

  // Accessibility: Skip link functionality
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector('#main-content');
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Progressive enhancement for better UX
  document.body.classList.add('js-enabled');

  console.log('About page JavaScript initialized successfully');
});