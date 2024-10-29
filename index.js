const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const database = require("./config/database");
const route = require("./routes/index.route");

database.connect();

const app = express();
const port = process.env.PORT || 3000; // Ensure a default port is set
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
route(app);
app.get("*", (req, res) => {
  res.status(404).send("404 Not Found 12345");
});
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});


module.exports = app; // Ensure the app is exported