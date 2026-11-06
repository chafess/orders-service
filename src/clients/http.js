const config = require("../config");
const { HttpError } = require("../errors");

async function call(url, options = {}) {
  try {
    return await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(config.TIMEOUT_MS),
    });
  } catch {
    throw new HttpError(503, `Service indisponible : ${url}`);
  }
}
module.exports = { call };