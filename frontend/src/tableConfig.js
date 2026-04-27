export const tableConfig = {
    carshows: {
        displayName: 'Салоны',
        primaryKey: 'id_carshow',
        displayColumn: 'carshow_brand',
        columns: [
            { key: 'id_carshow', name: 'ID' },
            { key: 'carshow_brand', name: 'Бренд салона' },
        ],
        relations: ['Модели 1:М'],
    },
    models: {
        displayName: 'Модели',
        primaryKey: 'id_model',
        displayColumn: (item) => `${item.model} (${item.bodywork})`,
        columns: [
            { key: 'id_model', name: 'ID' },
            { key: 'id_carshow', name: 'Бренд (ID)', isForeignKey: true, references: 'carshows' },
            { key: 'model', name: 'Название модели' },
            { key: 'bodywork', name: 'Тип кузова' },
        ],
        relations: ['Салоны М:1', 'Экземпляры 1:М'],
    },
    clients: {
        displayName: 'Клиенты',
        primaryKey: 'id_client',
        displayColumn: (item) => `${item.last_name} ${item.first_name}`,
        columns: [
            { key: 'id_client', name: 'ID' },
            { key: 'last_name', name: 'Фамилия' },
            { key: 'first_name', name: 'Имя' },
        ],
        relations: ['Продажи 1:М'],
    },
    colors: {
        displayName: 'Цвета',
        primaryKey: 'id_color',
        displayColumn: 'color',
        columns: [
            { key: 'id_color', name: 'ID' },
            { key: 'color', name: 'Название цвета' },
        ],
        relations: ['Экземпляры 1:М'],
    },
    optionsets: {
        displayName: 'Наборы опций',
        primaryKey: 'id_option_set',
        displayColumn: 'set_name',
        columns: [
            { key: 'id_option_set', name: 'ID' },
            { key: 'set_name', name: 'Название набора' },
        ],
        relations: ['Опции 1:М', 'Экземпляры 1:М'],
    },
    options: {
        displayName: 'Опции',
        primaryKey: 'id_option',
        displayColumn: 'option',
        columns: [
            { key: 'id_option', name: 'ID' },
            { key: 'id_option_set', name: 'Набор (ID)', isForeignKey: true, references: 'optionsets' },
            { key: 'option', name: 'Название опции' },
        ],
        relations: ['Наборы опций М:1'],
    },
    instances: {
        displayName: 'Экземпляры',
        primaryKey: 'id_instance',
        displayColumn: (item) => `ID Экземпляра ${item.id_instance}`,
        columns: [
            { key: 'id_instance', name: 'ID' },
            { key: 'id_model', name: 'Модель (ID)', isForeignKey: true, references: 'models' },
            { key: 'id_color', name: 'Цвет (ID)', isForeignKey: true, references: 'colors' },
            { key: 'id_option_set', name: 'Набор опций (ID)', isForeignKey: true, references: 'optionsets' },
            { key: 'gearbox', name: 'Коробка передач' },
        ],
        relations: ['Модели М:1', 'Цвета М:1', 'Наборы опций М:1', 'Цены 1:М', 'Продажи 1:1'],
    },
    costs: {
        displayName: 'Цены',
        primaryKey: 'id_price',
        displayColumn: (item) => `Цена #${item.id_price}`,
        columns: [
            { key: 'id_price', name: 'ID' },
            { key: 'id_instance', name: 'Экземпляр (ID)', isForeignKey: true, references: 'instances' },
            { key: 'date', name: 'Дата' },
            { key: 'price', name: 'Цена' },
        ],
        relations: ['Экземпляры М:1'],
    },
    sales: {
        displayName: 'Продажи',
        primaryKey: 'id_sale',
        displayColumn: (item) => `Продажа #${item.id_sale}`,
        columns: [
            { key: 'id_sale', name: 'ID' },
            { key: 'id_instance', name: 'Проданный экземпляр (ID)', isForeignKey: true, references: 'instances' },
            { key: 'id_client', name: 'Клиент (ID)', isForeignKey: true, references: 'clients' },
            { key: 'date_of_sale', name: 'Дата продажи' },
        ],
        relations: ['Экземпляры 1:1', 'Клиенты М:1'],
    },
};