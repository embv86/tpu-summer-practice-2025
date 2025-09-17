from flask import Blueprint, request, jsonify
from .models import db, Carshow, Client, Color, Model, OptionSet, Option, Instance, CostToday, Sale
from datetime import datetime

api = Blueprint('api', __name__)

# --- CRUD для Carshows (Бренды) -------------------------------------------------------------------------------------

@api.route('/carshows', methods=['POST'])
def add_carshow():  
    data = request.get_json()
    if 'carshow_brand' not in data:
        return jsonify({'error': 'Missing carshow_brand'}), 400
    new_carshow = Carshow(carshow_brand=data['carshow_brand'])
    db.session.add(new_carshow)
    db.session.commit()
    return jsonify(new_carshow.to_dict()), 201

@api.route('/carshows', methods=['GET'])
def get_carshows():
    carshows = Carshow.query.all()
    return jsonify([cs.to_dict() for cs in carshows])

@api.route('/carshows/<int:id_carshow>', methods=['PUT'])
def update_carshow(id_carshow):
    carshow = Carshow.query.get_or_404(id_carshow)
    data = request.get_json()
    carshow.carshow_brand = data.get('carshow_brand', carshow.carshow_brand)
    db.session.commit()
    return jsonify(carshow.to_dict())

@api.route('/carshows/<int:id_carshow>', methods=['DELETE'])
def delete_carshow(id_carshow):
    carshow = Carshow.query.get_or_404(id_carshow)
    db.session.delete(carshow)
    db.session.commit()
    return '', 204

# --- CRUD для Clients (Клиенты) -------------------------------------------------------------------------------------

@api.route('/clients', methods=['POST'])
def add_client():
    data = request.get_json()
    if not all(key in data for key in ['first_name', 'last_name']):
        return jsonify({'error': 'Missing data. Required fields: first_name, last_name'}), 400

    new_client = Client(
        first_name=data['first_name'],
        last_name=data['last_name']
    )
    db.session.add(new_client)
    db.session.commit()
    return jsonify(new_client.to_dict()), 201

@api.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    return jsonify([client.to_dict() for client in clients])

@api.route('/clients/<int:id_client>', methods=['PUT'])
def update_client(id_client):
    client = Client.query.get_or_404(id_client)
    data = request.get_json()
    client.first_name = data.get('first_name', client.first_name)
    client.last_name = data.get('last_name', client.last_name)
    db.session.commit()
    return jsonify(client.to_dict())

@api.route('/clients/<int:id_client>', methods=['DELETE'])
def delete_client(id_client):
    client = Client.query.get_or_404(id_client)
    db.session.delete(client)
    db.session.commit()
    return '', 204

# --- CRUD для Colors (Цвета) ----------------------------------------------------------------------------------------

@api.route('/colors', methods=['POST'])
def add_color():
    data = request.get_json()
    if 'color' not in data:
        return jsonify({'error': 'Missing color name'}), 400

    if Color.query.filter_by(color=data['color']).first():
        return jsonify({'error': 'Color already exists'}), 409

    new_color = Color(color=data['color'])
    db.session.add(new_color)
    db.session.commit()
    return jsonify(new_color.to_dict()), 201

@api.route('/colors', methods=['GET'])
def get_colors():
    colors = Color.query.all()
    return jsonify([c.to_dict() for c in colors])

@api.route('/colors/<int:id_color>', methods=['PUT'])
def update_color(id_color):
    color = Color.query.get_or_404(id_color)
    data = request.get_json()
    new_color_name = data.get('color')

    if new_color_name and Color.query.filter_by(color=new_color_name).first():
        return jsonify({'error': 'Color name already in use'}), 409

    color.color = new_color_name or color.color
    db.session.commit()
    return jsonify(color.to_dict())

@api.route('/colors/<int:id_color>', methods=['DELETE'])
def delete_color(id_color):
    color = Color.query.get_or_404(id_color)
    db.session.delete(color)
    db.session.commit()
    return '', 204

# --- CRUD для Models (Модели автомобилей) ---------------------------------------------------------------------------

@api.route('/models', methods=['POST'])
def add_model():
    data = request.get_json()
    required = ['model', 'bodywork', 'id_carshow']
    if not all(field in data for field in required):
        return jsonify({'error': 'Missing data. Required: model, bodywork, id_carshow'}), 400
    if not Carshow.query.get(data['id_carshow']):
        return jsonify({'error': f"Carshow with id {data['id_carshow']} not found"}), 404
    new_model = Model(model=data['model'], bodywork=data['bodywork'], id_carshow=data['id_carshow'])
    db.session.add(new_model)
    db.session.commit()
    return jsonify(new_model.to_dict()), 201

@api.route('/models', methods=['GET'])
def get_models():
    models = Model.query.all()
    return jsonify([m.to_dict() for m in models])

@api.route('/models/<int:id_model>', methods=['PUT'])
def update_model(id_model):
    model = Model.query.get_or_404(id_model)
    data = request.get_json()
    model.model = data.get('model', model.model)
    model.bodywork = data.get('bodywork', model.bodywork)
    if 'id_carshow' in data and not Carshow.query.get(data['id_carshow']):
        return jsonify({'error': f"Carshow with id {data['id_carshow']} not found"}), 404
    model.id_carshow = data.get('id_carshow', model.id_carshow)
    db.session.commit()
    return jsonify(model.to_dict())

