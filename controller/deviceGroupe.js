const { default: mongoose } = require("mongoose");
const DeviceGroupModel = require("../model/GpsLocation/DeviceGroupeModel");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const UserModel = require("../model/User/user");
// const getDeviceGroups = async (req, res) => {
//   var userId = req.user._id;

// }


const getCustomeVehicle = async (req, res) => {
  try {
 const FoundedVehicle = await VehicleModel.aggregate([
  { $unset: ["_id"] },
  {$project:{
  
  value:"$deviceIMEI",
  label:{
  $concat:[
    "$driverName" ," ", "$deviceIMEI",
  ]}
  }}

 ])


 return res.json({
  FoundedVehicle
 })



  }
catch(error){



}}



const getDeviceGroups = async (req, res) => {
        try {
          console.log("coms")
            var userId = req.user._id;
         let devicegrp=await DeviceGroupModel.find({ $or: [{ user: userId }, { sharees: userId }] })
                 .populate({
                    path: 'devices',
                    select: '_id simNumber deviceIMEI type plate driverName driverPhoneNumber gpsDataCount model',
                    populate: {
                        path: 'model',
                        select: { name: 1, _id: 0 }
                    }
                })
                .populate('sharees')
                

                if(!devicegrp){
                  return res.json({
                   message: "there is no devices or user doesn't access",
                   code :400
                  })
                }
                console.log("comes here again 222")
                return res.json({
                  devicegrp,
                  code :200
                })
                
               
        
        }
        catch (err) {
          console.log("something went wrong in deviceGroup ",err)
          return res.json({
                messageSys: err.message,
                message:"something went wrong in deviceGroup",
                code:404
              })
        }
}


// const getDeviceGroups3 = async (req, res) => {
//   try {
//     var { deviceGroup } = req.params;
//     var deviceGroupArr = [];
//     deviceGroupArr.push(new mongoose.Types.ObjectId(deviceGroup));
//     console.log(deviceGroupArr, "deviceGroup");
//     var userId = req.user._id;
//     //  const populatedUser = await VehicleModel.aggregate({
//     //   $match:{ }
//     //  })

//     // const populateUser = await DeviceGroupModel.find({
//     //         $or: [{ user: userId }, { sharees: userId }],
//     //       })
//     //       .populate({
//     //         path: "devices",
//     //         select:
//     //           "_id simNumber deviceIMEI type plate driverName driverPhoneNumber gpsDataCount model",
//     //         populate: {
//     //           path: "model",
//     //           select: { name: 1, _id: 0 },
//     //         },
//     //       })

//     //       if (!populateUser) {
//     //         return res.json({
//     //           code: 400,
//     //           message: "There is no device group",
//     //         });
//     //       }
//     // const populateUser = await DeviceGroupModel.find({
//     //   $or: [{ user: userId }, { sharees: userId }],
//     // })
//     // .populate({
//     //   path: "devices",
//     //   select:
//     //     "_id simNumber deviceIMEI type plate driverName driverPhoneNumber gpsDataCount model",
//     //   populate: {
//     //     path: "model",
//     //     select: { name: 1, _id: 0 },
//     //   },
//     // })

//     // if (!populateUser) {
//     //   return res.json({
//     //     code: 400,
//     //     message: "There is no device group",
//     //   });
//     // }

//     // r
//     console.log(userId._id);
//     const populateUser = await VehicleModel.aggregate([
//       // {
//       //   $match: { $and:[
//       //    { $or: [{ user: userId }, { sharees: userId }]}
//       //    ,{
//       //     devices :{$in : deviceGroupArr.map((item)=>{
//       //       return  new mongoose.Types.ObjectId(item);
//       //     })}
//       //    },
//       // sum:{$concat:[
//       //   //     "$deviceCustomedriverName" ," ","$deviceCustome.deviceIMEI"
    
//       //   // ]},

//       // {unwind:"$_id"},

//       {
//         $group: {
//           _id: "$_id",
//           tempsF: { $push: { _id: "$_id" } },
//         },
//       },
//      { $project:{
//       tempsFs: {
//         $map: {
//           input: "$tempsF",
//           as: "tempInCelsius",
//           in:["$$tempInCelsius._id"]
//         },
//       },
//       }},
//       //     {
//       //   $addFields: {
//       //     idr:"$tempsF",
//       //     tempsF: {
//       //       $map: {
//       //         input: "$tempsF",
//       //         as: "tempInCelsius",
//       //         in:["$$tempInCelsius._id"]
//       //       },
//       //     },
//       //   },
//       // },
//       {
//         $lookup: {
//           from: "devicegroups",
//           let: { idN: "$_id" },
//           // as: "vehicle_q",

