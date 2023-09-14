// import { Prisma } from "@prisma/client";

// export const handlePrismaKnownRequestError = (err, req, res, next) => {
//   switch (err.code) {
//     case "P2002":
//       // handling duplicate key errors
//       res.status(400);
//       res.send({
//         message: `Duplicate field value: ${err.meta.target}`
//       });
//     case "P2014":
//       // handling invalid id errors
//       res.status(400);
//       res.send({
//         message: `Invalid ID: ${err.meta.target}`
//       });
//     case "P2003":
//       // handling invalid data errors
//       res.status(400);
//       res.send({
//         message: `Invalid input data: ${err.meta.target}`
//       });
//     default:
//       // handling all other errors
//       res.status(500);
//       res.send({
//         message: `Something went wrong: ${err.message}`
//       });
//   }
// };

// export const handlePrismaClientInitializationError = (err, req, res, next) => {
//   console.log("=errcode", err.errorCode);
//   switch (err.errorCode) {
//     case "P1001":
//       res.status(503);
//       res.send({
//         message: `Service is temporary unavailable`
//       });
//     default:
//       // handling all other errors
//       res.status(500);
//       res.send({
//         message: `Something went wrong`
//       });
//   }
// };

// const errorHandler = (err, req, res, next) => {
//   if (err instanceof Prisma.PrismaClientKnownRequestError) {
//     console.log("===if");
//     handlePrismaKnownRequestError(err, req, res, next);
//   } else if (err instanceof Prisma.PrismaClientInitializationError) {
//     console.log("===else if");
//     handlePrismaClientInitializationError(err, req, res, next);
//   } else {
//     console.log("===else");
//     res.status(500);
//     res.send({
//       message: `Internal server error`
//     });
//   }
// };

// export default errorHandler;
