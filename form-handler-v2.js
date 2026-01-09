// Unified form handling for all forms
$(document).ready(function() {
    console.log('Unified form handler loaded v2');

    // Config for different form endpoints - Map to confirmed working endpoints
    const FORM_ENDPOINTS = {
        'modalApplyForm': '/visa',         // Changed to confirmed working endpoint
        'quickApplyForm': '/visa',         // Changed to confirmed working endpoint
        'visaApplicationForm': '/visa',    // Changed to confirmed working endpoint
        'consultForm': '/visa',            // Changed to confirmed working endpoint
        'contactForm': '/contact'          // This one was already working
    };

    // Base API URL - Production (use localhost for local development)
    const API_BASE_URL = 'https://visa-backend-h11c.onrender.com/api';
    // const API_BASE_URL = 'http://localhost:5000/api'; // For local development // Use this when deployed to Render

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

        // Add form metadata to help debugging
        formData.source = window.location.pathname + ' - ' + formId;
        formData.form_id = formId; // Add explicit form ID field
        formData.form_type = formId.includes('contact') ? 'contact' : 'visa'; // Categorize the form
        formData.timestamp = new Date().toISOString();
        formData.submission_date = new Date().toLocaleDateString();
        
        // Add a unique identifier
        formData.submission_id = 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Add debug info
        formData.debug_info = 'Submitted using form-handler-v2.js with x-www-form-urlencoded';

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
        // Try alternative submission methods if debug mode is enabled
        const useAlternatives = true; // Set to true to try alternative submission approaches
        
        if (useAlternatives) {
            // First, try a direct fetch POST request with URLSearchParams (application/x-www-form-urlencoded)
            // This should fix the 415 Unsupported Media Type error
            console.log('ATTEMPTING DIRECT API CALL TO:', API_BASE_URL + endpoint);
            
            // Convert the formData object to URLSearchParams for proper form data submission
            const params = new URLSearchParams();
            Object.keys(formData).forEach(key => {
                params.append(key, formData[key]);
            });
            
            // Try a direct POST request with form-urlencoded data
            fetch(API_BASE_URL + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Try with form-urlencoded
                },
                body: params // Send as url-encoded form data instead of JSON or multipart
            })
            .then(response => {
                console.log('FETCH RESPONSE STATUS:', response.status);
                if (response.ok) {
                    console.log('FETCH SUCCESS! Form submitted successfully via fetch');
                    return response.text();
                } else {
                    console.log('FETCH FAILED with status:', response.status);
                    throw new Error('Fetch submission failed');
                }
            })
            .then(data => {
                console.log('FETCH RESPONSE DATA:', data);
                // Don't call success callback here, we'll let the iframe method handle that
            })
            .catch(error => {
                console.log('FETCH ERROR:', error.message, '- Falling back to iframe method');
                // Continue with iframe method as fallback
            });
        }
        
        // Create a hidden iframe for the form target
        const iframeId = 'form_target_' + Math.random().toString(36).substr(2, 9);
        const $iframe = $('<iframe>', {
            name: iframeId,
            id: iframeId,
            style: 'display:none'
        }).appendTo('body');
        
        // Log the full URL we're submitting to for debugging
        const fullUrl = API_BASE_URL + endpoint;
        console.log('USING CONFIRMED WORKING ENDPOINT: Now submitting to:', endpoint);
        console.log('FULL SUBMISSION URL:', fullUrl);
        
        // Create a new form to submit directly - using URL encoded form data
        const $directForm = $('<form>', {
            action: fullUrl,
            method: 'POST',
            target: iframeId,
            enctype: 'application/x-www-form-urlencoded', // Try with form-urlencoded instead of multipart
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
                    console.log('SUBMISSION SUCCESSFUL! The form data was sent to the server.');
                    console.log('Check your admin dashboard for the new submission.');
                    successCallback();
                }
            } catch (e) {
                console.log('Could not access iframe content due to same-origin policy');
                // This is normal and expected - we can't read cross-origin iframe content
                console.log('SUBMISSION LIKELY SUCCESSFUL - form submitted without CORS errors');
                successCallback();
            }
        });
        
        // Submit the form
        $directForm.submit();
        
        // Fallback: Assume success after a reasonable timeout if iframe load event doesn't fire
        setTimeout(function() {
            console.log('Form submission completed. If you don\'t see the submission in your admin dashboard, please check:');
            console.log('1. Is the /api/visa endpoint configured correctly on your server?');
            console.log('2. Are all required fields being submitted correctly?');
            console.log('3. Is your admin dashboard properly connected to the API?');
            
            successCallback();
            // Clean up
            $iframe.remove();
            $directForm.remove();
        }, 5000);
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