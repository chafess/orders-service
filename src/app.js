/*const express = require("express");
const cors = require("cors");
const config = require("./config");

const app = express();
app.use(cors({ origin: config.FRONTEND_ORIGINS }));
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "orders", status: "UP" })
);

app.listen(config.PORT, () =>
  console.log(`Orders service sur http://localhost:${config.PORT}`)
);
*/
const express = require("express");
const cors = require("cors");
const config = require("./config");
const ordersRouter = require("./routes/orders");

const app = express();
app.use(cors({ origin: config.FRONTEND_ORIGINS }));
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "orders", status: "UP" })
);

app.use("/api/orders", ordersRouter);

// Gestion centralisée des erreurs
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.status ? err.message : "Erreur interne du serveur";
  if (!err.status) console.error(err);
  res.status(status).json({ error: message, message });
});

app.listen(config.PORT, () =>
  console.log(`Orders service sur http://localhost:${config.PORT}`)
);

