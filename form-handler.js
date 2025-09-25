// Unified form handling for all forms
$(document).ready(function() {
    console.log('Unified form handler loaded');

    // Config for different form endpoints
    const FORM_ENDPOINTS = {
        'modalApplyForm': '/visa-submissions',
        'quickApplyForm': '/visa-submissions',
        'visaApplicationForm': '/visa-submissions',
        'consultForm': '/contact'
    };

    // Base API URL
    const API_BASE_URL = 'https://visa-vq00.onrender.com/api';

    // Reusable form submission handler
    function handleFormSubmit($form, endpoint) {
        const $submitBtn = $form.find('button[type="submit"]');
        const $msgDiv = $form.find('.form-message');
        const formId = $form.attr('id');
        
        // Gather form data
        const formData = {};
        $form.serializeArray().forEach(item => {
            formData[item.name] = item.value.trim();
        });

        // Add default fields if not present
        if (!formData.subject && formId.includes('apply')) {
            formData.subject = 'Visa Application';
        }

        // Validation
        const requiredFields = ['name', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            alert('Please provide ' + missingFields.join(', '));
            return;
        }

        // Show loading state
        $submitBtn.prop('disabled', true).text('Submitting...');
        $msgDiv.html('').hide();

        // Store original button text
        const originalBtnText = $submitBtn.text();

        // Submit form
        $.ajax({
            url: API_BASE_URL + endpoint,
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Origin': 'https://www.visaproamahle.co.za'
            },
            success: function(response) {
                // Handle different styling for different forms
                if (formId === 'modalApplyForm') {
                    $msgDiv.html('Application submitted successfully! We will contact you soon.')
                        .removeClass('hidden')
                        .removeClass('bg-red-100 text-red-700')
                        .addClass('bg-green-100 text-green-700')
                        .show();
                } else {
                    $msgDiv.html(`
                        <div style="color: #4CAF50; background: #f0fff4; padding: 12px; border-radius: 6px; margin-top: 10px;">
                            Application submitted successfully! We will contact you soon.
                        </div>
                    `).show();
                }
                
                // Show an alert message
                alert('Application submitted successfully! We will contact you soon.');
                
                $form[0].reset();

                // If form is in a modal, close it after success
                const $modal = $form.closest('.modal-overlay');
                if ($modal.length) {
                    setTimeout(() => {
                        $modal.removeClass('show');
                    }, 1000);
                }
                
                // If the form is in a Tailwind modal
                const appModal = document.getElementById('appModal');
                if (formId === 'modalApplyForm' && appModal) {
                    setTimeout(() => {
                        appModal.classList.add('hidden');
                    }, 2000);
                }
            },
            error: function(xhr, status, error) {
                console.error('Form submission error:', error);
                let errorMessage = 'Error submitting form. Please try again.';

                if (xhr.status === 429) {
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                } else if (xhr.status === 400) {
                    errorMessage = 'Please check your form details and try again.';
                }

                if (formId === 'modalApplyForm') {
                    $msgDiv.html(errorMessage)
                        .removeClass('hidden')
                        .removeClass('bg-green-100 text-green-700')
                        .addClass('bg-red-100 text-red-700')
                        .show();
                } else {
                    $msgDiv.html(`
                        <div style="color: #f44336; background: #fff5f5; padding: 12px; border-radius: 6px; margin-top: 10px;">
                            ${errorMessage}
                        </div>
                    `).show();
                }
            },
            complete: function() {
                $submitBtn.prop('disabled', false).text(originalBtnText);
            }
        });
    }

    // Add message div to forms if not present
    function ensureMessageDiv($form) {
        if (!$form.find('.form-message').length) {
            $form.prepend('<div class="form-message" style="display: none;"></div>');
        }
    }

    // Attach handlers to all forms
    Object.entries(FORM_ENDPOINTS).forEach(([formId, endpoint]) => {
        const $form = $(`#${formId}`);
        if ($form.length) {
            ensureMessageDiv($form);
            $form.on('submit', function(e) {
                e.preventDefault();
                handleFormSubmit($(this), endpoint);
            });
        }
    });
});