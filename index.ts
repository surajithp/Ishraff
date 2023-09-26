import router from "./router";
import { createNewUser, resetPassword, signin } from "./handlers/user";
// export { logger as LOGGER } from "./winston";
import { handleInputErrors } from "./modules/middleware";
import { body } from "express-validator";
import { userDataValidate } from "./validations/uservalidation";
import { Prisma } from "@prisma/client";
import * as dotenv from "dotenv";
import cors from "cors";
import { protect } from "./modules/auth";
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const CronJob = require("node-cron");
import { updateAllTasks } from "./handlers/task";

const port = 3000;

dotenv.config();

// app.use(express.static("static"));

// CronJob.schedule("* */12 * * * *", function () {
//   getAllTasks();
//   updateAllTasks();
// });

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

app.use((err, req, res, next) => {
  console.log("==err", err);
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        // handling duplicate key errors
        res.status(400);
        res.send({
          message: `Duplicate field value: ${err.meta.target}`
        });
      case "P2014":
        // handling invalid id errors
        res.status(400);
        res.send({
          message: `Invalid ID: ${err.meta.target}`
        });
      case "P2003":
        // handling invalid data errors
        res.status(400);
        res.send({
          message: `Invalid input data: ${err.meta.target}`
        });
      default:
        // handling all other errors
        res.status(500);
        res.send({
          message: `Something went wrong: ${err.message}`
        });
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1001") {
      res.status(503);
      res.send({
        message: `Service is temporary unavailable`
      });
    } else {
      res.status(503);
      res.send({
        message: `Service is temporary unavailable`
      });
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(422);
    res.send({
      message: err.message
    });
  } else if (err) {
    res.status(400);
    res.send({
      message: err.message
    });
  } else {
    res.status(500);
    res.send({
      message: `Internal server error`
    });
  }
});

// creates and starts a server for our API on a defined port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
