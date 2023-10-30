const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");
const TokenModel = require("../model/TokenModel");

exports.isAuthenticated = catchAsyncErrors(async(req,res,next) => {
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decoded.id);

    next();
});


exports.isSeller = catchAsyncErrors(async(req,res,next) => {
    const {seller_token} = req.cookies;
    if(!seller_token){
        return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

    req.seller = await Shop.findById(decoded.id);

    next();
});


exports.isAdmin = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
        };
        next();
    }
}








function validate(decoded, request, callback) {

    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
     }
     var token = req.headers.authorization.split(' ')[1];
   

    UserModel.findOne({ _id: decoded.iss }, (error, user) => {
        if (!user) {
            return callback(new Error('Not found'), false);
        }
        if (!error) {
            TokenModel.exists(
                {
                    token: token,
                    state: true,
                    userId: user.id,
                },


                const req.user= TokenModel

                
                (countError, tokenExists) => {
                    if (tokenExists) {
                        request.user = user;
                    }
                    return callback(countError, tokenExists, {
                        scope: user.roles.map(role => role.rolename),
                    });
                }
            );
        } else {
            return callback(new Error('Not authorized'));
        }
    });
  }
  