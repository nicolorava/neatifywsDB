// Reveal on scroll
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced) {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-fade');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    })
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
}

// Basic GA click tracking via data-gtag attribute
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-gtag]');
  if (!target) return;
  const label = target.getAttribute('data-gtag');
  if (typeof gtag === 'function') {
    gtag('event', 'click', { event_category: 'cta', event_label: label });
  }
});

// Improve details/summary focus + keyboard hint
document.querySelectorAll('.faq-item summary').forEach((s) => {
  s.setAttribute('role', 'button');
  s.setAttribute('tabindex', '0');
});

// Horizontal scroll: vertical-controlled horizontal panel track
(function() {
  if (prefersReduced) return; // degrade to vertical stack

  // Skip horizontal scroll logic on mobile devices
  if (window.innerWidth <= 1200) return;

  const section = document.getElementById('deep-features');
  if (!section) return;
  const outer = section.querySelector('.hs__outer');
  const sticky = section.querySelector('.hs__sticky');
  const track = section.querySelector('.hs__track');
  if (!outer || !sticky || !track) return;

  let scrollLen = 0; // how much vertical scroll maps to full horizontal
  let trackScroll = 0; // px to translate on X
  let ticking = false;

  function recalc() {
    const vw = window.innerWidth;
    const panels = track.children.length;
    // Horizontal distance equals total width minus viewport width
    trackScroll = Math.max(0, track.scrollWidth - vw);
    // Vertical scroll length equals the same horizontal distance
    scrollLen = trackScroll;
    // Set the outer wrapper height to allow vertical scrolling through the section
    outer.style.height = (window.innerHeight + scrollLen) + 'px';
  }

  function onScroll() {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      const rect = outer.getBoundingClientRect();
      const start = rect.top; // distance from viewport top
      const viewportH = window.innerHeight;
      const offset = viewportH * 1.1; // Start scroll when completely in the section
      const progress = Math.min(Math.max((viewportH - start - offset) / scrollLen, 0), 1);
      const x = -trackScroll * progress;
      track.style.transform = `translate3d(${x}px,0,0)`;
      
      // Dynamic image rotation based on scroll progress
      const panels = track.querySelectorAll('.hs__panel');
      const viewportCenter = window.innerWidth / 2;
      
      panels.forEach((panel, index) => {
        const mediaFrame = panel.querySelector('.media-frame');
        if (!mediaFrame) return;
        
        // Calculate panel position relative to viewport center
        const panelRect = panel.getBoundingClientRect();
        const panelCenter = panelRect.left + (panelRect.width / 2);
        const distanceFromCenter = (panelCenter - viewportCenter) / (window.innerWidth / 2);
        
        // Smooth curve for rotation with easing
        const normalizedDistance = Math.max(-1, Math.min(1, distanceFromCenter));
        const rotation = normalizedDistance * 8;
        
        // Apply smooth transform with sub-pixel precision
        const rotationY = rotation.toFixed(2);
        mediaFrame.style.transform = `perspective(1000px) rotateY(${rotationY}deg) rotateX(2deg)`;
      });
      
      ticking = false;
    });
    ticking = true;
  }

  function onResize() {
    // Re-check if we should disable horizontal scroll on resize
    if (window.innerWidth <= 1200) {
      // Reset any transforms and height when switching to mobile view
      track.style.transform = 'none';
      outer.style.height = 'auto';
      return;
    }
    recalc();
  }

  // Make functions available globally for dynamic initialization
  window.horizontalScrollRecalc = recalc;
  window.horizontalScrollOnScroll = onScroll;

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial setup - check if mobile and set appropriate height
  if (window.innerWidth <= 1200) {
    outer.style.height = 'auto';
  } else {
    recalc();
  }
  onScroll();
})();

