from . import db

# 1. Таблица Carshows (Автосалоны/Бренды)
class Carshow(db.Model):
    __tablename__ = 'Carshows'

    id_carshow = db.Column(db.Integer, primary_key=True)
    carshow_brand = db.Column(db.String(255), nullable=False)

    models = db.relationship('Model', back_populates='carshow')

    def to_dict(self):
        return {
            'id_carshow': self.id_carshow,
            'carshow_brand': self.carshow_brand
        }

# 2. Таблица Models (Модели автомобилей)
class Model(db.Model):
    __tablename__ = 'Models'

    id_model = db.Column(db.Integer, primary_key=True)
    model = db.Column(db.String(255), nullable=False)
    bodywork = db.Column(db.String(255), nullable=False)

    id_carshow = db.Column(db.Integer, db.ForeignKey('Carshows.id_carshow'), nullable=False)

    carshow = db.relationship('Carshow', back_populates='models')
    instances = db.relationship('Instance', back_populates='model')

    def to_dict(self):
        return {
            'id_model': self.id_model,
            'model': self.model,
            'bodywork': self.bodywork,
            'id_carshow': self.id_carshow
        }

# 3. Таблица Colors (Цвета)
class Color(db.Model):
    __tablename__ = 'Colors'

    id_color = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.String(255), nullable=False, unique=True)

    instances = db.relationship('Instance', back_populates='color')

    def to_dict(self):
        return {
            'id_color': self.id_color,
            'color': self.color
        }

# 4. Таблица Option_sets (Наборы опций)
class OptionSet(db.Model):
    __tablename__ = 'Option_sets'

    id_option_set = db.Column(db.Integer, primary_key=True)
    set_name = db.Column(db.String(255), nullable=False, unique=True)

    instances = db.relationship('Instance', back_populates='option_set')
    options = db.relationship('Option', back_populates='option_set')

    def to_dict(self):
        return {
            'id_option_set': self.id_option_set,
            'set_name': self.set_name
        }

# 5. Таблица Options (Конкретные опции в наборе)
class Option(db.Model):
    __tablename__ = 'Options'

    id_option = db.Column(db.Integer, primary_key=True, autoincrement=True)
    option = db.Column(db.String(255), nullable=False)

    id_option_set = db.Column(db.Integer, db.ForeignKey('Option_sets.id_option_set'), nullable=False)

    option_set = db.relationship('OptionSet', back_populates='options')

    def to_dict(self):
        return {
            'id_option': self.id_option,
            'option': self.option,
            'id_option_set': self.id_option_set
        }

# 6. Таблица Clients (Клиенты)
class Client(db.Model):
    __tablename__ = 'Clients'

    id_client = db.Column(db.Integer, primary_key=True)
    last_name = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(255), nullable=False)

    sales = db.relationship('Sale', back_populates='client')

    def to_dict(self):
        return {
            'id_client': self.id_client,
            'last_name': self.last_name,
            'first_name': self.first_name
        }

# 7. Таблица Instances (Экземпляры автомобилей)
class Instance(db.Model):
    __tablename__ = 'Instances'

    id_instance = db.Column(db.Integer, primary_key=True)
    gearbox = db.Column(db.String(255), nullable=False)

    id_model = db.Column(db.Integer, db.ForeignKey('Models.id_model'), nullable=False)
    id_color = db.Column(db.Integer, db.ForeignKey('Colors.id_color'), nullable=False)
    id_option_set = db.Column(db.Integer, db.ForeignKey('Option_sets.id_option_set'), nullable=False)

    model = db.relationship('Model', back_populates='instances')
    color = db.relationship('Color', back_populates='instances')
    option_set = db.relationship('OptionSet', back_populates='instances')

    costs = db.relationship('CostToday', back_populates='instance')
    sale = db.relationship('Sale', uselist=False, back_populates='instance')

    def to_dict(self):
        return {
            'id_instance': self.id_instance,
            'gearbox': self.gearbox,
            'id_model': self.id_model,
            'id_color': self.id_color,
            'id_option_set': self.id_option_set
        }

# 8. Таблица Cost_today (История цен)
class CostToday(db.Model):
    __tablename__ = 'Cost_today'

    id_price = db.Column(db.Integer, primary_key=True)

    id_instance = db.Column(db.Integer, db.ForeignKey('Instances.id_instance'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    price = db.Column(db.Numeric(12, 2), nullable=False)

    instance = db.relationship('Instance', back_populates='costs')

    def to_dict(self):
        return {
            'id_price': self.id_price,
            'id_instance': self.id_instance,
            'date': self.date.isoformat(),
            'price': float(self.price)
        }

# 9. Таблица Sales (Продажи)
class Sale(db.Model):
    __tablename__ = 'Sales'

    id_sale = db.Column(db.Integer, primary_key=True)
    id_instance = db.Column(db.Integer, db.ForeignKey('Instances.id_instance'), nullable=False, unique=True)
    date_of_sale = db.Column(db.Date, nullable=False)
    id_client = db.Column(db.Integer, db.ForeignKey('Clients.id_client'), nullable=False)

    instance = db.relationship('Instance', back_populates='sale')
    client = db.relationship('Client', back_populates='sales')

    def to_dict(self):
        return {
            'id_sale': self.id_sale,
            'id_instance': self.id_instance,
            'date_of_sale': self.date_of_sale.isoformat(),
            'id_client': self.id_client
        }