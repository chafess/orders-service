const db = require("../db/database");
const catalogClient = require("../clients/catalogClient");
const inventoryClient = require("../clients/inventoryClient");
const shippingClient = require("../clients/shippingClient");
const { HttpError } = require("../errors");

const TRANSITIONS = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function listOrders(userId) {
  if (!userId) throw new HttpError(400, "userId est obligatoire");
  return db.getOrdersByUser(userId);
}

function getOrder(id) {
  const order = db.getOrderById(id);
  if (!order) throw new HttpError(404, "Commande introuvable");
  return order;
}

async function createOrder({ userId, customer, items }) {
  // 1. Validation
  if (!userId) throw new HttpError(400, "userId est obligatoire");
  if (!customer || !customer.name || !customer.address || !customer.city)
    throw new HttpError(400, "customer (name, address, city) est obligatoire");
  if (!Array.isArray(items) || items.length === 0)
    throw new HttpError(400, "La commande doit contenir au moins un article");
  for (const i of items) {
    if (!Number.isInteger(i.productId) || !Number.isInteger(i.quantity) || i.quantity <= 0)
      throw new HttpError(400, "Chaque article doit avoir productId et quantity > 0");
  }

  // 2-3. Prix réels depuis Catalog, puis total
  const lines = await catalogClient.getPricedItems(items);
  const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  // 4. Réservation du stock
  const reserved = await inventoryClient.reserve(items);
  if (!reserved) throw new HttpError(409, "Stock insuffisant");

  // 5. Enregistrement (avec compensation si la base échoue)
  try {
    return db.createOrder({ userId, customer, lines, total });
  } catch (e) {
    await inventoryClient.release(items).catch(() => {});
    throw new HttpError(500, "Erreur lors de l'enregistrement de la commande");
  }
}

function updateStatus(id, status) {
  if (!Object.keys(TRANSITIONS).includes(status))
    throw new HttpError(400, `Statut invalide : ${status}`);
  const order = getOrder(id);
  if (!TRANSITIONS[order.status].includes(status))
    throw new HttpError(409, `Transition interdite : ${order.status} → ${status}`);
  return db.updateStatus(id, status);
}

async function cancelOrder(id) {
  const order = getOrder(id);
  if (!["PENDING_PAYMENT", "PAID"].includes(order.status))
    throw new HttpError(409, "Cette commande ne peut plus être annulée");

  const shipment = await shippingClient.getShipmentByOrder(id);
  if (shipment && !["PREPARING", "CANCELLED"].includes(shipment.status))
    throw new HttpError(409, "Impossible d'annuler une commande déjà expédiée");

  // On libère le stock AVANT d'annuler : si ça échoue, la commande reste annulable
  await inventoryClient.release(
    order.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  );
  return db.updateStatus(id, "CANCELLED");
}

module.exports = { listOrders, getOrder, createOrder, updateStatus, cancelOrder };