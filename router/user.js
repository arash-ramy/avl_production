const express = require("express");
const router = express.Router();


const userController = require("../controller/userController")

const headerAccess= 
// login user
router.post(
    "/signin",userController.Signin);
  

router.post(
    "/signup",userController.signup
)


router.post(
    "/test",userController.test
)
module.exports = router;