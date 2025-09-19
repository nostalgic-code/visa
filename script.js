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
if (consultForm) {
  consultForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = consultForm.querySelector('.submit-btn');
    submitBtn.textContent = 'Scheduling...';
    
    const formData = {
      fullName: document.getElementById('fullName').value,
      emailAddress: document.getElementById('emailAddress').value,
      phoneNumber: document.getElementById('phoneNumber').value,
      nationality: document.getElementById('nationality').value,
      destinationCountry: document.getElementById('destinationCountry').value,
      visaType: document.getElementById('visaType').value,
      message: document.getElementById('message').value
    };
    
    try {
      const response = await fetch('https://visa-vq00.onrender.com/api/visa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        submitBtn.textContent = 'Schedule Consultation';
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

        setTimeout(closeModal, 3000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      submitBtn.textContent = 'Schedule Consultation';
      alert('Error submitting form. Please try again.');
    }
  });
}

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

// Quick apply form handler
document.getElementById('applyBtn')?.addEventListener('click', async function(e) {
  e.preventDefault();
  const name = document.getElementById('fname').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone')?.value.trim() || '';
  const country = document.getElementById('country')?.value.trim() || '';
  const visaType = document.getElementById('visaType')?.value || 'Quick Application';

  if(!name || !email) {
    alert('Please provide name and email');
    return;
  }

  this.textContent = 'Applying...';
  
  try {
    const response = await fetch('https://visa-vq00.onrender.com/api/visa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        country,
        visaType,
        message: 'Quick Application'
      })
    });
    
    if (response.ok) {
      alert('Application submitted successfully — we will contact you.');
      document.getElementById('fname').value = '';
      document.getElementById('email').value = '';
      if (document.getElementById('phone')) document.getElementById('phone').value = '';
      if (document.getElementById('country')) document.getElementById('country').value = '';
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error submitting form. Please try again.');
  } finally {
    this.textContent = 'Apply Now';
  }
});

// contact form handler
if (document.getElementById('contactForm')) {
  document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('cname').value.trim();
    const email = document.getElementById('cemail').value.trim();
    const message = document.getElementById('cmessage')?.value.trim() || '';
    const subject = document.getElementById('csubject')?.value.trim() || '';
    
    if(!name || !email) {
      alert('Please provide name and email');
      return;
    }
    
    const submitBtn = this.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Sending...';
    
    try {
      const response = await fetch('https://visa-vq00.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          subject
        })
      });
      
      if (response.ok) {
        alert('Message sent successfully! We will reach out shortly.');
        this.reset();
      } else {
        throw new Error('Message submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message. Please try again.');
    } finally {
      if (submitBtn) submitBtn.textContent = 'Send Message';
    }
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
