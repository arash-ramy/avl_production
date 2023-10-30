const jwt = require("jsonwebtoken");
const ActivityModel = require("../model/ActivityModel");
const UserModel = require("../model/user");
const moment = require("moment");
const TokenModel = require("../model/TokenModel");
const Validator = require("validatorjs");
const multer = require('multer')

const path = require('path')


// DISABLE OTHER ACCOUNT
const disableOtherAccounts = async (userId) => {
  const today = new Date();
  return await TokenModel.update(
    { userId, state: true },
    { state: false, deleted: today },
    { multi: true }
  );
};

const updateUserActivity = async (activityname, user) => {
  const activity = new ActivityModel({
    activityname,
    activitydate: new Date(),
    username: user.username,
  });
  await activity.save(null);
};

const Signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.json({
        message: "user not found",
        code: "401",
        type: "Transaction Error",
      });
    }
    console.log(user.password);

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(
        new ErrorHandler("Please provide the correct information", 400)
      );
    }
    console.log(user, "this si user");
    if (user.username !== "admin" && !user.isapproved) {
      return res.json({
        message: "user has been disabled",
        code: "403",
        type: "Authentication Error ",
      });
    }
    if (user.islockedout) {
      return res.json({
        message: "user can't login, user doesn't exist or is blocked",
        code: "200",
        type: "Authentication Error",
      });
    }
    console.log("passed", user._id);
    const useridd = user._id;
    const today = new Date();
    await TokenModel.updateMany(
      { userId: useridd, state: true },
      { state: false, deleted: today },
      { multi: true }
    );

    // tracking activity user
    const activity = new ActivityModel({
      activityname: "ورود به سیستم",
      activitydate: new Date(),
      username: user.username,
    });

    await activity.save();

    const id = user._id;
    const createActivationToken = (id) => {
      return jwt.sign({ id }, process.env.ACTIVATION_SECRET, {
        expiresIn: "7d",
      });
    };
    console.log("object");

    // const expires =new Date(Date.now() + 7* 24 * 60 * 60 * 1000);
    const expires = moment().add(7, "days").valueOf();
    const token = createActivationToken(user);
    console.log(expires);

    const userToken = new TokenModel({
      userId: user.id,
      token,
      exp: expires,
    });
    console.log("object");
    await userToken.save();

    console.log(createActivationToken(user));

    console.log("resid");
    const result = Object.assign(user.getBrief(), {
      authorization: token,
    });
    console.log("resid");

    // res.setHeader('authorization', 'ramy')

    return res.json({ result });

    // const token = jwt.encode(
    //     {
    //         iss: user.id,
    //         exp: expires,
    //     },
    //     '729183456258456'
    // );

    //   const expires = moment().add(7, "days").valueOf();
    //   const token = jwt.encode(
    //     {
    //       iss: user.id,
    //       exp: expires,
    //     },
    //     "729183456258456"
    //   );
    //   const userToken = new TokenModel({
    //     userId: user.id,
    //     token,
    //     exp: expires,
    //   });
    //   await userToken.save();
    //   const result = Object.assign(user.getBrief(), {
    //     authorization: token,
    //   });
    //   return res(result);
    // });
  } catch (error) {
    // logger.error(error);
    console.log(error);
    return res.json({
      message: "Authentication error: error in fetching data",
      code: "401",
      error,
    });
  }
};

const signup = async (req, res) => {
  console.log(req.headers);
  try {
    console.log("sign up passed");
    const user = new UserModel({
      username: req.body.username,
      hashedPassword: req.body.password,
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      gender: req.body.gender,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      salt: "1",
      isapproved: true,
      islockedout: false,
    });
    user.roles.push({ rolename: "user" });
    await user
      .save()
      .then((response) => {
        return res.json({
          message: "user added to database successfully",
          userId: user.id,
        });
      })
      .catch((error) => {
        return res.json({
          message: "user not add to database",
          code: "401",
          type: "sing up Error",
          error,
        });
      });
  } catch (ex) {
    // logger.error(ex);
    console.log(ex);
    return res.json({
      ex,
      code: "404",
    });
  }

  //   {
  //     if (error) {
  //       //   logger.error(error);
  //       return res.json({
  //         message: "user can't login, user doesn't exist or is blocked",
  //         code: "401",
  //         type: "sing up Error",
  //         error,
  //       });

  //     }
  //     logger.info(
  //       `New user ${user.firstname} ${user.lastname} added successfully`
  //     );
  //     return res.json({
  //       message: "user added to database successfully",
  //       userId: user.id,
  //     });
  //   });
};

