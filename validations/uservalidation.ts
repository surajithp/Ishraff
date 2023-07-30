export const userDataValidate = (req, res, next) => {
  if (!req.body.username) {
    throw Error("username is required");
  }
  if (!req.body.email) {
    throw Error("email is required");
  }
  if (!req.body.phoneNumber) {
    throw Error("mobile number is required");
  }
  if (!req.body.password) {
    throw Error("password is required");
  }
  if (req.body.password.length < 5) {
    throw Error("password should have atleast 5 characters");
  }
  next();
};
