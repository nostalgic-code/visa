from flask import Blueprint, request, jsonify
from flask_cors import CORS
from . import db
from .models import ContactSubmission, VisaSubmission
import os

api = Blueprint('api', __name__)

# Configure CORS based on environment
if os.environ.get('FLASK_ENV') == 'production':
    # In production, only allow requests from your actual frontend domain
    CORS(api, origins=['https://your-frontend-domain.com'], 
         methods=['POST', 'OPTIONS'],
         allow_headers=['Content-Type'])
else:
    # In development, allow all origins
    CORS(api)

@api.route('/api/visa', methods=['POST'])
def submit_visa():
    data = request.json
    print("Received visa application data:", data)  # Debug log
    
    try:
        submission = VisaSubmission(
            full_name=data.get('fullName') or data.get('name', ''),
            email=data.get('emailAddress') or data.get('email', ''),
            phone=data.get('phoneNumber') or data.get('phone', ''),
            visa_type=data.get('visaType', ''),
            nationality=data.get('nationality') or data.get('country', ''),
            message=data.get('message', 'Quick Application')
        )
        
        db.session.add(submission)
        db.session.commit()
        print("Successfully saved visa application")  # Debug log
        
        return jsonify({
            'message': 'Visa application submitted successfully',
            'status': 'success'
        }), 201
        
    except Exception as e:
        print("Error saving visa application:", str(e))  # Debug log
        db.session.rollback()
        return jsonify({
            'message': 'Error processing visa application',
            'error': str(e),
            'status': 'error'
        }), 500

@api.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    print("Received contact form data:", data)  # Debug log
    
    try:
        # Use .get() to handle missing fields safely
        submission = ContactSubmission(
            name=data.get('name', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            subject=data.get('subject', 'Contact Form Submission'),
            message=data.get('message', '')
        )
        
        db.session.add(submission)
        db.session.commit()
        print("Successfully saved contact submission")  # Debug log
        
        return jsonify({
            'message': 'Contact form submitted successfully',
            'status': 'success'
        }), 201
        
    except Exception as e:
        print("Error saving contact submission:", str(e))  # Debug log
        db.session.rollback()
        return jsonify({
            'message': 'Error processing contact form',
            'error': str(e),
            'status': 'error'
        }), 500
