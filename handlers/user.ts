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
    // const senderId = req.query.referral_code;
    const data = {
      username: req.body.username,
      email: req.body.email,
      password: hash,
      phoneNumber: req.body.phoneNumber
    };
    console.log("===data", data);
    // if (senderId) {
    //   await prisma.platformInvitation.create({
    //     data: {
    //       senderId: senderId,
    //       receiverId: user.id,
    //       status: "accepted"
    //     }
    //   });
    // }
    const token = createJWT(data);
    let OTP = Math.floor(100000 + Math.random() * 900000);
    if (OTP) {
      const createdOtp = await prisma.mobileOtp.create({
        data: {
          userId: token,
          otp: OTP,
          expiryTime: 300,
          phone_number: data.phoneNumber
        }
      });
      res.json({ token: token, data: data, createdOtp });
    }
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  const token = req.body.token;
  const userData = req.body.data;
  const otp = req.body.otp;
  const otpRecord = await prisma.mobileOtp.findFirst({
    where: {
      otp: otp,
      userId: token,
      isExpired: false
    }
  });
  if (otpRecord) {
    const otpCreatedTime = new Date(otpRecord.createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeDifferenceInSeconds = (currentTime - otpCreatedTime) / 1000;
    if (timeDifferenceInSeconds < otpRecord.expiryTime) {
      const senderId = req.query.referral_code;
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          phoneNumber: userData.phoneNumber
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
        await prisma.notifications.create({
          data: {
            userId: senderId,
            type: "platform",
            title: "Platform invitation accepted",
            description: `${user.username} has joined the platform using your invite`
          }
        });
      }
      const token = createJWT(user);
      const { password, ...rest } = user;
      res.json({ user: rest, token });
    } else {
      res.status(422);
      res.send({ message: "OTP is expired" });
    }
  } else {
    res.status(422);
    res.send({ message: "OTP is invalid" });
  }
};

export const signin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
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

export const signinWithOtp = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { phoneNumber: req.body.mobile }
    });

    if (!user) {
      res.status(401);
      res.send({ status: "failed", error: "Invalid mobile Number" });
      return;
    }

    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    if (OTP) {
      const token = await hashPassword(user.id);
      const createdOtp = await prisma.mobileOtp.create({
        data: {
          userId: user.id,
          otp: parseInt(OTP),
          expiryTime: 300,
          phone_number: user.phoneNumber
        }
      });
      res.json({ token: token, createdOtp });
    }
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  const otp = req.body.otp;
  const otpRecord = await prisma.mobileOtp.findFirst({
    where: {
      otp: otp,
      isExpired: false
    }
  });
  if (otpRecord) {
    const otpCreatedTime = new Date(otpRecord.createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeDifferenceInSeconds = (currentTime - otpCreatedTime) / 1000;
    if (timeDifferenceInSeconds < otpRecord.expiryTime) {
      const isValid = await comparePasswords(otpRecord.userId, req.body.token);
      if (isValid) {
        const user = await prisma.user.findUnique({
          where: { id: otpRecord.userId }
        });
        const token = createJWT(user);
        const { password, ...rest } = user;
        res.json({ user: rest, token });
      } else {
        res.status(422);
        res.send({ message: "Token is invalid" });
      }
    } else {
      res.status(422);
      res.send({ message: "OTP is expired" });
    }
  } else {
    res.status(422);
    res.send({ message: "OTP is invalid" });
  }
};

export const updateUserProfile = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId
      }
    });
    if (user) {
      const userName = req.body.name;
      console.log("============userName", userName);
      const updatedUser = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          username: userName
        }
      });
      res.json({
        status: "success",
        data: updatedUser,
        errors: []
      });
    } else {
      res.status(422);
      res.send({ message: "User not existed" });
    }
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
