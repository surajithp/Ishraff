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
    const createdBy = req.query.created_by;
    const assignedTo = req.query.assigned_to;
    let projects = [];
    const status = req.query.status;
    let projectMembers = await prisma.projectMember.findMany({
      where: {
        userId: req.user.id,
        isArchived: false
      },
      include: {
        project: true
      }
    });
    if (createdBy) {
      projectMembers = projectMembers.filter(
        (member) => member.role === "admin"
      );
    }
    if (assignedTo) {
      projectMembers = projectMembers.filter(
        (member) => member.role !== "admin"
      );
    }
    projectMembers.forEach((member) => {
      projects.push({ role: member.role, ...member.project });
    });
    if (status) {
      projects = projects.filter((item) => item.status === status);
    } else {
      projects = projects.filter((project) => project.status !== "archived");
    }
    res.json({ status: "success", data: projects.reverse(), errors: [] });
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
    res.json({
      status: "success",
      data: projectMemberProjects.reverse(),
      errors: []
    });
  } catch (error) {
    res.status(422);
    res.send({ message: error });
  }
};

export const getProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (project) {
      const projectTasks = await prisma.projectTask.findMany({
        where: {
          projectId: project.id,
          isArchived: false
        }
      });
      const totalTasks = projectTasks;
      const completedTasks = projectTasks.filter(
        (task) => task.status === "completed" || task.status === "delayed"
      );
      const data: any = {
        ...project,
        tasksSummary: {
          totalTasks: totalTasks.length,
          completedTasks: completedTasks.length
        }
      };
      const memberDetails = req.query.member_details;
      if (memberDetails) {
        const projectMember = await prisma.projectMember.findFirst({
          where: {
            projectId: projectId,
            userId: req.user.id
          }
        });
        if (projectMember) {
          data.projectMember = projectMember;
        }
      }
      res.json({ status: "success", data: data, errors: [] });
    } else {
      res.status(404);
      res.send({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await prisma.project.create({
      data: {
        name: req.body.name,
        type: req.body.type,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        status: "in_progress",
        belongsToId: req.user.id
      }
    });
    if (project) {
      const member = await prisma.projectMember.create({
        data: {
          role: "admin",
          userId: req.user.id,
          projectId: project.id
        }
      });
      if (member) {
        res.json({ status: "success", data: project, errors: [] });
      }
    } else {
      res.status(404);
      res.send({ message: "Project Creation Failed" });
    }
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
        const projectMember = await prisma.projectMember.findFirst({
          where: {
            userId: req.user.id,
            projectId: projectDetails.id
          }
        });
        if (projectMember && projectMember.role === "admin") {
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
          res.send({
            message: "Only Project Admin can update project details"
          });
        }
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

export const archiveProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          userId: req.user.id
        }
      });
      if (projectMember && projectMember.role === "admin") {
        if (projectDetails.status === "archived") {
          const date = new Date();

          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let currentDate = `${day}-${month}-${year}`;
          if (projectDetails.startDate && projectDetails.endDate) {
            const project = await prisma.project.update({
              where: {
                id: projectId,
                startDate: { not: null, gte: currentDate },
                startTime: { not: null }
              },
              data: {
                status: "draft"
              }
            });
            res.json({ status: "success", data: project, errors: [] });
          } else {
            const project = await prisma.project.update({
              where: {
                id: projectId,
                startDate: null,
                startTime: null
              },
              data: {
                status: "in_progress"
              }
            });
            res.json({ status: "success", data: project, errors: [] });
            const projectMembers = await prisma.projectMember.findMany({
              where: {
                projectId: projectId
              }
            });
            const proms = [];
            projectMembers.forEach((member) => {
              proms.push(
                prisma.notifications.create({
                  data: {
                    userId: member.userId,
                    type: "project",
                    title: `${projectDetails.name} status changed`,
                    description: `${projectDetails.name} status has been changed to in progress`
                  }
                })
              );
            });
            await Promise.all(proms);
          }
        } else {
          const project = await prisma.project.update({
            where: {
              id: projectId
            },
            data: {
              status: "archived"
            }
          });
          res.json({ status: "success", data: project, errors: [] });
          const projectMembers = await prisma.projectMember.findMany({
            where: {
              projectId: projectId
            }
          });
          const proms = [];
          projectMembers.forEach((member) => {
            proms.push(
              prisma.notifications.create({
                data: {
                  userId: member.userId,
                  type: "project",
                  title: `${projectDetails.name} status changed`,
                  description: `${projectDetails.name} status has been changed to archived`
                }
              })
            );
          });
          await Promise.all(proms);
        }
      } else {
        res.status(422);
        res.send({
          message: "Only Project Admin can archive project details"
        });
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
    const invitationRole = req.body.role;
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      if (projectDetails.type === "team") {
        const projectMember = await prisma.projectMember.findFirst({
          where: {
            userId: req.user.id,
            projectId: projectId
          },
          include: {
            user: true
          }
        });
        if (projectMember) {
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
              let projectInvitation = null;
              if (invitationRole === "manager") {
                if (projectMember.role === "admin") {
                  projectInvitation = await prisma.projectInvitation.create({
                    data: {
                      userId: req.user.id,
                      inviteeId: req.body.userId,
                      status: "not_accepted",
                      role: req.body.role,
                      projectId: projectId
                    }
                  });
                } else {
                  res.status(422);
                  res.send({ message: "Admin only can invite Manager" });
                }
              } else {
                projectInvitation = await prisma.projectInvitation.create({
                  data: {
                    userId: req.user.id,
                    inviteeId: req.body.userId,
                    status: "not_accepted",
                    role: req.body.role,
                    projectId: projectId
                  }
                });
              }
              res.json({
                status: "success",
                data: projectInvitation,
                errors: []
              });
              await prisma.notifications.create({
                data: {
                  userId: projectInvitation.inviteeId,
                  type: "project",
                  title: `${projectDetails.name} invitation update`,
                  description: `Project invitation received for ${projectInvitation.role} role by ${projectMember.user.username} in project ${projectDetails.name}, please check`
                }
              });
            } else {
              res.status(422);
              res.send({ message: "Project invitation already existed" });
            }
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
              },
              include: {
                user: true
              }
            });
            if (member) {
              res.json({
                status: "success",
                data: projectInvitation,
                errors: []
              });
              await prisma.notifications.create({
                data: {
                  userId: invitationDetails.userId,
                  type: "project",
                  title: `${projectDetails.name} invitation update`,
                  description: `Project invitation sent to ${member.user.username} for the ${invitationDetails.role} has been accepted`
                }
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

export const remindProjectInvitation = async (req, res) => {
  try {
    const projectId = req.params.id;
    const invitationId = req.params.invitationId;
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
          res.json({
            status: "success",
            data: invitationDetails,
            errors: []
          });
          const user = await prisma.user.findFirst({
            where: {
              id: invitationDetails.userId
            }
          });
          await prisma.notifications.create({
            data: {
              userId: invitationDetails.inviteeId,
              type: "project",
              title: `${projectDetails.name} invitation update`,
              description: `Project invitation received for ${invitationDetails.role} role by ${user.username} in project ${projectDetails.name}, please check`
            }
          });
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
    const status = req.query.status;
    let whereParams: any = {
      projectId: projectId
    };
    if (role) {
      whereParams = {
        projectId: projectId,
        role: role
      };
    }
    const isProjectMember = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id
      }
    });
    if (isProjectMember) {
      whereParams.userId = req.user.id;
    } else {
      whereParams.inviteeId = req.user.id;
    }
    if (status) {
      whereParams.status = status;
    }
    const projectInvitations = await prisma.projectInvitation.findMany({
      where: whereParams,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        invitee: true,
        invitedBy: true,
        project: true
      }
    });
    const invitations = projectInvitations.map((invitation) => {
      return {
        id: invitation.id,
        invited_on: invitation.createdAt,
        updatedAt: invitation.updatedAt,
        role: invitation.role,
        projectId: invitation.projectId,
        project: invitation.project.name,
        status: invitation.status,
        invited_by: invitation.invitedBy.username,
        invitation_to: invitation.invitee.username
      };
    });
    res.json({
      status: "success",
      data: projectInvitations.reverse(),
      errors: []
    });
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
  try {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const showTaskDetails = req.query.tasks_summary;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const projectMember: any = await prisma.projectMember.findFirst({
        where: {
          id: memberId
        },
        include: {
          user: true
        }
      });
      if (showTaskDetails) {
        const projectTasks = await prisma.projectTask.findMany({
          where: {
            projectId: projectId,
            isArchived: false
          }
        });
        const assignedTasks = projectTasks.filter(
          (task) => task.memberId === projectMember.id
        );
        const createdTasks = projectTasks.filter(
          (task) => task.userId === projectMember.userId
        );
        const managedTasks = projectTasks.filter(
          (task) => task.managedUserId === projectMember.userId
        );
        const inProgressTasks = assignedTasks.filter(
          (task) => task.status === "in_progress"
        );
        const inReviewTasks = assignedTasks.filter(
          (task) => task.status === "in_review"
        );
        const approvedTasks = managedTasks.filter(
          (task) => task.status === "completed"
        );
        const completedTasks = assignedTasks.filter(
          (task) => task.status === "completed"
        );
        const overdueTasks = assignedTasks.filter((task)=>task.status === "overdue")
        const tasksSummary = {
          assignedTasks: assignedTasks.length,
          createdTasks: createdTasks.length,
          managedTasks: managedTasks.length,
          inProgressTasks: inProgressTasks.length,
          approvedTasks: approvedTasks.length,
          inreviewTasks: inReviewTasks.length,
          overdueTasks: overdueTasks.length,
          completedTasks: completedTasks.length
        };
        projectMember.tasksSummary = tasksSummary;
      }
      res.json({ status: "success", data: projectMember, errors: [] });
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: req.user.id
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
    const projectId = req.params.id;
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        id: memberId
      }
    });
    if (projectMember) {
      const user = await prisma.projectMember.findFirst({
        where: {
          userId: req.user.id,
          projectId: projectId
        },
        include: {
          user: true
        }
      });
      if (!user) {
        throw new Error("Project Admin does not exist");
      }
      if (user.role !== "admin") {
        throw new Error("Project Admin can only change role");
      }
      if (projectMember.role !== req.body.role) {
        const updatedProjectMember = await prisma.projectMember.update({
          where: {
            id: memberId
          },
          data: {
            role: req.body.role
          }
        });
        if (projectMember.role === "manager" && req.body.role === "worker") {
          console.log("=====if", user);
          await prisma.projectTask.updateMany({
            where: {
              projectId: projectId,
              managedUserId: projectMember.userId
            },
            data: {
              managedUserId: req.user.id,
              managedMemberId: user.id,
              managedUserName: user.user.username
            }
          });
        }
        res.json({ status: "success", data: updatedProjectMember, errors: [] });
        await prisma.notifications.create({
          data: {
            userId: updatedProjectMember.userId,
            type: "project",
            title: "Role Change",
            description: `Your role has been changed to ${updatedProjectMember.role} by ${user.user.username}`
          }
        });
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
    const projectId = req.params.id;
    const userProjectMemberDetails = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id,
        projectId: projectId
      }
    });
    if (userProjectMemberDetails && userProjectMemberDetails.role === "admin") {
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          id: memberId,
          projectId: projectId
        }
      });
      if (projectMember) {
        const member = await prisma.projectMember.update({
          where: {
            id: memberId
          },
          data: {
            isArchived: true
          }
        });
        if (member) {
          if (projectMember.role === "worker") {
            await prisma.projectTask.updateMany({
              where: {
                memberId: memberId
              },
              data: {
                memberId: userProjectMemberDetails.id
              }
            });
          } else if (projectMember.role === "manager") {
            await prisma.projectTask.updateMany({
              where: {
                memberId: memberId
              },
              data: {
                memberId: userProjectMemberDetails.id
              }
            });
            await prisma.projectTask.updateMany({
              where: {
                managedUserId: projectMember.userId
              },
              data: {
                managedUserId: userProjectMemberDetails.userId
              }
            });
          }
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
    } else {
      res.status(422);
      res.send({
        message: "User does not have access to remove project member"
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateProjectMember = async (req, res, next) => {
  try {
    const changeRole = req.body.role;
    const memberId = req.params.memberId;
    const projectId = req.params.id;
    const userProjectMemberDetails = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id
      }
    });
    if (userProjectMemberDetails && userProjectMemberDetails.role === "admin") {
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          id: memberId,
          projectId: projectId
        }
      });
      if (projectMember) {
        if (
          projectMember.role !== changeRole &&
          changeRole !== "admin" &&
          changeRole === "guest"
        ) {
          const member = await prisma.projectMember.update({
            where: {
              id: memberId
            },
            data: {
              role: changeRole
            }
          });
          if (member) {
            if (projectMember.role === "manager" && changeRole === "worker") {
              await prisma.projectTask.updateMany({
                where: {
                  managedUserId: projectMember.userId
                },
                data: {
                  managedUserId: userProjectMemberDetails.userId
                }
              });
            }
            res.json({
              status: "success",
              message: "Project Member Role updated successfully"
            });
          } else {
            res.status(422);
            res.send({ message: "Project Member Role updation failed" });
          }
        } else {
          res.status(422);
          res.send({ message: "Project Member Role cannot change" });
        }
      } else {
        res.status(422);
        res.send({ message: "Project Member does not exist" });
      }
    } else {
      res.status(422);
      res.send({
        message: "User does not have access to remove project member"
      });
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
      projectMembers = await prisma.projectInvitation.findMany({
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
    console.log("==users", users);
    if (projectMembers.length > 0) {
      users = users.filter((user) => {
        const isExisted = projectMembers.find(
          (member) => member.inviteeId === user.id || member.userId === user.id
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
  const showTaskDetails = req.query.tasks_summary;
  let searchParam = req.query.searchText;
  let projectMembers = [];
  if (searchParam) {
    projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId,
        isArchived: false
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: true,
        project: true
      }
    });
    projectMembers = projectMembers.filter((member) => {
      const user = member.user;
      if (user.username.toLowerCase().indexOf(searchParam) > -1) {
        return true;
      }
      if (user.email.toLowerCase().indexOf(searchParam) > -1) {
        return true;
      }
      if (user.phoneNumber.toLowerCase().indexOf(searchParam) > -1) {
        return true;
      }
      if (member.id.indexOf(searchParam) > -1) {
        return true;
      }
      return false;
    });
  } else if (role) {
    projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId,
        isArchived: false,
        role: role
      },
      include: {
        user: true,
        project: true
      }
    });
  } else {
    projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId,
        isArchived: false
      },
      include: {
        user: true,
        project: true
      }
    });
  }
  if (showTaskDetails) {
    const projectTasks = await prisma.projectTask.findMany({
      where: {
        projectId: projectId,
        isArchived: false
      }
    });
    projectMembers.forEach((member) => {
      const assignedTasks = projectTasks.filter(
        (task) => task.memberId === member.id
      );
      const createdTasks = projectTasks.filter(
        (task) => task.userId === member.userId
      );
      const managedTasks = projectTasks.filter(
        (task) => task.managedUserId === member.userId
      );
      const inProgressTasks = assignedTasks.filter(
        (task) => task.status === "in_progress"
      );
      const inReviewTasks = assignedTasks.filter(
        (task) => task.status === "in_review"
      );
      const approvedTasks = managedTasks.filter(
        (task) => task.status === "completed"
      );
      const completedTasks = assignedTasks.filter(
        (task) => task.status === "completed"
      );
      const overdueTasks = assignedTasks.filter((task)=>task.status === "overdue")
      const tasksSummary = {
        assignedTasks: assignedTasks.length,
        createdTasks: createdTasks.length,
        managedTasks: managedTasks.length,
        inProgressTasks: inProgressTasks.length,
        approvedTasks: approvedTasks.length,
        inreviewTasks: inReviewTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length
      };
      member.tasksSummary = tasksSummary;
    });
  }
  res.json({ status: "success", data: projectMembers, errors: [] });
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
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          userId: req.user.id
        },
        include: {
          user: true
        }
      });
      if (projectMember) {
        let isEligibleToCreateProjectAttachment =
          projectMember.role === "manager" || projectMember.role === "admin";
        if (isEligibleToCreateProjectAttachment) {
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
                attachmentFileKey: objectKey,
                attachmentName: fileName,
                attachmentSize: fileSize,
                attachmentType: fileType
              }
            });
            res.json({
              status: "success",
              data: attachment,
              errors: []
            });
            const projectMembers = await prisma.projectMember.findMany({
              where: {
                projectId: projectId,
                role: { in: ["admin", "manager"] }
              }
            });
            console.log("======projectMembers", projectMembers);
            const proms = [];
            projectMembers.forEach((member) => {
              proms.push(
                prisma.notifications.create({
                  data: {
                    userId: member.userId,
                    type: "project",
                    title: `${projectDetails.name} attachment update`,
                    description: `An update has been added by ${projectMember.user.username} under the project ${projectDetails.name}`
                  }
                })
              );
            });
            await Promise.all(proms);
          }
        } else {
          res.status(422);
          res.send({ message: "Permission denied to Add Attachement" });
        }
      } else {
        res.status(422);
        res.send({ message: "ProjectMember does not exist" });
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
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          userId: req.user.id,
          projectId: projectId
        }
      });
      if (
        (projectMember && projectMember.role === "admin") ||
        projectMember.role === "manager"
      ) {
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
        } else {
          res.status(422);
          res.send({ message: "Project Attachment does not exist" });
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
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: req.user.id
      }
    });
    if (projectMember) {
      const attachments = await prisma.projectAttachment.findMany({
        where: {
          projectId: projectId
        }
      });
      if (attachments) {
        res.json({
          status: "success",
          data: attachments.reverse(),
          errors: []
        });
      }
    } else {
      res.status(422);
      res.send({ message: "ProjectMember does not exist" });
    }
  } catch (error) {
    res.status(422);
    res.send({ message: error });
  }
};

export const updateAllProjects = async () => {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  // This arrangement can be altered based on how we want the date's format to appear.
  let currentDate = new Date().toISOString();
  try {
    await prisma.project.updateMany({
      where: {
        startDate: null,
        startTime: null,
        status: { notIn: ["archived", "completed"] }
      },
      data: {
        status: "in_progress"
      }
    });
    await prisma.project.updateMany({
      where: {
        startDate: { not: null, gte: currentDate },
        startTime: { not: null },
        status: { notIn: ["archived", "completed"] }
      },
      data: {
        status: "draft"
      }
    });
    await prisma.project.updateMany({
      where: {
        startDate: { not: null, lte: currentDate },
        startTime: { not: null },
        endDate: { not: null, gte: currentDate },
        endTime: { not: null },
        status: { notIn: ["archived", "completed"] }
      },
      data: {
        status: "in_progress"
      }
    });
    await prisma.project.updateMany({
      where: {
        endDate: { not: null, lte: currentDate },
        endTime: { not: null },
        status: { notIn: ["archived", "completed"] }
      },
      data: {
        status: "overdue"
      }
    });
  } catch (error) {
    console.log("=====tasks updation failed");
  }
};