//           pipeline: [
//             {
//               $match: {
//                 $and: [
//                   { $or: [{ user: userId }, { sharees: userId }] },
//                   {
//                     devices: {
//                       $in: [ new mongoose.Types.ObjectId("5992786211dc0505f290f86b")],
//                     },
//                   },
//                 ],
//               },
//             },
//           ],
//           as: "extracted_device",
//         },
//       },

//       {
//         $unwind: "$extracted_device",
//       },
//       {$count:"$extracted_device"}

//       // {$match:{}}


//       // , {
//       //   $lookup: {
//       //     from: "$extracted_device.",
//       //     localField: "devices",
//       //     foreignField: "_id",
//       //     as: "deds",
//       //   }
//       // },

//       //       {
//       //       $lookup: {
//       //         from: "$extracted_device",
//       //         localField: "_id",
//       //         foreignField: "devices",
//       //         as: "ddddddddd"
//       //     }
//       // }
//       // {
//       //   $project: {
//       //     _id: null,
//       //     locations: {
//       //       $map: {
//       //         input: "$extracted_device",
//       //         as: "devi",
//       //         in: ["$$devi.desc", "$$devi.status"],
//       //       },
//       //     },
//       //   },
//       // }
//     ]).limit(10);

//     // .select("fullName")
//     return res.json({
//       code: 200,
//       populateUser,
//     });

//     // {
//     //   $unwind: "$devices",
//     // },
//     // {
//     //   $lookup: {
//     //     from: "vehicles",
//     //     localField: "devices",
//     //     foreignField: "_id",
//     //     as: "deviceCustome",
//     //   },

//     // },
//     // {
//     //   $unwind: "$deviceCustome",
//     // },
//     // {
//     //   $project:{
//     //     _id: 0,

//     //  ddd:{
//     //   $map: {
//     //     input: "$deviceCustome",
//     //     as: "item",
//     //     in: ["$$item.deviceIMEI", "$$item.driverName"],
//     //   },}
//     // }
//     // },

//     // {$addFields: {
//     //   "fullName" : {
//     //     label:"$deviceCustome.deviceIMEI",
//     //     value:{$concat:[
//     //       "$deviceCustome.driverName"

//     //   ]},
//     //   sum:{$concat:[
//     //     "$deviceCustome.driverName" ," ","$deviceCustome.deviceIMEI"

//     // ]},
//     //   }
//     // }}

//     // {$group:{
//     //   _id:null,
//     //   deviceGroup_berif:{
//     //     $push:{
//     //      "$fullName"
//     //     }
//     //   }
//     // }}
//     // {
//     // //   $group :{
//     // //   //   _id: "$IMEI",
//     // //   //   devicegr: { $push: {deviceIMEI: "$deviceCustome.deviceIMEI",driverName: "$deviceCustome.driverName",}
//     // //   // }

//     // },

//     // {$addFields:{
//     //   ss:""
//     // }
//     //  { $project:{
//     //    ee: devicegr.imei
//     //   }}
//     // {
//     //   $project: {
//     //     _id: 0,
//     //     IMEI: "$IMEI",
//     //     devicegr: {
//     //       $map: {
//     //         input: "$devicegr",
//     //         as: "ddd",
//     //         in: ["$$ddd.imei", "$$ddd.imei2"]
//     //       }
//     //     }
//     //   }
//     // }
//     //  {
//     //   $unwind: "$deviceCustome"
//     // },
//     // {
//     //   $project: {
//     //     // _id: 0,
//     //     // label: "$deviceCustome.deviceIMEI"+' '+"$deviceCustome.driverName",
//     //     // // label_2: "$deviceCustome.driverName",
//     //     $push:{
//     //       label: "$$deviceCustome.deviceIMEI"
//     //     }

//     //   // {  "itemDescription": { $concat: [ "$item", " - ", "$description" ] } }
//     //   }
//     // }
//     // { $project: { itemDescription: { $concat: [ "$item", " - ", "$description" ] } } }

//     // {

//     //   $group :{
//     //     _id: "$deviceCustome",
//     //     locations: { $push: {lat: "$lat", lng: "$lng" } }
//     //   }
//     // },
//     // {
//     //   $project: {
//     //     id: "$_id",
//     //     values: {
//     //       $map: {
//     //         input: "$devices",
//     //         as: "device",
//     //         in:  ["$$device"]
//     //       },
//     //       // ss:"$devices"
//     //     },
//     //   },
//     // },

//     // {
//     //   $group :{
//     //     "_id": "$_id",
//     //     "devices": "$devices"}
//     //   }

//     // { $concat: [ "$user", " - ", "$status" ] },
//     //   {$project: {
//     //     _id: 0,

//     //   $map: {
//     //     input: "$devices",
//     //     as: "device",
//     //     in: { $add: [ "$$device"] }
//     //   }
//     // }}

