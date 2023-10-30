const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const UserRole = new Schema({
    rolename: { type: String },
    roledesc: String,
});

const User = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    hashedPassword: { type: String, required: true },
    salt: { type: String, required: true },
    registeredDate: { type: String, default: new Date()},
    roles: [UserRole],
    deviceModel: [
        {
            type: Schema.ObjectId,
            ref: 'vehicletype',
        },
    ],
    firstname: String,
    lastname: String,
    mobileNumber: String,
    gender: { type: String, enum: ['Female', 'Male', 'Customer', 'Agent'] },
    email: { type: String, unique: true, required: true },
    isapproved: Boolean,
    islockedout: Boolean,
    profileImage: String,
});

User.virtual('groups', {
    ref: 'devicegroup',
    localField: '_id',
    foreignField: 'sharees',
});

//  Hash password
User.pre("save", async function (next){
    if(!this.isModified("hashedPassword")){
      next();
    }
  
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10);
  });
  
// User.methods.verifyPassword = function(password, callback) {
//     bcrypt.compare(password, this.hashedPassword, (err, isMatch) => {
//         if (err) return callback(err);
//         callback(null, isMatch);
//     });
// };
// compare password
User.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.hashedPassword);
  };
User.methods.getBrief = function() {
    const {
        id,
        username,
        email,
        firstname,
        lastname,
        registerDate,
        mobileNumber,
        gender,
        roles,
    } = this;
    return {
        id,
        username,
        email,
        firstname,
        lastname,
        registerDate,
        mobileNumber,
        gender,
        roles,
    };
};

User.methods.isAdmin = function isAdmin() {
    return this.username === 'admin';
};

User.methods.can = function hasRole(roleName) {
    return this.roles.some(({ rolename }) => rolename === roleName);
};

const UserModel = mongoose.model('users', User);

module.exports = UserModel;