import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/middleware";
import {
  createProject,
  getProject,
  getProjects,
  createProjectMember,
  getProjectMembers,
  getProjectMember,
  getPlatformUsers,
  createProjectInvitation,
  getProjectInvitations,
  createProjectAttachment,
  updateProject,
  deleteProjectMember,
  changeProjectMemberRole,
  updateProjectInvitation
} from "./handlers/project";
import {
  createProjectTask,
  getProjectTasks,
  updateProjectTask
} from "./handlers/task";
import {
  generateInvitationCode,
  createPlatformInvitation,
  getUserPlatformInvitations
} from "./handlers/invitation";
import {
  createTaskUpdate,
  createTaskUpdateComment,
  getTaskUpdateComments,
  getProjectUpdates,
  getTaskUpdates
} from "./handlers/taskUpdate";

const router = Router();

router.get("/platform/invitation", generateInvitationCode);

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

router.patch(
  "/project/:id/invitation/:invitationId",
  body("status").notEmpty().withMessage("status should not be empty"),
  handleInputErrors,
  updateProjectInvitation
);

router.post(
  "/project/:id/attachment/upload",
  body("projectId").notEmpty().withMessage("Member Id should not be empty"),
  body("memberId").notEmpty().withMessage("Member Id should not be empty"),
  handleInputErrors,
  createProjectAttachment
);

router.get("/project/:id/invitations", getProjectInvitations);

router.post("/project/:id/members", createProjectMember);

router.patch(
  "/project/:id/members/:memberId/role",
  body("role").notEmpty().withMessage("Role should not be empty"),
  changeProjectMemberRole
);

router.get("/project/:id/members/:memberId", getProjectMember);

router.delete("/project/:id/members/:memberId", deleteProjectMember);

router.get("/project/:id/members", getProjectMembers);

router.post("/project/:id/tasks", createProjectTask);

router.patch("/project/:id/tasks/:taskId", updateProjectTask);

router.get("/project/:id/tasks", getProjectTasks);

router.get("/project/:id/updates", getProjectUpdates);

router.get("/project/:id/tasks/:taskId/updates", getTaskUpdates);

router.post("/project/:id/tasks/:taskId/update", createTaskUpdate);

router.post(
  "/project/:id/tasks/:taskId/update/:updateId/comments",
  createTaskUpdateComment
);

router.get(
  "/project/:id/tasks/:taskId/update/:updateId/comments",
  getTaskUpdateComments
);

export default router;