// Currency Detection - Simple and Smart
(function() {
  const currencySymbol = document.getElementById('currency-symbol');
  if (!currencySymbol) return;
  
  // Get user's locale and timezone
  const userLocale = navigator.language || navigator.languages?.[0] || 'en-US';
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // European countries/locales that use EUR
  const eurRegions = [
    'de', 'fr', 'it', 'es', 'nl', 'be', 'at', 'pt', 'ie', 'fi', 
    'gr', 'ee', 'lv', 'lt', 'lu', 'mt', 'sk', 'si', 'cy'
  ];
  
  // European timezones
  const eurTimezones = [
    'Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid',
    'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna', 'Europe/Lisbon',
    'Europe/Dublin', 'Europe/Helsinki', 'Europe/Athens', 'Europe/Tallinn',
    'Europe/Riga', 'Europe/Vilnius', 'Europe/Luxembourg', 'Europe/Malta',
    'Europe/Bratislava', 'Europe/Ljubljana', 'Europe/Nicosia'
  ];
  
  // Check if user is likely from eurozone
  const countryCode = userLocale.split('-')[0]?.toLowerCase();
  const isEurLocale = eurRegions.includes(countryCode);
  const isEurTimezone = eurTimezones.includes(userTimezone);
  
  // Smart detection: locale OR timezone match = EUR
  if (isEurLocale || isEurTimezone) {
    currencySymbol.textContent = '€';
    
    // Add subtle animation
    currencySymbol.style.opacity = '0';
    setTimeout(() => {
      currencySymbol.style.transition = 'opacity 0.3s ease';
      currencySymbol.style.opacity = '1';
    }, 100);
  }
})();

// Button Microanimations - Magnetic Effect and Mouse Tracking
(function() {
  if (prefersReduced) return; // respect reduced motion preference
  
  const buttons = document.querySelectorAll('.appstore-cta.custom');
  
  buttons.forEach(button => {
    let isHovering = false;
    
    // Magnetic effect
    button.addEventListener('mouseenter', () => {
      isHovering = true;
    });
    
    button.addEventListener('mouseleave', () => {
      isHovering = false;
      // Remove mouse position variables
      button.style.removeProperty('--mouse-x');
      button.style.removeProperty('--mouse-y');
    });
    
    button.addEventListener('mousemove', (e) => {
      if (!isHovering) return;
      
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update CSS custom properties for radial gradient
      const mouseX = (x / rect.width) * 100;
      const mouseY = (y / rect.height) * 100;
      button.style.setProperty('--mouse-x', `${mouseX}%`);
      button.style.setProperty('--mouse-y', `${mouseY}%`);
    });
    
    // Add ripple effect on click
    button.addEventListener('click', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'button-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      button.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });
  });
})();

// Optimized Custom Cursor with RAF - Desktop only
/* (function() {
  if (prefersReduced) return;

  // Only create cursor on devices with fine pointers (desktop/laptop)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  document.body.appendChild(cursor);

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // Track mouse position (no DOM updates here)
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Direct cursor following with RAF (no delay)
  function animateCursor() {
    // Direct positioning - no lerp delay
    cursorX = mouseX;
    cursorY = mouseY;

    // Update position
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover detection
  const hoverElements = 'a, button, [role="button"], input, select, textarea, .appstore-cta, .social-item, .faq-item summary, .footer-links a, .nav-link';

  document.addEventListener('mouseover', (e) => {
    if (e.target.matches(hoverElements) || e.target.closest(hoverElements)) {
      cursor.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.matches(hoverElements) || e.target.closest(hoverElements)) {
      cursor.classList.remove('hover');
    }
  });

  // Hide/show cursor when leaving/entering window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
})(); */

// Card Stagger Animation
(function() {
  if (prefersReduced) return;
  
  const cards = document.querySelectorAll('.card');
  
  // Add stagger delay to cards
  cards.forEach((card, index) => {
    card.style.setProperty('--stagger-delay', `${index * 100}ms`);
    
    // Add entrance animation class
    card.classList.add('card-entrance');
  });
  
  // Add floating animation delays to icons (excluding social icons)
  const iconWraps = document.querySelectorAll('.icon-wrap:not(.social-icon-wrapper)');
  iconWraps.forEach((icon, index) => {
    // Random delay between 0-2 seconds for natural feel
    const delay = Math.random() * 2;
    icon.style.setProperty('--icon-delay', `${delay}s`);
  });
})();

// Enhanced FAQ Animations
(function() {
  if (prefersReduced) return;

  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const summary = item.querySelector('summary');
    const content = item.querySelector('.faq-content');

    if (summary) {
      summary.addEventListener('click', () => {
        // Add a small delay before the content reveals for smoother animation
        setTimeout(() => {
          if (item.open) {
            content?.classList.add('faq-revealing');
          }
        }, 50);
      });
    }
  });
})();

