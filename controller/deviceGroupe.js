const DeviceGroupModel = require("../model/GpsLocation/DeviceGroupeModel");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const UserModel = require("../model/User/user");

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
    await foundedDeviceGroup.save();
    return res.json({
      foundedDeviceGroup,
      code: 200,
    });
    //
  } catch (error) {
    // logger.error(ex);
    return res.json({
      message: "somthing went wrong in add vehicle to device group",
      code: 400,
    });
  }
};
const editGroup = async (req, res) => {
  try {
    var groupId = req.body.groupId;
    var name = req.body.name;
    var desc = req.body.desc;
    var color = req.body.color;
    var userId = req.user._id;

    const doundedDevices = await DeviceGroupModel.findOne({
      $and: [{ user: userId }, { _id: groupId }],
    });

    if (!doundedDevices) {
      return res.json({
        msg: "There is no device group",
        code: 400,
      });
    }

    name && (doundedDevices.name = name);
    desc && (doundedDevices.desc = desc);
    color && (doundedDevices.color = color);
    await doundedDevices.save();
    return res.json({
      doundedDevices,
      code: 200,
    });
  } catch (error) {
    return res.json({
      message: "Somthing went wrong in device groupe",
      code: 200,
    });
  }
};
const shareGroupsWithUser = async (req, res) => {
  try {
    console.log("shared3");
    var userId = req.user._id;
    var groupId = req.body.groupId;
    var sharee = req.body.sharee;
    if (!sharee) {
      return res.json({
        message: "sharee required",
        code: 413,
        validate: false,
      });
    }
    const foundedGroup = await DeviceGroupModel.findOne({
      $and: [{ user: userId }, { _id: groupId }],
    }).populate("devices");
    console.log("shared4");

    if (!foundedGroup) {
      return res.json({
        message: "There is no device group",
        code: 400,
      });
    }
    console.log("object");
    if (!foundedGroup.sharees) foundedGroup.sharees = new Array();
    if (foundedGroup.sharees.indexOf(sharee) < 0) {
      foundedGroup.sharees.push(sharee);
      await foundedGroup.save();
      return res.json({ group: foundedGroup, sharee: sharee, code: 200 });
    }
  } catch (error) {
    console.log(error);
    // logger.error(ex);
    return res.json({
      error,
      code: 500,
    });
  }
};
const unshareGroupsWithUser = async (req, res) => {
  try {
    console.log("shared3");
    var userId = req.user._id;
    var groupId = req.body.groupId;
    var sharee = req.body.sharee;
    if (!sharee) {
      return res.json({
        message: "sharee required",
        code: 413,
        validate: false,
      });
    }
    const foundedGroup = await DeviceGroupModel.findOne({
      $and: [{ user: userId }, { _id: groupId }],
    }).populate("devices");
    console.log("shared4");

    if (!foundedGroup) {
      return res.json({
        message: "There is no device group",
        code: 400,
      });
    }
    console.log("object1");
    if (!foundedGroup.sharees) foundedGroup.sharees = new Array();
    if (foundedGroup.sharees.indexOf(sharee) >= 0) {
      foundedGroup.sharees.splice(foundedGroup.sharees.indexOf(sharee), 1);
      await foundedGroup.save();
      return res.json({ group: foundedGroup, sharee: sharee, code: 200 });
    }
  } catch (error) {
    console.log(error);
    // logger.error(ex);
    return res.json({
      error,
      code: 500,
    });
  }
};
const getVehiclesofGroup = async (req, res) => {
  try {
    var groupId = req.params.groupId;
    var userId = req.user._id;
    const vehiclesofGroup = await DeviceGroupModel.findOne({
      $and: [
        { $or: [{ user: userId }, { sharees: userId }] },
        { _id: groupId },
      ],
    }).populate({
      path: "devices",
      select:
        "_id simNumber deviceIMEI vehicleName type plate driverName driverPhoneNumber model",
      populate: {
        path: "model",
        select: { name: 1, _id: 1 },
      },
    });

    if (!vehiclesofGroup) {
      return res.json({
        message: "There is no device group",
        code: 404,
      });
    }
    var vehicles = vehiclesofGroup.devices;
    var result = new Array();

    for (var i = 0; i < vehicles.length; i++) {
      var tmpVehicle = {};
      var remainingDate = -1;
      tmpVehicle.deviceInfo = vehicles[i];
      if (vehicles[i].lastLocation) {
        var oneDay = 24 * 60 * 60 * 1000;
        var startDate = new Date(vehicles[i].lastLocation.date);
        var endDate = new Date();
        remainingDate = Math.round(
          Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)
        );
      }
      tmpVehicle.lastLocationDiff = remainingDate;
      result.push(tmpVehicle);
    }

    console.log(result);
    // console.log(vehiclesofGroup);

    return res.json({
      code: 200,
      result: result,
    });
    // var result = new Array();
    // for (var i = 0; i < vehicles.length; i++) {
    //               var tmpVehicle = {};
    //               var remainingDate = -1;
    //               tmpVehicle.deviceInfo = vehicles[i];
    //               if (vehicles[i].lastLocation) {
    //                   var oneDay = 24 * 60 * 60 * 1000;
    //                   var startDate = new Date(vehicles[i].lastLocation.date);
    //                   var endDate = new Date();
    //                   remainingDate = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));

    //               }
    // .exec(function (err, dgs) {
    //     if (err) {
    //         logger.error(err);
    //         return res({
    //             msg: err
    //         }).code(500);
    //     }
    //     else if (!dgs) {
    //         return res({
    //             msg: 'There is no device group'
    //         }).code(404);
    //     }
    //     else {
    //         var vehicles = dgs.devices;
    //         var result = new Array;
    //         for (var i = 0; i < vehicles.length; i++) {
    //             var tmpVehicle = {};
    //             var remainingDate = -1;
    //             tmpVehicle.deviceInfo = vehicles[i];
    //             if (vehicles[i].lastLocation) {
    //                 var oneDay = 24 * 60 * 60 * 1000;
    //                 var startDate = new Date(vehicles[i].lastLocation.date);
    //                 var endDate = new Date();
    //                 remainingDate = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));

    //             }
    //             tmpVehicle.lastLocationDiff = remainingDate;
    //             result.push(tmpVehicle);
    //         }
    //         res(result).code(200);
    //     }
    // })
  } catch (error) {
    // logger.error(ex);
    return res.json({
      message: "somthing went wrong in Get Vehicles Of Group",
      code: 500,
    });
  }
};

