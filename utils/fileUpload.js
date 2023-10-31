// const multer = require("multer");

// // Set up storage for uploaded files
// const storage = multer.diskStorage({


//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     // if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//     //     return  cb ("error")
//     //   }
//     cb(null, Date.now() + "-" + file.originalname);
    
//   },
//   limits: {
//     fileSize: 2 * 1024 * 1024
// },
// fileFilter: (req, file, cb) => {
//     if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//         cb(null, true);
//     } else {
//         cb(null, false);
//         const err = new Error('Only .png, .jpg and .jpeg format allowed!')
//         err.name = 'ExtensionError'
//         return cb(err);
//     }

// }

// })
// // console.log(storage,"this is for your ")

// // Create the multer instance
// const upload = multer({ storage: storage });

// module.exports = upload;
// const multi_upload = multer({
//   storage,
//   limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
//   fileFilter: (req, file, cb) => {
//       if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//           cb(null, true);
//       } else {
//           cb(null, false);
//           const err = new Error('Only .png, .jpg and .jpeg format allowed!')
//           err.name = 'ExtensionError'
//           return cb(err);
//       }
//   },
// })


























// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads/");
//     },
//     filename: function (req, file, cb) {
//             cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0])
//     }
// });
// const multiupload = multer({
//     storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 1MB
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//             cb(null, true);
//         } else {
//             cb(null, false);
//             const err = new Error('Only .png, .jpg and .jpeg format allowed!')
//             err.name = 'ExtensionError'
//             return cb(err);
//         }
//     },
// })