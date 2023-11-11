const Validator = require("validatorjs");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const VehicleStatusModel = require("../model/GpsLocation/VehicleStatusModel");
const VehicleTypeModel = require("../model/GpsLocation/VehicleTypeModel");
const PhoneBookModel = require("../model/User/phoneBookModel");
const { NotifyUtility } = require("./NotifyUtility");

// RESET DEVICE =>   THIS API IS NOT VERIFIED
async function resetDevice(req, res) {
  try {
    const { IMEI } = req.params;
    const foundedVehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });

    if (!foundedVehicle) {
      return res.json({ message: "vehicle not found", code: 400 });
    }
    if (["GT06", "MVT380"].includes(vehicle.trackerModel)) {
      await NotifyUtility.resetDevice(
        vehicle.simNumber,
        vehicle.trackerModel === "GT06"
      );
    }

    return res.json({
      msg: "process has been successfully completed",
      code: 200,
    });
  } catch (error) {
    return res.json({ error: error, code: 404 });
  }
}

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
// this is CONTROLER is not tested and pro mode
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
    const foundedVhicleByIMEI = await VehicleModel.findOne({
      deviceIMEI: imei,
    }).populate("vehicleStatus");

    if (!foundedVhicleByIMEI)
      return res.json({
        msg: "vehicle not found",
        code: 404,
      });

    if (foundedVhicleByIMEI.vehicleStatus.status !== status) {
      let vehicleStatus = new VehicleStatusModel({
        vehicleIMEI: imei,
        status: status,
        date: createDate,
        desc: desc,
      });
      await vehicleStatus.save();

      const updatedvhcile = await foundedVhicleByIMEI.updateMany(
        {
          vehicleStatus: vehicleStatus._id,
        },
        { upsert: true }
      );
      return res.json({
        code: 200,
      });
    }
    if (vehicle.vehicleStatus.status === status) {
      let id = vehicle.vehicleStatus._id;
      await VehicleStatusModel.findOneAndUpdate({ _id: id }, { desc: desc });

      res.json({ code: 200 });
    }
  } catch (error) {
    return res.json({
      message: "somthing went wrong in setDeviceStatus",
    });
  }
}
// this is CONTROLER is not tested and pro mode
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
// this is CONTROLER is not tested and pro mode
async function setInterval(req, res) {
  try {
    const { IMEI, interval } = req.params;
    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });

    if (!vehicle) {
      return res.json({ msg: "vehicle not found", code: 404 });
    }

    if (["GT06", "MVT380"].includes(vehicle.trackerModel)) {
      NotifyUtility.setInterval(
        vehicle.simNumber,
        interval,
        vehicle.trackerModel === "GT06"
      ).then(() => {
        res({ msg: "OK" }).code(200);
      });
    }
  } catch (error) {
    return res.json({ message: error.message, code: 404 });
  }
}
// this is CONTROLER is not tested and pro mode
async function configure(req, res) {
  try {
    const { IMEI } = req.params;
    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });

    if (!vehicle) {
      return res.json({ message: "vehicle not found", code: 404 });
    }
    if (vehicle.trackerModel === "GT06") {
      NotifyUtility.setServerAutomatic(vehicle.simNumber);
      return res.json({
        message: "success",
        code: 200,
      });
    }

    if (vehicle.trackerModel === "MVT380") {
      NotifyUtility.reconfigureDevice(vehicle.simNumber);
      return res.json({
        message: "success",
        code: 200,
      });
    }
    return res.json({
      message: "configure was not successfully",
      code: 200,
    });

    // res
    //           if (vehicle.trackerModel === 'GT06') {
    //               NotifyUtility.setServerAutomatic(
    //                   vehicle.simNumber
    //               )
    //                   .then(() => {
    //                       res({ msg: 'OK' })
    //                           .code(200);
    //                   });
    //           } else if (vehicle.trackerModel === 'MVT380') {
    //               NotifyUtility.reconfigureDevice(
    //                   vehicle.simNumber
    //               )
    //                   .then(() => {
    //                       res({ msg: 'OK' })
    //                           .code(200);
    //                   });
    //           }

    //   );
  } catch (error) {
    return res.json({ msg: error.message, code: 500 });
  }
}
// this is CONTROLER is not tested and pro mode
// async function addDevice(req, res) {

