const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const database = require("./config/database");
const memberRoutes = require("./routes/member");
const bookRoutes = require("./routes/book");

// Start Swegger
const swaggerUi = require("swagger-ui-express");
const apiDocumentacion = require("./apidocs.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocumentacion));
// End Swegger

app.use(bodyParser.json());

// routes
app.use(memberRoutes);
app.use(bookRoutes);

app.listen(port, () => {
  console.log(`server up & running at ${port}`);
});
