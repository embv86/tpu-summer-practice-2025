# Веб-приложение для управления базой данных «Автосалон»

Учебный проект по разработке и модульному тестированию полнофункционального клиент-серверного веб-приложения для автоматизации работы автосалона (ТПУ).

---

## Стек технологий

- **Backend:**
  - Язык: Python 3.13
  - Веб-фреймворк: Flask
  - ORM: SQLAlchemy (Flask-SQLAlchemy)
  - СУБД: PostgreSQL (основная), SQLite in-memory (тестовая)
  - Драйверы БД: `psycopg` (v3), `psycopg2-binary`
  - Дополнительно: `python-dotenv`, `Flask-CORS`

- **Frontend:**
  - Библиотека: React 19
  - Сборщик: Vite
  - UI-библиотека: Material UI (MUI), Emotion
  - HTTP-клиент: Axios
  - Работа с датами: `@mui/x-date-pickers`, `date-fns`

- **Тестирование:**
  - Фреймворк: `pytest` (11 автоматизированных модульных тестов)
  - Изоляция: фикстуры с in-memory базой данных SQLite

---

## Структура проекта

```text
tpu-summer-practice-2025/
├── backend/                         # Серверная часть (Flask)
│   ├── app/
│   │   ├── __init__.py              # Фабрика приложения create_app()
│   │   ├── models.py                # Описание 9 моделей SQLAlchemy
│   │   └── routes.py                # REST API эндпоинты (CRUD)
│   ├── tests/                       # Модульные тесты
│   │   ├── conftest.py              # Pytest-фикстуры и in-memory SQLite БД
│   │   └── test_api.py              # 11 модульных тестов API
│   ├── .env                         # Конфигурация подключения к PostgreSQL
│   ├── pytest.ini                   # Конфигурация запуска тестов
│   ├── requirements.txt             # Зависимости Python
│   └── run.py                       # Точка входа для запуска сервера
│
├── frontend/                        # Клиентская часть (React + Vite)
│   ├── src/
│   │   ├── components/              # React-компоненты (таблицы, диалоги, формы)
│   │   ├── services/                # apiService.js (Axios CRUD клиент)
│   │   ├── App.jsx                  # Главный компонент с темой оформления
│   │   ├── main.jsx                 # Точка входа React
│   │   └── tableConfig.js           # Метаданные и настройки отображения таблиц
│   ├── index.html                   # HTML-шаблон
│   ├── package.json                 # Зависимости Node.js
│   └── vite.config.js               # Конфигурация сборщика Vite
│
├── .gitignore                       # Игнорируемые файлы (venv, node_modules и т.д.)
├── Отчет_Модульное_тестирование.docx# Официальный отчет по тестированию
└── README.md                        # Документация проекта
```

---

## Структура базы данных

Информационная модель включает 9 связанных таблиц:
1. **Carshows** — бренды производителей автомобилей.
2. **Models** — модели автомобилей (связаны с брендом).
3. **Colors** — справочник уникальных цветов кузова.
4. **Option_sets** — пакеты комплектаций (наборы опций).
5. **Options** — конкретные опции, входящие в набор.
6. **Clients** — база клиентов/покупателей.
7. **Instances** — физические автомобили в наличии (модель, цвет, комплектация, КПП).
8. **Cost_today** — история изменения стоимости автомобиля на дату.
9. **Sales** — договоры продажи автомобилей клиентам.

---

## Установка и запуск

### 1. Предварительные требования
- Установленный **Python 3.10+** (рекомендуется 3.13)
- Установленный **Node.js** (LTS 20+)
- Установленная СУБД **PostgreSQL** на порту `5432`

### 2. Запуск Backend (Flask)

1. Откройте терминал в корне проекта и активируйте виртуальное окружение:
   ```powershell
   cd backend
   ..\.venv\Scripts\Activate.ps1
   ```
2. Установите зависимости (если окружение новое):
   ```powershell
   pip install -r requirements.txt
   ```
3. Запустите сервер:
   ```powershell
   python run.py
   ```
Сервер будет доступен по адресу: **`http://127.0.0.1:5000`**.

### 3. Запуск Frontend (React + Vite)

1. Откройте второй терминал:
   ```powershell
   cd frontend
   ```
2. Установите зависимости npm (при первом запуске):
   ```powershell
   npm install
   ```
3. Запустите dev-сервер:
   ```powershell
   npm run dev
   ```
Приложение откроется в браузере по адресу: **`http://localhost:5173`**.

---

## Запуск модульных тестов (pytest)

Тесты полностью изолированы и используют виртуальную базу данных SQLite in-memory, поэтому они не требуют запущенного сервера и не изменяют данные в PostgreSQL.

Для запуска тестов выполните из корня проекта:
```powershell
.venv\Scripts\pytest backend -v
```

Или из папки `backend`:
```powershell
cd backend
..\.venv\Scripts\pytest -v
```

### Список тестов:
| Тест | Проверяемая логика |
|---|---|
| `test_01_AddCarshow_success` | Успешное создание записи бренда (статус 201) |
| `test_02_AddCarshow_missing_brand_returns_400` | Валидация обязательного поля `carshow_brand` (статус 400) |
| `test_03_AddModel_nonexistent_carshow_returns_404` | Проверка целостности внешнего ключа бренда (статус 404) |
| `test_04_AddColor_duplicate_returns_409` | Запрет дублирования цветов в справочнике (статус 409) |
| `test_05_AddOptionSet_success` | Создание набора опций (статус 201) |
| `test_06_AddOption_links_to_optionset` | Корректная привязка опции к набору (статус 201) |
| `test_07_AddInstance_invalid_foreign_keys_returns_404` | Проверка внешних связей экземпляра автомобиля (статус 404) |
| `test_08_AddCost_invalid_date_format_returns_400` | Валидация формата даты цены `YYYY-MM-DD` (статус 400) |
| `test_09_AddCost_duplicate_date_returns_409` | Запрет двух цен для авто в одну и ту же дату (статус 409) |
| `test_10_AddSale_success_and_prevent_duplicate_sale` | Успешная продажа и запрет повторной продажи авто (статус 409) |
| `test_11_DeleteCarshow_success_returns_204` | Успешное удаление бренда из базы (статус 204) |
