import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/middleware";
import { uploadProfileImage } from "./handlers/user";
import {
  createProject,
  getProject,
  getProjects,
  createProjectMember,
  updateProjectMember,
  getProjectMembers,
  getProjectMember,
  getUserProjectMember,
  getPlatformUsers,
  createProjectInvitation,
  getProjectInvitation,
  getProjectInvitations,
  createProjectAttachment,
  updateProject,
  deleteProjectMember,
  changeProjectMemberRole,
  updateProjectInvitation,
  removeProjectInvitation,
  getProjectAttachments,
  deleteProjectAttachment,
  archiveProject
} from "./handlers/project";
import {
  createProjectTask,
  getProjectTasks,
  getProjectMemberTasks,
  getProjectTask,
  getProjectTaskModifications,
  updateProjectTask
} from "./handlers/task";
import {
  generateInvitationCode,
  createPlatformInvitation,
  getUserPlatformInvitations,
  getUserProjectInvitations
} from "./handlers/invitation";
import {
  createTaskUpdate,
  createTaskUpdateRating,
  createTaskUpdateComment,
  getTaskUpdateComments,
  getProjectUpdates,
  updateTaskUpdate,
  getTaskUpdates,
  getTaskUpdateRatings,
  updateTaskUpdateRating
} from "./handlers/taskUpdate";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage
});

const router = Router();

router.get("/platform/invitation", generateInvitationCode);

router.get("/platform/users", getPlatformUsers);

router.post("/platform/invitation", createPlatformInvitation);

router.get("/platform/invitations", getUserPlatformInvitations);

router.get("/project/invitations", getUserProjectInvitations);

router.post("/user/profile-image", upload.single("file"), uploadProfileImage);

router.post(
  "/project",
  body("name").isString().notEmpty().withMessage("Name should not be empty"),
  body("type").isString().withMessage("Type should not be empty"),
  body("latitude").isNumeric().withMessage("Latitude should be numeric"),
  body("latitude").notEmpty().withMessage("Latitude should not be empty"),
  body("latitude")
    .isFloat({ max: 90, min: -90 })
    .withMessage("Latitude must be a number between -90 and 90"),
  body("longitude").isNumeric().withMessage("Longitude should be numeric"),
  body("longitude").notEmpty().withMessage("Longitude should not be empty"),
  body("longitude")
    .isFloat({ max: 180, min: -180 })
    .withMessage("Longitude must be a number between -180 and 180"),
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
  body("latitude")
    .isFloat({ max: 90, min: -90 })
    .withMessage("Latitude must be a number between -90 and 90"),
  body("longitude")
    .isNumeric()
    .optional()
    .notEmpty()
    .withMessage("Longitude should not be empty"),
  body("longitude")
    .isFloat({ max: 180, min: -180 })
    .withMessage("Longitude must be a number between -180 and 180"),
  handleInputErrors,
  updateProject
);

router.get("/project/:id", getProject);

router.post("/project/:id/archived", archiveProject);


router.get("/projects", getProjects);

router.post(
  "/project/:id/invitation",
  body("userId").notEmpty().withMessage("User Id should not be empty"),
  body("role").notEmpty().withMessage("Role should not be empty"),
  handleInputErrors,
  createProjectInvitation
);

router.patch(
  "/project/:id/invitation/:invitationId",
  body("status")
    .optional()
    .notEmpty()
    .withMessage("status should not be empty"),
  body("role").optional().notEmpty().withMessage("role should not be empty"),
  handleInputErrors,
  updateProjectInvitation
);

router.get(
  "/project/:id/invitation/:invitationId",
  handleInputErrors,
  getProjectInvitation
);

router.delete(
  "/project/:id/invitation/:invitationId",
  handleInputErrors,
  removeProjectInvitation
);

router.get("/project/:id/invitations", getProjectInvitations);

router.post(
  "/project/:id/attachments",
  upload.single("file"),
  handleInputErrors,
  createProjectAttachment
);

router.delete(
  "/project/:id/attachments/:attachmentId",
  handleInputErrors,
  deleteProjectAttachment
);

router.get(
  "/project/:id/attachments",
  handleInputErrors,
  getProjectAttachments
);

// router.post("/project/:id/members", createProjectMember);

router.patch(
  "/project/:id/members/:memberId/role",
  body("role").notEmpty().withMessage("Role should not be empty"),
  changeProjectMemberRole
);

router.get("/project/:id/members/:memberId", getProjectMember);

router.get("/project/:id/user", getUserProjectMember);

router.patch("/project/:id/members/:memberId", updateProjectMember);

router.delete("/project/:id/members/:memberId", deleteProjectMember);

router.get("/project/:id/members", getProjectMembers);

router.post(
  "/project/:id/tasks",
  body("name").notEmpty().withMessage("Name should not be empty"),
  body("memberId")
    .notEmpty()
    .withMessage("Assigned Member Id should not be empty"),
  body("managedMemberId")
    .notEmpty()
    .withMessage("Managed Member Id should not be empty"),
  createProjectTask
);

router.patch("/project/:id/tasks/:taskId", updateProjectTask);

router.get("/project/:id/tasks/:taskId", getProjectTask);

router.get(
  "/project/:id/tasks/:taskId/modifications",
  getProjectTaskModifications
);

router.get("/project/:id/tasks", getProjectTasks);

router.get("/project/:id/members/:memberId/tasks", getProjectMemberTasks);

router.get("/project/:id/updates", getProjectUpdates);

router.get("/project/:id/tasks/:taskId/updates", getTaskUpdates);

router.post(
  "/project/:id/tasks/:taskId/update",
  upload.single("file"),
  createTaskUpdate
);

router.patch("/project/:id/tasks/:taskId/update/:updateId", updateTaskUpdate);

router.post(
  "/project/:id/tasks/:taskId/update/:updateId/ratings",
  createTaskUpdateRating
);

router.patch(
  "/project/:id/tasks/:taskId/update/:updateId/ratings/:ratingId",
  updateTaskUpdateRating
);

router.get(
  "/project/:id/tasks/:taskId/update/:updateId/ratings",
  getTaskUpdateRatings
);

router.post(
  "/project/:id/tasks/:taskId/update/:updateId/comments",
  createTaskUpdateComment
);

router.get(
  "/project/:id/tasks/:taskId/update/:updateId/comments",
  getTaskUpdateComments
);

export default router;