const removeVehicleFromGroup = async (req, res) => {
  try {
    var vehicleId = req.params.vehicleId;
    var groupId = req.params.groupId;
    var userId;
    if (req.user) {
      userId = req.user._id;
    }
    const foundDeviceGroup = await DeviceGroupModel.findOne({
      $and: [{ user: userId }, { _id: groupId }],
    });
    if (!foundDeviceGroup) {
      return res.json({
        message: "There is no device group",
        code: 400,
      });
    }
    const foundedVehicle = await VehicleModel.findOne({ _id: vehicleId });

    if (!foundedVehicle) {
      return res.json({
        message: "There is no vhicle",
        code: 400,
      });
    }

    foundDeviceGroup.devices = new Array();
    if (foundDeviceGroup.devices.indexOf(vehicleId) >= 0) {
      foundDeviceGroup.devices.splice(
        foundDeviceGroup.devices.indexOf(vehicleId),
        1
      );
    }
    await foundDeviceGroup.save();
    res.json({ foundedVehicle, code: 200 });
  } catch (ex) {
    // logger.error(ex);
    return res({
      message: "Something went wrong in removeVehicleFromGroup",
      code: 500,
    });
  }
};
const getUserDeviceGroups = async (req, res) => {
  try {
    var userId = req.params.id;
    console.log(userId);
    const deviceFounded = await DeviceGroupModel.find({ user: userId });

    if (!deviceFounded) {
      return res.json({
        message: "device not founded ",
        code: 400,
      });
    }
    return res.json({
      code: 200,
      deviceFounded,
    });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      messagesys: error.message,
      message: "somthing went wrong in getUserDeviceGroups",
      code: 500,
    });
  }
};

