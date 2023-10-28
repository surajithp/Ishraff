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

export const deleteUserNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await prisma.notifications.delete({
      where: {
        id: notificationId
      }
    });
    res.json({
      status: "success",
      data: notification,
      errors: []
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotifications = async () => {
  try {
    let currentDate = new Date().toISOString();
    await prisma.notifications.deleteMany({
      where: {
        createdAt: { not: null, lte: currentDate }
      }
    });
  } catch (error) {}
};
