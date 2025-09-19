from flask import Blueprint, render_template, request, redirect, url_for, flash, send_from_directory, jsonify
from flask_login import login_required, current_user
from flask_cors import CORS
from . import db
import os
from .models import ContactSubmission, VisaSubmission

main = Blueprint('main', __name__, static_folder='static')

@main.route('/')
def index():
    return send_from_directory(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'visa-master'), 'index.html')

@main.route('/contact.html')
def contact():
    return send_from_directory(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'visa-master'), 'contact.html')

@main.route('/services.html')
def services():
    return send_from_directory(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'visa-master'), 'services.html')

@main.route('/<path:filename>')
def serve_static(filename):
    # Try to serve from visa-master folder first
    try:
        return send_from_directory(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'visa-master'), filename)
    except:
        # If not found, try to serve from root folder
        return send_from_directory(os.path.join(os.path.dirname(os.path.dirname(__file__))), filename)

@main.route('/admin')
@login_required
def admin():
    contact_submissions = ContactSubmission.query.all()
    visa_submissions = VisaSubmission.query.all()
    return render_template('admin/dashboard.html', 
                         contact_submissions=contact_submissions,
                         visa_submissions=visa_submissions)
