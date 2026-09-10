CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(255),
    name VARCHAR(255),
    price DECIMAL(10,2),
    category VARCHAR(255),
    image TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    amount DECIMAL(10,2),
    status VARCHAR(50)
);
