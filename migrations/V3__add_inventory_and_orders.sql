-- Add stock column to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Create order_items table to properly track which products were bought in an order
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Insert seed products with stock (Using UPSERT so it can be re-run safely)
INSERT INTO products (id, sku, name, price, category, image, description, stock) VALUES
  (1, 'MON-001', 'UltraWide Pro Display', 899.99, 'Monitors', 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=500&q=80', '34-inch curved professional display', 50),
  (2, 'CHAS-001','Open Frame Chassis', 249.99, 'Case', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80', 'Premium open-air desktop chassis', 20),
  (3, 'KEY-001', 'Mechanical Tech Keyboard', 149.99, 'Keyboards', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', 'RGB tactile switches, aluminium body', 100),
  (4, 'MOU-001', 'Ergo Wireless Mouse', 79.99, 'Accessories', 'https://images.unsplash.com/photo-1615663245857-ac931003185c?w=500&q=80', 'Precision sensor and ergonomic grip', 150),
  (5, 'GPU-001', 'RTX Pro Graphics Card', 1199.99, 'Components', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80', 'Next-gen ray tracing performance', 10),
  (6, 'HDP-001', 'Studio Headphones', 199.99, 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80', 'High-fidelity sound for creators', 75)
ON CONFLICT (id) DO UPDATE
  SET sku=EXCLUDED.sku, name=EXCLUDED.name, price=EXCLUDED.price,
      category=EXCLUDED.category, image=EXCLUDED.image, description=EXCLUDED.description,
      stock=EXCLUDED.stock;
