import prisma from "../db";

export const getProjects = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      include: {
        projects: true
      }
    });
    res.json({ status: "success", data: user.projects, errors: [] });
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
    res.json({ status: "success", data: project, errors: [] });
  } catch (error) {
    res.status(404);
    res.send({ message: "Not found" });
  }
};

export const createProject = async (req, res) => {
  try {
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
    res.status(422);
    res.send({ message: error });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId
      }
    });
    if (projectDetails) {
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
      res.status(404);
      res.send({ message: "Project does not exist" });
    }
  } catch (error) {
    res.status(422);
    res.send({ message: error });
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
            id: req.body.memberId
          }
        });
        if (!inviteeUserDetails) {
          res.status(422);
          res.send({ message: "Member does not exist" });
        } else {
          const inviteeDetails = await prisma.projectInvitation.findFirst({
            where: {
              inviteeId: req.body.memberId
            }
          });
          if (!inviteeDetails) {
            const projectInvitation = await prisma.projectInvitation.create({
              data: {
                userId: req.user.id,
                inviteeId: req.body.memberId,
                status: "not-accepted",
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

export const getProjectInvitations = async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectInvitation = await prisma.projectInvitation.findMany({
      where: {
        projectId: projectId,
        userId: req.user.id
      },
      include: {
        invitee: true
      }
    });
    res.json({ status: "success", data: projectInvitation, errors: [] });
  } catch (error) {}
};

export const createProjectMember = async (req, res) => {
  try {
    const member = await prisma.projectMember.create({
      data: {
        role: req.body.role,
        userId: req.body.userId,
        projectId: req.body.projectId
      }
    });
    res.json({ status: "success", data: member, errors: [] });
  } catch (error) {}
};

export const getPlatformUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        phoneNumber: true,
        id: true,
        password: false
      }
    });
    res.json({ status: "success", data: users, errors: [] });
  } catch (error) {}
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
        belongsTo: true
      }
    });
    res.json({ status: "success", data: projectMembers, errors: [] });
  } else {
    const projectMembers = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        ProjectMember: true
      }
    });
    res.json({ status: "success", data: projectMembers, errors: [] });
  }
};
