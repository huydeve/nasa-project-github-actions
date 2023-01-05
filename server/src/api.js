const express = require("express");
const launchesRouter = require("./routes/launches/launches.router");
const planetsRouter = require("./routes/planets/planets.router");
const googleRouter = require("./routes/auth/google.router");
const api = express.Router();
function checkLoggedIn(req, res, next) {
  const isLoggedIn = true;
  if (!isLoggedIn)
    return res.status(401).json({
      error: "You must login!",
    });
  next();
}

api.use("/auth", googleRouter);

api.use(checkLoggedIn);
api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);

module.exports = api;
