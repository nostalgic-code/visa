from app import create_app, db
from app.models import Admin
from werkzeug.security import generate_password_hash

app = create_app()

# Create tables and admin user
def init_db():
    try:
        # Create all tables
        db.create_all()
        print("Database tables created successfully")
        
        # Check if admin user exists
        admin = Admin.query.filter_by(email='admin@example.com').first()
        if not admin:
            admin = Admin(
                email='admin@example.com',
                name='Admin',
                password=generate_password_hash('your-secure-password', method='sha256')
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully")
        else:
            print("Admin user already exists")
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        # Re-raise the exception for proper error handling
        raise

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
