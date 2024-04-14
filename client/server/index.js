var express = require("express");
var app = express();
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const config = require("./config.json");

const options = {
  key: fs.readFileSync(path.join(__dirname, "./key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./cert.pem")),
};

app.use((req, res, next) => {
  res.set("Cross-Origin-Opener-Policy", "same-origin");
  res.set("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.static(path.join(__dirname, "../www")));

if (config.https) {
  https.createServer(options, app).listen(config.port, "0.0.0.0");
} else {
  http.createServer(options, app).listen(config.port, "0.0.0.0");
}
