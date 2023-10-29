import prisma from "../db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { slugifyString } from "../modules/utils";

export const createTaskUpdate = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        if (req.file) {
          const fileName = req.file.originalname;
          const fileType = req.file.mimetype;
          const objectKey = `${slugifyString(
            Date.now().toString()
          )}-${slugifyString(fileName)}`;
          const S3 = new S3Client({
            region: "auto",
            endpoint: process.env.ENDPOINT,
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
            }
          });
          const response = await S3.send(
            new PutObjectCommand({
              Body: req.file.buffer,
              Bucket: process.env.BUCKET_NAME,
              Key: objectKey,
              ContentType: fileType
            })
          );
          if (response) {
            const fileSize = parseInt(req.headers["content-length"]);
            const attachment = await prisma.taskUpdate.create({
              data: {
                projectId: projectId,
                taskId: taskId,
                description: req.body.description,
                longitude: parseFloat(req.body.longitude),
                latitude: parseFloat(req.body.latitude),
                rating: null,
                userId: req.user.id,
                status: "in_review",
                submittedOn: null,
                attachmentName: fileName,
                attachmentFileKey: objectKey,
                attachmentSize: fileSize,
                attachmentType: fileType
              }
            });
            res.json({
              status: "success",
              data: attachment,
              errors: []
            });
            const projectGuests = await prisma.projectMember.findMany({
              where: {
                projectId: projectId,
                role: "guest"
              }
            });
            const projectGuestsUserIds = projectGuests.map(
              (guest) => guest.userId
            );
            const assignedMember = await prisma.projectMember.findFirst({
              where: {
                projectId: projectId,
                id: taskDetails.memberId
              }
            });
            const userIds = [
              ...projectGuestsUserIds,
              assignedMember.userId,
              taskDetails.managedUserId,
              taskDetails.userId
            ];
            const user = await prisma.user.findFirst({
              where: {
                id: req.user.id
              }
            });
            let proms = [];
            userIds.forEach((id) => {
              proms.push(
                prisma.notifications.create({
                  data: {
                    userId: id,
                    type: "task-update",
                    title: `${projectDetails.name} update details`,
                    description: `An update has been added by ${user.username} for the task - ${taskDetails.name}`
                  }
                })
              );
            });
            Promise.all(proms);
          } else {
            res.status(422);
            res.send({ message: "Update attachment uploading failed" });
          }
        } else {
          res.status(422);
          res.send({ message: "Update attachment does not exist" });
        }
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const updateTaskUpdate = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const updateId = req.params.updateId;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    const status = req.body.status;
    let allowedStatuses = ["flagged", "approved"];
    const data: any = {};
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        if (allowedStatuses.includes(status)) {
          const taskUpdate = await prisma.taskUpdate.findFirst({
            where: {
              id: updateId
            }
          });
          if (status === "flagged") {
            data.isFlagged = !taskUpdate.isFlagged;
            if (data.isFlagged) {
              data.status = "flagged";
            }
          } else {
            data.status = status;
            if (status === "approved") {
              const user = await prisma.user.findFirst({
                where: {
                  id: req.user.id
                }
              });
              data.approvedOn = new Date().toISOString();
              data.approverId = req.user.id;
              data.approvedBy = user ? user.username : "";
            }
          }
          // if (status === "unapproved") {
          //   data.status = "in_review";
          // }
          const update = await prisma.taskUpdate.update({
            where: {
              id: updateId
            },
            data: data
          });
          res.json({
            status: "success",
            data: update,
            errors: []
          });
          const projectGuests = await prisma.projectMember.findMany({
            where: {
              projectId: projectId,
              role: "guest"
            }
          });
          const projectMember = await prisma.projectMember.findFirst({
            where: {
              projectId: projectId,
              id: taskDetails.memberId
            }
          });
          const projectGuestsUserIds = projectGuests.map(
            (guest) => guest.userId
          );
          const userIds = [
            ...projectGuestsUserIds,
            projectMember.userId,
            taskDetails.managedUserId,
            taskDetails.userId
          ];
          const user = await prisma.user.findFirst({
            where: {
              id: req.user.id
            }
          });
          let proms = [];
          if (status === "flagged") {
            userIds.forEach((id) => {
              proms.push(
                prisma.notifications.create({
                  data: {
                    userId: id,
                    type: "task-update",
                    title: `Update Flagged`,
                    description: `Update-${update.displayId} has been flagged by ${user.username} for the task - ${taskDetails.name}`
                  }
                })
              );
            });
          } else if (status === "approved") {
            userIds.forEach((id) => {
              proms.push(
                prisma.notifications.create({
                  data: {
                    userId: id,
                    type: "task-update",
                    title: `${projectDetails.name} update status change`,
                    description: `Update-${update.displayId} has been approved by ${user.username} for the task - ${taskDetails.name}`
                  }
                })
              );
            });
          } else {
            userIds.forEach((id) => {
              proms.push(
                prisma.notifications.create({
                  data: {
                    userId: id,
                    type: "task-update",
                    title: `${projectDetails.name} update status change`,
                    description: `Update-${update.displayId} has been ${status} by ${user.username} for the task - ${taskDetails.name}`
                  }
                })
              );
            });
          }
          await Promise.all(proms);
        } else {
          res.status(422);
          res.send({ message: "Status in not valid" });
        }
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const createTaskUpdateComment = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        const updateId = req.params.updateId;
        const taskComment = await prisma.updateComments.create({
          data: {
            memberId: req.body.memberId,
            comment: req.body.comment,
            taskUpdateId: updateId
          }
        });
        res.json({
          status: "success",
          data: taskComment,
          errors: []
        });
        const projectGuests = await prisma.projectMember.findMany({
          where: {
            projectId: projectId,
            role: "guest"
          }
        });
        const projectMember = await prisma.projectMember.findFirst({
          where: {
            projectId: projectId,
            id: taskDetails.memberId
          }
        });
        const projectGuestsUserIds = projectGuests.map((guest) => guest.userId);
        const userIds = [
          ...projectGuestsUserIds,
          projectMember.userId,
          taskDetails.managedUserId,
          taskDetails.userId
        ];
        console.log("==userIds", userIds);
        let proms = [];
        userIds.forEach((id) => {
          proms.push(
            prisma.notifications.create({
              data: {
                userId: id,
                type: "task-update",
                title: `Comments on Task`,
                description: `Comments have been added to update- ${updateId} for the task-${taskDetails.name} under project- ${projectDetails.name}. Please check`
              }
            })
          );
        });
        await Promise.all(proms);
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getTaskUpdates = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const projectId = req.params.id;
    const taskDetails = await prisma.projectTask.findFirst({
      where: {
        id: taskId
      }
    });
    const status = req.query.status;
    if (taskDetails) {
      let whereParam: any = {
        taskId: taskId
      };
      if (status) {
        whereParam.status = status;
      }
      const taskUpdates = await prisma.taskUpdate.findMany({
        where: whereParam,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          task: true,
          createdBy: true
        }
      });
      const taskRatings = await prisma.updateRatings.findMany({
        where: {
          taskId: taskId
        }
      });
      const userProjectMemberDetails = await prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: req.user.id
        }
      });
      const userTaskRatings = await prisma.updateRatings.findMany({
        where: {
          taskId: taskId,
          memberId: userProjectMemberDetails.id
        }
      });
      taskUpdates.forEach((update: any) => {
        const userRating = userTaskRatings.find(
          (rating) => rating.taskUpdateId === update.id
        );
        if (userRating) {
          update.user_rating = userRating;
        }
        const updateRatings = taskRatings.filter(
          (rating) => rating.taskUpdateId === update.id
        );
        let avgRating = 0;
        updateRatings.forEach((rating) => {
          avgRating = avgRating + rating.rating;
        });
        if (updateRatings.length > 0) {
          update.rating = avgRating / updateRatings.length;
        } else {
          update.rating = 0;
        }
      });
      res.json({
        status: "success",
        data: taskUpdates,
        errors: []
      });
    } else {
      res.status(422);
      res.send({ message: "Task does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectUpdates = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    const status = req.query.status;
    if (projectDetails) {
      let whereParam: any = {
        projectId: projectId
      };
      if (status) {
        whereParam.status = status;
      }
      const userProjectMemberDetails = await prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: req.user.id
        }
      });
      const projectUpdates = await prisma.taskUpdate.findMany({
        where: whereParam,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          task: true,
          createdBy: true
        }
      });
      const allUpdatesRatings = await prisma.updateRatings.findMany({
        include: {
          taskUpdate: true
        }
      });
      const allUserRatings = allUpdatesRatings.filter(
        (rating) => rating.memberId === userProjectMemberDetails.id
      );
      const projectRatings = allUpdatesRatings.filter(
        (rating) => rating.taskUpdate.projectId === projectId
      );
      projectUpdates.forEach((update: any) => {
        const userRating = allUserRatings.find(
          (rating) => rating.taskUpdateId === update.id
        );
        if (userRating) {
          update.user_rating = userRating;
        }
        const updateRatings = projectRatings.filter(
          (rating) => rating.taskUpdateId === update.id
        );
        let avgRating = 0;
        updateRatings.forEach((rating) => {
          avgRating = avgRating + rating.rating;
        });
        if (updateRatings.length > 0) {
          update.rating = avgRating / updateRatings.length;
        } else {
          update.rating = 0;
        }
      });
      res.json({
        status: "success",
        data: projectUpdates,
        errors: []
      });
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getTaskUpdateComments = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        const updateId = req.params.updateId;
        const taskUpdateComments = await prisma.updateComments.findMany({
          where: {
            taskUpdateId: updateId
          },
          include: {
            projectMember: {
              include: {
                user: true
              }
            }
          }
        });
        res.json({
          status: "success",
          data: taskUpdateComments,
          errors: []
        });
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const createTaskUpdateRating = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        const updateId = req.params.updateId;
        const memberPreviousRating = await prisma.updateRatings.findFirst({
          where: {
            taskUpdateId: updateId,
            memberId: req.body.memberId
          }
        });
        if (!memberPreviousRating) {
          const updateRating = await prisma.updateRatings.create({
            data: {
              memberId: req.body.memberId,
              rating: req.body.rating,
              taskUpdateId: updateId,
              taskId: taskDetails.id
            }
          });
          res.json({
            status: "success",
            data: updateRating,
            errors: []
          });
        } else {
          res.status(422);
          res.send({ message: "Project Member already rated the update" });
        }
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const updateTaskUpdateRating = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        const updateId = req.params.updateId;
        const ratingId = req.params.ratingId;
        const ratingDetails = await prisma.updateRatings.findFirst({
          where: {
            taskUpdateId: updateId,
            id: ratingId
          }
        });
        if (ratingDetails) {
          if (ratingDetails.memberId === req.body.memberId) {
            const updateRating = await prisma.updateRatings.update({
              where: {
                id: ratingId
              },
              data: {
                rating: req.body.rating
              }
            });
            res.json({
              status: "success",
              data: updateRating,
              errors: []
            });
          } else {
            res.status(422);
            res.send({
              message: "Rating cannot be updated by other project Member"
            });
          }
        } else {
          res.status(422);
          res.send({ message: "Rating Details does not exist" });
        }
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getTaskUpdateRatings = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        const updateId = req.params.updateId;
        const updateRatings = await prisma.updateRatings.findMany({
          where: {
            taskUpdateId: updateId
          }
        });
        res.json({
          status: "success",
          data: updateRatings,
          errors: []
        });
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserTaskUpdateRatings = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        const userProjectMemberDetails = await prisma.projectMember.findFirst({
          where: {
            projectId: projectId,
            userId: req.user.id
          }
        });
        const updateRatings = await prisma.updateRatings.findMany({
          where: {
            taskId: taskId,
            memberId: userProjectMemberDetails.id
          }
        });
        res.json({
          status: "success",
          data: updateRatings,
          errors: []
        });
      } else {
        res.status(422);
        res.send({ message: "Task details does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserProjectUpdateRatings = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const userProjectMemberDetails = await prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: req.user.id
        }
      });
      const updateRatings = await prisma.updateRatings.findMany({
        where: {
          memberId: userProjectMemberDetails.id
        },
        include: {
          taskUpdate: true
        }
      });
      const projectUpdateRatings = updateRatings.filter(
        (rating) => rating.taskUpdate.projectId === projectId
      );
      res.json({
        status: "success",
        data: projectUpdateRatings,
        errors: []
      });
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};
