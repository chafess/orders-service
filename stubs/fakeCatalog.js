const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const products = [
  { id: 1, name: "Lenovo ThinkPad E14", category: "Laptops", price: 8499, image: "https://placehold.co/600x400?text=ThinkPad+E14", description: "Business laptop" },
  { id: 2, name: "Samsung Galaxy A55", category: "Smartphones", price: 4299, image: "https://placehold.co/600x400?text=Galaxy+A55", description: "5G smartphone" },
  { id: 3, name: "Sony WH-1000XM5", category: "Audio", price: 3499, image: "https://placehold.co/600x400?text=Sony+Headphones", description: "Noise-cancelling headphones" },
  { id: 4, name: "Logitech MX Master 3S", category: "Accessories", price: 1199, image: "https://placehold.co/600x400?text=MX+Master+3S", description: "Ergonomic mouse" },
  { id: 5, name: "Dell UltraSharp 27", category: "Monitors", price: 3999, image: "https://placehold.co/600x400?text=Dell+Monitor", description: "27-inch QHD monitor" },
  { id: 6, name: "Apple iPad Air", category: "Tablets", price: 7299, image: "https://placehold.co/600x400?text=iPad+Air", description: "Tablet" },
];

app.get("/products", (req, res) => res.json(products));

app.get("/products/:id", (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  p ? res.json(p) : res.status(404).json({ error: "Produit introuvable" });
});

app.listen(8082, () => console.log("Fake Catalog sur 8082"));