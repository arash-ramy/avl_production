const mongoose = require('mongoose');
const { UserModel } = require('../User/user');

const { Schema } = mongoose;

const ActionEvent = new Schema({
    userId: { type: Schema.ObjectId, ref: "users" },
    date: { type: Date },
    objectModel: { type: String },
    objectId: { type: Schema.ObjectId },
    actionType: { type: String },
    fieldName: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
});

const ActionEventModel = mongoose.model('actionevent', ActionEvent);

module.exports = ActionEventModel;
