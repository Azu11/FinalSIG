const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

//settings
app.set("port", process.env.BACK_PORT || 3000);

// middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("src/public"));
app.use(cors());

// proxy middleware
app.use(
  "/geoserver",
  createProxyMiddleware({
    target: "http://localhost:8080",
    changeOrigin: true,
    pathRewrite: {
      "^/geoserver": "/geoserver",
    },
  })
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});


//routes
app.use("/api", require("./routes"));

//start server
app.listen(app.get("port"), () => {
  console.log("😁 server en puerto", app.get("port",));
});