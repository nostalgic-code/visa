from run import app, init_db

# Initialize the database
with app.app_context():
    init_db()

if __name__ == "__main__":
    app.run()
