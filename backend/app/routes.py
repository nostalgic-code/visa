from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
from app import supabase
from datetime import datetime
from functools import wraps
from supabase import create_client, Client
import os

api_bp = Blueprint('api', __name__)
dashboard_bp = Blueprint('dashboard', __name__)

# Helper function to get authenticated Supabase client
def get_auth_client():
    """Create Supabase client with user's access token"""
    access_token = session.get('access_token')
    if not access_token:
        return None
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    auth_client = create_client(supabase_url, supabase_key)
    
    try:
        # Set the auth token for authenticated requests
        auth_client.postgrest.auth(access_token)
        return auth_client
    except Exception as e:
        # If token is invalid or expired, clear session
        if 'JWT expired' in str(e) or 'invalid' in str(e).lower():
            session.clear()
        return None

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'access_token' not in session:
            return redirect(url_for('dashboard.login'))
        return f(*args, **kwargs)
    return decorated_function

# API Routes
@api_bp.route('/visa', methods=['POST'])
def submit_visa_application():
    """Handle visa application submissions from both modals"""
    try:
        data = request.form.to_dict()
        
        # Debug: Log incoming data
        print("=" * 50)
        print("INCOMING FORM DATA:")
        for key, value in data.items():
            print(f"  {key}: {value}")
        print("=" * 50)
        
        # Map camelCase to snake_case for PostgreSQL
        field_mapping = {
            'countryApplyingFrom': 'country_applying_from',
            'passportCountry': 'passport_country',
            'returnDate': 'return_date',
            'visaType': 'visa_type',
            'communicationMethod': 'communication_method'
        }
        
        # Define fields that exist in the database
        allowed_fields = [
            'name', 'email', 'phone', 'country_applying_from', 
            'passport_country', 'destination', 'return_date', 
            'visa_type', 'communication_method', 'message'
        ]
        
        # Convert camelCase to snake_case and filter
        filtered_data = {}
        for key, value in data.items():
            # Convert key if it's in the mapping
            db_key = field_mapping.get(key, key)
            # Only include if it's an allowed field and value is not empty
            if db_key in allowed_fields and value and value.strip():
                filtered_data[db_key] = value
        
        # Debug: Log filtered data
        print("FILTERED DATA FOR DATABASE:")
        for key, value in filtered_data.items():
            print(f"  {key}: {value}")
        print("=" * 50)
        
        # Add timestamp and status
        filtered_data['submitted_at'] = datetime.utcnow().isoformat()
        filtered_data['status'] = 'new'
        
        # Determine form type from original data
        if 'form_type' in data:
            filtered_data['form_type'] = data['form_type']
        elif 'communication_method' in filtered_data:
            filtered_data['form_type'] = 'consultation' if 'message' in filtered_data else 'callback'
        else:
            filtered_data['form_type'] = 'unknown'
        
        # Insert into Supabase
        result = supabase.table('visa_applications').insert(filtered_data).execute()
        
        return jsonify({
            'success': True,
            'message': 'Application submitted successfully. We will contact you soon!',
            'id': result.data[0]['id'] if result.data else None
        }), 200
        
    except Exception as e:
        print(f"Error submitting application: {str(e)}")  # Log to terminal
        return jsonify({
            'success': False,
            'message': f'Error submitting application: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error submitting application: {str(e)}'
        }), 500

