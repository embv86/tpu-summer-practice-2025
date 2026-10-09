import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()

def create_app(test_config=None):
    app = Flask(__name__)

    db_url = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG'] = True

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    CORS(app)

    from .routes import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app