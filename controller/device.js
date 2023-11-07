const Validator = require("validatorjs");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const VehicleStatusModel = require("../model/GpsLocation/VehicleStatusModel");
const VehicleTypeModel = require("../model/GpsLocation/VehicleTypeModel");
const { NotifyUtility } = require("./NotifyUtility");

// ADD NEW VHICELS            === COLLECTION => VEHICLE
async function addDevice(req, res) {
  console.log(req.body);
  try {
    var simNumber = req.body.simNumber;
    var deviceIMEI = req.body.deviceIMEI;
    var createDate = new Date();
    var creator = req.user._id;
    var plate = req.body.plate;
    var name = req.body.name;
    var driverName = req.body.driverName;
    var driverPhoneNumber = req.body.driverPhoneNumber;
    var trackerModel = req.body.trackerModel;
    var fuel = req.body.fuel;
    var model = req.body.model;
    let usage = req.body.usage;
    // console.log(req.body);

    // console.log(await VehicleTypeModel.findOne({ name: model }))
    if (!simNumber && !deviceIMEI && !plate && !name && !model) {
      return res.json({
        msg: "inputs are required",
        code: 400,
        validate: false,
      });
    }
    var newVehicle = new VehicleModel({
      simNumber: simNumber,
      deviceIMEI: deviceIMEI,
      status: true,
      createDate: createDate,
      creator: creator,
      vehicleName: name,
      plate: plate,
      model: await VehicleTypeModel.findOne({ name: model }),
      driverName: driverName,
      driverPhoneNumber: driverPhoneNumber,
      trackerModel: trackerModel,
      fuel: fuel,
      usage: usage,
    });

    await newVehicle.save();

    // create a new vehicleStatusModel
    let vehicleStatus = new VehicleStatusModel({
      vehicleIMEI: newVehicle.deviceIMEI,
      status: "بدون داده",
      date: new Date(),
    });
    await vehicleStatus.save();
    newVehicle.vehicleStatus = vehicleStatus._id;
    await newVehicle.save();

    return res.json({
      code: 201,
      message: "vehicle added successfully",
      newVehicle: newVehicle,
    });
  } catch (error) {
    return res.json({
      code: 500,
      message: "something went wrong in Adding vehicle ",
      error: error.message,
    });
  }
}
// UPDATE THE POINTED DEVICE  ===> COLLECTION => VEHICLE
async function editDevice(req, res) {
  try {
    var vehicleId = req.body.vehicleId;
    var simNumber = req.body.simNumber;
    var deviceIMEI = req.body.deviceIMEI;
    var plate = req.body.plate;
    var name = req.body.name;
    var driverName = req.body.driverName;
    var driverPhoneNumber = req.body.driverPhoneNumber;
    var trackerModel = req.body.trackerModel;
    var fuel = req.body.fuel;
    var model = req.body.modelName;
    let usage = req.body.usage;

    if (!vehicleId) {
      return res.json({
        msg: "vehicleId required",
        code: "400",
        validate: false,
        field: "vehicleId",
      });
    }
    const vehicle = await VehicleModel.findOne({ _id: vehicleId });
    if (!vehicle) {
      return res.json({
        msg: "vehicle not found",
      });
    }
    if (vehicle.deviceIMEI !== deviceIMEI) {
      if (VehicleModel.exists({ deviceIMEI: deviceIMEI })) {
        return res.json({
          msg: "وسیله نقلیه دیگری با این IMEI موجود است",
          code: "400",
        });
      }
    }

    const oldVehicle = { ...vehicle._doc };
    simNumber && (vehicle.simNumber = simNumber);
    deviceIMEI && (vehicle.deviceIMEI = deviceIMEI);
    plate && (vehicle.plate = plate);
    name && (vehicle.vehicleName = name);
    model && (vehicle.model = await VehicleTypeModel.findOne({ name: model }));
    driverName && (vehicle.driverName = driverName);
    driverPhoneNumber && (vehicle.driverPhoneNumber = driverPhoneNumber);
    trackerModel && (vehicle.trackerModel = trackerModel);
    fuel && (vehicle.fuel = fuel);
    usage && (vehicle.usage = usage);

    await vehicle.save(async function (err) {
      if (err) {
        return res({
          msg: err,
        }).code(500);
      } else {
        // create new event for changing name and phone number of driver
        for (let fieldName of ["driverName", "driverPhoneNumber"]) {
          let vehicleEvent;
          if (vehicle[fieldName] !== oldVehicle[fieldName]) {
            vehicleEvent = new ActionEventModel({
              userId: req.user._id,
              date: new Date().AsDateJs(),
              objectModel: "vehicle",
              objectId: vehicleId,
              actionType: "update",
              fieldName,
              oldValue: oldVehicle[fieldName],
              newValue: vehicle[fieldName],
            });
            await vehicleEvent.save();
          }
        }
        return res(vehicle).code(200);
      }
    });
  } catch (ex) {
    logger.error(ex);
    return res({
      msg: ex,
    }).code(500);
  }
}
// ADD TYPES OF DEVICE MODELS ===> (VEHICLE MODELS)   COLLECTION =>*VHEICLETYPES*
async function addDeviceModels(req, res) {
  try {
    const name = req.body.vehicleType;
    const typeExist = await VehicleTypeModel.exists({ name });
    if (typeExist) {
      return res.json({
        msg: "این مدل قبلا در سامانه ثبت گردیده است",
        code: 400,
      });
    }
    const vehicleType = new VehicleTypeModel({ name });
    await vehicleType.save();
    return res.json({ vehicleType, code: 200 });
  } catch (error) {
    // logger.error(ex);
    return res({
      message: "something went wrong in Add device ",
      code: 400,
      messageSys: error.message,
    });
  }
}
// GET TYPES OF DEVICE MODELS ===> (VEHICLE MODELS)
async function getDeviceModels(req, res) {
  try {
    const foundedItem = await VehicleTypeModel.find().select({
      name: 1,
      _id: 0,
    });

    if (!foundedItem) {
      return res.json({
        message: "vehicle type not found ",
        code: 400,
      });
    }
    return res.json({
      foundedItem,
      code: 200,
    });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      messageSys: error.message,
      message: "something went wrong in getDeviceModels . ",
      code: 500,
    });
  }
}
// this is api is not tested and pro mode
async function setDeviceStatus(req, res) {
  try {
    let status = req.body.status;
    let imei = req.body.imei;
    let desc = req.body.desc;
    let createDate = new Date();

    if (!imei) {
      return res.json({
        msg: "IMEI required",
        code: "422",
        validate: false,
        field: "deviceIMEI",
      });
    }
    if (!status) {
      return res.json({
        msg: "status required",
        code: "422",
        validate: false,
        field: "vehicleStatus",
      });
    }
    // W
    const foundedVhicleByIMEI = await VehicleModel.findOne({ deviceIMEI: imei }).populate("vehicleStatus")
    return res.json({
      msg: "vehicle not found",
      code :404
    })
    
      // if(foundedVhicleByIMEI.vehicleStatus.status !== status)
      // {
      //   let vehicleStatus = new VehicleStatusModel({
      //     vehicleIMEI: imei,
      //     status: status,
      //     date: createDate,
      //     desc: desc,
      //   });
      //   await vehicleStatus.save();

      // const updatedvhcile = await vehicle
      //   .updateMany(
      //     {
      //       vehicleStatus: vehicleStatus._id,
      //     },
      //     { upsert: true }
      //   )
      // }
    
      // {

    
      //       // create new vehicleStatusModel
      //       if (vehicle.vehicleStatus.status !== status) {
      //         let vehicleStatus = new VehicleStatusModel({
      //           vehicleIMEI: imei,
      //           status: status,
      //           date: createDate,
      //           desc: desc,
      //         });

      //         await vehicleStatus.save();

      //           .exec();
      //         await vehicle.save();

      //         return res().code(200);
      //       } else if (vehicle.vehicleStatus.status === status) {
      //         // update desc
      //         let id = vehicle.vehicleStatus._id;
      //         VehicleStatusModel.findOneAndUpdate(
      //           { _id: id },
      //           { desc: desc }
      //         ).exec(function (err, result) {
      //           if (err) {
      //             logger.error(err);
      //           } else {
      //             return res().code(200);
      //           }
      //         });
            // }
          // }
        // });
    // }
  } catch (error) {}
}

