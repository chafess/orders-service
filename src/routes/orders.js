const express = require("express");
const service = require("../services/orderService");

const router = express.Router();

// Évite un try/catch dans chaque route
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);

router.get("/", wrap(async (req, res) => {
  res.json(service.listOrders(req.query.userId));
}));

router.get("/:id", wrap(async (req, res) => {
  res.json(service.getOrder(req.params.id));
}));

router.post("/", wrap(async (req, res) => {
  const order = await service.createOrder(req.body);
  res.status(201).json(order);
}));

router.patch("/:id/status", wrap(async (req, res) => {
  res.json(service.updateStatus(req.params.id, req.body.status));
}));

router.post("/:id/cancel", wrap(async (req, res) => {
  res.json(await service.cancelOrder(req.params.id));
}));

module.exports = router;