@api.route('/models/<int:id_model>', methods=['DELETE'])
def delete_model(id_model):
    model = Model.query.get_or_404(id_model)
    db.session.delete(model)
    db.session.commit()
    return '', 204

# --- CRUD для OptionSet (Наборы опций) ------------------------------------------------------------------------------

@api.route('/optionsets', methods=['POST'])
def add_optionset():
    data = request.get_json()
    if 'set_name' not in data:
        return jsonify({'error': 'Missing set_name'}), 400
    if OptionSet.query.filter_by(set_name=data['set_name']).first():
        return jsonify({'error': 'OptionSet with this name already exists'}), 409
    new_set = OptionSet(set_name=data['set_name'])
    db.session.add(new_set)
    db.session.commit()
    return jsonify(new_set.to_dict()), 201

@api.route('/optionsets', methods=['GET'])
def get_optionsets():
    sets = OptionSet.query.all()
    return jsonify([s.to_dict() for s in sets])

@api.route('/optionsets/<int:id_optionset>', methods=['PUT'])
def update_optionset(id_optionset):
    opt_set = OptionSet.query.get_or_404(id_optionset)
    data = request.get_json()
    new_name = data.get('set_name', opt_set.set_name)
    if new_name != opt_set.set_name and OptionSet.query.filter_by(set_name=new_name).first():
        return jsonify({'error': 'OptionSet name already in use'}), 409
    opt_set.set_name = new_name
    db.session.commit()
    return jsonify(opt_set.to_dict())

@api.route('/optionsets/<int:id_optionset>', methods=['DELETE'])
def delete_optionset(id_optionset):
    opt_set = OptionSet.query.get_or_404(id_optionset)
    db.session.delete(opt_set)
    db.session.commit()
    return '', 204

# --- CRUD для Option (Конкретные опции) -----------------------------------------------------------------------------

@api.route('/options', methods=['POST'])
def add_option():
    data = request.get_json()
    if not all(k in data for k in ['option', 'id_option_set']):
        return jsonify({'error': 'Missing data. Required: option, id_option_set'}), 400
    if not OptionSet.query.get(data['id_option_set']):
        return jsonify({'error': f"OptionSet with id {data['id_option_set']} not found"}), 404

    new_option = Option(option=data['option'], id_option_set=data['id_option_set'])
    db.session.add(new_option)
    db.session.commit()
    return jsonify(new_option.to_dict()), 201

@api.route('/options', methods=['GET'])
def get_options():
    set_id = request.args.get('set_id', type=int)
    if set_id:  options = Option.query.filter_by(id_option_set=set_id).all()
    else:   options = Option.query.all()
    return jsonify([opt.to_dict() for opt in options])

@api.route('/options/<int:id_option>', methods=['PUT'])
def update_option(id_option):
    option = Option.query.get_or_404(id_option)
    data = request.get_json()

    option.option = data.get('option', option.option)

    if 'id_option_set' in data:
        if not OptionSet.query.get(data['id_option_set']):
            return jsonify({'error': f"OptionSet with id {data['id_option_set']} not found"}), 404
        option.id_option_set = data['id_option_set']

    db.session.commit()
    return jsonify(option.to_dict())

@api.route('/options/<int:id_option>', methods=['DELETE'])
def delete_option(id_option):
    option = Option.query.get_or_404(id_option)
    db.session.delete(option)
    db.session.commit()
    return '', 204

# --- CRUD для Instances (Экземпляры автомобилей) --------------------------------------------------------------------

@api.route('/instances', methods=['POST'])
def add_instance():
    data = request.get_json()
    required = ['gearbox', 'id_model', 'id_color', 'id_option_set']
    if not all(field in data for field in required):
        return jsonify({'error': 'Missing data. Required: gearbox, id_model, id_color, id_option_set'}), 400

    if not Model.query.get(data['id_model']): return jsonify({'error': 'Model not found'}), 404
    if not Color.query.get(data['id_color']): return jsonify({'error': 'Color not found'}), 404
    if not OptionSet.query.get(data['id_option_set']): return jsonify({'error': 'OptionSet not found'}), 404

    new_instance = Instance(
        gearbox=data['gearbox'],
        id_model=data['id_model'],
        id_color=data['id_color'],
        id_option_set=data['id_option_set']
    )
    db.session.add(new_instance)
    db.session.commit()
    return jsonify(new_instance.to_dict()), 201

@api.route('/instances', methods=['GET'])
def get_instances():
    instances = Instance.query.all()
    return jsonify([i.to_dict() for i in instances])

