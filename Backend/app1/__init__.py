from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Import routes only after app is created to avoid circular imports
from . import routes

# Register routes with the Flask app
# app.register_blueprint(routes.bp)