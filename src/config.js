module.exports = {
  PORT: process.env.PORT || 8084,
  FRONTEND_ORIGINS: ["http://localhost:5173", "http://localhost:5174"],
  CATALOG_URL: process.env.CATALOG_URL || "http://localhost:8082",
  INVENTORY_URL: process.env.INVENTORY_URL || "http://localhost:8083",
  TIMEOUT_MS: 3000,
};