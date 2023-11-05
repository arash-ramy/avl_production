const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
// const { upload } = require("../utils/fileUpload");

const userController = require("../controller/userController");

// login user
router.post("/signin", userController.Signin);
router.post("/signup", userController.signup);
router.get("/", userController.getUserList);

router.put("/", userController.editUser);

router.get("/lock/:userid", userController.lockUser);

router.get("/unlock/:userid", userController.unlockUser);

// auth : true
router.post("/change-password", headerAuth, userController.changeUserPassword);
// auth : true
router.post(
  "/change-password-other",
  headerAuth,
  userController.changeOtherPassword
);

router.post("/passwordrecovery", userController.forgotPasswordRequest);

router.post("/phoneNumbers/add", userController.addPhoneNumber);
router.get("/phoneNumbers/show", userController.getPhoneBook);

var multer = require("multer");
const path = require("path");

try {
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/prof-uploads");
    },
    filename: (req, file, cb) => {
      cb(null, req.user._id + -+new Date() + path.extname(file.originalname));
    },
  });
  var limits = {
    files: 1,
    fileSize: 1024 * 1024,
  };
  var upload = multer({ storage: storage, limits });
  // Create the multer instance
  // const upload = multer({ storage: storage });
} catch (error) {
  console.log(error);
}

router.post(
  "/upload-profile",
  headerAuth,
  upload.single("file"),
  userController.uploadProfilePicture
);
router.get("/get-profile", userController.getProfilePicture);
router.post("/addRoleToUser", userController.addRoleToUser);

router.post("/test", headerAuth, userController.test);

module.exports = router;
/*
 upload(req, res, async (err) => {
 
      if (err instanceof multer.MulterError) {
        
          res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } }).end();
          return;

      } else if (err) {
        
          if (err.name == 'ExtensionError') {
              res.status(413).send({ error: { message: err.message } }).end();
          } else {
              res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } }).end();
          }

          return;
      }
   
      resolve(req.files);
 */