// }
// this is api is not tested and pro mode
async function setAPN(req, res) {
  try {
    const { IMEI, apnname } = req.params;
    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });
    if (vehicle) {
      return res.json({
        message: "vehicle not founded",
        code: 404,
      });
    }
    if (["GT06", "MVT380"].includes(vehicle.trackerModel)) {
      NotifyUtility.setAPN(
        vehicle.simNumber,
        apnname,
        vehicle.trackerModel === "GT06"
      );
      res.json({ message: "successfully", code: 200 });
    }
  } catch (error) {
    return res.json({ messageSys: error.message });
  }
}
// this is api is not tested and pro mode
async function setSOS(req, res) {
  try {
    const { IMEI, sos } = req.params;
    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });
    if (!vehicle) {
      return res.json({ msg: "vehicle not found", code: 404 });
    }

    if (vehicle.trackerModel === "GT06") {
      NotifyUtility.setSOSNumber(vehicle.simNumber, sos);
      return res.json({
        message: "success",
        code: 200,
      });
    }

    if (vehicle.trackerModel === "MVT380") {
      res.json({ msg: "Not Implemented", code: 404 });
    }
  } catch (error) {
    return res({
      messageSys: error.message,
      code: 500,
      message: "somthing went wrong in Set Sos",
    });
  }
}
async function getDevices(req, res) {
  try {
    console.log(req.user, "c`est user ");
    const allVehicles = await VehicleModel.find()
      .setAuthorizationUser(req.user)

      .select({
        _id: 1,
        deviceIMEI: 1,
        driverName: 1,
        driverPhoneNumber: 1,
        gpsDataCount: 1,
        lastLocation: 1,
        plate: 1,
        simNumber: 1,
        trackerModel: 1,
        vehicleName: 1,
        speedAlarm: 1,
        maxSpeed: 1,
        maxPMDistance: 1,
        createDate: 1,
        permissibleZone: 1,
        vehicleStatus: 1,
        zoneAlarm: 1,
        fuel: 1,
        currentMonthDistance: 1,
        usage: 1,
        model: 1,
      })
      .populate("lastLocation")
      // .populate({
      //     path: 'speedAlarm.smsReceivers',
      //     model: PhoneBookModel,
      //     select: { 'firstName': 1, 'lastName': 1, 'phoneNumber': 1 }
      // })
      // .populate({
      //     path: 'zoneAlarm.smsReceivers',
      //     model: PhoneBookModel,
      //     select: { 'firstName': 1, 'lastName': 1, 'phoneNumber': 1 }
      // })
      // .populate({ path: 'groups', select: 'name' })
      .populate("vehicleStatus")
      .populate({
        path: "model",
        model: VehicleTypeModel,
        select: { name: 1, _id: 0 },
      })
      .sort({ _id: -1 })
      .lean()
      .clone();

    return res.json({
      allVehicles,
    });

    // .exec((err, vehicles) => {
    //     if (err) {
    //         logger.error(err);
    //         return res({
    //             msg: err,
    //         }).code(500);
    //     }
    //     if (!vehicles) {
    //         return res({
    //             msg: 'There is no vehicles',
    //         }).code(404);
    //     }
    //     const getElapsedDate = date => {
    //         const oneDay = 24 * 60 * 60 * 1000;
    //         const now = new Date();
    //         return Math.floor(Math.abs((now - date) / oneDay));
    //     };
    //     const result = vehicles.map(vehicle => {
    //         const { lastLocation, deviceInfo } = vehicle;
    //         return {
    //             deviceInfo: vehicle,
    //             lastLocationDiff: lastLocation
    //                 ? getElapsedDate(lastLocation.date)
    //                 : -1,
    //         };
    //     });
    //     return res(result).code(200);
    // });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      messageSys: error.message,
      code: 500,
    });
  }
}

async function getLastLocationOfAllDevice(req, res) {
  try {
    VehicleModel.find({ lastLocation: { $ne: null } })
      .setAuthorizationUser(req.user)
      .select({
        driverName: 1,
        driverPhoneNumber: 1,
        plate: 1,
        simNumber: 1,
        vehicleName: 1,
        lastLocation: 1,
        model: 1,
      })
      .populate({ path: "model", select: { name: 1, _id: 0 } })
      .populate("lastLocation")
      .exec(async (err, vehicles) => {
        if (err) {
          logger.error(err);
          return res({
            msg: err,
          }).code(500);
        }
        if (!vehicles) {
          return res({
            msg: "There is no vehicles",
          }).code(404);
        }

        const result = await vehicles.map(async (vehicle) => {
          const group = await DeviceGroupModel.findOne(
            { devices: vehicle._id },
            "name color"
          );
          const {
            model,
            vehicleName,
            driverName,
            simNumber,
            driverPhoneNumber,
            plate,
            lastLocation: { lat, lng, IMEI, date, speed },
          } = vehicle;
          return {
            deviceInfo: {
              model,
              vehicleName,
              driverName,
              simNumber,
              driverPhoneNumber,
              plate,
            },
            lastLocation: {
              lat,
              lng,
              IMEI,
              date,
              speed,
            },
            group,
          };
        });
        Promise.all(result).then((values) => {
          return res(values).code(200);
        });
      });
  } catch (ex) {
    logger.error(ex);
    return res({
      msg: ex,
    }).code(404);
  }
}

