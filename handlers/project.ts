import prisma from "../db";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";
import { slugifyString } from "../modules/utils";

export const getProjects = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      include: {
        ProjectMember: true,
        projects: true
      }
    });
    const projectMember = user.ProjectMember;
    const projectIds = projectMember.map((item) => item.projectId);
    let proms = [];
    projectIds.forEach((projectId) => {
      proms.push(
        prisma.project.findFirst({
          where: {
            id: projectId
          }
        })
      );
    });
    const assignedProjects = await Promise.all(proms);
    console.log("====assignedProjects", assignedProjects);
    const createdProjects = user.projects;
    const userProjects = [...createdProjects, ...assignedProjects];
    res.json({ status: "success", data: userProjects, errors: [] });
  } catch (error) {
    console.log("=======error", error);
    next(error);
  }
};

export const getProjectsForProjectMember = async (req, res) => {
  try {
    const projectMemberProjects = await prisma.projectMemberOnProjects.findMany(
      {
        where: {
          memberId: req.body.memberId
        },
        include: {
          project: true
        }
      }
    );
    res.json({ status: "success", data: projectMemberProjects, errors: [] });
  } catch (error) {
    res.status(422);
    res.send({ message: error });
  }
};

export const getProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        belongsToId: req.user.id
      }
    });
    if (project) {
      const projectTasks = await prisma.projectTask.findMany({
        where: {
          projectId: project.id
        }
      });
      const totalTasks = projectTasks;
      const completedTasks = projectTasks.filter(
        (task) => task.status === "COMPLETED"
      );
      const data = {
        ...project,
        tasksSummary: {
          totalTasks: totalTasks.length,
          completedTasks: completedTasks.length
        }
      };
      res.json({ status: "success", data: data, errors: [] });
    } else {
      res.status(404);
      res.send({ message: "Not found" });
    }
  } catch (error) {
    res.status(404);
    res.send({ message: "Not found" });
  }
};