function editUser(req, res) {
  try {
    const {
      userId,
      username,
      firstname,
      lastname,
      gender,
      email,
      mobileNumber,
    } = req.body;
    if (!userId) {
      return res.json({
        message: "userId required",
        code: "422",
        validate: false,
        field: "userId",
      });
    }
    UserModel.findOne({ _id: userId }, function (error, user) {
      if (error) {
        // logger.error(error);
        return res.json({
          error,
          code: "500",
        });
      }
      username && (user.username = username);
      firstname && (user.firstname = firstname);
      lastname && (user.lastname = lastname);
      gender && (user.gender = gender);
      email && (user.email = email);
      mobileNumber && (user.mobileNumber = mobileNumber);

      user.save(function (error) {
        if (error) {
          // logger.error(error);
          return res.json({
            code: "500",
            error,
          });
        }
        return res.json({
          code: "200",
          user,
        });
      });
    });
  } catch (ex) {
    // logger.error(ex);
    return res.json({
      message: ex,
      code: "404",
    });
  }
}

const getUserList = async (req, res) => {
  try {
    // updateUserActivity("مشاهده لیست کاربران", req.user);
    const allUser = await UserModel.find();
    //    .select({
    //     _id: 1,
    //     username: 1,
    //     firstname: 1,
    //     lastname: 1,
    //     gender: 1,
    //     email: 1,
    //     mobileNumber: 1,
    //     roles: 1,
    //     islockedout: 1,
    //     deviceModel: 1,
    // })
    // .populate({
    //     path: 'deviceModel',
    //     select: { name: 1, _id: 0 },
    // })

    // console.log(allData, "ramy");
    // .populate({
    //     path: 'deviceModel',
    //     select: { name: 1, _id: 0 },
    // })
    // .populate('groups', 'name')
    // .lean()

    return res.json({ allUser });
  } catch (error) {
    return res.json({
      message: "Couldn`t load all users",
      code: "400",
      error: error.message,
    });
  }
};

const unlockUser = async (req, res) => {
  try {
    const user_id = req.params.userid;

    const updateToLock = await UserModel.updateOne(
      { _id: user_id },
      { $set: { islockedout: false } }
    );

    if (updateToLock) {
      return res.json({
        message: "user updated successfully",
        code: "200",
      });
    }

    console.log(updateToLock);
  } catch (error) {
    return res.json({
      message: "user  is not updated",
      systemMsg: error?.message,
      code: "400",
    });
  }
};

const lockUser = async (req, res) => {
  try {
    const user_id = req.params.userid;

    const updateToLock = await UserModel.updateOne(
      { _id: user_id },
      { $set: { islockedout: true } }
    );
    if (updateToLock) {
      return res.json({
        message: "user updated successfully",
        code: "200",
      });
    }

    console.log(updateToLock);
  } catch (error) {
    return res.json({
      message: "user  is not updated",
      systemMsg: error?.message,
      code: "400",
    });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    // console.log("rm");
    const old_password = req.body.oldpassword;
    const user_id = req.user?._id;
    const new_password = req.body.password;
    console.log(req.user);

    // console.log(object)
    // VALIDATE INPUTS
    // console.log(req.body);
    let inputs = {
      old_password: old_password,
      user_id: user_id,

      new_password: new_password,
    };

    let vald = {
      old_password: ["required", "max:30"],
      new_password: ["required", "max:25", "min:4"],
      user_id: ["required"],
    };

    let validation = new Validator(inputs, vald, {
      "required.old_password": "old_password is required",
      "required.new_password": "new_password is required",
      "max.old_password": "new password most be less than 30 caractor",
      "max.new_password": "new password most be less than 25 caractor",
      "min.new_password": "new password most be more than 4 caractor",

    });
    let status = validation.fails();
    if (status) {
      console.log("cddsf");
      let errors = validation.errors.errors;
      return res.json({
        code: 415,
        type: "InputsError",
        //  errors:errors
      });

    }
    const user = await UserModel.findOne({ _id: user_id });

    const isPasswordValid = await user.comparePassword(old_password);

    if (!isPasswordValid) {
      return res.json({
        code: 400,
        message: "old password is not currect please ",
        //  errors:errors
      });
    }
    user.hashedPassword = new_password;
    await user.save();
    return res.json({
      code: 200,
      message: "password changed successfully",
    });
   
    
  } catch (error) {
    return res.json({
      message: "change password is not changed successfully",
      systemMsg: error?.message,
      code: "400",
    });
  }
};



