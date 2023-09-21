import prisma from "../db";

export const createProjectTask = async (req, res, next) => {
  try {
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
              res.status(422);
              res.send({
                message: `Managed User is not Project Member`
              });
            }
          }
          console.log("===managedUser", managedUser);
          const assignedMember = await prisma.projectMember.findFirst({
            where: {
              id: req.body.memberId,
              projectId: projectId
            }
          });
          if (assignedMember) {
            const task = await prisma.projectTask.create({
              data: {
                name: req.body.name,
                userId: req.user.id,
                description: req.body.description,
                memberId: req.body.memberId,
                projectId: projectId,
                managedUserId: managedUser.user.id,
                managedUserName: managedUser.user.username,
                updatedAt: new Date().toISOString(),
                status: "DRAFT",
                startDate: req.body?.startDate,
                startTime: req.body?.startTime,
                endDate: req.body?.endDate,
                endTime: req.body?.endTime
              }
            });
            if (task) {
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
            res.status(422);
            res.send({
              message: `Assigned User is not Project Member`
            });
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
      const memberDetails = await prisma.projectMember.findFirst({
        where: {
          id: req.body.memberId
        }
      });
      if (memberDetails && taskDetails) {
        let userId = req.body.userId;
        if (!userId) {
          userId = req.user.id;
        }
        const task = await prisma.projectTask.update({
          where: {
            id: taskId
          },
          data: {
            ...req.body
          }
        });
        if (task) {
          res.json({
            status: "success",
            data: task,
            errors: []
          });
        } else {
          res.status(422);
          res.send({ message: "Task not created" });
        }
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
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
      const projectTasks = await prisma.projectTask.findMany({
        where: {
          projectId: projectId
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
      const tasks = projectTasks.map((task) => {
        return {
          created_at: task.createdAt,
          created_by: task.createdBy.username,
          assigned_at: task.createdAt,
          assigned_to: task.assignedTo.user.username,
          managed_by: task.managedUserId,
          status: task.status,
          name: task.name,
          due_by: task.endDate
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
