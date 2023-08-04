import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/middleware";
import {
  createProject,
  getProject,
  getProjects,
  createProjectMember,
  getProjectMembers,
  getPlatformUsers
} from "./handlers/project";
import {
  generateInvitationCode,
  createPlatformInvitation,
  getUserPlatformInvitations
} from "./handlers/invitation";

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

router.post("/project/member/invitation", createProjectMember);

router.get("/project/:id/members", getProjectMembers);

router.get("/platform/users", getPlatformUsers);

router.post("/platform/invitation", createPlatformInvitation);

router.get("/platform/invitations", getUserPlatformInvitations);

export default router;