async function getAlarmSettings(req, res) {
  try {
    var IMEI = req.params.IMEI;
    var settingsType = req.params.settingsType;
    const foundedVehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });

    if (!foundedVehicle) {
      res.json({ message: "vehicle not founded ", code: 404 });
    }
    const vehcile = foundedVehicle.getAlarmSettings(settingsType);
    res.json({ message: "success ", code: 200, vehcile });
  } catch (error) {
    return res.json({
      messageSys: error.message,
      message: "someghing went wrong in sending alarm in getAlarmSettings",
      code: 404,
    });
  }
}

async function setAlarmSettings(req, res) {
  try {
    var IMEI = req.body.IMEI;
    var sendSMS = req.body.sendSMS ? req.body.sendSMS : false;
    var smsNumbers = req.body.smsNumbers;
    var sendEmail = req.body.sendEmail ? req.body.sendEmail : false;
    var emails = req.body.emails;
    var settingsType = req.body.settingsType;
    var speedLimit = req.body.maxSpeed;
    var pmDistance = req.body.maxPmDistance;
    let phoneNumbers = req.body.smsReceivers;

    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });
    console.log(vehicle)

    if (!vehicle) {
      return res.json({
        message: "vehicle not founded !",
        code: 404,
      });
    }
    let receivers = await PhoneBookModel.find({
      phoneNumber: { $in: [...new Set(phoneNumbers)] },
    });
    console.log(receivers,"this is ph")
    var setting = {
      sendSMS: sendSMS.toString() == "true" ? true : false,
      rcvSMSNumbers: smsNumbers,
      sendEmail: sendEmail.toString() == "true" ? true : false,
      rcvEmails: emails,
      smsReceivers: receivers,
    };

    if (settingsType.toString().toLowerCase() === "speed") {
      await vehicle
        .update({ speedAlarm: setting }, {multi:true})
        .then(() => {
          vehicle.maxSpeed = isNaN(speedLimit) ? vehicle.maxSpeed : speedLimit;
        });
    }
    if (settingsType.toString().toLowerCase() === "pm") {
      vehicle.pmAlarm.sendEmail = setting.sendEmail;
      vehicle.pmAlarm.sendSMS = setting.sendSMS;
      vehicle.pmAlarm.rcvEmails = setting.rcvEmails;
      vehicle.pmAlarm.rcvSMSNumbers = setting.rcvSMSNumbers;
      vehicle.maxPMDistance = isNaN(pmDistance)
        ? vehicle.maxPMDistance
        : pmDistance;
    }
    if (settingsType.toString().toLowerCase() === "region") {
      vehicle.regionAlarm.sendEmail = setting.sendEmail;
      vehicle.regionAlarm.sendSMS = setting.sendSMS;
      vehicle.regionAlarm.rcvEmails = setting.rcvEmails;
      vehicle.regionAlarm.rcvSMSNumbers = setting.rcvSMSNumbers;
    }
    await vehicle.save();
    let vehiclAlarmset=vehicle.getAlarmSettings(settingsType)
    return res.json({vehiclAlarmset,code:200})
    
    //  .exec(async function (err, vehicle) {
    //           if (err) {
    //               return res({
    //                   msg: err
    //               })
    //                   .code(500);
    //           } else if (!vehicle) {
    //               return res({
    //                   msg: 'vehicle not found'
    //               })
    //                   .code(404);
    //           } else {
    //               let receivers = await PhoneBookModel.find({ 'phoneNumber': { '$in': [...new Set(phoneNumbers)] } })
    //               var setting = {
    //                   sendSMS: (sendSMS.toString() == 'true') ? true : false,
    //                   rcvSMSNumbers: smsNumbers,
    //                   sendEmail: (sendEmail.toString() == 'true') ? true : false,
    //                   rcvEmails: emails,
    //                   smsReceivers: receivers
    //               };

    //               if (settingsType.toString().toLowerCase() === 'speed') {
    //                   vehicle.update({speedAlarm: setting},  {upsert:true}).exec()
    //                   vehicle.maxSpeed = (isNaN(speedLimit) ? vehicle.maxSpeed : speedLimit);
    //               }
    //               if (settingsType.toString().toLowerCase() === 'pm') {
    //                   vehicle.pmAlarm.sendEmail = setting.sendEmail;
    //                   vehicle.pmAlarm.sendSMS = setting.sendSMS;
    //                   vehicle.pmAlarm.rcvEmails = setting.rcvEmails;
    //                   vehicle.pmAlarm.rcvSMSNumbers = setting.rcvSMSNumbers;
    //                   vehicle.maxPMDistance = (isNaN(pmDistance) ? vehicle.maxPMDistance : pmDistance);

    //               }
    //               if (settingsType.toString().toLowerCase() === 'region') {
    //                   vehicle.regionAlarm.sendEmail = setting.sendEmail;
    //                   vehicle.regionAlarm.sendSMS = setting.sendSMS;
    //                   vehicle.regionAlarm.rcvEmails = setting.rcvEmails;
    //                   vehicle.regionAlarm.rcvSMSNumbers = setting.rcvSMSNumbers;
    //               }

    //               vehicle.save(function (err) {
    //                   if (err) {
    //                       return res({
    //                           msg: err
    //                       })
    //                           .code(404);
    //                   } else {
    //                       return res(vehicle.getAlarmSettings(settingsType))
    //                           .code(200);
    //                   }
    //               });
    //           }
    //       });
  } catch (error) {
    return res.json({
      messageSys: error.message,
      code: 500,
      message: "somthing went wrong in setAlarmSettings",
    });
  }
}

