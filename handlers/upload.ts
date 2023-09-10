// import {
//   S3Client,
//   PutObjectCommand,
//   GetObjectCommand,
//   ListObjectsV2Command
// } from "@aws-sdk/client-s3";
// import axios from "axios";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import multer from "multer";

// const storage = multer.memoryStorage();
// const upload = multer({
//   storage
// });

// app.get("/", (req, res) => {
//   res.send(`
//     <h2>File Upload With <code>"Node.js"</code></h2>
//     <form action="/upload" enctype="multipart/form-data" method="post">
//       <div>Select a file:
//         <input name="file" type="file" />
//       </div>
//       <input type="submit" value="Upload" />
//     </form>

//   `);
// });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   console.log("==req", req.file);
//   const S3 = new S3Client({
//     region: "auto",
//     endpoint: process.env.ENDPOINT,
//     credentials: {
//       accessKeyId: process.env.R2_ACCESS_KEY_ID,
//       secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
//     }
//   });
//   const fileName = req.file.originalname;
//   const fileType = req.file.mimetype;
//   const objectKey = `${slugifyString(Date.now().toString())}-${slugifyString(
//     fileName
//   )}`;
//   const blob = new Blob([req.file.buffer], { type: fileType });
//   const response = await S3.send(
//     new PutObjectCommand({
//       Body: blob,
//       Bucket: process.env.BUCKET_NAME,
//       Key: objectKey,
//       ContentType: fileType
//     })
//   );
//   // console.log("key", `${process.env.BUCKET_NAME}/${objectKey}`);
//   // const presignedUrl = await getSignedUrl(
//   //   S3,
//   //   new PutObjectCommand({
//   //     Bucket: process.env.BUCKET_NAME,
//   //     Key: objectKey,
//   //     ContentType: fileType,
//   //     ACL: "public-read"
//   //   }),
//   //   {
//   //     expiresIn: 60 * 60
//   //   }
//   // );
//   // const uploadToR2Response = await axios.put(presignedUrl, {
//   //   method: "PUT",
//   //   headers: {
//   //     "Content-Type": fileType
//   //   },
//   //   body: req.file
//   // });
//   // console.log("=====uploadToR2Response", uploadToR2Response);
//   res.send("File Upload");
// });
