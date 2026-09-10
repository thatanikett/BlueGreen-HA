const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const os = require("os");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const { createClient } = require("redis");

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/postgres";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const SESSION_SECRET = process.env.SESSION_SECRET || "bluegreen-secret";
const SESSION_COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE === "true";
const SESSION_COOKIE_SAME_SITE = process.env.SESSION_COOKIE_SAME_SITE || "lax";
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "connect.sid";
const PG_SSL_MODE = process.env.PG_SSL_MODE || "disable";
const REDIS_TLS_ENABLED = process.env.REDIS_TLS_ENABLED === "true";
const REDIS_PING_COMMAND = process.env.REDIS_PING_COMMAND || "PING";

function buildPgConfig() {
  const config = {
    connectionString: DATABASE_URL,
  };

  if (PG_SSL_MODE !== "disable") {
    config.ssl = {
      rejectUnauthorized: PG_SSL_MODE === "verify-full",
    };
  }

  return config;
}

function buildRedisConfig() {
  const config = { url: REDIS_URL };

  if (REDIS_TLS_ENABLED) {
    config.socket = { tls: true };
  }

  return config;
}

const pool = new Pool(buildPgConfig());

// Redis Client & Session Store
const redisClient = createClient(buildRedisConfig());
redisClient.on("error", (err) => console.error("Redis Client Error", err));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    name: SESSION_COOKIE_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: SESSION_COOKIE_SECURE,
      httpOnly: true,
      sameSite: SESSION_COOKIE_SAME_SITE,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

function saveCart(req, res, cart) {
  req.session.cart = cart;
  req.session.save((err) => {
    if (err) {
      console.error("Session save error", err);
      return res.status(500).json({ error: "Failed to persist cart" });
    }
    return res.json(req.session.cart);
  });
}