const changeOtherPassword = async (req,res)=>{
  try {
    const userId = req.body.userId;
    const new_password = req.body.newPassword;
    let inputs = {
      userId: userId,
      newPassword: new_password,

    };

    let vald = {
      userId: ["required"],
      newPassword: ["required", "max:25", "min:4"],
    };

    let validation = new Validator(inputs, vald, {
      "required.userId": "userId is required",
      "required.newPassword": "new Password is required",
      "max.newPassword": "new password most be less than 25 caractors",
      "min.newPassword": "new Password most be more then 4 caractors",

    });
    let status = validation.fails();
    if (status) {
      let errors = validation.errors.errors;
      return res.json({
        code: 415,
        type: "InputsError",
         errors:errors
      });
      
    }


     const userFounded = await UserModel.findOne({ _id:userId });

     if(!userFounded){
      return res.json({
        code: 400,
        message: "user not found",
        //  errors:errors
      });
     }
    //  console.log(userFounded,'this is user ramy')
    
     userFounded.hashedPassword = new_password;
     await userFounded.save().then(()=>{
       res.json({
         code:200,
         message:"user password change successfully "
       })
     })
  }
    catch (error) {
      return res.json({
        message: "",
        systemMsg: error?.message,
        code: "400",
      });
    }
  };



  const uploadProfilePicture =async (req,res)=>{
    
    

    console.log(req)
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/')
        console.log(req, file ,cb)
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext);
    }
})
      


    //   const { userId } = data;
    //   const name = data.file.hapi.filename;
    //   UserModel.findOne({ _id: userId }).exec(function(err, user) {
    //       if (err) {
    //           logger.error(err);
    //           return res({ msg: err }).code(404);
    //       }
    //       if (!user) {
    //           return res({ msg: 'user not found' }).code(404);
    //       }
    //       user.profileImage = name;
    //       user.save(null);
    //       const path = `${__dirname}/../uploads/users/${userId}/${name}`;
    //       if (!fs.existsSync(`${__dirname}/../uploads`)) {
    //           fs.mkdirSync(`${__dirname}/../uploads`);
    //       }
    //       if (!fs.existsSync(`${__dirname}/../uploads/users`)) {
    //           fs.mkdirSync(`${__dirname}/../uploads/users`);
    //       }
    //       if (
    //           !fs.existsSync(
    //               `${__dirname}/../uploads/users/${userId}`
    //           )
    //       ) {
    //           fs.mkdirSync(`${__dirname}/../uploads/users/${userId}`);
    //       }
    //       const file = fs.createWriteStream(path);
    //       file.on('error', function(errFile) {
    //           logger.error(errFile);
    //           return res({ msg: errFile }).code(404);
    //       });
    //       data.file.pipe(file);
    //       data.file.on('end', function(errFile) {
    //           const ret = {
    //               filename: data.file.hapi.filename,
    //               headers: data.file.hapi.headers,
    //           };
    //           return res(JSON.stringify(ret)).code(200);
    //       });
    //   });



    // }

  }




























const addRoleToUser = async (req, res) => {
  try {
    const { userId, roleName } = req.body;
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res({ msg: "User not found" }).code(404);
    }
    if (!user.roles.find((role) => role.rolename === roleName)) {
      user.roles.push({ rolename: roleName, roledesc: roleName });
      await user.save();
    }
    return res({
      msg: "Role added to user successfully!",
      data: user,
    }).code(200);
  } catch (ex) {
    logger.error(ex);
    return res({ msg: ex }).code(404);
  }
};

// function getUser(req, res) {
//   updateUserActivity("دریافت کاربر یا ایمیل", req.user);
//   if (req.params.email) {
//     UserModel.findOne({ email: req.params.email }, function (error, user) {
//       if (error) {
//         // logger.error(error);
//         res.json({
//           error,
//           code: "500",
//         });
//       }
//       return res(user.getBrief());
//     });
//   }
// }

const test = async (req, res) => {
  // console.log(req)
  
  console.log(req.user.roles)

  // console.log(req.headers)
  // console.log(object);
};
module.exports = {
  Signin,
  signup,
  editUser,
  getUserList,
  lockUser,
  unlockUser,
  changeUserPassword,
  changeOtherPassword,
  uploadProfilePicture,
  addRoleToUser,
  test,
};

// let vald = {
//   Machines: ["required", "max:25", "min:1"],
//   MachinesID: ["required", "numeric"],
//   MachinesCode: ["required", "max:33", "min:1"],
//   Plate: ["required", "max:33", "min:1"],
//   Drivername: ["required", "max:20", "min:3"],
//   FuelType: ["required", "max:25", "min:1"],
//   FuelTypeID: ["required", "numeric"],
//   CartexGasolineID: ["required", "numeric"],
//   CreateBy: ["required", "max:20", "min:3"],
//   FuelDailyQuta: ["required", "max:20", "min:3"],
// };
