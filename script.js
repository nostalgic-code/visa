// Add menu overlay to body
const overlay = document.createElement('div');
overlay.className = 'menu-overlay';
document.body.appendChild(overlay);

// Mobile menu functionality
const menuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Hide mobile menu toggle on desktop
function updateMenuVisibility() {
  if (window.innerWidth > 768) {
    menuToggle.style.display = 'none';
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    menuToggle.style.display = 'block';
  }
}

// Initial check and add resize listener
updateMenuVisibility();
window.addEventListener('resize', updateMenuVisibility);

function toggleMenu() {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Handle body scroll
  document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  
  // Animate menu items
  const links = navLinks.querySelectorAll('a');
  if (navLinks.classList.contains('active')) {
    links.forEach((link, index) => {
      setTimeout(() => {
        link.style.opacity = '1';
        link.style.transform = 'translateX(0)';
      }, 100 + (index * 50));
    });
  } else {
    links.forEach(link => {
      link.style.opacity = '0';
      link.style.transform = 'translateX(20px)';
    });
  }
}

menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// Close menu when clicking nav links
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
      toggleMenu();
    }
  });
});

// set year
document.getElementById('year').textContent = new Date().getFullYear();

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Header scroll effect
const header = document.querySelector('header.site-head');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


// Modal Handling (unified: use .show class only)
const modal = document.getElementById('consultModal');
const closeBtn = modal ? modal.querySelector('.modal-close') : null;

// Get all consultation buttons
const consultButtons = [
  'navContactBtnMobile',
  'mobileConsultBtn',
  'headerConsultBtn',
  'heroConsultBtn',
  'whyConsultBtn',
  'processConsultBtn',
  'teamConsultBtn',
  'ctaConsultBtn',
  'openConsultModal'
].map(id => document.getElementById(id));

function openModal(e) {
  if (e) e.preventDefault();
  if (modal) {
    // Reset form and button state
    const consultForm = document.getElementById('consultForm');
    if (consultForm) {
      consultForm.reset();
      const submitBtn = consultForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Schedule Consultation';
      }
      // Hide any form messages
      const msgDiv = consultForm.querySelector('.form-message');
      if (msgDiv) msgDiv.style.display = 'none';
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(e) {
  if (e) e.preventDefault();
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Add click event to all consultation buttons
consultButtons.forEach(btn => {
  if (btn) btn.addEventListener('click', openModal);
});

// Close modal with close button
if (closeBtn) closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
if (modal) {
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
}

// Form handling
const consultForm = document.getElementById('consultForm');
// Form submission is handled by form-handler.js

// Animate service cards
const cards = gsap.utils.toArray('.service-card');
cards.forEach((card, i) => {
  gsap.set(card, { opacity: 0, y: 20 });
  
  gsap.to(card, {
    scrollTrigger: {
      trigger: card,
      start: "top bottom-=100",
      toggleActions: "play none none reverse"
    },
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out",
    delay: i * 0.1
  });
});



// Contact form submission is handled by form-handler.js

// simple reveal on scroll
const els = document.querySelectorAll('section, .hero-left, .apply-card');
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if(en.isIntersecting) en.target.style.opacity = 1;
  });
}, {threshold: 0.08});
els.forEach(el => {
  el.style.opacity = 0;
  io.observe(el);
});
