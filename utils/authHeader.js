const jwt = require("jsonwebtoken");

const TokenModel = require("../model/User/TokenModel");
const UserModel = require("../model/User/user");

// Middleware for handling authentication through JWT tokens
exports.headerAuth = async (req, res, next) => {
  try {
    // console.log("Middleware executed for authentication");

    // Check if the request has the Authorization header
    if (!req.headers.authorization) {
      return res.json({
        message: "Please make sure your request has an Authorization header (Level 1)",
        code: 401,
      });
    }

    // Extract the token from the Authorization header
    var token = req.headers.authorization.split(" ")[1];

    // Verify the token with the provided secret
    const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);

    // Check if the decoding was successful
    if (!decoded) {
      return res.json({
        message: "Please make sure your Authorization header is valid",
        code: 401,
      });
    }

    // Find the user associated with the decoded ID
    const foundedUser = await UserModel.findById({ _id: decoded.id._id });

    // Check if the user exists
    if (!foundedUser) {
      return res.json({
        message: "Please make sure your request has an Authorization header (Level 2)",
        code: 401,
      });
    }
console.log("username ===>",foundedUser.username)
    // Check if the token exists in the TokenModel collection
    const tokenExist = await TokenModel.exists({
      token: token,
      state: true,
      userId: foundedUser._id,
    });

    // If the token exists, set the user in the request object
    if (tokenExist) {
      req.user = foundedUser;
    }

    // Map user roles for further use
    foundedUser.roles.map((role) => role.rolename);

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Authorization failed",
      code: 403
    });
  }
};
