const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const passport = require("passport");



const app = express();

const api = require("./api");

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(helmet());

app.use(morgan("combined")); //log writing to console
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/v1", api);
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});


module.exports = app;
