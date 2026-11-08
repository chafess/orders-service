const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const stock = { 1: 12, 2: 20, 3: 8, 4: 25, 5: 10, 6: 15 };

// Mets true pour simuler une rupture de stock, false pour le fonctionnement normal
const FORCE_OUT_OF_STOCK = false;

app.post("/api/inventory/reserve", (req, res) => {
  if (FORCE_OUT_OF_STOCK) {
    console.log("--> Rupture simulée");
    return res.status(409).json({ success: false, message: "Out of stock" });
  }
  const items = req.body.items;
  const ok = items.every((i) => (stock[i.productId] || 0) >= i.quantity);
  if (ok) items.forEach((i) => (stock[i.productId] -= i.quantity));
  console.log("Reserve ->", ok, stock);
  res.json({ success: ok });
});

app.post("/api/inventory/release", (req, res) => {
  req.body.items.forEach((i) => (stock[i.productId] += i.quantity));
  console.log("Release ->", stock);
  res.json({ success: true });
});

app.get("/api/inventory/:productId", (req, res) => {
  res.json({
    productId: Number(req.params.productId),
    stock: stock[req.params.productId] || 0,
  });
});

app.listen(8083, () => console.log("Fake Inventory sur 8083"));