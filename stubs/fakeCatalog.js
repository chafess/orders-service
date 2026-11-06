const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const products = [
  { id: 1, name: "Produit A", category: "test", price: 100, image: "", description: "" },
  { id: 2, name: "Produit B", category: "test", price: 250, image: "", description: "" },
];

app.get("/products", (req, res) => res.json(products));

app.get("/products/:id", (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  p ? res.json(p) : res.status(404).json({ error: "Produit introuvable" });
});

app.listen(8082, () => console.log("Fake Catalog sur 8082"));