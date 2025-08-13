import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Универсальные функции для CRUD операций
export const apiService = {
    // Получить все записи для сущности (например, '/carshows')
    getAll: (resource) => apiClient.get(`/${resource}`),

    // Получить одну запись по ID
    getById: (resource, id) => apiClient.get(`/${resource}/${id}`),

    // Создать новую запись
    create: (resource, data) => apiClient.post(`/${resource}`, data),

    // Обновить запись по ID
    update: (resource, id, data) => apiClient.put(`/${resource}/${id}`, data),

    // Удалить запись по ID
    delete: (resource, id) => apiClient.delete(`/${resource}/${id}`),
};