export const createProject = async (req, res, next) => {
  try {
    console.log("=req", req.user);
    const project = await prisma.project.create({
      data: {
        name: req.body.name,
        type: req.body.type,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        belongsToId: req.user.id
      }
    });
    res.json({ status: "success", data: project, errors: [] });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      if (!req.body.type) {
        const project = await prisma.project.update({
          where: {
            id: projectId
          },
          data: {
            ...req.body
          }
        });
        res.json({ status: "success", data: project, errors: [] });
      } else {
        res.status(422);
        res.send({ message: "Project type cannot be changed" });
      }
    } else {
      res.status(404);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const createProjectInvitation = async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      if (projectDetails.type === "team") {
        const inviteeUserDetails = await prisma.user.findFirst({
          where: {
            id: req.body.userId
          }
        });
        if (!inviteeUserDetails) {
          res.status(422);
          res.send({ message: "User does not exist" });
        } else {
          const inviteeDetails = await prisma.projectInvitation.findFirst({
            where: {
              inviteeId: req.body.userId,
              projectId: projectId
            }
          });
          if (!inviteeDetails) {
            const projectInvitation = await prisma.projectInvitation.create({
              data: {
                userId: req.user.id,
                inviteeId: req.body.userId,
                status: "not_accepted",
                role: req.body.role,
                projectId: projectId
              }
            });
            res.json({
              status: "success",
              data: projectInvitation,
              errors: []
            });
          } else {
            res.status(422);
            res.send({ message: "Project invitation already existed" });
          }
        }
      } else {
        res.status(422);
        res.send({ message: "Project does not allow adding members" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    res.status(422);
    res.send({ message: error });
  }
};

export const updateProjectInvitation = async (req, res) => {
  try {
    const projectId = req.params.id;
    const invitationId = req.params.invitationId;
    const status = req.body.status;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      if (projectDetails.type === "team") {
        const invitationDetails = await prisma.projectInvitation.findFirst({
          where: {
            id: invitationId,
            projectId: projectId
          }
        });
        if (invitationDetails) {
          const projectInvitation = await prisma.projectInvitation.update({
            where: {
              id: invitationId
            },
            data: {
              ...req.body
            }
          });
          if (status === "accepted") {
            const member = await prisma.projectMember.create({
              data: {
                role: invitationDetails.role,
                userId: invitationDetails.inviteeId,
                projectId: projectId
              }
            });
            if (member) {
              res.json({
                status: "success",
                data: projectInvitation,
                errors: []
              });
            } else {
              res.status(422);
              res.send({ message: "Project invitation updation failed" });
            }
          } else {
            res.json({
              status: "success",
              data: projectInvitation,
              errors: []
            });
          }
        } else {
          res.status(422);
          res.send({ message: "Project invitation does not exist" });
        }
      } else {
        res.status(422);
        res.send({ message: "Project does not allow adding members" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    res.status(422);
    res.send({ message: error });
  }
};

export const getProjectInvitation = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const invitationId = req.params.invitationId;
    const projectInvitation = await prisma.projectInvitation.findFirst({
      where: {
        id: invitationId,
        projectId: projectId
      },
      include: {
        invitee: true
      }
    });
    res.json({ status: "success", data: projectInvitation, errors: [] });
  } catch (error) {
    next(error);
  }
};

export const removeProjectInvitation = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const invitationId = req.params.invitationId;
    const invitationDetails = await prisma.projectInvitation.findUnique({
      where: {
        id: invitationId
      }
    });
    if (invitationDetails) {
      if (invitationDetails.status !== "accepted") {
        const projectInvitation = await prisma.projectInvitation.delete({
          where: {
            id: invitationId,
            projectId: projectId
          }
        });
        res.json({ status: "success", data: projectInvitation, errors: [] });
      } else {
        res.status(422);
        res.send({ message: "Cannot delete accepted project invitation" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project invitation does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectInvitations = async (req, res) => {
  try {
    const projectId = req.params.id;
    const role = req.query.role;
    let whereParams: any = {
      projectId: projectId
    };
    if (role) {
      whereParams = {
        projectId: projectId,
        role: role
      };
    }
    const projectInvitation = await prisma.projectInvitation.findMany({
      where: whereParams,
      include: {
        invitee: true
      }
    });
    res.json({ status: "success", data: projectInvitation, errors: [] });
  } catch (error) {}
};

export const createProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const projectMemberExisted = await prisma.projectMember.findFirst({
        where: {
          userId: req.body.userId
        }
      });
      if (!projectMemberExisted) {
        const member = await prisma.projectMember.create({
          data: {
            role: req.body.role,
            userId: req.body.userId,
            projectId: req.body.projectId
          }
        });
        res.json({ status: "success", data: member, errors: [] });
      } else {
        res.status(422);
        res.send({ message: "Project member already exist with user" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectMember = async (req, res, next) => {
  console.log("===entered");
  try {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          id: memberId
        }
      });
      res.json({ status: "success", data: projectMember, errors: [] });
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const changeProjectMemberRole = async (req, res, next) => {
  try {
    const memberId = req.params.memberId;
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        id: memberId
      }
    });
    if (projectMember) {
      if (projectMember.role !== req.body.role) {
        const projectMember = await prisma.projectMember.update({
          where: {
            id: memberId
          },
          data: {
            role: req.body.role
          }
        });
        res.json({ status: "success", data: projectMember, errors: [] });
      } else {
        res.status(422);
        res.send({ message: "Project Member already have that role" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project Member does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteProjectMember = async (req, res, next) => {
  try {
    const memberId = req.params.memberId;
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        id: memberId
      }
    });
    if (projectMember) {
      const member = await prisma.projectMember.delete({
        where: {
          id: memberId
        }
      });
      if (member) {
        res.json({
          status: "success",
          message: "Project Member removed successfully"
        });
      } else {
        res.status(422);
        res.send({ message: "Project Member removal failed" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project Member does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getPlatformUsers = async (req, res, next) => {
  try {
    let searchParam = req.query.searchText;
    const projectId = req.query.projectId;
    let projectMembers = [];
    let users = [];
    if (projectId) {
      projectMembers = await prisma.projectMember.findMany({
        where: {
          projectId: projectId
        }
      });
    }
    if (searchParam) {
      users = await prisma.user.findMany({
        where: {
          OR: [
            {
              email: {
                contains: searchParam
              }
            },
            { username: { contains: searchParam } },
            { phoneNumber: { contains: searchParam } }
          ]
        },
        select: {
          email: true,
          username: true,
          phoneNumber: true,
          id: true,
          password: false
        }
      });
    } else {
      users = await prisma.user.findMany({
        select: {
          email: true,
          username: true,
          phoneNumber: true,
          id: true,
          password: false
        }
      });
    }
    if (projectMembers.length > 0) {
      users = users.filter((user) => {
        const isExisted = projectMembers.find(
          (member) => member.userId === user.id
        );
        return isExisted ? false : true;
      });
    }
    res.json({ status: "success", data: users, errors: [] });
  } catch (error) {
    console.log("=error", error);
    next(error);
  }
};

export const getProjectMembers = async (req, res) => {
  const projectId = req.params.id;
  const role = req.query.role;
  if (role) {
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId,
        role: role
      },
      include: {
        user: true,
        projects: true
      }
    });
    res.json({ status: "success", data: projectMembers, errors: [] });
  } else {
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId
      },
      include: {
        user: true,
        projects: true
      }
    });
    res.json({ status: "success", data: projectMembers, errors: [] });
  }
};

export const createProjectAttachment = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      console.log("=req", req);
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
        const user = await prisma.user.findUnique({
          where: {
            id: req.user.id
          }
        });
        const attachment = await prisma.projectAttachment.create({
          data: {
            projectId: projectId,
            userId: req.user.id,
            addedBy: user.username,
            attachementFileKey: objectKey,
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
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    console.log("=error", error);
    next(error);
  }
};

export const deleteProjectAttachment = async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const projectMember = await prisma.user.findFirst({
        where: {
          id: req.body.memberId
        }
      });
      if (projectMember) {
        const attachmentId = req.params.attachmentId;
        const attachment = await prisma.projectAttachment.findFirst({
          where: {
            id: attachmentId
          }
        });
        if (attachment) {
          const response = await prisma.projectAttachment.delete({
            where: {
              id: attachmentId
            }
          });
          if (response) {
            res.json({
              status: "success",
              data: {
                message: "Attachment deleted successfully"
              },
              errors: []
            });
          }
        }
      } else {
        res.status(422);
        res.send({ message: "Project Member does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    res.status(422);
    res.send({ message: error });
  }
};

export const getProjectAttachments = async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const attachments = await prisma.projectAttachment.findMany({
        where: {
          projectId: projectId
        }
      });
      if (attachments) {
        res.json({
          status: "success",
          data: attachments,
          errors: []
        });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    res.status(422);
    res.send({ message: error });
  }
};
