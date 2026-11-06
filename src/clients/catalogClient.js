const config = require("../config");
const { call } = require("./http");
const { HttpError } = require("../errors");

async function getPricedItems(items) {
  const lines = [];
  for (const item of items) {
    const res = await call(`${config.CATALOG_URL}/products/${item.productId}`);
    if (res.status === 404)
      throw new HttpError(404, `Produit ${item.productId} introuvable`);
    if (!res.ok) throw new HttpError(503, "Erreur du service Catalog");
    const p = await res.json();
    // Couche anti-corruption : on ne garde que ce dont Orders a besoin
    lines.push({
      productId: p.id,
      name: p.name,
      unitPrice: p.price,
      quantity: item.quantity,
    });
  }
  return lines;
}

module.exports = { getPricedItems };