const jwt = require("jsonwebtoken");

const TokenModel = require("../model/TokenModel");
const UserModel = require("../model/user");



exports.headerAuth = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.json({
      message: "Please make sure your request has an Authorization header lv1",
      code: 403,
    });
  }
  var token = req.headers.authorization.split(" ")[1];

  const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);

  const foundedUser = await  UserModel.findById({ _id: decoded.id._id });
  if (!foundedUser) {
    return res.json({
      message: "Please make sure your request has an Authorization header lv2",
      code: 403,
    });
  }
  const tokenExist =  TokenModel.exists(
    {
        token: token,
        state: true,
        userId: foundedUser._id,
    },
  )
  if (tokenExist) {
    req.user = foundedUser;
}

 foundedUser.roles.map(role => role.rolename)


  // console.log("******",tokenExist,"******")
  
  // console.log("end validation ")

  next()

  // UserModel.findOne({ _id: decoded.iss }, (error, user) => {
  //     if (!user) {
  //         return callback(new Error('Not found'), false);
  //     }
  //     if (!error) {
  //         TokenModel.exists(
  //             {
  //                 token: token,
  //                 state: true,
  //                 userId: user.id,
  //             },

  //             const req.user= TokenModel

  //             (countError, tokenExists) => {
  //                 if (tokenExists) {
  //                     request.user = user;
  //                 }
  //                 return callback(countError, tokenExists, {
  //                     scope: user.roles.map(role => role.rolename),
  //                 });
  //             }
  //         );
  //     } else {
  //         return callback(new Error('Not authorized'));
  //     }
  // });
};
