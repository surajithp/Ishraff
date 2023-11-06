import router from "./router";
import {
  createNewUser,
  resetPassword,
  signin,
  signinWithOtp,
  verifyOtp,
  verifyUser
} from "./handlers/user";
// export { logger as LOGGER } from "./winston";
import { handleInputErrors } from "./modules/middleware";
import { body } from "express-validator";
import bodyParser from "body-parser";
import { userDataValidate } from "./validations/uservalidation";
import { Prisma } from "@prisma/client";
import webpush from "web-push";
import path from "path";
import * as dotenv from "dotenv";
import cors from "cors";
import { protect } from "./modules/auth";
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const CronJob = require("node-cron");
import { updateAllTasks } from "./handlers/task";
import { updateAllProjects } from "./handlers/project";
import { deleteNotifications } from "./handlers/notifications";

const port = 3000;

dotenv.config();

// app.use(express.static(path.join(__dirname, "client")))

app.use(
  bodyParser.json({
    limit: "20mb"
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "20mb",
    parameterLimit: 50000
  })
);

CronJob.schedule("0 */1 * * *", function () {
  updateAllTasks();
  updateAllProjects();
});

CronJob.schedule("0 0 */3 * *", function () {
  deleteNotifications();
});

const publicVapidKey =
  "BGRrP8r_FW7hJ3XhB7VwMkGK66JMzhAmk5RAJvLvtNAdoSjzNesvkQSTsNG3vtnx9w7sN25Xc40fM0jDmvM6FNw";

const privateVapidKey = "yH2EDC-jYWc1Ay1TBEOkF6dEJysIOsCAwRJMvurh6Y4";

// Setup the public and private VAPID keys to web-push library.
webpush.setVapidDetails(
  "mailto:surajith1991@gmail.com",
  publicVapidKey,
  privateVapidKey
);

app.post("/subscribe", (req, res) => {
  //get push subscription object
  const subscription = req.body;

  //send status 201
  res.status(201).json({});

  //create paylod
  const payload = JSON.stringify({ title: "Node Js Push Notification" });

  //pass the object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));
});

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
    .isLength({ min: 8 })
    .withMessage("Password must be greater than 8 letters"),
  body("phoneNumber").notEmpty(),
  body("email").isEmail().withMessage("Email is not valid"),
  handleInputErrors,
  createNewUser
);

app.post(
  "/signup/verify",
  body("token").notEmpty().withMessage("Token should not be empty"),
  handleInputErrors,
  verifyUser
);

app.post(
  "/signin",
  body("email").isEmail().withMessage("Email is not valid"),
  handleInputErrors,
  signin
);

app.post(
  "/signin/phone_number",
  body("mobile").notEmpty().withMessage("Mobile number should not be empty"),
  handleInputErrors,
  signinWithOtp
);

app.post(
  "/verifyOtp",
  body("otp").notEmpty().withMessage("Otp should not be empty"),
  body("token").notEmpty().withMessage("Token should not be empty"),
  handleInputErrors,
  verifyOtp
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
