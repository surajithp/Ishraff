import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/middleware";
import {
  createProject,
  getProject,
  getProjects,
  createProjectMember,
  getProjectMembers,
  getPlatformUsers,
  createProjectInvitation,
  getProjectInvitations,
  updateProject
} from "./handlers/project";
import {
  generateInvitationCode,
  createPlatformInvitation,
  getUserPlatformInvitations
} from "./handlers/invitation";

const router = Router();

router.get("/platform/invitation/", generateInvitationCode);

router.get("/platform/users", getPlatformUsers);

router.post("/platform/invitation", createPlatformInvitation);

router.get("/platform/invitations", getUserPlatformInvitations);

router.post(
  "/project",
  body("name").isString().notEmpty().withMessage("Name should not be empty"),
  body("type").isString().withMessage("Type should not be empty"),
  body("latitude").isNumeric().withMessage("Latitude should be numeric"),
  body("latitude").notEmpty().withMessage("Latitude should not be empty"),
  body("longitude").isNumeric().withMessage("Longitude should be numeric"),
  body("longitude").notEmpty().withMessage("Longitude should not be empty"),
  handleInputErrors,
  createProject
);

router.patch(
  "/project/:id",
  body("name")
    .isString()
    .optional()
    .notEmpty()
    .withMessage("Name should not be empty"),
  body("type")
    .isString()
    .optional()
    .notEmpty()
    .withMessage("Type should not be empty"),
  body("latitude")
    .isNumeric()
    .optional()
    .notEmpty()
    .withMessage("Latitude should not be empty"),
  body("longitude")
    .isNumeric()
    .optional()
    .notEmpty()
    .withMessage("Longitude should not be empty"),
  handleInputErrors,
  updateProject
);

router.get("/project/:id", getProject);

router.get("/projects", getProjects);

router.post(
  "/project/:id/invitation",
  body("memberId").notEmpty().withMessage("Member Id should not be empty"),
  body("role").notEmpty().withMessage("Role should not be empty"),
  handleInputErrors,
  createProjectInvitation
);

router.get("/project/:id/invitations", getProjectInvitations);

router.post("/project/member/invitation", createProjectMember);

router.get("/project/:id/members", getProjectMembers);

export default router;
