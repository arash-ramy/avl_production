const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");


const userController = require("../controller/userController");


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
    "/passwordrecovery",userController.forgotPasswordRequest
)

router.post(
    "/phoneNumbers/add",userController.addPhoneNumber
)
router.get(
    "/phoneNumbers/show",userController.getPhoneBook
)

// router.post(
//     "/upload-Prof-pic",multiupload.array('files', 10),userController.uploadProfilePicture
// )





















router.post(
    "/addRoleToUser",userController.addRoleToUser
)



router.post(
    "/test", headerAuth, userController.test
)


module.exports = router;