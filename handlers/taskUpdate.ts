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
            console.log("=obejctKey", objectKey);
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
    if (projectDetails) {
      const taskId = req.params.taskId;
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails) {
        const attachment = await prisma.taskUpdate.update({
          where: {
            id: updateId
          },
          data: {
            ...req.body
          }
        });
        res.json({
          status: "success",
          data: attachment,
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
      taskUpdates.forEach((update) => {
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
    const status = req.params.status;
    if (projectDetails) {
      let whereParam: any = {
        projectId: projectId
      };
      if (status) {
        whereParam.status = status;
      }
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
