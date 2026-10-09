import pytest
from app import create_app, db

@pytest.fixture
def app():
    """Создание тестового экземпляра Flask-приложения с in-memory базой данных SQLite."""
    test_config = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False
    }
    app_instance = create_app(test_config=test_config)

    with app_instance.app_context():
        db.create_all()
        yield app_instance
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Тестовый клиент для отправки HTTP-запросов к API."""
    return app.test_client()