@api.route('/instances/<int:id_instance>', methods=['PUT'])
def update_instance(id_instance):
    instance = Instance.query.get_or_404(id_instance)
    data = request.get_json()

    if 'id_model' in data and not Model.query.get(data['id_model']): return jsonify({'error': 'Model not found'}), 404
    if 'id_color' in data and not Color.query.get(data['id_color']): return jsonify({'error': 'Color not found'}), 404
    if 'id_option_set' in data and not OptionSet.query.get(data['id_option_set']): return jsonify(
        {'error': 'OptionSet not found'}), 404

    # Обновляем поля
    instance.gearbox = data.get('gearbox', instance.gearbox)
    instance.id_model = data.get('id_model', instance.id_model)
    instance.id_color = data.get('id_color', instance.id_color)
    instance.id_option_set = data.get('id_option_set', instance.id_option_set)

    db.session.commit()
    return jsonify(instance.to_dict())

@api.route('/instances/<int:id_instance>', methods=['DELETE'])
def delete_instance(id_instance):
    instance = Instance.query.get_or_404(id_instance)
    db.session.delete(instance)
    db.session.commit()
    return '', 204

# --- CRUD для CostToday (Цены) -------------------------------------------------------------------------------------

@api.route('/costs', methods=['POST'])
def add_cost():
    data = request.get_json()
    required = ['id_instance', 'date', 'price']
    if not all(field in data for field in required):
        return jsonify({'error': 'Missing data. Required: id_instance, date, price'}), 400

    if not Instance.query.get(data['id_instance']):
        return jsonify({'error': 'Instance not found'}), 404

    try:
        date_obj = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    existing_cost = CostToday.query.filter_by(id_instance=data['id_instance'], date=date_obj).first()
    if existing_cost:
        return jsonify({'error': 'Cost for this instance on this date already exists'}), 409

    new_cost = CostToday(
        id_instance=data['id_instance'],
        date=date_obj,
        price=data['price']
    )
    db.session.add(new_cost)
    db.session.commit()
    return jsonify(new_cost.to_dict()), 201

@api.route('/costs', methods=['GET'])
def get_costs():
    instance_id = request.args.get('instance_id', type=int)
    if instance_id:
        costs = CostToday.query.filter_by(id_instance=instance_id).all()
    else:
        costs = CostToday.query.all()
    return jsonify([c.to_dict() for c in costs])

@api.route('/costs/<int:id>', methods=['PUT'])
def update_cost(id):
    cost = CostToday.query.get_or_404(id)
    data = request.get_json()

    if 'price' in data:
        cost.price = data['price']

    if 'date' in data:
        try:
            date_obj = datetime.strptime(data['date'], '%Y-%m-%d').date()
            cost.date = date_obj
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    if 'id_instance' in data:
        if not Instance.query.get(data['id_instance']):
            return jsonify({'error': 'Instance not found'}), 404
        cost.id_instance = data['id_instance']

    db.session.commit()
    return jsonify(cost.to_dict())

@api.route('/costs/<int:id>', methods=['DELETE'])
def delete_cost(id):
    cost = CostToday.query.get_or_404(id)
    db.session.delete(cost)
    db.session.commit()
    return '', 204

# --- CRUD для Sales (Продажи) --------------------------------------------------------------------------------------

@api.route('/sales', methods=['POST'])
def add_sale():
    data = request.get_json()
    required = ['id_instance', 'date_of_sale', 'id_client']
    if not all(field in data for field in required):
        return jsonify({'error': 'Missing data. Required: id_instance, date_of_sale, id_client'}), 400
    if not Instance.query.get(data['id_instance']): return jsonify({'error': 'Instance not found'}), 404
    if not Client.query.get(data['id_client']): return jsonify({'error': 'Client not found'}), 404
    if Sale.query.get(data['id_instance']):
        return jsonify({'error': 'This instance has already been sold'}), 409
    try:
        date_obj = datetime.strptime(data['date_of_sale'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    new_sale = Sale(id_instance=data['id_instance'], date_of_sale=date_obj, id_client=data['id_client'])
    db.session.add(new_sale)
    db.session.commit()
    return jsonify(new_sale.to_dict()), 201

@api.route('/sales', methods=['GET'])
def get_sales():
    sales = Sale.query.all()
    return jsonify([s.to_dict() for s in sales])

@api.route('/sales/<int:id>', methods=['PUT'])
def update_sale(id):
    sale = Sale.query.get_or_404(id)
    data = request.get_json()

    if 'id_client' in data:
        if not Client.query.get(data['id_client']):
            return jsonify({'error': 'Client not found'}), 404
        sale.id_client = data['id_client']

    if 'date_of_sale' in data:
        try:
            sale.date_of_sale = datetime.strptime(data['date_of_sale'], '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    if 'id_instance' in data:
        if not Instance.query.get(data['id_instance']):
            return jsonify({'error': 'Instance not found'}), 404
        existing_sale = Sale.query.filter(Sale.id_instance == data['id_instance'], Sale.id_sale != id).first()
        if existing_sale:
            return jsonify({'error': 'This instance has already been sold'}), 409
        sale.id_instance = data['id_instance']

    db.session.commit()
    return jsonify(sale.to_dict())

@api.route('/sales/<int:id_sale>', methods=['DELETE'])
def delete_sale(id_sale):
    sale = Sale.query.get_or_404(id_sale)
    db.session.delete(sale)
    db.session.commit()
    return '', 204