// Mobile/Desktop Features Management with Dynamic Switching
(function() {
  const mobileContainer = document.getElementById('mobile-features-content');
  if (!mobileContainer) return;

  // Mobile features data
  const mobileFeatures = [
    {
      webp: 'asset/images/folderCleanerOutcome.webp',
      fallback: 'asset/images/folderCleanerOutcome.png',
      alt: 'One‑click organizer result',
      title: 'Transform Chaos Into Order (In 1 click)',
      description: 'That client project folder that looks like a tornado hit it? Your Desktop that\'s buried under months of screenshots and random downloads? Pick any disaster zone and watch Neatify transform it into a clean, logical structure. Images flow into Visual folders, documents land in Document categories, everything finds its perfect home. Your stress melts away as chaos becomes clarity.'
    },
    {
      webp: 'asset/images/savedProject.webp',
      fallback: 'asset/images/savedProject.png',
      alt: 'Project Selection UI',
      title: 'Switch Clients Without Losing Your Mind',
      description: 'Monday you\'re designing logos for a tech startup. Tuesday it\'s website mockups for a restaurant chain. Wednesday brings presentation slides for a consulting firm. Each client needs different organization. One click switches your entire file system to match your current project. No mental gymnastics, no folder confusion, no files landing in the wrong place.'
    },
    {
      webp: 'asset/images/homeScreen.webp',
      fallback: 'asset/images/homeScreen.png',
      alt: 'Start sorting from the app home',
      title: 'Your Digital Assistant Never Sleeps',
      description: 'Press Start and feel the relief. While you\'re designing, coding, or in client meetings, Neatify works behind the scenes. Every screenshot, every download, every asset gets moved to exactly where it belongs.'
    },
    {
      webp: 'asset/images/savedRules.webp',
      fallback: 'asset/images/savedRules.png',
      alt: 'Custom rules creation interface',
      title: 'Set Rules Once, Organized Forever',
      description: 'Create simple rules like "PDFs → Documents folder" and "Images → Current project visuals." Set them once, forget them forever. No projects needed, no complex setup. Just pure automation that learns your workflow and keeps your files flowing exactly where you want them, every single time.'
    }
  ];

  let mobileContentLoaded = false;
  let horizontalScrollInitialized = false;

  // Enhanced function to load revolutionary mobile content
  function loadMobileContent() {
    if (mobileContentLoaded) return;

    // Create mobile feature cards with enhanced structure
    mobileFeatures.forEach((feature, index) => {
      const card = document.createElement('div');
      card.className = 'feature-mobile-card';
      card.style.setProperty('--stagger-delay', `${index * 200}ms`);

      // Add magnetic hover effect tracking
      card.setAttribute('data-magnetic', 'true');

      card.innerHTML = `
        <div class="feature-mobile-image">
          <img src="${feature.webp}" alt="${feature.alt}" loading="lazy" />
        </div>
        <div class="feature-mobile-content">
          <h3>${feature.title}</h3>
          <p>${feature.description}</p>
        </div>
      `;

      mobileContainer.appendChild(card);
    });

    // Enhanced staggered entrance animation with magnetic effects
    const cards = mobileContainer.querySelectorAll('.feature-mobile-card');

    // Set initial state
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
      card.style.filter = 'blur(4px)';
    });

    // Animate in with enhanced timing
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.filter = 'blur(0px)';

        // Add entrance sound effect (visual feedback)
        card.style.boxShadow = '0 0 40px rgba(0, 238, 255, 0.3)';
        setTimeout(() => {
          card.style.boxShadow = '';
        }, 600);

      }, index * 200 + 100);
    });

    // Add enhanced magnetic hover effects
    cards.forEach((card, index) => {
      let isHovering = false;
      let animationFrame;

      const handleMouseMove = (e) => {
        if (!isHovering) return;

        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.1;
        const deltaY = (e.clientY - centerY) * 0.1;

        if (animationFrame) cancelAnimationFrame(animationFrame);

        animationFrame = requestAnimationFrame(() => {
          card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
        });
      };

      card.addEventListener('mouseenter', () => {
        isHovering = true;
        card.style.transition = 'transform 0.3s ease-out';
        document.addEventListener('mousemove', handleMouseMove);
      });

      card.addEventListener('mouseleave', () => {
        isHovering = false;
        document.removeEventListener('mousemove', handleMouseMove);
        if (animationFrame) cancelAnimationFrame(animationFrame);

        card.style.transition = 'transform 0.6s ease-out';
        card.style.transform = 'translate(0px, 0px) scale(1)';
      });

      // Enhanced intersection observer for smooth active state management
      let activeTransitionTimeout;

      const observer = new IntersectionObserver((entries) => {
        // Clear any pending transitions
        if (activeTransitionTimeout) {
          clearTimeout(activeTransitionTimeout);
        }

        // Debounce the state changes for smoother transitions
        activeTransitionTimeout = setTimeout(() => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // First remove active state from all cards
              cards.forEach(card => {
                card.classList.remove('in-view');
              });

              // Then add active state to the visible card after a brief delay
              setTimeout(() => {
                entry.target.classList.add('in-view');
              }, 50);

            } else {
              // Remove active state when out of view with smooth transition
              setTimeout(() => {
                entry.target.classList.remove('in-view');
              }, 100);
            }
          });
        }, 150); // Debounce delay for smoother transitions
      }, {
        threshold: 0.65,
        rootMargin: '-15% 0px -15% 0px'
      });

      observer.observe(card);
    });

    mobileContentLoaded = true;
  }

  // Function to initialize horizontal scroll (for desktop)
  function initializeHorizontalScroll() {
    if (prefersReduced) return;
    if (window.innerWidth <= 1200) return;

    // Force re-initialization by calling both functions
    if (typeof window.horizontalScrollRecalc === 'function' && typeof window.horizontalScrollOnScroll === 'function') {
      setTimeout(() => {
        // First recalculate dimensions
        window.horizontalScrollRecalc();
        // Then update scroll positions
        window.horizontalScrollOnScroll();
        // Also trigger a resize event to make sure everything is updated
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }, 200);
    }

    horizontalScrollInitialized = true;
  }

  // Function to handle responsive switching
  function handleResize() {
    if (window.innerWidth <= 1200) {
      // Mobile mode
      loadMobileContent();
      horizontalScrollInitialized = false; // Reset for next desktop switch
    } else {
      // Desktop mode - always force re-initialization
      horizontalScrollInitialized = false; // Force re-init
      initializeHorizontalScroll();
    }
  }

  // Initial setup
  handleResize();

  // Listen for resize events with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });
})();

