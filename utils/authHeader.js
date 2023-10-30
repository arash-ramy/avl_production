const jwt = require("jsonwebtoken");

const TokenModel = require("../model/TokenModel");
const UserModel = require("../model/user");

// exports.isAuthenticated = catchAsyncErrors(async(req,res,next) => {
//     const {token} = req.cookies;

//     if(!token){
//         return next(new ErrorHandler("Please login to continue", 401));
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//     req.user = await User.findById(decoded.id);

//     next();
// });

// exports.isSeller = catchAsyncErrors(async(req,res,next) => {
//     const {seller_token} = req.cookies;
//     if(!seller_token){
//         return next(new ErrorHandler("Please login to continue", 401));
//     }

//     const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

//     req.seller = await Shop.findById(decoded.id);

//     next();
// });

// exports.isAdmin = (...roles) => {
//     return (req,res,next) => {
//         if(!roles.includes(req.user.role)){
//             return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
//         };
//         next();
//     }
// }

exports.headerAuth = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.json({
      message: "Please make sure your request has an Authorization header lv1",
      code: 403,
    });
  }
  var token = req.headers.authorization.split(" ")[1];

  const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);

//   console.log(decoded,"line-53")
  const foundedUser = await  UserModel.findById({ _id: decoded.id._id });
//   console.log("header =>  ", foundedUser);
  if (!foundedUser) {
    return res.json({
      message: "Please make sure your request has an Authorization header lv2",
      code: 403,
    });
  }
// console.log("resid",)
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

// console.log(foundedUser.roles.map(role => role.rolename),"avl")
 foundedUser.roles.map(role => role.rolename)
// console.log(foundedUser,"foundedUser")


  console.log("******",tokenExist,"******")
  //  const user =UserModel.findOne({ _id: decoded.iss})
  //     if (user) {
  //         return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });

  //     }
  console.log("end validation ")

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
