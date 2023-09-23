import prisma from "../db";
import { createJWT, hashPassword, comparePasswords } from "../modules/auth";

export const createNewUser = async (req, res, next) => {
  const hash = await hashPassword(req.body.password);
  try {
    const senderId = req.query.referral_code;
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: hash,
        phoneNumber: req.body.phoneNumber
      }
    });
    if (senderId) {
      await prisma.platformInvitation.create({
        data: {
          senderId: senderId,
          receiverId: user.id,
          status: "accepted"
        }
      });
    }
    const { password, ...rest } = user;
    const token = createJWT(user);
    res.json({ user: user, token: token });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email }
    });

    if (!user) {
      res.status(401);
      res.send({ status: "failed", error: "Invalid email" });
      return;
    }
    const isValid = await comparePasswords(req.body.password, user.password);

    if (!isValid) {
      res.status(401);
      res.send({ status: "failed", error: "Invalid Password" });
      return;
    }
    const token = createJWT(user);
    const { password, ...rest } = user;

    res.json({ user: rest, token });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email }
    });

    if (!user) {
      res.status(401);
      res.send({ status: "failed", error: "Invalid email" });
      return;
    }

    const hash = await hashPassword(req.body.password);

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hash
      }
    });

    const token = createJWT(updatedUser);
    const { password, ...rest } = updatedUser;

    res.json({ user: rest, token });
  } catch (error) {
    next(error);
  }
};
