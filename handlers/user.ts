import prisma from "../db";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";
import { slugifyString } from "../modules/utils";

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

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (req.file) {
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
        const user = await prisma.user.update({
          where: {
            id: req.user.id
          },
          data: {
            profileImageKey: objectKey
          }
        });
        if (user) {
          res.json({
            status: "success",
            data: user,
            errors: []
          });
        } else {
          res.status(422);
          res.send({ message: "Profile Image updation failed" });
        }
      }
    } else {
      res.status(422);
      res.send({ message: "No file existed" });
    }
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
