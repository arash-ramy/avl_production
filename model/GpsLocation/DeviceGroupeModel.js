const mongoose = require('mongoose');

const { UserModel } = require("../User/user");
const { VehicleModel } = require('./VehicleModel');

const { Schema } = mongoose;

const DeviceGroupSchema = new Schema({
    user: { type: Schema.ObjectId, ref: "users" },
    name: { type: String },
    createDate: { type: String },
    desc: { type: String },
    devices: [{ type: Schema.ObjectId, ref: "vehicle" }],
    status: { type: Boolean },
    sharees: [{ type: Schema.ObjectId, ref: "users" }],
    color: { type: String },
});

// DeviceGroupSchema.plugin(dataTables);

const DeviceGroupModel = mongoose.model('devicegroup', DeviceGroupSchema);

module.exports = DeviceGroupModel;
