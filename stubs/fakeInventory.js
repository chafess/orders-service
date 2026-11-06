const express = require("express");
const app = express();
app.use(express.json());

const stock = { 1: 12, 2: 20, 3: 8, 4: 25, 5: 10, 6: 15 };

app.post("/api/inventory/reserve", (req, res) => {
  const items = req.body.items;
  const ok = items.every(i => (stock[i.productId] || 0) >= i.quantity);
  if (ok) items.forEach(i => (stock[i.productId] -= i.quantity));
  res.json({ success: ok });
});

app.post("/api/inventory/release", (req, res) => {
  req.body.items.forEach(i => (stock[i.productId] += i.quantity));
  res.json({ success: true });
});

app.get("/api/inventory/:productId", (req, res) => {
  res.json({ productId: Number(req.params.productId), stock: stock[req.params.productId] || 0 });
});

app.listen(8083, () => console.log("Fake Inventory sur 8083"));