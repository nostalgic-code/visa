from app import create_app, db
from app.models import Admin
from werkzeug.security import generate_password_hash

app = create_app()

# Create tables and admin user
def init_db():
    with app.app_context():
        db.create_all()
        
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

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
