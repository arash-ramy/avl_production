const express = require("express");
const router = express.Router();


const userController = require("../controller/userController");
const { headerAuth } = require("../utils/authHeader");

const headerAccess= 
// login user
router.post(
    "/signin",userController.Signin);
  router.post(
    "/signup",userController.signup
)
router.get(
    "/",userController.getUserList
)

router.put(
    "/",userController.editUser
)

router.get(
    "/lock/:userid",userController.lockUser
)


router.get(
    "/unlock/:userid",userController.unlockUser
)

// auth : true
router.post(
    "/change-password",headerAuth,userController.changeUserPassword
)
// auth : true
router.post(
    "/change-password-other",headerAuth,userController.changeOtherPassword
)



router.post(
    "/upload-Prof-pic",userController.uploadProfilePicture
)






















router.post(
    "/addRoleToUser",userController.addRoleToUser
)



router.post(
    "/test", headerAuth, userController.test
)


module.exports = router;