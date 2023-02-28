const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const database = require("./config/database");
const memberRoutes = require("./routes/member");
const bookRoutes = require("./routes/book");

app.use(bodyParser.json());

// routes
app.use(memberRoutes);
app.use(bookRoutes);

app.listen(port, () => {
  console.log(`server up & running at ${port}`);
});
