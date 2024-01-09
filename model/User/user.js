const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const UserRoleSchema = new Schema({
    rolename: String,
    roledesc: String,
});

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    hashedPassword: { type: String, required: true },
    salt: { type: String, required: true },
    registeredDate: { type: String, default: new Date() },
    roles: [UserRoleSchema],
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

UserSchema.virtual('groups', {
    ref: 'devicegroup',
    localField: '_id',
    foreignField: 'sharees',
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('hashedPassword')) {
        return next();
    }
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10);
    next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.hashedPassword);
};

UserSchema.methods.getBrief = function () {
    const { id, username, email, firstname, lastname, registerDate, mobileNumber, gender, roles } = this;
    return { id, username, email, firstname, lastname, registerDate, mobileNumber, gender, roles };
};

UserSchema.methods.isAdmin = function () {
    return this.username === 'admin';
};

UserSchema.methods.can = function (roleName) {
    return this.roles.some(({ rolename }) => rolename === roleName);
};

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;