document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, looking for contact form...');
    const contactForm = document.getElementById('contactForm'); // Changed from contact-form to contactForm
    
    if (contactForm) {
        console.log('Contact form found, adding submit listener...');
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted, gathering data...');
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            console.log('Sending form data:', formData);
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Response status:', response.status);
                const result = await response.json();
                console.log('Response data:', result);
                
                if (response.ok) {
                    alert('Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                } else {
                    alert('Error: ' + (result.error || 'Failed to submit form'));
                }
            } catch (error) {
                console.error('Detailed error:', error);
                alert('Error submitting form. Please try again.');
            }
        });
    } else {
        console.error('Contact form not found! Make sure the form has id="contactForm"');
    }
});