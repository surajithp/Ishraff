import prisma from "../db";

export const getProjects = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id
    },
    include: {
      projects: true
    }
  });
  res.json({ status: "success", data: user.projects, errors: [] });
};

export const getProject = async (req, res) => {
  const projectId = req.params.id;
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      belongsToId: req.user.id
    }
  });
  res.json({ status: "success", data: project, errors: [] });
};

export const createProject = async (req, res) => {
  const project = await prisma.project.create({
    data: {
      name: req.body.name,
      type: req.body.type,
      location: req.body.location,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      belongsToId: req.user.id
    }
  });
  res.json({ status: "success", data: project, errors: [] });
};

export const createProjectMember = async (req, res) => {
  const member = await prisma.projectMember.create({
    data: {
      role: req.body.role,
      userId: req.body.userId,
      projectId: req.body.projectId
    }
  });
  res.json({ status: "success", data: member, errors: [] });
};

export const getPlatformUsers = async (req, res) => {
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
};

export const getProjectMembers = async (req, res) => {
  const projectId = req.params.id;
  const role = req.query.role;
  console.log("=role", role);
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
