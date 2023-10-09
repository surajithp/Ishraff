import { body, validationResult } from "express-validator";

export const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    res.json({ errors: errors.array() });
  } else {
    next();
  }
};

const fileFilterMiddleware = (req, file, cb) => {
  const fileSize = parseInt(req.headers["content-length"]);

  if (
    (file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "application/octet-stream") &&
    fileSize <= 1282810
  ) {
    cb(null, true);
  } else if (file.mimetype === "video/mp4" && fileSize <= 22282810) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
