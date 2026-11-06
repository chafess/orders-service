const config = require("../config");
const { call } = require("./http");

// Retourne l'expédition de la commande, ou null si absente / service éteint
async function getShipmentByOrder(orderId) {
  try {
    const res = await call(
      `${config.SHIPPING_URL}/api/shipments/order/${encodeURIComponent(orderId)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

module.exports = { getShipmentByOrder };