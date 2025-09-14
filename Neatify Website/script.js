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

  window.addEventListener('resize', recalc, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  recalc();
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

// Optimized Custom Cursor with RAF
(function() {
  if (prefersReduced) return;
  
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
})();

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