async function tests(req, res) {
  try {
    console.log(req.user);
    const allVehicles = await VehicleModel.find()
      .setAuthorizationUser(req.user)
      .select({
        _id: 1,
        deviceIMEI: 1,
        driverName: 1,
        driverPhoneNumber: 1,
        gpsDataCount: 1,
        lastLocation: 1,
        plate: 1,
        simNumber: 1,
        trackerModel: 1,
        vehicleName: 1,
        speedAlarm: 1,
        maxSpeed: 1,
        maxPMDistance: 1,
        createDate: 1,
        permissibleZone: 1,
        vehicleStatus: 1,
        zoneAlarm: 1,
        fuel: 1,
        currentMonthDistance: 1,
        usage: 1,
        model: 1,
      });
    // .populate('lastLocation')
    // .populate({
    //     path: 'speedAlarm.smsReceivers',
    //     model: PhoneBookModel,
    //     select: { 'firstName': 1, 'lastName': 1, 'phoneNumber': 1 }
    // })
    // .populate({
    //     path: 'zoneAlarm.smsReceivers',
    //     model: PhoneBookModel,
    //     select: { 'firstName': 1, 'lastName': 1, 'phoneNumber': 1 }
    // })
    // // .populate({ path: 'groups', select: 'name' })
    // .populate('vehicleStatus')
    // .populate({
    //     path: 'model',
    //     model: VehicleTypeModel,
    //     select: { 'name': 1, '_id': 0 }
    // })
    // .sort({ _id: -1 })
    // .lean()

    return res.json({
      allVehicles,
    });

    // .exec((err, vehicles) => {
    //     if (err) {
    //         logger.error(err);
    //         return res({
    //             msg: err,
    //         }).code(500);
    //     }
    //     if (!vehicles) {
    //         return res({
    //             msg: 'There is no vehicles',
    //         }).code(404);
    //     }
    //     const getElapsedDate = date => {
    //         const oneDay = 24 * 60 * 60 * 1000;
    //         const now = new Date();
    //         return Math.floor(Math.abs((now - date) / oneDay));
    //     };
    //     const result = vehicles.map(vehicle => {
    //         const { lastLocation, deviceInfo } = vehicle;
    //         return {
    //             deviceInfo: vehicle,
    //             lastLocationDiff: lastLocation
    //                 ? getElapsedDate(lastLocation.date)
    //                 : -1,
    //         };
    //     });
    //     return res(result).code(200);
    // });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      messageSys: error.message,
      code: 500,
    });
  }
}
module.exports = {
  resetDevice,
  setInterval,
  setAPN,
  setSOS,
  configure,
  getDevices,
  addDevice,
  editDevice,
  addDeviceModels,
  getDeviceModels,
  setDeviceStatus,
  deleteDeviceStatus,
  getLastLocationOfAllDevice,
  getAlarmSettings,
  setAlarmSettings,
  tests,
};