@api_bp.route('/applications', methods=['GET'])
def get_applications():
    """Get all applications (protected endpoint)"""
    try:
        # In production, add proper authentication here
        result = supabase.table('visa_applications').select('*').order('submitted_at', desc=True).execute()
        
        return jsonify({
            'success': True,
            'data': result.data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@api_bp.route('/applications/<int:app_id>', methods=['GET'])
def get_application(app_id):
    """Get single application by ID"""
    try:
        result = supabase.table('visa_applications').select('*').eq('id', app_id).single().execute()
        
        return jsonify({
            'success': True,
            'data': result.data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404

@api_bp.route('/applications/<int:app_id>/status', methods=['PUT'])
@login_required
def update_application_status(app_id):
    """Update application status (protected endpoint)"""
    try:
        # Get authenticated client
        auth_client = get_auth_client()
        if not auth_client:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'success': False, 'message': 'Status is required'}), 400
        
        result = auth_client.table('visa_applications').update({'status': new_status}).eq('id', app_id).execute()
        
        return jsonify({
            'success': True,
            'message': 'Status updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@api_bp.route('/applications/<int:app_id>', methods=['DELETE'])
@login_required
def delete_application(app_id):
    """Delete an application (protected endpoint)"""
    try:
        # Get authenticated client
        auth_client = get_auth_client()
        if not auth_client:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        # Delete from Supabase
        result = auth_client.table('visa_applications').delete().eq('id', app_id).execute()
        
        return jsonify({
            'success': True,
            'message': 'Application deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Dashboard Routes
@dashboard_bp.route('/admin/signup', methods=['GET', 'POST'])
def signup():
    """Admin signup page with Supabase Auth"""
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            
            # Register new user with Supabase Auth
            response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            
            # Check if email confirmation is required
            if response.user and not response.session:
                return jsonify({
                    'success': True,
                    'message': 'Account created! Please check your email to confirm your account.',
                    'requires_confirmation': True
                }), 200
            
            # If auto-confirmed, store session
            if response.session:
                session['access_token'] = response.session.access_token
                session['refresh_token'] = response.session.refresh_token
                session['user_email'] = response.user.email
                
                return jsonify({
                    'success': True,
                    'message': 'Account created and logged in successfully!'
                }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Signup failed: {str(e)}'
            }), 400
    
    # Check if already logged in
    if 'access_token' in session:
        return redirect(url_for('dashboard.index'))
    
    return render_template('admin/signup.html')

@dashboard_bp.route('/admin/login', methods=['GET', 'POST'])
def login():
    """Admin login page with Supabase Auth"""
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            
            # Authenticate with Supabase Auth
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            # Store access token and user info in session
            session['access_token'] = response.session.access_token
            session['refresh_token'] = response.session.refresh_token
            session['user_email'] = response.user.email
            
            return jsonify({
                'success': True,
                'message': 'Login successful'
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Login failed: {str(e)}'
            }), 401
    
    # Check if already logged in
    if 'access_token' in session:
        return redirect(url_for('dashboard.index'))
    
    return render_template('admin/login.html')

@dashboard_bp.route('/admin/logout')
def logout():
    """Admin logout"""
    try:
        # Sign out from Supabase
        if 'access_token' in session:
            supabase.auth.sign_out()
    except:
        pass
    
    # Clear session
    session.clear()
    return redirect(url_for('dashboard.login'))

@dashboard_bp.route('/admin')
@login_required
def index():
    """Dashboard home page showing all applications"""
    try:
        # Get authenticated client
        auth_client = get_auth_client()
        if not auth_client:
            return redirect(url_for('dashboard.login'))
        
        # Fetch all applications from Supabase with authenticated client
        result = auth_client.table('visa_applications').select('*').order('submitted_at', desc=True).execute()
        applications = result.data
        
        # Calculate stats
        total = len(applications)
        new_count = len([a for a in applications if a.get('status') == 'new'])
        in_progress = len([a for a in applications if a.get('status') == 'in_progress'])
        completed = len([a for a in applications if a.get('status') == 'completed'])
        
        stats = {
            'total': total,
            'new': new_count,
            'in_progress': in_progress,
            'completed': completed
        }
        
        return render_template('admin/dashboard.html', applications=applications, stats=stats)
        
    except Exception as e:
        # Check if JWT expired error
        error_msg = str(e)
        if 'JWT expired' in error_msg or 'PGRST303' in error_msg:
            session.clear()
            return redirect(url_for('dashboard.login'))
        return render_template('admin/dashboard.html', applications=[], stats={}, error=error_msg)

@dashboard_bp.route('/admin/application/<int:app_id>')
@login_required
def view_application(app_id):
    """View single application details"""
    try:
        # Get authenticated client
        auth_client = get_auth_client()
        if not auth_client:
            return redirect(url_for('dashboard.login'))
        
        result = auth_client.table('visa_applications').select('*').eq('id', app_id).single().execute()
        application = result.data
        
        return render_template('admin/application_detail.html', application=application)
        
    except Exception as e:
        return f"Error loading application: {str(e)}", 404

@api_bp.route('/applications/refresh', methods=['GET'])
def refresh_applications():
    """API endpoint to fetch fresh dashboard data for real-time updates"""
    try:
        # Check for access token
        access_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not access_token:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        # Get authenticated client
        auth_client = supabase.postgrest.auth(access_token)
        
        # Fetch all applications
        result = auth_client.table('visa_applications').select('*').order('submitted_at', desc=True).execute()
        applications = result.data
        
        # Calculate stats
        total = len(applications)
        new = len([app for app in applications if app.get('status') == 'new'])
        in_progress = len([app for app in applications if app.get('status') == 'in_progress'])
        completed = len([app for app in applications if app.get('status') == 'completed'])
        
        return jsonify({
            'success': True,
            'applications': applications,
            'stats': {
                'total': total,
                'new': new,
                'in_progress': in_progress,
                'completed': completed
            }
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        # Check if JWT expired
        if 'JWT expired' in error_msg or 'PGRST303' in error_msg:
            return jsonify({'success': False, 'message': 'Session expired', 'expired': True}), 401
        return jsonify({'success': False, 'message': error_msg}), 500
