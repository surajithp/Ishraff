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
                longitude: req.body.longitude,
                latitude: req.body.latitude,
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
    if (taskDetails) {
      const taskUpdates = await prisma.taskUpdate.findMany({
        where: {
          taskId: taskId
        },
        include: {
          task: true,
          createdBy: true
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
    if (projectDetails) {
      const projectUpdates = await prisma.taskUpdate.findMany({
        where: {
          projectId: projectId
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
