const app = require("./app");
const https = require("https");
const fs = require("fs");
require("dotenv").config();

const { loadPlanets } = require("./models/planets.model");
const { mongoConnect } = require("./services/mongo");
const { loadLaunchesData } = require("./models/launches.model");

const PORT = process.env.PORT || 8080;

const server = https.createServer(
  {
    cert: fs.readFileSync("cert.pem"),
    key: fs.readFileSync("key.pem"),
  },
  app
);
async function startServer() {
  await mongoConnect();
  await loadPlanets();
  await loadLaunchesData();
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
}

startServer();
