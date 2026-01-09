// API Testing Tool
$(document).ready(function() {
    console.log('API Testing Tool Loaded');
    
    // Base API URL
    const API_BASE_URL = 'https://visa-vq00.onrender.com';
    
    // Potential endpoints to test
    const TEST_ENDPOINTS = [
        '/api',
        '/api/visa',
        '/api/visa-submissions',
        '/api/visa-application',
        '/api/submissions',
        '/api/contact',
        '/api/consult',
        '/api/consultation'
    ];
    
    // Create the testing UI
    createTestUI();
    
    // Function to create testing UI
    function createTestUI() {
        const $testUI = $(`
            <div style="position:fixed; bottom:10px; right:10px; background:#f8f9fa; border:1px solid #ccc; padding:15px; border-radius:8px; z-index:1000; width:350px; max-height:80vh; overflow-y:auto; box-shadow:0 0 10px rgba(0,0,0,0.2);">
                <h3 style="margin-top:0; color:#333;">API Testing Tool</h3>
                <div class="endpoints-test">
                    <h4>1. Test Available Endpoints</h4>
                    <button id="testEndpoints" class="test-btn">Test Endpoints</button>
                    <div id="endpointResults" class="results"></div>
                </div>
                <hr>
                <div class="submit-test">
                    <h4>2. Test Form Submission</h4>
                    <select id="endpointSelect" style="width:100%; margin-bottom:10px;">
                        <option value="">Select Endpoint</option>
                        ${TEST_ENDPOINTS.map(ep => `<option value="${ep}">${ep}</option>`).join('')}
                    </select>
                    <button id="submitTest" class="test-btn">Send Test Data</button>
                    <div id="submissionResults" class="results"></div>
                </div>
                <hr>
                <button id="closeTestTool" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Close</button>
            </div>
        `);
        
        // Apply styles to the testing UI
        $testUI.find('.test-btn').css({
            'background': '#007bff',
            'color': 'white',
            'border': 'none',
            'padding': '5px 10px',
            'border-radius': '4px',
            'cursor': 'pointer',
            'margin': '5px 0'
        });
        
        $testUI.find('.results').css({
            'margin-top': '10px',
            'padding': '10px',
            'background': '#f1f1f1',
            'border-radius': '4px',
            'font-family': 'monospace',
            'font-size': '12px',
            'min-height': '30px'
        });
        
        // Add the UI to the page
        $('body').append($testUI);
        
        // Set up event listeners
        $('#testEndpoints').on('click', testAllEndpoints);
        $('#submitTest').on('click', testSubmission);
        $('#closeTestTool').on('click', function() {
            $testUI.remove();
        });
    }
    
    // Function to test all endpoints
    async function testAllEndpoints() {
        const $results = $('#endpointResults');
        $results.html('<p>Testing endpoints...</p>');
        
        let resultsHTML = '';
        
        for (const endpoint of TEST_ENDPOINTS) {
            try {
                const response = await fetch(API_BASE_URL + endpoint, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                const statusText = response.ok ? '✅' : '❌';
                resultsHTML += `<p>${statusText} ${endpoint} - Status: ${response.status}</p>`;
            } catch (error) {
                resultsHTML += `<p>❌ ${endpoint} - Error: ${error.message}</p>`;
            }
        }
        
        $results.html(resultsHTML || '<p>No endpoints found</p>');
    }
    
    // Function to test submission
    async function testSubmission() {
        const $results = $('#submissionResults');
        const endpoint = $('#endpointSelect').val();
        
        if (!endpoint) {
            $results.html('<p style="color:red;">Please select an endpoint</p>');
            return;
        }
        
        $results.html('<p>Sending test data...</p>');
        
        // Create test form data
        const testData = {
            name: 'API Test User',
            email: 'test@example.com',
            phone: '+1234567890',
            subject: 'API Test Submission',
            message: 'This is an automated test submission from the API Testing Tool.',
            source: 'api-test.js',
            timestamp: new Date().toISOString(),
            submission_id: 'test_' + Date.now()
        };
        
        try {
            // Try with fetch
            const fetchResponse = await fetch(API_BASE_URL + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            
            let responseText = '';
            
            try {
                const responseData = await fetchResponse.text();
                responseText = responseData;
            } catch (e) {
                responseText = 'Could not parse response';
            }
            
            $results.html(`
                <p><strong>POST to ${endpoint}</strong></p>
                <p>Status: ${fetchResponse.status} ${fetchResponse.statusText}</p>
                <p>Response: ${responseText}</p>
            `);
            
            // Log to console for more details
            console.log('API Test - Endpoint:', endpoint);
            console.log('API Test - Status:', fetchResponse.status);
            console.log('API Test - Response:', responseText);
            
        } catch (error) {
            $results.html(`<p style="color:red;">Error: ${error.message}</p>`);
            console.error('API Test Error:', error);
            
            // Fallback to iframe method
            $results.append(`<p>Trying fallback iframe method...</p>`);
            submitWithIframe(endpoint, testData);
        }
    }
    
    // Fallback submission method using iframe
    function submitWithIframe(endpoint, formData) {
        const iframeId = 'test_frame_' + Date.now();
        const $iframe = $('<iframe>', {
            name: iframeId,
            id: iframeId,
            style: 'display:none'
        }).appendTo('body');
        
        const $form = $('<form>', {
            action: API_BASE_URL + endpoint,
            method: 'POST',
            target: iframeId,
            style: 'display:none'
        }).appendTo('body');
        
        // Add form fields
        Object.entries(formData).forEach(([key, value]) => {
            $('<input>', {
                type: 'hidden',
                name: key,
                value: value
            }).appendTo($form);
        });
        
        // Handle response
        $iframe.on('load', function() {
            $('#submissionResults').append('<p>Iframe submission completed</p>');
            setTimeout(() => {
                $iframe.remove();
                $form.remove();
            }, 1000);
        });
        
        // Submit the form
        $form.submit();
    }
});