async function ensureConnection(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      console.log("Postgres connected");
      return;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      console.log(
        `Postgres not ready yet (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function ensureRedisConnection() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
}

async function getDependencyHealth() {
  let db = "disconnected";
  let redis = "disconnected";

  try {
    await pool.query("SELECT 1");
    db = "connected";
  } catch (err) {
    console.error("Health DB check failed", err.message);
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.sendCommand([REDIS_PING_COMMAND]);
    redis = "connected";
  } catch (err) {
    console.error("Health Redis check failed", err.message);
  }

  return { db, redis };
}

app.get("/health", async (_req, res) => {
  const { db, redis } = await getDependencyHealth();
  const status =
    db === "connected" && redis === "connected" ? "ok" : "degraded";

  res.status(status === "ok" ? 200 : 503).json({
    status,
    db,
    redis,
    version: process.env.APP_VERSION || "V1",
    hostname: os.hostname() || "localhost",
  });
});

app.get("/test/smoke", async (_req, res) => {
  try {
    const version = process.env.APP_VERSION || "V1";
    const smokeKey = `smoke:${Date.now()}`;
    await pool.query("SELECT 1");
    await redisClient.set(smokeKey, version, { EX: 30 });
    await redisClient.del(smokeKey);

    res.json({
      status: "ok",
      test: "smoke",
      version,
    });
  } catch (err) {
    console.error("Smoke test failed", err);
    res.status(500).json({
      status: "failed",
      test: "smoke",
      error: err.message,
    });
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, sku, name, price, category, image, description
       FROM products
       ORDER BY category ASC, name ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cart endpoints
app.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  res.json(cart);
});

app.post("/cart", (req, res) => {
  const product = req.body;
  const cart = [...(req.session.cart || [])];
  const idx = cart.findIndex((i) => String(i.id) === String(product.id));
  if (idx !== -1) {
    // clone the item so the array reference changes
    cart[idx] = { ...cart[idx], quantity: (cart[idx].quantity || 1) + 1 };
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(req, res, cart);
});

app.put("/cart/:id", (req, res) => {
  const productId = String(req.params.id);
  const quantity = Number(req.body.quantity);
  let cart = [...(req.session.cart || [])];

  if (!Number.isFinite(quantity)) {
    return res.status(400).json({ error: "Quantity must be a number" });
  }

  if (quantity <= 0) {
    cart = cart.filter((i) => String(i.id) !== productId);
  } else {
    const idx = cart.findIndex((i) => String(i.id) === productId);
    if (idx !== -1) {
      cart[idx] = { ...cart[idx], quantity }; // new object – triggers change detection
    }
  }
  saveCart(req, res, cart);
});

app.post("/cart/:id/increment", (req, res) => {
  const productId = String(req.params.id);
  const cart = [...(req.session.cart || [])];
  const idx = cart.findIndex((i) => String(i.id) === productId);

  if (idx === -1) {
    return res.status(404).json({ error: "Product not in cart" });
  }

  cart[idx] = { ...cart[idx], quantity: (cart[idx].quantity || 1) + 1 };
  saveCart(req, res, cart);
});

app.post("/cart/:id/decrement", (req, res) => {
  const productId = String(req.params.id);
  const cart = [...(req.session.cart || [])];
  const idx = cart.findIndex((i) => String(i.id) === productId);

  if (idx === -1) {
    return res.status(404).json({ error: "Product not in cart" });
  }

  const nextQuantity = (cart[idx].quantity || 1) - 1;
  if (nextQuantity <= 0) {
    return saveCart(
      req,
      res,
      cart.filter((i) => String(i.id) !== productId),
    );
  }

  cart[idx] = { ...cart[idx], quantity: nextQuantity };
  saveCart(req, res, cart);
});

app.delete("/cart", (req, res) => {
  saveCart(req, res, []);
});

// Orders endpoint
app.post(["/orders", "/api/orders"], async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }
  const amount = cart.reduce(
    (total, item) => total + Number(item.price) * (item.quantity || 1),
    0,
  );
  const payment_method = req.body.payment_method || "online";
  const user_id = "demo-user"; // Simplified for demo
  const status = "completed";

  try {
    const result = await pool.query(
      `INSERT INTO orders (user_id, amount, status, payment_method) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [user_id, amount, status, payment_method],
    );
    req.session.cart = [];
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("Session save error", saveErr);
        return res.status(500).json({ error: "Failed to clear cart" });
      }
      return res.json({ success: true, orderId: result.rows[0].id });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/info", (req, res) => {
  res.json({
    version: process.env.APP_VERSION || "V1",
    hostname: os.hostname() || "localhost",
  });
});

async function start() {
  try {
    await ensureRedisConnection();
    await ensureConnection();

    // Seed products via UPSERT so new products always appear even on rebuilt DB
    try {
      await pool.query(`
        INSERT INTO products (id, sku, name, price, category, image, description) VALUES
          (1,  'MON-001', 'UltraWide Pro Display',    899.99,  'Monitors',    'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=500&q=80', '34-inch curved professional display'),
          (2,  'CHAS-001','Open Frame Chassis',        249.99,  'Case',        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80', 'Premium open-air desktop chassis'),
          (3,  'KEY-001', 'Mechanical Tech Keyboard', 149.99,  'Keyboards',   'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', 'RGB tactile switches, aluminium body'),
          (4,  'MOU-001', 'Ergo Wireless Mouse',       79.99,  'Accessories', 'https://images.unsplash.com/photo-1615663245857-ac931003185c?w=500&q=80', 'Precision sensor and ergonomic grip'),
          (5,  'GPU-001', 'RTX Pro Graphics Card',   1199.99,  'Components',  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80', 'Next-gen ray tracing performance'),
          (6,  'HDP-001', 'Studio Headphones',        199.99,  'Audio',       'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80', 'High-fidelity sound for creators')
        ON CONFLICT (id) DO UPDATE
          SET sku=EXCLUDED.sku, name=EXCLUDED.name, price=EXCLUDED.price,
              category=EXCLUDED.category, image=EXCLUDED.image, description=EXCLUDED.description;
      `);
      console.log("Products seeded.");
    } catch (err) {
      console.error("Seed error:", err.message);
    }

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();
