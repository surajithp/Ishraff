import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/middleware";
import { createProject, getProject, getProjects } from "./handlers/project";
import { generateInvitationCode } from "./handlers/invitation";

const router = Router();

router.get("/platform/invitation/", generateInvitationCode);

router.get("/project/:id", getProject);

router.get("/projects", getProjects);

router.post(
  "/project",
  body("name").isString(),
  handleInputErrors,
  createProject
);

export default router;
