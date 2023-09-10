import router from "./router";
import { createNewUser, resetPassword, signin } from "./handlers/user";
// export { logger as LOGGER } from "./winston";
import { handleInputErrors } from "./modules/middleware";
import { body } from "express-validator";
import * as dotenv from "dotenv";
import cors from "cors";
import { protect } from "./modules/auth";
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const port = 3000;

dotenv.config();

// app.use(express.static("static"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", protect, router);

app.post(
  "/signup",
  body("username").notEmpty().withMessage("Name should not be empty"),
  body("username").isString().withMessage("Name should be string"),
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("phoneNumber").notEmpty(),
  body("email").isEmail().withMessage("Email is not valid"),
  handleInputErrors,
  createNewUser
);
app.post(
  "/signin",
  body("email").isEmail().withMessage("Email is not valid"),
  handleInputErrors,
  signin
);

app.post(
  "/reset-password",
  body("email").isEmail().withMessage("Email is not valid"),
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1
    })
    .withMessage(
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  handleInputErrors,
  resetPassword
);

// creates and starts a server for our API on a defined port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