//     // },
//     // { "$unwind": "$device88" },
//     // { "$group": {
//     //       "_id": "$_id",
//     //       "devices": { "$push": "$devices" },
//     //       "device88": { "$push": "$device88" }
//     //   }}
//     //   $project:{"device":"$device"}
//     // }
//     // ])
//     // .select("fullName")
//     // .limit(10)

//     // return res.json({
//     //   code: 200,
//     //   populateUser,
//     // });

//     //label: driverName + " " + deviceIMEI
//     // const getDeviceGroups = async (req, res) => {
//     //   try {
//     //     var userId = req.user._id;
//     //     const populateUser = await DeviceGroupModel.find({
//     //       $or: [{ user: userId }, { sharees: userId }],
//     //     })
//     //     .populate({
//     //       path: "devices",
//     //       select:
//     //         "_id simNumber deviceIMEI type plate driverName driverPhoneNumber gpsDataCount model",
//     //       populate: {
//     //         path: "model",
//     //         select: { name: 1, _id: 0 },
//     //       },
//     //     })

//     //     if (!populateUser) {
//     //       return res.json({
//     //         code: 400,
//     //         message: "There is no device group",
//     //       });
//     //     }

//     //     return res.json({
//     //       code: 200,
//     //       populateUser,
//     //     })
//   } catch (error) {
//     // logger.error(error);
//     console.log(error);
//     return res.json({
//       messageSys: error.message,
//       message: "somthing went wrong in getDeviceGroups",
//       code: 400,
//     });
//   }
// };

