import pytest

# Вспомогательная функция для создания базового экземпляра авто и связанных сущностей
def create_base_instance(client):
    # 1. Автосалон (бренд)
    r_cs = client.post('/api/carshows', json={'carshow_brand': 'Mercedes-Benz'})
    cs_id = r_cs.get_json()['id_carshow']

    # 2. Модель авто
    r_m = client.post('/api/models', json={'model': 'E-Class', 'bodywork': 'Седан', 'id_carshow': cs_id})
    m_id = r_m.get_json()['id_model']

    # 3. Цвет кузова
    r_c = client.post('/api/colors', json={'color': 'Черный металлик'})
    c_id = r_c.get_json()['id_color']

    # 4. Набор опций
    r_os = client.post('/api/optionsets', json={'set_name': 'AMG Line'})
    os_id = r_os.get_json()['id_option_set']

    # 5. Экземпляр авто
    r_inst = client.post('/api/instances', json={
        'gearbox': 'Автомат',
        'id_model': m_id,
        'id_color': c_id,
        'id_option_set': os_id
    })
    inst_id = r_inst.get_json()['id_instance']
    return cs_id, m_id, c_id, os_id, inst_id


# --- 1. Тестирование создания автосалона (Carshows) ---
def test_01_AddCarshow_success(client):
    """Тест 1: Успешное создание записи автосалона (бренда) и возврат кода 201."""
    response = client.post('/api/carshows', json={'carshow_brand': 'Audi'})
    assert response.status_code == 201
    data = response.get_json()
    assert 'id_carshow' in data
    assert data['carshow_brand'] == 'Audi'


# --- 2. Тестирование валидации обязательных полей автосалона ---
def test_02_AddCarshow_missing_brand_returns_400(client):
    """Тест 2: Возврат ошибки 400 при отсутствии обязательного поля carshow_brand."""
    response = client.post('/api/carshows', json={})
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data
    assert data['error'] == 'Missing carshow_brand'


# --- 3. Тестирование добавления модели с валидацией внешнего ключа (FK) ---
def test_03_AddModel_nonexistent_carshow_returns_404(client):
    """Тест 3: Возврат ошибки 404 при попытке привязать модель к несуществующему автосалону."""
    response = client.post('/api/models', json={
        'model': 'A6',
        'bodywork': 'Седан',
        'id_carshow': 999
    })
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data
    assert 'not found' in data['error']


# --- 4. Тестирование предотвращения дубликатов цветов ---
def test_04_AddColor_duplicate_returns_409(client):
    """Тест 4: Возврат ошибки 409 Conflict при попытке создания дублирующегося цвета."""
    first = client.post('/api/colors', json={'color': 'Белый перламутр'})
    assert first.status_code == 201

    duplicate = client.post('/api/colors', json={'color': 'Белый перламутр'})
    assert duplicate.status_code == 409
    assert duplicate.get_json()['error'] == 'Color already exists'


# --- 5. Тестирование создания набора опций ---
def test_05_AddOptionSet_success(client):
    """Тест 5: Успешное создание набора опций."""
    response = client.post('/api/optionsets', json={'set_name': 'Зимний пакет'})
    assert response.status_code == 201
    data = response.get_json()
    assert 'id_option_set' in data
    assert data['set_name'] == 'Зимний пакет'


# --- 6. Тестирование добавления конкретной опции в набор ---
def test_06_AddOption_links_to_optionset(client):
    """Тест 6: Создание опции и её корректная привязка к существующему набору опций."""
    set_resp = client.post('/api/optionsets', json={'set_name': 'Комфорт'})
    set_id = set_resp.get_json()['id_option_set']

    opt_resp = client.post('/api/options', json={
        'option': 'Подогрев сидений',
        'id_option_set': set_id
    })
    assert opt_resp.status_code == 201
    data = opt_resp.get_json()
    assert data['option'] == 'Подогрев сидений'
    assert data['id_option_set'] == set_id


# --- 7. Тестирование валидации связей экземпляра автомобиля ---
def test_07_AddInstance_invalid_foreign_keys_returns_404(client):
    """Тест 7: Возврат ошибки 404 при попытке создать экземпляр с несуществующей моделью."""
    response = client.post('/api/instances', json={
        'gearbox': 'Автомат',
        'id_model': 999,
        'id_color': 1,
        'id_option_set': 1
    })
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Model not found'


# --- 8. Тестирование валидации формата даты стоимости автомобиля ---
def test_08_AddCost_invalid_date_format_returns_400(client):
    """Тест 8: Возврат ошибки 400 при неверном формате даты (требуется YYYY-MM-DD)."""
    _, _, _, _, inst_id = create_base_instance(client)

    response = client.post('/api/costs', json={
        'id_instance': inst_id,
        'date': '10-05-2026',  # Неверный формат даты
        'price': 4500000.00
    })
    assert response.status_code == 400
    assert 'Invalid date format' in response.get_json()['error']


# --- 9. Тестирование предотвращения дублирования цен на одну дату ---
def test_09_AddCost_duplicate_date_returns_409(client):
    """Тест 9: Запрет установки двух цен для одного экземпляра в одну и ту же дату (409 Conflict)."""
    _, _, _, _, inst_id = create_base_instance(client)

    first = client.post('/api/costs', json={
        'id_instance': inst_id,
        'date': '2026-05-15',
        'price': 4500000.00
    })
    assert first.status_code == 201

    duplicate = client.post('/api/costs', json={
        'id_instance': inst_id,
        'date': '2026-05-15',
        'price': 4600000.00
    })
    assert duplicate.status_code == 409
    assert 'already exists' in duplicate.get_json()['error']


# --- 10. Тестирование продажи автомобиля и запрета повторной продажи ---
def test_10_AddSale_success_and_prevent_duplicate_sale(client):
    """Тест 10: Успешная продажа авто и возврат 409 при попытке повторно продать тот же авто."""
    _, _, _, _, inst_id = create_base_instance(client)

    # Создаем двух клиентов
    c1 = client.post('/api/clients', json={'first_name': 'Алексей', 'last_name': 'Смирнов'}).get_json()['id_client']
    c2 = client.post('/api/clients', json={'first_name': 'Дмитрий', 'last_name': 'Кузнецов'}).get_json()['id_client']

    # Первая продажа - успешно
    sale_resp = client.post('/api/sales', json={
        'id_instance': inst_id,
        'id_client': c1,
        'date_of_sale': '2026-05-20'
    })
    assert sale_resp.status_code == 201
    assert sale_resp.get_json()['id_instance'] == inst_id

    # Вторая продажа того же автомобиля - отказ
    sale_dup = client.post('/api/sales', json={
        'id_instance': inst_id,
        'id_client': c2,
        'date_of_sale': '2026-05-21'
    })
    assert sale_dup.status_code == 409
    assert 'already been sold' in sale_dup.get_json()['error']


# --- 11. Тестирование удаления автосалона (DELETE) ---
def test_11_DeleteCarshow_success_returns_204(client):
    """Тест 11: Успешное удаление автосалона и возврат статуса 204 No Content."""
    cs = client.post('/api/carshows', json={'carshow_brand': 'Lexus'}).get_json()
    cs_id = cs['id_carshow']

    delete_resp = client.delete(f'/api/carshows/{cs_id}')
    assert delete_resp.status_code == 204

    # Проверка отсутствия в списке
    list_resp = client.get('/api/carshows')
    assert all(item['id_carshow'] != cs_id for item in list_resp.get_json())
