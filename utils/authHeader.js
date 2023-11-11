const jwt = require("jsonwebtoken");

const TokenModel = require("../model/User/TokenModel");
const UserModel = require("../model/User/user");



exports.headerAuth = async (req, res, next) => {
  try{
  if (!req.headers.authorization) {
    return res.json({
      message: "Please make sure your request has an Authorization header lv1",
      code: 403,
    });
  }
  var token = req.headers.authorization.split(" ")[1];

  const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);
  if(!decoded){
    return res.json({
      message: "Please make sure your Authorization header is valid",
      code: 403,
    });
  }


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
}
catch(error)
{
  console.log(error)
  return res.json({
    message: "Authorization failed",
    code: 403,
  });}

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
