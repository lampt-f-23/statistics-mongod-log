const express = require("express");
const routes = require("./src/routes/index");
const morgan = require("morgan");
const { connectToDatabase } = require("./src/modules/config/db");

const app = express();
const port = process.env.PORT || 3000;

connectToDatabase();
app.use(morgan("dev"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", routes);
routes;
app.listen(port, () => {
  console.log(`server is running with port: ${port}`);
});
