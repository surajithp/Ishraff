import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

export const comparePasswords = (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password) => {
  return bcrypt.hash(password, 5);
};

export const createJWT = (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "10h"
    }
  );
  return token;
};

export const protect = (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    res.status(401);
    res.send({
      data: {
        status: "error",
        code: "token-expired"
      }
    });
    return;
  }

  const [, token] = bearer.split(" ");
  if (!token) {
    console.log("here");
    res.status(401);
    res.send({
      data: {
        status: "error",
        code: "token-expired"
      }
    });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        res.status(401);
        res.send({
          data: {
            status: "error",
            code: "token-expired"
          }
        });
      } else {
        console.log("Token verifified successfully");
        if (decoded) {
          req.user = decoded;
          console.log(decoded);
          next();
        }
      }
    });
  } catch (e) {
    res.status(401);
    res.send({
      data: {
        status: "error",
        code: "token-expired"
      }
    });
    return;
  }
};
