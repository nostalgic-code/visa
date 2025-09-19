    document.addEventListener('DOMContentLoaded', function() {
    console.log('Forms.js loaded - Debug version');
    const contactForm = document.getElementById('contactForm');
    console.log('Looking for contact form...', contactForm ? 'Found' : 'Not found');
    
    if (contactForm) {
        console.log('Adding submit listener to contact form');
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted!');
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone')?.value || '',
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            console.log('Form data collected:', formData);

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Contact form submitted successfully!');
                    contactForm.reset();
                } else {
                    alert('Error submitting form. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error submitting form. Please try again.');
            }
        });
    }

    // Visa form submission
    const visaForm = document.getElementById('visaForm');
    if (visaForm) {
        visaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                full_name: document.getElementById('full_name').value,
                email: document.getElementById('visa_email').value,
                phone: document.getElementById('visa_phone').value,
                visa_type: document.getElementById('visa_type').value,
                nationality: document.getElementById('nationality').value,
                message: document.getElementById('visa_message').value
            };

            try {
                const response = await fetch('/api/visa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Visa form submitted successfully!');
                    visaForm.reset();
                } else {
                    alert('Error submitting form. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error submitting form. Please try again.');
            }
        });
    }
});