const getVehiclesofMultiGroup = async (req, res) => {
  try {
    var groupId = req.body.groups;
    var userId = req.user._id;
    const foundItem = await DeviceGroupModel.find({
      $and: [
        // { $or: [{user: userId}, {sharees: userId}] },
        { _id: { $in: groupId } },
      ],
    }).populate("devices");
    console.log(foundItem);

    if (!foundItem) {
      return res.json({
        message: "not founded ",
        code: 400,
      });
    }
    var result = new Array();
    for(var ii = 0 ; ii < foundItem.length ; ii++) {
    var vehicles = foundItem[ii].devices;
    for (var i = 0; i < vehicles.length; i++) {
        var tmpVehicle = {};
        var remainingDate = -1;
        tmpVehicle.deviceInfo = vehicles[i];
        if (vehicles[i].lastLocation) {
            var oneDay = 24 * 60 * 60 * 1000;
            var startDate = new Date(vehicles[i].lastLocation.date);
            var endDate = new Date();
            remainingDate = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));
  
        }
        tmpVehicle.lastLocationDiff = remainingDate;
        result.push(tmpVehicle);
    }
  }
  return res.json({
    result
    ,"code":200
  })
    // .populate('devices').exec(function (err, dgs) {
    //     if (err) {
    //         logger.error(err);
    //         return res({
    //             msg: err
    //         }).code(500);
    //     }
    //     else if (!dgs) {
    //         return res({
    //             msg: 'There is no device group'
    //         }).code(404);
    //     }
    //     else {
    //         var result = new Array;

    //         for(var ii = 0 ; ii < dgs.length ; ii++) {
    //             var vehicles = dgs[ii].devices;
    //             for (var i = 0; i < vehicles.length; i++) {
    //                 var tmpVehicle = {};
    //                 var remainingDate = -1;
    //                 tmpVehicle.deviceInfo = vehicles[i];
    //                 if (vehicles[i].lastLocation) {
    //                     var oneDay = 24 * 60 * 60 * 1000;
    //                     var startDate = new Date(vehicles[i].lastLocation.date);
    //                     var endDate = new Date();
    //                     remainingDate = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));

    //                 }
    //                 tmpVehicle.lastLocationDiff = remainingDate;
    //                 result.push(tmpVehicle);
    //             }
    //         }
    //         res(result).code(200);

    //     }
    // })
  } catch (ex) {
    logger.error(ex);
    return res({
      msg: ex,
    }).code(404);
  }
};

// this is reportVehicleOfGroups
const reportVehicleOfGroups = async (req, res) => {
  var groupId = req.params.groupId;
  var userId = req.params.userId;

  const foundedUser = await UserModel.findOne({'_id': userId})
  // console.log(data)
  if(!foundedUser){
  return res.json({
    msg: 'There is no user data'
    ,"code":400
  });}
req.user = userId

console.log(req.user)
 const foundedDevice=  await  DeviceGroupModel.findOne({
    $and: [
        { $or: [{user: userId}, {sharees: userId}] },
        {'_id': groupId}
    ]
}).populate('devices')
.populate('devices.gpsdata')
return res.json({
  "foundedUser": foundedUser
  ,"foundedDevice":foundedDevice
});

}

module.exports = {
  getDeviceGroups,
  addDeviceGroup,
  getDeviceGroupById,
  editDeviceGroup,
  addVehicleToGroup,
  editGroup,
  shareGroupsWithUser,
  unshareGroupsWithUser,
  getVehiclesofGroup,
  removeVehicleFromGroup,
  getUserDeviceGroups,
  getVehiclesofMultiGroup,
  reportVehicleOfGroups
};
