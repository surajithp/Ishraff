import prisma from "../db";
import { TASK_STATUS } from "@prisma/client";

export const createProjectTask = async (req, res, next) => {
  try {
    let isDraft = false;
    let status: any = "in_progress";
    if (req.query.draft) {
      isDraft = true;
    }
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const memberDetails = await prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: req.user.id
        },
        include: {
          user: true
        }
      });
      if (memberDetails) {
        let isEligibleToCreateTask =
          memberDetails.role === "manager" || memberDetails.role === "admin";
        if (isEligibleToCreateTask) {
          const managedMemberId = req.body.managedMemberId;
          let managedUser = null;
          if (managedMemberId === "self") {
            managedUser = memberDetails;
          } else {
            const projectMemberDetails = await prisma.projectMember.findFirst({
              where: {
                id: managedMemberId,
                projectId: projectId
              },
              include: {
                user: true
              }
            });
            if (projectMemberDetails) {
              managedUser = projectMemberDetails;
            } else {
              throw new Error("Managed User is not Project Member");
            }
          }
          if (managedUser.role !== "admin" && managedUser.role !== "manager") {
            throw new Error("Managed User should be Admin or Manager");
          }
          let assignedMember = null;
          if (req.body.memberId === "self") {
            assignedMember = await prisma.projectMember.findFirst({
              where: {
                userId: req.user.id,
                projectId: projectId
              }
            });
          } else {
            assignedMember = await prisma.projectMember.findFirst({
              where: {
                id: req.body.memberId,
                projectId: projectId
              }
            });
          }
          if (assignedMember) {
            if (isDraft) {
              status = "draft";
            }
            const task = await prisma.projectTask.create({
              data: {
                name: req.body.name,
                userId: req.user.id,
                description: req.body.description,
                memberId: assignedMember.id,
                projectId: projectId,
                managedUserId: managedUser.user.id,
                managedMemberId: managedUser.id,
                managedUserName: managedUser.user.username,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: status,
                startDate: req.body?.startDate,
                startTime: req.body?.startTime,
                endDate: req.body?.endDate,
                endTime: req.body?.endTime
              }
            });
            if (task) {
              if (projectDetails.status === "completed") {
                await prisma.project.update({
                  where: {
                    id: projectId
                  },
                  data: {
                    status: "in_progress"
                  }
                });
              }
              if (req.body.startDate) {
                const startDateInMilliSecs = new Date(
                  req.body.startDate
                ).getTime();
                const currentTimeInMilliSecs = new Date().getTime();
                if (startDateInMilliSecs > currentTimeInMilliSecs) {
                  status = "draft";
                  await prisma.projectTask.update({
                    where: {
                      id: task.id
                    },
                    data: {
                      status: status
                    }
                  });
                }
              }
              await prisma.notifications.create({
                data: {
                  userId: assignedMember.userId,
                  type: "task",
                  title: `${projectDetails.name} task creation`,
                  description: `Task - ${task.name} has been created under ${projectDetails.name}. Please check`
                }
              });
              if (assignedMember.userId !== managedUser.userId) {
                await prisma.notifications.create({
                  data: {
                    userId: managedUser.userId,
                    type: "task",
                    title: `${projectDetails.name} task creation`,
                    description: `Task - ${task.name} has been created under ${projectDetails.name}. Please check`
                  }
                });
              }
              res.json({
                status: "success",
                data: task,
                errors: []
              });
            } else {
              res.status(422);
              res.send({ message: "Task not created" });
            }
          } else {
            throw new Error("Assigned User is not Project Member");
          }
        } else {
          res.status(422);
          res.send({
            message: `Project Member with role ${memberDetails.role} cannot create task`
          });
        }
      } else {
        res.status(422);
        res.send({ message: "Project member does not exist" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

// export const createProjectTask = async (req, res, next) => {
//   try {
//     const projectId = req.params.id;
//     const projectDetails = await prisma.project.findFirst({
//       where: {
//         id: projectId
//       }
//     });
//     if (projectDetails) {
//       let userId = req.body.userId;
//       if (!userId) {
//         userId = req.user.id;
//       }
//       const task = await prisma.projectTask.create({
//         data: {
//           name: req.body.name,
//           description: req.body.description,
//           memberId: req.body.memberId,
//           userId: userId,
//           projectId: projectId
//         }
//       });
//       if (task) {
//         res.json({
//           status: "success",
//           data: task,
//           errors: []
//         });
//       } else {
//         res.status(422);
//         res.send({ message: "Task not created" });
//       }
//     } else {
//       res.status(422);
//       res.send({ message: "Project does not exist" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const updateProjectTask = async (req, res, next) => {
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
        const memberDetails = await prisma.projectMember.findFirst({
          where: {
            projectId: projectId,
            userId: req.user.id
          }
        });
        if (!memberDetails) {
          throw new Error("Project Member does not exist");
        }
        if (
          memberDetails.role === "admin" ||
          req.user.id === taskDetails.managedUserId
        ) {
          let { memberId, managedMemberId, ...rest } = req.body;
          const data = {
            ...rest
          };
          if (memberId === "self") {
            const assignedMember = await prisma.projectMember.findFirst({
              where: {
                userId: req.user.id,
                projectId: projectId
              }
            });
            memberId = assignedMember.id;
          }
          if (taskDetails.memberId !== memberId) {
            data.memberId = memberId;
            await prisma.taskModifications.create({
              data: {
                newMemberId: memberId,
                oldMemberId: taskDetails.memberId,
                taskId: taskDetails.id
              }
            });
          }
          if (managedMemberId === "self") {
            managedMemberId = req.user.id;
          }
          if (managedMemberId) {
            const managedMember = await prisma.projectMember.findFirst({
              where: {
                projectId: projectId,
                userId: managedMemberId
              },
              include: {
                user: true
              }
            });
            if (
              managedMember &&
              managedMemberId !== taskDetails.managedUserId
            ) {
              data.managedUserId = managedMember.userId;
              data.managedUserName = managedMember.user.username;
              await prisma.taskModifications.create({
                data: {
                  newManagedUserId: managedMember.userId,
                  oldManagedUserId: taskDetails.managedUserId,
                  taskId: taskDetails.id
                }
              });
            }
          }
          if (req.body.startDate) {
            let startDateInMilliSecs = new Date(req.body.startDate).getTime();
            const currentTimeInMilliSecs = new Date().getTime();
            const startTime = req.body.startTime;
            const [hours, minutes] = startTime.split(":");
            startDateInMilliSecs =
              startDateInMilliSecs +
              (hours * 60 * 60 + minutes * 60) * 1000 -
              4 * 60 * 60 * 1000;
            if (
              taskDetails.status === "draft" &&
              startDateInMilliSecs < currentTimeInMilliSecs
            ) {
              data.status = "in_progress";
            } else if (
              taskDetails.status === "in_progress" &&
              startDateInMilliSecs > currentTimeInMilliSecs
            ) {
              data.status = "draft";
            }
          }
          if (req.body.endDate) {
            let endDateInMilliSecs = new Date(req.body.endDate).getTime();
            const currentTimeInMilliSecs = new Date().getTime();
            const endTime = req.body.endTime;
            const [hrs, mnts] = endTime.split(":");
            endDateInMilliSecs =
              endDateInMilliSecs +
              (hrs * 60 * 60 + mnts * 60) * 1000 -
              4 * 60 * 60 * 1000;
            if (endDateInMilliSecs < currentTimeInMilliSecs) {
              data.status = "overdue";
            } else if (
              taskDetails.status === "overdue" &&
              endDateInMilliSecs > currentTimeInMilliSecs
            ) {
              data.status = "in_progress";
            }
          }
          const task = await prisma.projectTask.update({
            where: {
              id: taskId
            },
            data: data
          });
          if (task) {
            res.json({
              status: "success",
              data: task,
              errors: []
            });
          } else {
            res.status(422);
            res.send({ message: "Task not updated" });
          }
        } else {
          throw new Error(
            "Project Admin or Task Manager can  edit task details"
          );
        }
      } else {
        throw new Error("Task  does not exist");
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const submitProjectTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    const projectMemberDetails = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id,
        projectId: projectId
      },
      include: {
        user: true
      }
    });
    if (projectDetails && projectMemberDetails) {
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (
        taskDetails.status === "in_progress" ||
        taskDetails.status === "overdue"
      ) {
        let status: TASK_STATUS = "in_review";
        // if (taskDetails.status === "overdue") {
        //   status = "overdue";
        // }
        if (taskDetails.memberId === projectMemberDetails.id) {
          const task = await prisma.projectTask.update({
            where: {
              id: taskId
            },
            data: {
              status: status,
              submittedAt: new Date().toISOString()
            }
          });
          await prisma.notifications.create({
            data: {
              userId: taskDetails.managedUserId,
              type: "task",
              title: `Task status change`,
              description: `Task-${taskDetails.displayId} has been submitted by ${projectMemberDetails.user.username} for the task - ${taskDetails.name}`
            }
          });
          res.json({
            status: "success",
            data: task,
            errors: []
          });
        } else {
          res.status(422);
          res.send({ message: "Member is not assigned to task" });
        }
      } else {
        res.status(422);
        res.send({ message: "Task cannot be submittted" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const approveProjectTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    const projectMemberDetails = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id,
        projectId: projectId
      },
      include: {
        user: true
      }
    });
    if (projectDetails && projectMemberDetails) {
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        },
        include: {
          assignedTo: true
        }
      });
      if (taskDetails.status === "in_review") {
        if (
          projectMemberDetails.role === "admin" ||
          taskDetails.managedUserId === projectMemberDetails.userId
        ) {
          let status: TASK_STATUS = "completed";
          const endDate = new Date(taskDetails.endDate);
          const endDateInMilliSecs = new Date(taskDetails.endDate).getTime();
          if (endDateInMilliSecs < new Date().getTime()) {
            status = "delayed";
          }
          const task = await prisma.projectTask.update({
            where: {
              id: taskId
            },
            data: {
              status: status,
              completedAt: new Date().toISOString(),
              isCompleted: true
            }
          });
          const projectTasks = await prisma.projectTask.findMany({
            where: {
              projectId: projectId,
              isArchived: false
            }
          });
          const totalTasks = projectTasks;
          const completedTasks = projectTasks.filter(
            (task) => task.status === "completed" || task.status === "delayed"
          );
          if (
            totalTasks.length > 1 &&
            totalTasks.length === completedTasks.length
          ) {
            await prisma.project.update({
              where: {
                id: projectId
              },
              data: {
                completedAt: new Date().toISOString(),
                status: "completed"
              }
            });
          }
          await prisma.notifications.create({
            data: {
              userId: taskDetails.assignedTo.userId,
              type: "task",
              title: `Task status change`,
              description: `Task-${taskDetails.displayId} has been approved by ${projectMemberDetails.user.username} for the task - ${taskDetails.name}`
            }
          });
          res.json({
            status: "success",
            data: task,
            errors: []
          });
        } else {
          res.status(422);
          res.send({
            message:
              "User should be project admin or task manager to approve the task"
          });
        }
      } else {
        res.status(422);
        res.send({ message: "Task cannot be approved" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const reopenProjectTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    const projectMemberDetails = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id,
        projectId: projectId
      }
    });
    if (projectDetails && projectMemberDetails) {
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (taskDetails.status === "completed") {
        if (
          projectMemberDetails.role === "admin" ||
          taskDetails.managedUserId === projectMemberDetails.userId
        ) {
          let status: any = "in_progress";
          const endDate = taskDetails.endDate;
          const endDateInMilliSecs = new Date(endDate).getTime();
          const currentDateInMilliSecs = new Date().getTime();
          if (currentDateInMilliSecs > endDateInMilliSecs) {
            status = "overdue";
          }
          const task = await prisma.projectTask.update({
            where: {
              id: taskId
            },
            data: {
              status: status,
              reopenedAt: new Date().toISOString(),
              completedAt: null,
              isCompleted: false
            }
          });
          const taskTransition = await prisma.taskStatusTransitions.create({
            data: {
              status: "reopened",
              taskId: taskId,
              projectId: projectId,
              userId: projectMemberDetails.userId
            }
          });
          if (taskTransition) {
            res.json({
              status: "success",
              data: task,
              errors: []
            });
          } else {
            res.status(422);
            res.send({
              message: "Capturing Task transition failed"
            });
          }
        } else {
          res.status(422);
          res.send({
            message:
              "User should be project admin or task manager to reopen the task"
          });
        }
      } else {
        res.status(422);
        res.send({ message: "Only completed tasks can be reopened" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const archiveProjectTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    const projectMemberDetails = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id,
        projectId: projectId
      }
    });
    if (projectDetails && projectMemberDetails) {
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (
        projectMemberDetails.role === "admin" ||
        taskDetails.managedUserId === projectMemberDetails.userId
      ) {
        const task = await prisma.projectTask.update({
          where: {
            id: taskId
          },
          data: {
            status: "archived",
            reopenedAt: new Date().toISOString(),
            isArchived: true
          }
        });
        const taskTransition = await prisma.taskStatusTransitions.create({
          data: {
            status: "archived",
            taskId: taskId,
            projectId: projectId,
            userId: projectMemberDetails.userId
          }
        });
        if (taskTransition) {
          res.json({
            status: "success",
            data: task,
            errors: []
          });
        } else {
          res.status(422);
          res.send({
            message: "Capturing Task transition failed"
          });
        }
      } else {
        res.status(422);
        res.send({
          message:
            "User should be project admin or task manager to archive the task"
        });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const rejectProjectTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    let currentDate = new Date().toISOString();
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    const projectMemberDetails = await prisma.projectMember.findFirst({
      where: {
        userId: req.user.id,
        projectId: projectId
      }
    });
    if (projectDetails && projectMemberDetails) {
      const taskDetails = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        }
      });
      if (
        projectMemberDetails.role === "admin" ||
        taskDetails.managedUserId === projectMemberDetails.userId
      ) {
        const task = await prisma.projectTask.update({
          where: {
            id: taskId
          },
          data: {
            status: "in_progress"
          }
        });
        await prisma.projectTask.update({
          where: {
            id: taskId,
            endDate: { not: null, lte: currentDate },
            endTime: { not: null },
            status: { not: "archived" }
          },
          data: {
            status: "overdue"
          }
        });
        res.json({
          status: "success",
          data: task,
          errors: []
        });
      } else {
        res.status(422);
        res.send({
          message:
            "User should be project admin or task manager to reject the task"
        });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const showDetails = req.query.details;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const task = await prisma.projectTask.findFirst({
        where: {
          id: taskId
        },
        include: {
          assignedTo: {
            include: {
              user: true
            }
          },
          createdBy: true
        }
      });
      let managedMemberId = task.managedMemberId;
      if (!managedMemberId) {
        const managedMember = await prisma.projectMember.findFirst({
          where: {
            projectId: projectId,
            userId: task.managedUserId
          }
        });
        managedMemberId = managedMember.id;
      }
      const taskDetails = {
        id: task.id,
        projectId: task.projectId,
        created_at: task.createdAt,
        created_by: task.createdBy.username,
        assigned_at: task.createdAt,
        assigned_to: task.assignedTo.user.username,
        memberId: task.memberId,
        managedMemberId: managedMemberId,
        managed_by: task.managedUserName,
        displayId: task.displayId,
        status: task.status,
        name: task.name,
        due_by: task.endDate,
        end_time: task.endTime,
        completedAt: task.completedAt ?? null,
        description: task.description ?? null
      };
      if (taskDetails) {
        if (showDetails) {
          res.json({
            status: "success",
            data: taskDetails,
            errors: []
          });
        } else {
          res.json({
            status: "success",
            data: task,
            errors: []
          });
        }
      } else {
        res.status(422);
        res.send({ message: "Project does not have tasks" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectTaskModifications = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const taskModifications = await prisma.taskModifications.findMany({
        where: {
          taskId: taskId
        }
      });
      if (taskModifications) {
        res.json({
          status: "success",
          data: taskModifications,
          errors: []
        });
      } else {
        res.status(422);
        res.send({ message: "Project does not have tasks" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req, res, next) => {
  try {
    const createdBy = req.query.created_by;
    const assignedTo = req.query.assigned_to;
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const status = req.query.status;
      let whereParam: any = {
        projectId: projectId,
        isArchived: false
      };
      if (status) {
        whereParam = {
          projectId: projectId,
          status: status
        };
      }
      const projectTasks = await prisma.projectTask.findMany({
        where: whereParam,
        include: {
          assignedTo: {
            include: {
              user: true
            }
          },
          createdBy: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          userId: req.user.id,
          projectId: projectId
        },
        include: {
          user: true
        }
      });
      let userTasks = projectTasks;
      if (createdBy) {
        userTasks = projectTasks.filter((task) => {
          return task.userId === req.user.id;
        });
      }
      if (assignedTo) {
        userTasks = projectTasks.filter((task) => {
          return (
            task.managedUserId === req.user.id ||
            task.memberId === projectMember.id
          );
        });
      }
      userTasks.forEach((task) => {
        if (task.managedMemberId === projectMember.id) {
          task.managedUserName = projectMember.user.username;
        }
      });
      const tasks = userTasks.map((task) => {
        return {
          id: task.id,
          projectId: task.projectId,
          created_at: task.createdAt,
          created_by: task.createdBy.username,
          assigned_at: task.createdAt,
          assigned_to: task.assignedTo.user.username,
          managed_by: task.managedUserName,
          displayId: task.displayId,
          status: task.status,
          name: task.name,
          due_by: task.endDate,
          end_time: task.endTime,
          completedAt: task.completedAt ?? null,
          description: task.description ?? null
        };
      });
      if (tasks) {
        res.json({
          status: "success",
          data: tasks,
          errors: []
        });
      } else {
        res.status(422);
        res.send({ message: "Project does not have tasks" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectMemberTasks = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const status = req.query.status;
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId: projectId
      }
    });
    let whereParam: any = {
      OR: [
        {
          memberId: memberId
        },
        {
          managedUserId: projectMember.userId
        },
        {
          userId: projectMember.userId
        }
      ]
    };
    if (status) {
      whereParam = {
        OR: [
          {
            memberId: memberId
          },
          {
            managedUserId: projectMember.userId
          },
          {
            userId: projectMember.userId
          }
        ],
        status: status
      };
    }
    if (projectMember) {
      let tasks = await prisma.projectTask.findMany({
        where: whereParam,
        include: {
          assignedTo: {
            include: {
              user: true
            }
          },
          createdBy: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      tasks = tasks.filter((task) => !task.isArchived);
      tasks = tasks.filter((task) => task.projectId === projectId);
      if (tasks) {
        const projectTasks = tasks.map((task) => {
          return {
            id: task.id,
            projectId: task.projectId,
            created_at: task.createdAt,
            created_by: task.createdBy.username,
            assigned_at: task.createdAt,
            assigned_to: task.assignedTo.user.username,
            managed_by: task.managedUserName,
            displayId: task.displayId,
            memberId: task.memberId,
            managedMemberId: task.managedMemberId,
            status: task.status,
            name: task.name,
            due_by: task.endDate,
            completedAt: task.completedAt ?? null,
            end_time: task.endTime,
            description: task.description ?? null
          };
        });
        res.json({
          status: "success",
          data: projectTasks,
          errors: []
        });
      } else {
        res.status(422);
        res.send({ message: "Project does not have tasks" });
      }
    } else {
      res.status(422);
      res.send({ message: "Project Member does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

export const updateAllTasks = async () => {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  // This arrangement can be altered based on how we want the date's format to appear.
  let currentDate = new Date().toISOString();
  try {
    // await prisma.projectTask.updateMany({
    //   where: {
    //     startDate: null,
    //     startTime: null,
    //     status: { notIn: ["archived", "completed", "overdue"] }
    //   },
    //   data: {
    //     status: "in_progress"
    //   }
    // });
    await prisma.projectTask.updateMany({
      where: {
        startDate: { gte: currentDate },
        startTime: { not: null },
        status: { not: "archived" }
      },
      data: {
        status: "draft"
      }
    });
    await prisma.projectTask.updateMany({
      where: {
        startDate: { lte: currentDate },
        startTime: { not: null },
        endDate: { gte: currentDate },
        endTime: { not: null },
        status: { in: ["draft"] }
      },
      data: {
        status: "in_progress"
      }
    });
    await prisma.projectTask.updateMany({
      where: {
        startDate: { lte: currentDate },
        startTime: { not: null },
        endDate: { lte: currentDate },
        endTime: { not: null },
        status: { notIn: ["archived", "completed", "delayed", "overdue"] }
      },
      data: {
        status: "overdue"
      }
    });
  } catch (error) {
    console.log("=====tasks updation failed");
  }
};
