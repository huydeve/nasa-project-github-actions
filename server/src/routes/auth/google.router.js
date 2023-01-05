const express = require("express");
const {
  loginGoogle,
  callBackGoogle,
  logoutGoogle,
} = require("./google.controller");

const googleRouter = express.Router();
googleRouter.get("/google", loginGoogle);
googleRouter.get("/google/callback", callBackGoogle);
googleRouter.get("/logout", logoutGoogle);

module.exports = googleRouter;
