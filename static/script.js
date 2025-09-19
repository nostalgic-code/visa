document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing form handlers...');

    // Contact Form Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log('Contact form found, adding submit listener...');
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Contact form submitted, gathering data...');
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            console.log('Sending contact form data:', formData);
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Contact form response status:', response.status);
                const result = await response.json();
                console.log('Contact form response data:', result);
                
                if (response.ok) {
                    alert('Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                } else {
                    alert('Error: ' + (result.error || 'Failed to submit form'));
                }
            } catch (error) {
                console.error('Contact form error:', error);
                alert('Error submitting form. Please try again.');
            }
        });
    }

    // Visa Consultation Form Handler
    const consultForm = document.getElementById('consultForm');
    if (consultForm) {
        console.log('Consultation form found, adding submit listener...');
        consultForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Consultation form submitted, gathering data...');
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                emailAddress: document.getElementById('emailAddress').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                nationality: document.getElementById('nationality').value,
                destinationCountry: document.getElementById('destinationCountry').value,
                visaType: document.getElementById('visaType').value,
                travelDate: document.getElementById('travelDate').value,
                message: document.getElementById('message').value
            };
            
            console.log('Sending consultation form data:', formData);
            
            try {
                const response = await fetch('/api/visa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Consultation form response status:', response.status);
                const result = await response.json();
                console.log('Consultation form response data:', result);
                
                if (response.ok) {
                    alert('Thank you! Your consultation request has been submitted successfully.');
                    consultForm.reset();
                    // Close modal if it exists
                    const modal = document.getElementById('consultationModal');
                    if (modal) modal.style.display = 'none';
                } else {
                    alert('Error: ' + (result.error || 'Failed to submit form'));
                }
            } catch (error) {
                console.error('Consultation form error:', error);
                alert('Error submitting form. Please try again.');
            }
        });
    }

    // Quick Apply Form Handler
    const quickApplyForm = document.querySelector('.apply-card form');
    if (quickApplyForm) {
        console.log('Quick apply form found, adding submit listener...');
        quickApplyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Quick apply form submitted, gathering data...');
            
            const formData = {
                name: this.querySelector('input[name="name"]').value,
                email: this.querySelector('input[name="email"]').value,
                phone: this.querySelector('input[name="phone"]').value,
                country: this.querySelector('input[name="country"]').value,
                visaType: this.querySelector('select[name="visaType"]').value
            };
            
            console.log('Sending quick apply form data:', formData);
            
            try {
                const response = await fetch('/api/quick-apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Quick apply form response status:', response.status);
                const result = await response.json();
                console.log('Quick apply form response data:', result);
                
                if (response.ok) {
                    alert('Thank you! Your application has been submitted successfully.');
                    this.reset();
                } else {
                    alert('Error: ' + (result.error || 'Failed to submit form'));
                }
            } catch (error) {
                console.error('Quick apply form error:', error);
                alert('Error submitting form. Please try again.');
            }
        });
    }

    // Modal functionality
    const openAppModal = document.getElementById('openAppModal');
    const appModal = document.getElementById('appModal');
    const closeAppModal = document.getElementById('closeAppModal');
    
    if (openAppModal && appModal && closeAppModal) {
        openAppModal.addEventListener('click', () => appModal.classList.remove('hidden'));
        closeAppModal.addEventListener('click', () => appModal.classList.add('hidden'));
        appModal.addEventListener('click', (e) => {
            if (e.target === appModal) appModal.classList.add('hidden');
        });
    }
});