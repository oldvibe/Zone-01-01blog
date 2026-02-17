const PROXY_CONFIG = {
  "/api": {
    "target": process.env["BACKEND_URL"] || "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/uploads": {
    "target": process.env["BACKEND_URL"] || "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
};

module.exports = PROXY_CONFIG;
