import prisma from "../db";

export const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        userId: req.user.id
      }
    });
    res.json({
      status: "success",
      data: notifications,
      errors: []
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notifications.deleteMany({
      where: {
        userId: req.user.id
      }
    });
    res.json({
      status: "success",
      data: notifications,
      errors: []
    });
  } catch (error) {
    next(error);
  }
};
