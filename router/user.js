const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const userController = require("../controller/userController");
const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/prof-uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.user._id + "-" + new Date().getTime() + path.extname(file.originalname));
  },
});

const limits = {
  files: 1,
  fileSize: 1024 * 1024,
};

// Multer upload configuration
const upload = multer({ storage, limits });

// User Authentication Routes
router.post("/signin", userController.Signin);
router.post("/signup", userController.signup);

// User Management Routes
router.get("/",headerAuth, userController.getUserList);
router.put("/", headerAuth, userController.editUser);
router.get("/lock/:userid", headerAuth, userController.lockUser);
router.get("/unlock/:userid", headerAuth, userController.unlockUser);
router.post("/change-password", headerAuth, userController.changeUserPassword);
router.post("/change-password-other", headerAuth, userController.changeOtherPassword);

// Additional User Information Routes
router.get("/berif", headerAuth, userController.getLisOftNameAndUserName);
router.post("/passwordrecovery", headerAuth, userController.forgotPasswordRequest);
router.post("/phoneNumbers/add", headerAuth, userController.addPhoneNumber);
router.get("/phoneNumbers/show", headerAuth, userController.getPhoneBook);

// Profile Picture Routes
// router.post("/upload-profile", headerAuth, upload.single("file"), userController.uploadProfilePicture);
// router.get("/get-profile", userController.getProfilePicture);

// Role Management Routes
router.post("/addRoleToUser",headerAuth, userController.addRoleToUser);

// Testing Route
// router.post("/test", headerAuth, userController.test);

module.exports = router;
