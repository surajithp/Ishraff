import prisma from "../db";

export const createProjectTask = async (req, res) => {
  const projectId = req.params.id;
  const projectDetails = await prisma.project.findFirst({
    where: {
      id: projectId
    }
  });
  if (projectDetails) {
    const memberDetails = await prisma.projectMember.findFirst({
      where: {
        id: req.body.memberId
      }
    });
    if (memberDetails) {
      let userId = req.body.userId;
      if (!userId) {
        userId = req.user.id;
      }
      const task = await prisma.task.create({
        data: {
          name: req.body.name,
          userId: userId,
          description: req.body.description,
          memberId: req.body.memberId,
          projectId: projectId,
          managedUserId: userId,
          updatedAt: new Date().toISOString(),
          reopenedAt: null,
          status: "DRAFT"
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
};

export const getProjectTasks = async (req, res) => {
  const projectId = req.params.id;
  const projectDetails = await prisma.project.findFirst({
    where: {
      id: projectId
    }
  });
  if (projectDetails) {
    const projectTasks = await prisma.task.findMany({
      where: {
        projectId: projectId
      },
      include: {
        managedBy: true,
        assignedTo: {
          include: {
            user: true
          }
        }
      }
    });
    if (projectTasks) {
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
    res.send({ message: "Project does not exist" });
  }
};