const getDeviceGroups2 = async (req, res) => {
  try {
    var userId = req.user._id;
    const populateUser = await DeviceGroupModel.find({
      $or: [{ user: userId }, { sharees: userId }],
    }).populate({
      path: "devices",
      select: "_id  deviceIMEI   driverName   ",
      populate: {
        path: "model",
        select: { name: 1, _id: 0 },
        co,
      },
    });

    if (!populateUser) {
      return res.json({
        code: 400,
        message: "There is no device group",
      });
    }
    // const populateUser = await DeviceGroupModel.find({
    //   $or: [{ user: userId }, { sharees: userId }],
    // })
    // .populate({
    //   path: "devices",
    //   select:
    //     "_id simNumber deviceIMEI type plate driverName driverPhoneNumber gpsDataCount model",
    //   populate: {
    //     path: "model",
    //     select: { name: 1, _id: 0 },
    //   },
    // })

    // if (!populateUser) {
    //   return res.json({
    //     code: 400,
    //     message: "There is no device group",
    //   });
    // }

    // r
    // const populateUser = await DeviceGroupModel.aggregate([
    // {
    //   $match: {
    //     $or: [{ user: userId }, { sharees: userId }],
    //   },
    // },
    // {
    //   $unwind: "$devices",
    // },
    // {
    //   $lookup: {
    //     from: "vehicles",
    //     localField: "devices",
    //     foreignField: "_id",
    //     as: "deviceCustome",
    //   },
    // }
    // {
    //   $project: {
    //     id: "$_id",
    //     values: {
    //       $map: {
    //         input: "$devices",
    //         as: "device",
    //         in:  ["$$device"]
    //       },
    //       // ss:"$devices"
    //     },
    //   },
    // },

    // {
    //   $group :{
    //     "_id": "$_id",
    //     "devices": "$devices"}
    //   }

    // { $concat: [ "$user", " - ", "$status" ] },
    //   {$project: {
    //     _id: 0,

    //   $map: {
    //     input: "$devices",
    //     as: "device",
    //     in: { $add: [ "$$device"] }
    //   }
    // }}

    // },
    // { "$unwind": "$device88" },
    // { "$group": {
    //       "_id": "$_id",
    //       "devices": { "$push": "$devices" },
    //       "device88": { "$push": "$device88" }
    //   }}
    //   $project:{"device":"$device"}
    // }
    // ]).limit(10);
    return res.json({
      code: 200,
      populateUser,
    });

    // return res.json({
    //   code: 200,
    //   populateUser,
    // });

    //label: driverName + " " + deviceIMEI
    // const getDeviceGroups = async (req, res) => {
    //   try {
    //     var userId = req.user._id;
    //     const populateUser = await DeviceGroupModel.find({
    //       $or: [{ user: userId }, { sharees: userId }],
    //     })
    //     .populate({
    //       path: "devices",
    //       select:
    //         "_id simNumber deviceIMEI type plate driverName driverPhoneNumber gpsDataCount model",
    //       populate: {
    //         path: "model",
    //         select: { name: 1, _id: 0 },
    //       },
    //     })

    //     if (!populateUser) {
    //       return res.json({
    //         code: 400,
    //         message: "There is no device group",
    //       });
    //     }

    //     return res.json({
    //       code: 200,
    //       populateUser,
    //     })
  } catch (error) {
    // logger.error(error);
    console.log(error);
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
    // logger.error(ex);
    console.log(error)

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
      $or: [{ user: userId }, { _id: groupId }],
    })
    .populate('devices')
    .populate({
        path:'sharees',
        populate: {
            path: 'deviceModel',
            select: {name: 1, _id: 0}
        }
    })
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
    console.log(error)

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


    console.log(req.body)

    const founded_DG = await DeviceGroupModel.findOne({
      $or: [{ user: userId }, { _id: groupId }],
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
    console.log(error)

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
    console.log(error)

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
    console.log(groupId, "groupId");
    console.log(userId, "userId");

    const vehiclesofGroup = await DeviceGroupModel.findOne({
      _id: groupId,
    }).populate({
      path: "devices",
      select:
        "_id simNumber deviceIMEI vehicleName type plate driverName driverPhoneNumber model",
      populate: {
        path: "model",
        select: { name: 1, _id: 1 },
      },
    });
    console.log(vehiclesofGroup, "dddd");

    if (!vehiclesofGroup) {
      return res.json({
        message: "There is no device group",
        code: 404,
      });
    }
    var vehicles = vehiclesofGroup.devices;
    var result = new Array();

    for (var i = 0; i < vehicles.length; i++) {
      00;
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
    console.log(error)

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
    console.log(vehicleId , "vehicleId")
    console.log(groupId,"groupId")

    const foundDeviceGroup = await DeviceGroupModel.findOne({
      $or: [{ user: userId }, { _id: groupId }],
    });
    if (!foundDeviceGroup) {
      return res.json({
        message: "There is no device group",
        code: 400,
      });
    }
    const foundedVehicle = await VehicleModel.findOne({ _id: vehicleId });
    console.log(vehicleId,"this is vehicleId")
    if (!foundedVehicle) {
      return res.json({
        message: "There is no vhicle",
        code: 400,
      });
    }
    if(!foundDeviceGroup.devices){
    foundDeviceGroup.devices = new Array();
  }
    if (foundDeviceGroup.devices.indexOf(vehicleId) >= 0) {
      console.log("foundDeviceGroup.devices.indexOf(vehicleId)",foundDeviceGroup.devices.indexOf(vehicleId))
      foundDeviceGroup.devices.splice(
        foundDeviceGroup.devices.indexOf(vehicleId),
        1
      );
    }
    await foundDeviceGroup.save().then(()=>{
      res.json({message:"successfuly deleted from deviceGroup",code:200})
    });
  } catch (err) {
    // logger.error(ex);
    console.log(error)

    return res.json({
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
    console.log(error)

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
    for (var ii = 0; ii < foundItem.length; ii++) {
      var vehicles = foundItem[ii].devices;
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
    }
    return res.json({
      result,
      code: 200,
    });
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
  } catch (error) {
    console.log(error)
    return res.json({
      msg: error.message,
      code:400
    })
  }
};

// this is reportVehicleOfGroups
const reportVehicleOfGroups = async (req, res) => {
  var groupId = req.params.groupId;
  var userId = req.params.userId;

  const foundedUser = await UserModel.findOne({ _id: userId });
  // console.log(data)
  if (!foundedUser) {
    return res.json({
      msg: "There is no user data",
      code: 400,
    });
  }
  req.user = userId;

  console.log(req.user);
  const foundedDevice = await DeviceGroupModel.findOne({
    $and: [{ $or: [{ user: userId }, { sharees: userId }] }, { _id: groupId }],
  })
    .populate("devices")
    .populate("devices.gpsdata");
  return res.json({
    foundedUser: foundedUser,
    foundedDevice: foundedDevice,
  });
};
// GETING BACH FROM IMEI DEVICE GROUP
const getBachInfoViaIMEI = async (req, res) => {
  try {
    var requiredFields = ["IMEIs"];
    var arrayOfIMEIS = new Array();
    for (var i = 0; i < requiredFields.length; i++) {
      if (requiredFields[i] in req.body == false) {
        return res.json({
          message: requiredFields[i] + " doesn't exist",
          code: "400",
          validate: false,
          field: requiredFields[i],
        });
      }
    }

    for (var i = 0; i < req.payload.IMEIs.length; i++) {
      arrayOfIMEIS.push({ deviceIMEI: req.payload.IMEIs[i] });
    }

    var condition = { $or: arrayOfIMEIS };

   var foundedvehicle = await VehicleModel.find(condition)
      return res.json({foundedvehicle, code:200})
    
  } catch (error) {
    console.log(error);
    return res.json({
      msg: error.message,
      code:500
    })
  }
};
module.exports = {
  getDeviceGroups,
  getDeviceGroups2,
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
  reportVehicleOfGroups,
  getCustomeVehicle
};
