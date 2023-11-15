import prisma from "../db";

export const generateInvitationCode = (req, res) => {
  const userId = req.user.id;
  res.json({ status: "success", code: userId, errors: [] });
};

export const createPlatformInvitation = async (req, res) => {
  const senderInvitation = await prisma.platformInvitation.findFirst({
    where: {
      receiverId: req.body.receiverId,
    },
  });
  if (!senderInvitation) {
    const invitation = await prisma.platformInvitation.create({
      data: {
        senderId: req.user.id,
        receiverId: req.body.receiverId,
        status: "not_accepted",
      },
    });
    res.json({ status: "success", data: invitation, errors: [] });
  } else {
    res.status(422);
    res.send({ message: "User invitation already exists" });
  }
};

export const getUserProjectInvitations = async (req, res, next) => {
  try {
    const status = req.query.status;
    const invitationType = req.query.invitation_type;
    const receivedInvitations = await prisma.projectInvitation.findMany({
      where: {
        inviteeId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        invitedBy: true,
        invitee: true,
        project: true,
      },
    });
    const sentInvitations = await prisma.projectInvitation.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        invitedBy: true,
        invitee: true,
        project: true,
      },
    });
    receivedInvitations.forEach((invitation: any) => {
      invitation.invitationType = "received";
    });
    sentInvitations.forEach((invitation: any) => {
      invitation.invitationType = "sent";
    });
    let invitations = [...receivedInvitations, ...sentInvitations];
    if (status) {
      invitations = invitations.filter((item) => item.status === status);
    }
    if (invitationType) {
      invitations = invitations.filter(
        (item: any) => item.invitationType === invitationType
      );
    }
    res.json({ status: "success", data: invitations, errors: [] });
  } catch (error) {
    next(error);
  }
};

export const getUserPlatformInvitations = async (req, res) => {
  const invitations = await prisma.platformInvitation.findMany({
    where: {
      senderId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      invitedBy: {
        select: {
          email: true,
          username: true,
          phoneNumber: true,
          id: true,
          password: false,
        },
      },
      invitee: {
        select: {
          email: true,
          username: true,
          phoneNumber: true,
          id: true,
          password: false,
        },
      },
    },
  });
  // let proms = [];
  // invitations.forEach((invitation) => {
  //   proms.push(
  //     prisma.user.findFirst({
  //       where: {
  //         id: invitation.receiverId
  //       }
  //     })
  //   );
  // });
  // const data = await Promise.all(proms);
  // console.log("==data", data);
  // invitations.forEach((invitation) => {
  //   const receiverDetails = data.find(
  //     (item) => item.id === invitation.receiverId
  //   );
  //   if (receiverDetails) {
  //     invitation.receiverEmail = receiverDetails.email;
  //     invitation.receiverMobile = receiverDetails.phoneNumber;
  //     invitation.receiverName = receiverDetails.username;
  //   }
  // });
  res.json({ status: "success", data: invitations, errors: [] });
};
