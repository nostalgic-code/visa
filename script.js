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
const consultBtnDesktop = document.getElementById('consultBtnDesktop');
const consultBtnMobile = document.querySelector('.mobile-only.btn-primary');
const closeBtn = modal ? modal.querySelector('.modal-close') : null;

function openModal(e) {
  if (e) e.preventDefault();
  if (modal) {
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
if (consultBtnDesktop) consultBtnDesktop.addEventListener('click', openModal);
if (consultBtnMobile) consultBtnMobile.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (modal) {
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
}

// Form handling
const consultForm = document.getElementById('consultForm');
consultForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(consultForm);
  const submitBtn = consultForm.querySelector('.submit-btn');
  
  // Simulate form submission
  submitBtn.textContent = 'Scheduling...';
  setTimeout(() => {
    submitBtn.textContent = 'Schedule Consultation';
    // Show success message with GSAP
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
      <div style="background: #4CAF50; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px;">
        <h4 style="margin: 0 0 8px;">Consultation Request Received!</h4>
        <p style="margin: 0;">We'll contact you within 24 hours to confirm your consultation.</p>
      </div>
    `;
    
    const formContent = consultForm.querySelector('.form-grid');
    formContent.style.display = 'none';
    consultForm.querySelector('.form-footer').before(successMessage);
    
    gsap.from(successMessage, {
      y: 20,
      opacity: 0,
      duration: 0.4
    });

    // Close modal after delay
    setTimeout(closeModal, 3000);
  }, 1500);
});

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

// simple apply form handler
document.getElementById('applyBtn').addEventListener('click', function(e) {
  e.preventDefault();
  const name = document.getElementById('fname').value.trim();
  const mail = document.getElementById('email').value.trim();
  if(!name || !mail) {
    alert('Please provide name and email');
    return;
  }
  this.textContent = 'Applying...';
  setTimeout(() => {
    this.textContent = 'Apply Now';
    alert('Application submitted — we will contact you.');
    document.getElementById('fname').value = '';
    document.getElementById('email').value = '';
  }, 900);
});

// contact form
if (document.getElementById('contactForm')) {
  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const n = document.getElementById('cname').value.trim();
    const em = document.getElementById('cemail').value.trim();
    if(!n || !em) {
      alert('Please fill the form');
      return;
    }
    alert('Thanks! We will reach out shortly.');
    this.reset();
  });
}

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
