const express = require("express");
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