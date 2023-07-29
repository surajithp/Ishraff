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