// this is api is not tested and pro mode
async function deleteDeviceStatus(req, res) {
  try {
    var deviceId = req.params.id;

    if (!deviceId) {
      return res.json({
        msg: "id required ",
        code: "422",
        validate: false,
        field: "vehicleId",
      });
    }

    const foundedVehicle = await VehicleModel.findOne({
      _id: deviceId,
    }).populate("lastLocation");
    let status = "";
    let now = new Date();
    console.log(now);
    if (!foundedVehicle.vehicleStatus) {
      status = "بدون داده";
      return res.json({
        msg: "vehicleStatus is not exist ! ",
        code: "400",
      });
    }

    if (!foundedVehicle.lastLocation) {
      return res.json({
        msg: "lastLocation is not exist !",
        code: "400",
      });
    }
    let lastLocationDate = foundedVehicle.lastLocation.date;

    let diffDays = Math.floor((now - lastLocationDate) / (1000 * 60 * 60 * 24)); // one day
    if (diffDays < 1) {
      status = "به روز";
    } else if (diffDays < 7 && diffDays >= 1) {
      status = "کمتر از یک هفته";
    } else if (diffDays < 30 && diffDays >= 7) {
      status = "کمتر از یک ماه";
    } else if (diffDays >= 30) {
      status = "بیش از یک ماه";
    }

    let vehicleStatus = new VehicleStatusModel({
      vehicleIMEI: foundedVehicle.deviceIMEI,
      status: status,
      date: new Date(),
      desc: "بازگشت به کار",
    });
    await vehicleStatus.save();

    foundedVehicle.vehicleStatus = vehicleStatus._id;
    await foundedVehicle.save();

    return res.json({
      code: 200,
    });

    // console.log(foundedVehicle)

    //     } else {
    //       VehicleModel.findOne({ _id: deviceId })
    //         .populate("lastLocation")
    //         .exec(async function (err, vehicle) {
    //           if (err) {
    //             return res({
    //               msg: err,
    //             }).code(500);
    //           } else {
    //             let status = "";
    //             let now = new Date().AsDateJs();
    //             if (!vehicle.vehicleStatus) {
    //               return res({
    //                 msg: err,
    //               }).code(500);
    //             } else if (!vehicle.lastLocation) {
    //               status = "بدون داده";
    //             } else {
    //               let lastLocationDate = vehicle.lastLocation.date;
    //               let diffDays = Math.floor(
    //                 (now - lastLocationDate) / (1000 * 60 * 60 * 24)
    //               );
    //               if (diffDays < 1) {
    //                 status = "به روز";
    //               } else if (diffDays < 7 && diffDays >= 1) {
    //                 status = "کمتر از یک هفته";
    //               } else if (diffDays < 30 && diffDays >= 7) {
    //                 status = "کمتر از یک ماه";
    //               } else if (diffDays >= 30) {
    //                 status = "بیش از یک ماه";
    //               }
    //             }

    //             let vehicleStatus = new VehicleStatusModel({
    //               vehicleIMEI: vehicle.deviceIMEI,
    //               status: status,
    //               date: new Date().AsDateJs(),
    //               desc: "بازگشت به کار",
    //             });
    //             await vehicleStatus.save();

    //             vehicle.vehicleStatus = vehicleStatus._id;
    //             await vehicle.save();

    //             return res().code(200);
    //           }
    //         });
    //     }
  } catch (error) {
    return res.json({
      message: "somthing went wrong in  deleteDeviceStatus .",
      messageSys: error.message,
      code: 500,
    });
  }
}

const NodeGeocoder = require("node-geocoder");

async function tests(req, res) {
  const geocoder = NodeGeocoder({ provider: "openstreetmap" });
  const dataa = geocoder.reverse(
    { lat: 35.6741, lon: 51.44159 },
    function (err, ress) {
      console.log(ress);
      return res.json({ ress });
    }
  );
}
module.exports = {
  addDevice,
  editDevice,
  addDeviceModels,
  getDeviceModels,
  setDeviceStatus,
  deleteDeviceStatus,
  tests,
};
