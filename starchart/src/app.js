const express = require("express");
const path = require("path");

const dns = require("./dns");
const acme = require("./acme");

const app = express();

app.post("/api/subdomains/:name/a/:ip", async (req, res) => {
  // TODO: error handling
  const { name, ip } = req.params;
  try {
    res.status(201).json(await dns.createSubdomain(name, "A", ip));
  } catch (err) {
    console.warn("Error", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/subdomains/:name/cname/:domain", async (req, res) => {
  // TODO: error handling
  const { name, domain } = req.params;
  try {
    res.status(201).json(await dns.createSubdomain(name, "CNAME", domain));
  } catch (err) {
    console.warn("Error", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/certs", async (req, res) => {
  try {
    res.json(await acme());
  } catch (err) {
    console.warn("Error", err);
    res.status(500).json({ error: err.message });
  }
});

app.use("/", express.static(path.join(__dirname, "static")));

module.exports = app;
