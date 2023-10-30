const jwt = require("jsonwebtoken");
const ActivityModel = require("../model/ActivityModel");
const UserModel = require("../model/user");
const moment = require("moment");
const TokenModel = require("../model/TokenModel");


// DISABLE OTHER ACCOUNT
function disableOtherAccounts(userId) {
  const today = new Date();
  return TokenModel.update(
    { userId, state: true },
    { state: false, deleted: today },
    { multi: true }
  );
}

function updateUserActivity(activityname, user) {
  const activity = new ActivityModel({
    activityname,
    activitydate: new Date(),
    username: user.username,
  });
  activity.save(null);
}

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
    // TRACK USER ACTIVITY => LOGIN
    // updateUserActivity("ورود به سیستم", user);
    // await disableOtherAccounts(user.id);

    // create activation token
    const id = user._id;
    const createActivationToken = (id) => {
      return jwt.sign({ id }, process.env.ACTIVATION_SECRET, {
        expiresIn: "7d",
      });
    };
    console.log("object")

    // const expires =new Date(Date.now() + 7* 24 * 60 * 60 * 1000);
    const expires = moment()
                    .add(7, 'days')
                    .valueOf(); 
    const token = createActivationToken(user);
    console.log(expires)

    const userToken = new TokenModel({
      userId: user.id,
      token,
      exp: expires,
    });
    console.log("object")
    await userToken.save();

    console.log(createActivationToken(user));

console.log("resid")
    const result = Object.assign(user.getBrief(), {
      authorization: token,
  });
  console.log("resid")
 
    // res.setHeader('authorization', 'ramy')

  return res.json({result});

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
    console.log(error)
    return res.json({
      message: "Authentication error: error in fetching data",
      code: '401',
      error
    });
  }
};

const signup = async (req, res) => {
  console.log(req.headers)
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

function getUserList(req, res) {
  // updateUserActivity("مشاهده لیست کاربران", req.user);
  UserModel.find()
    .select({
      _id: 1,
      username: 1,
      firstname: 1,
      lastname: 1,
      gender: 1,
      email: 1,
      mobileNumber: 1,
      roles: 1,
      islockedout: 1,
      deviceModel: 1,
    })
    // .populate({
    //     path: 'deviceModel',
    //     select: { name: 1, _id: 0 },
    // })
    // .populate('groups', 'name')
    // .lean()
    .exec(function (error, users) {
      if (error) {
        // logger.error(error);
        return res.json({
          message: error,
          code: "401",
        });
      }
      return res.json({
        users,
      });
    });
}
function getUser(req, res) {
  updateUserActivity("دریافت کاربر یا ایمیل", req.user);
  if (req.params.email) {
    UserModel.findOne({ email: req.params.email }, function (error, user) {
      if (error) {
        // logger.error(error);
        res.json({
          error,
          code: "500",
        });
      }
      return res(user.getBrief());
    });
  }
}










const test = async (req, res) => {
console.log(req.body)
console.log(req.headers)

};
module.exports = {
  Signin,
  signup,
  editUser,
  getUserList,
  getUser,
  test
};
