const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require("dotenv");
const { fileURLToPath } = require("url");
const { request, Server } = require("http");
dotenv.config();

//set up a test route
app.get("/", (req, res) => {
  res.send({ hello: "world" });
});




//start the server running
app.listen(PORT, (error) => {
  if (error) console.log(error);
  else {
    console.log(`Listening on port: ${PORT}`);
  }
});
