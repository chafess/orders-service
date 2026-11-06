const db = require("../src/db/database");

console.log("Commande du seed :", db.getOrderById("order-demo-001")?.status);

const order = db.createOrder({
  userId: "user-1",
  customer: { name: "Demo Customer", address: "123 Main Street", city: "Casablanca" },
  lines: [{ productId: 1, name: "Produit test", unitPrice: 100, quantity: 2 }],
  total: 200,
});

console.log("Commande créée :", JSON.stringify(order, null, 2));
console.log("Commandes de user-1 :", db.getOrdersByUser("user-1").length);
console.log("Commandes de user-2 :", db.getOrdersByUser("user-2").length);
console.log("Après PAID :", db.updateStatus(order.id, "PAID").status);