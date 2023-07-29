export const generateInvitationCode = (req, res) => {
  const userId = req.user.id;
  res.json({ status: "success", code: userId, errors: [] });
};