// Interactive Demo Section - Video Integration
(function() {
  if (prefersReduced) return;

  const demoSection = document.querySelector('.demo-section');
  if (!demoSection) return;

  const demoSteps = demoSection.querySelectorAll('.demo-step');
  const demoVideo = demoSection.querySelector('.demo-video-player');

  let currentStep = 0;
  let demoInterval;

  // Auto-cycle through demo steps
  function cycleDemoSteps() {
    demoSteps.forEach(step => step.classList.remove('active'));
    currentStep = (currentStep + 1) % demoSteps.length;
    demoSteps[currentStep].classList.add('active');
  }

  // Start auto-cycling when demo comes into view
  const demoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        demoInterval = setInterval(cycleDemoSteps, 4000);
      } else {
        if (demoInterval) clearInterval(demoInterval);
      }
    });
  }, { threshold: 0.3 });

  demoObserver.observe(demoSection);

  // Manual step interaction
  demoSteps.forEach((step, index) => {
    step.addEventListener('click', () => {
      if (demoInterval) clearInterval(demoInterval);
      demoSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
      currentStep = index;

      setTimeout(() => {
        demoInterval = setInterval(cycleDemoSteps, 4000);
      }, 6000);
    });
  });

  // Video event tracking
  if (demoVideo) {
    demoVideo.addEventListener('play', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'demo_video_play', {
          event_category: 'engagement',
          event_label: 'demo_section'
        });
      }
    });

    demoVideo.addEventListener('ended', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'demo_video_complete', {
          event_category: 'engagement',
          event_label: 'demo_section'
        });
      }
    });
  }
})();
