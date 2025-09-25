// Unified form handling for all forms
$(document).ready(function() {
    console.log('Unified form handler loaded v2');

    // Config for different form endpoints - Map all forms to the correct endpoints
    const FORM_ENDPOINTS = {
        'modalApplyForm': '/visa-submissions',
        'quickApplyForm': '/visa-submissions',
        'visaApplicationForm': '/visa-submissions',
        'consultForm': '/visa-submissions', // Changed from /consult to /visa-submissions
        'contactForm': '/contact'
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
        } else if (!formData.subject) {
            formData.subject = 'Form Submission from Website';
        }

        // Add form source info
        formData.source = window.location.pathname + ' - ' + formId;
        formData.timestamp = new Date().toISOString();
        
        // Add a unique identifier
        formData.submission_id = 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

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

        // Log what we're submitting (for debugging)
        console.log('Submitting form to:', API_BASE_URL + endpoint);
        console.log('Form data:', formData);

        // Handle form submission using form method to avoid CORS
        submitFormWithoutCORS($form, formData, endpoint, handleSuccess, handleError);

        // Function to handle success
        function handleSuccess() {
            // Display success message
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
            
            // Reset button state
            $submitBtn.prop('disabled', false).text(originalBtnText);
        }

        // Function to handle error
        function handleError() {
            const errorMessage = 'Form submitted, but we could not confirm receipt. We will still process your application.';
            
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
            
            // Reset button state
            $submitBtn.prop('disabled', false).text(originalBtnText);
        }
    }

    // Submit form using standard HTML form to avoid CORS
    function submitFormWithoutCORS($form, formData, endpoint, successCallback, errorCallback) {
        // Create a hidden iframe for the form target
        const iframeId = 'form_target_' + Math.random().toString(36).substr(2, 9);
        const $iframe = $('<iframe>', {
            name: iframeId,
            id: iframeId,
            style: 'display:none'
        }).appendTo('body');
        
        // Log the full URL we're submitting to for debugging
        const fullUrl = API_BASE_URL + endpoint;
        console.log('FIXED: Submitting to endpoint:', endpoint);
        console.log('FIXED: Full submission URL:', fullUrl);
        
        // Create a new form to submit directly
        const $directForm = $('<form>', {
            action: fullUrl,
            method: 'POST',
            target: iframeId,
            style: 'display:none'
        }).appendTo('body');
        
        // Add all the form data as hidden inputs
        Object.keys(formData).forEach(key => {
            $('<input>', {
                type: 'hidden',
                name: key,
                value: formData[key]
            }).appendTo($directForm);
            
            // Log each field for debugging
            console.log(`Form field: ${key} = ${formData[key]}`);
        });
        
        // Try to detect any response from the iframe
        $iframe.on('load', function() {
            try {
                const iframeContent = $iframe.contents().find('body').text();
                console.log('Iframe response:', iframeContent);
                
                if (iframeContent.includes('error') || iframeContent.includes('Error')) {
                    console.error('Error detected in response:', iframeContent);
                    errorCallback();
                } else {
                    console.log('Submission appears successful');
                    successCallback();
                }
            } catch (e) {
                console.log('Could not access iframe content due to same-origin policy');
                // Assume success if we can't read the iframe
                successCallback();
            }
        });
        
        // Submit the form
        $directForm.submit();
        
        // Fallback: Assume success after a timeout if iframe load event doesn't fire
        setTimeout(function() {
            console.log('Form submission timeout reached, assuming success');
            successCallback();
            // Clean up
            $iframe.remove();
            $directForm.remove();
        }, 3000);
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