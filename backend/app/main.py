from flask import Blueprint, render_template, request, redirect, url_for, flash, send_from_directory, jsonify
from flask_login import login_required, current_user
from flask_cors import CORS
from . import db
import os
from .models import ContactSubmission, VisaSubmission

main = Blueprint('main', __name__, static_folder='static')

@main.route('/')
def index():
    return jsonify({"message": "Welcome to Visa API"}), 200

@main.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

@main.route('/admin')
@login_required
def admin():
    contact_submissions = ContactSubmission.query.all()
    visa_submissions = VisaSubmission.query.all()
    return render_template('admin/dashboard.html', 
                         contact_submissions=contact_submissions,
                         visa_submissions=visa_submissions)
