const DeviceGroupModel = require("../model/GpsLocation/DeviceGroupeModel");
const VehicleModel = require("../model/GpsLocation/VehicleModel");

const getDeviceGroups = async (req, res) => {
  try {
    var userId = req.user._id;
    const populateUser = await DeviceGroupModel.find({
      $or: [{ user: userId }, { sharees: userId }],
    }).populate({
      path: "devices",
      select:
        "_id simNumber deviceIMEI type plate driverName driverPhoneNumber gpsDataCount model",
      populate: {
        path: "model",
        select: { name: 1, _id: 0 },
      },
    });
    if (!populateUser) {
      return res.json({
        code: 400,
        message: "There is no device group",
      });
    }

    return res.json({
      code: 200,
      populateUser,
    });

    console.log(populateUser);
    //     .populate('sharees').exec(function (error, dgs) {
    //     if (error) {
    //         // logger.error(error);
    //         return res({
    //             messageSys: error.message,
    //             code: 500
    //         });
    //     }
    //     else if (!dgs) {
    //         return res({
    //             messageSys: error.message,
    //             message:"there is no device group",
    //             code: 400
    //         });
    //     }
    //     else {
    //         return res.json({dgs,
    //         code:200,

    //         });

    //     }
    // })
  } catch (error) {
    // logger.error(error);
    return res.json({
      messageSys: error.message,
      message: "somthing went wrong in getDeviceGroups",
      code: 400,
    });
  }
};

const addDeviceGroup = async (req, res) => {
  try {
    var name = req.body.name;
    var desc = req.body.desc;
    var userId = req.user._id;
    var newDeviceGroup = new DeviceGroupModel({
      name: name,
      createDate: new Date(),
      desc: desc,
      status: true,
      user: userId,
    });
    await newDeviceGroup.save();

    return res.json({
      newDeviceGroup,
      code: 200,
    });
  } catch (error) {
    logger.error(ex);
    return resjson({
      message: error.message,
      code: 400,
    });
  }
};
const getDeviceGroupById = async (req, res) => {
  try {
    var userId = req.user._id;
    var groupId = req.params.groupId;

    const founded = await DeviceGroupModel.findOne({
      $and: [{ user: userId }, { _id: groupId }],
    });
    // .populate('devices')
    // .populate({
    //     path:'sharees',
    //     populate: {
    //         path: 'deviceModel',
    //         select: {name: 1, _id: 0}
    //     }
    // })
    if (!founded) {
      return res.json({
        messag: "There is no device group",
        code: 400,
      });
    }
    return res.json({
      code: 200,
      founded,
    });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      code: 500,
      messageSys: error.message,
      message: "somthing went wrong in fetching single device type section ",
    });
  }
};
const editDeviceGroup = async (req, res) => {
  try {
    var groupId = req.body.groupId;
    var name = req.body.name;
    var desc = req.body.desc;
    var color = req.body.color;
    var userId = req.user._id;

    const founded_DG = await DeviceGroupModel.findOne({
      $and: [{ user: userId }, { _id: groupId }],
    });

    if (!founded_DG) {
      return res.json({
        code: 500,
        message: "There is no device group",
      });
    }
    name && (founded_DG.name = name);
    desc && (founded_DG.desc = desc);
    color && (founded_DG.color = color);
    await founded_DG.save();

    return res.json({
      code: 200,
      founded_DG,
    });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      message: error.message,
      message: "somthing went wrong in edit deviceGroup",
      code: 404,
    });
  }
};

const addVehicleToGroup = async (req, res) => {
  try {
    var vehicleId = req.body.vehicleId;
    var groupId = req.body.groupId;
    var userId = req.user._id;
    const foundedDeviceGroup = await DeviceGroupModel.findOne({
      $and: [{ user: userId }, { _id: groupId }],
    });
    if (!foundedDeviceGroup) {
      return res.json({
        code: 400,
        message: "not founded any device group",
      });
    }
    console.log(foundedDeviceGroup);
    const foundedVehicle = await VehicleModel.findOne({ _id: vehicleId });
    if (!foundedVehicle) {
      return res.json({
        code: 400,
        message: "vehicle not founded",
      });
    }
    if (!foundedDeviceGroup.devices) foundedDeviceGroup.devices = new Array();
    if (foundedDeviceGroup.devices.indexOf(vehicleId) < 0) {
        foundedDeviceGroup.devices.push(vehicleId);
    }
    await foundedDeviceGroup.save()
    return res.json({
        foundedDeviceGroup,
        code :200
      })
    //   
  } catch (error) {
    // logger.error(ex);
    return res.json({
      message: "somthing went wrong in add vehicle to device group",
        code :400
    });
  }
};

module.exports = {
  getDeviceGroups,
  addDeviceGroup,
  getDeviceGroupById,
  editDeviceGroup,
  addVehicleToGroup,
};
