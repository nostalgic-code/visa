# VisaPro Amahle Backend - Setup Guide

## Overview
Flask backend with Supabase integration for visa application management and admin dashboard.

## Features
- ✅ Form submission API endpoints
- ✅ Supabase database integration
- ✅ Admin dashboard with authentication
- ✅ Real-time status updates
- ✅ Application management interface

## Prerequisites
- Python 3.8+
- Supabase account
- pip (Python package manager)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Go to Project Settings → API
4. Copy your:
   - Project URL
   - `anon/public` key

### 2. Enable Supabase Auth and Create Admin User

1. In your Supabase project, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter admin email and password (e.g., admin@visaproamahle.co.za)
4. Click **Create user**
5. ✅ Confirm email verification (check "Auto-confirm user" if needed for development)

**Note**: This user will be used to log into the admin dashboard.

### 3. Create Database Table

In your Supabase SQL Editor, run this SQL:

```sql
-- Create visa_applications table
CREATE TABLE visa_applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country_applying_from TEXT,
  passport_country TEXT,
  destination TEXT,
  return_date DATE,
  visa_type TEXT,
  communication_method TEXT,
  message TEXT,
  form_type TEXT,
  status TEXT DEFAULT 'new',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_submitted_at ON visa_applications(submitted_at DESC);
CREATE INDEX idx_status ON visa_applications(status);
CREATE INDEX idx_form_type ON visa_applications(form_type);

-- Enable Row Level Security (RLS)
ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for form submissions)
CREATE POLICY "Allow public inserts" ON visa_applications
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create policy to allow admin to read all
CREATE POLICY "Allow authenticated read" ON visa_applications
  FOR SELECT TO authenticated
  USING (true);

-- Create policy to allow admin to update
CREATE POLICY "Allow authenticated update" ON visa_applications
  FOR UPDATE TO authenticated
  USING (true);
```

**Important**: The RLS policies require the `authenticated` role, which is automatically assigned when users sign in with Supabase Auth.

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SECRET_KEY=your_random_secret_key_here
FLASK_ENV=development
```

**Note**: Admin credentials are now managed through Supabase Auth (created in Step 2), not environment variables.

### 5. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 6. Run the Application

**Development:**
```bash
python run.py
```

The server will start on `http://localhost:5000`

**Production (with Gunicorn):**
```bash
gunicorn --bind 0.0.0.0:5000 wsgi:app
```

## API Endpoints

### Public Endpoints

**Submit Visa Application**
```
POST /api/visa
Content-Type: application/x-www-form-urlencoded

Form fields:
- name (required)
- email (required)
- phone (required)
- countryApplyingFrom
- passportCountry
- destination
- returnDate
- visaType
- communicationMethod
- message (optional)
```

### Admin Endpoints

**Login**
```
GET/POST /admin/login
```

**Dashboard**
```
GET /admin
Requires: Authentication
```

**View Application Details**
```
GET /admin/application/<id>
Requires: Authentication
```

**Update Application Status**
```
PUT /api/applications/<id>/status
Content-Type: application/json

{
  "status": "new|in_progress|completed|cancelled"
}
```

## Admin Dashboard Access

1. Navigate to: `http://localhost:5000/admin/login`
2. Login with your Supabase Auth credentials (created in Setup Step 2)
3. View and manage all visa applications

**Authentication**: The dashboard uses Supabase Auth for secure authentication. Only users created in your Supabase Auth dashboard can access the admin panel.

## Dashboard Features

- **Statistics Dashboard**: View total, new, in-progress, and completed applications
- **Application Table**: See all submissions with key information
- **Status Management**: Update application status directly from the dashboard
- **Detailed View**: Click any application to see full details
- **Real-time Updates**: Status changes reflect immediately

## Frontend Integration

Update your frontend form action URLs to point to:
```
http://your-backend-url/api/visa
```

Example:
```html
<form action="http://localhost:5000/api/visa" method="POST">
  <!-- form fields -->
</form>
```

## Deployment

### Render.com (Recommended)

1. Push code to GitHub
2. Connect Render to your repository
3. Create new Web Service
4. Set environment variables in Render dashboard
5. Deploy!

### Other Platforms

The app is compatible with:
- Heroku
- Railway
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

## Troubleshooting

**Can't connect to Supabase:**
- Verify your `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check that RLS policies are correctly set up
- Ensure your Supabase project is active

**Login not working:**
- Verify the user exists in Supabase Auth → Users
- Ensure the user's email is confirmed
- Check that you're using the correct email/password
- Clear browser cookies/session and try again
- Check browser console for JavaScript errors

**Form submissions failing:**
- Check CORS settings if calling from different domain
- Verify all required fields are being sent
- Check Supabase table exists and RLS policies allow inserts
visaproSolutions
## Security Notes

- ✅ **Supabase Auth**: Admin authentication now uses Supabase's secure auth system
- Use strong passwords for admin users in Supabase Auth
- Use a strong random `SECRET_KEY` in production
- Enable HTTPS in production
- Enable email confirmation for new admin users in production
- Consider implementing rate limiting for API endpoints
- Review Supabase RLS policies for your security requirements
- Regularly audit admin users in Supabase Auth dashboard

## Support

For issues or questions, contact: info@visaproamahle.co.za
