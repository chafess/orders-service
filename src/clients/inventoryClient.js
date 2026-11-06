const config = require("../config");
const { call } = require("./http");
const { HttpError } = require("../errors");

const body = (items) =>
  JSON.stringify({
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });

// true = réservé, false = stock insuffisant
async function reserve(items) {
  const res = await call(`${config.INVENTORY_URL}/api/inventory/reserve`, {
    method: "POST",
    body: body(items),
  });
  if (res.status === 409) return false;
  if (!res.ok) throw new HttpError(503, "Erreur du service Inventory");
  const data = await res.json();
  return data.success === true;
}

async function release(items) {
  const res = await call(`${config.INVENTORY_URL}/api/inventory/release`, {
    method: "POST",
    body: body(items),
  });
  if (!res.ok) throw new HttpError(503, "Impossible de libérer le stock");
}

module.exports = { reserve, release };