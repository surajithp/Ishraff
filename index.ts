import router from "./router";
import { createNewUser, signin } from "./handlers/user";
import { userDataValidate } from "./validations/uservalidation";
import * as dotenv from "dotenv";
import cors from "cors";
import { protect } from "./modules/auth";
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const port = 3000;

dotenv.config();

app.use(express.static("static"));

/**
 * app.[method]([route], [route handler])
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", protect, router);

app.post("/user", userDataValidate, createNewUser);
app.post("/signin", signin);

// creates and starts a server for our API on a defined port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
