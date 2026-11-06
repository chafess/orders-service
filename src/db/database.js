const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "orders.db"));
db.pragma("foreign_keys = ON");

// ---------- Initialisation avec le schéma du prof ----------
const tableExists = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
  .get();

if (!tableExists) {
  db.exec(fs.readFileSync(path.join(DATA_DIR, "schema.sql"), "utf8"));
  const seedPath = path.join(DATA_DIR, "seed.sql");
  if (fs.existsSync(seedPath)) db.exec(fs.readFileSync(seedPath, "utf8"));
}

// ---------- Conversion ligne SQL -> JSON du contrat ----------
function toOrder(row, items) {
  return {
    id: row.id,
    userId: row.user_id,
    customer: {
      name: row.customer_name,
      address: row.customer_address,
      city: row.customer_city,
    },
    items: items.map((i) => ({
      productId: i.product_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
  };
}

function getItems(orderId) {
  return db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
}

// ---------- Fonctions d'accès ----------
function createOrder({ userId, customer, lines, total }) {
  const id = "order-" + crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, user_id, customer_name, customer_address, customer_city, total, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, price, quantity)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Transaction : tout est enregistré, ou rien du tout
  const save = db.transaction(() => {
    insertOrder.run(id, userId, customer.name, customer.address, customer.city, total, createdAt);
    for (const l of lines) {
      insertItem.run(id, l.productId, l.name, l.unitPrice, l.quantity);
    }
  });
  save();

  return getOrderById(id);
}

function getOrderById(id) {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return row ? toOrder(row, getItems(id)) : null;
}

function getOrdersByUser(userId) {
  const rows = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId);
  return rows.map((r) => toOrder(r, getItems(r.id)));
}

function updateStatus(id, status) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return getOrderById(id);
}

module.exports = { createOrder, getOrderById, getOrdersByUser, updateStatus };