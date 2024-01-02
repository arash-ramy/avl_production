const Validator = require("validatorjs");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const VehicleStatusModel = require("../model/GpsLocation/VehicleStatusModel");
const VehicleTypeModel = require("../model/GpsLocation/VehicleTypeModel");
const PhoneBookModel = require("../model/User/phoneBookModel");
const { FMXXXXController } = require("./FMXXXXController");
const { GT06Controller } = require("./GT06Controller");
const DeviceGroupModel = require("../model/GpsLocation/DeviceGroupeModel");
const geolib = require("geolib");

const moment = require("moment");
const jade = require("jade");
const path = require("path");
var pdf = require("html-pdf");
var ObjectId = require("mongoose").Types.ObjectId;

const { NotifyUtility } = require("./NotifyUtility");
const morgan = require("morgan");
const ActionEventModel = require("../model/GpsLocation/ActionEventModel");
const mongoose = require("mongoose");
const GPSDataModel = require("../model/GpsLocation/GPSDataModel");
const VehicleAlarmModel = require("../model/GpsLocation/VehicleAlarmModel");
const REPORT_TEMPLATE_DIR = path.resolve(__dirname, "..", "template", "report");

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
    // if (vehicle.deviceIMEI !== deviceIMEI) {
    //   if (VehicleModel.exists({ deviceIMEI: deviceIMEI })) {
    //     return res.json({
    //       msg: "وسیله نقلیه دیگری با این IMEI موجود است",
    //       code: "400",
    //     });
    //   }
    // }

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

    await vehicle.save();

    for (let fieldName of ["driverName", "driverPhoneNumber"]) {
      let vehicleEvent;

      if (vehicle[fieldName] !== oldVehicle[fieldName]) {
        vehicleEvent = new ActionEventModel({
          userId: req.user._id,
          date: new Date(),
          objectModel: "vehicle",
          objectId: vehicleId,
          actionType: "update",
          fieldName,
          oldValue: oldVehicle[fieldName],
          newValue: vehicle[fieldName],
        });
        await vehicleEvent.save();
      }

      return res.json({ vehicle, code: 200 });
    }
  } catch (error) {
    // logger.error(ex);
    return res.json({
      message: error.message,
      code: 500,
    });
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
      _id: 1,
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
    console.log(req.body, "555555555555");
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

      const updatedvhcile = await foundedVhicleByIMEI.updateOne(
        {
          vehicleStatus: vehicleStatus._id,
        },
        { upsert: true }
      );
      console.log(updatedvhcile, "updatedvhcile");
      return res.json({
        code: 200,
        message: "success",
      });
    }
    if (vehicle.vehicleStatus.status === status) {
      let id = vehicle.vehicleStatus._id;
      await VehicleStatusModel.findOneAndUpdate({ _id: id }, { desc: desc });

      res.json({ code: 200 });
    }
  } catch (error) {
    return res.json({
      messagesys: error.message,
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
      .populate({
        path: "speedAlarm",
        // model: PhoneBookModel,
        // select: { 'firstName': 1, 'lastName': 1, 'phoneNumber': 1 },
        populate: {
          path: "smsReceivers",
        },
        // }
      })

      .populate({ path: "groups", select: "name" })
      .populate("vehicleStatus")
      .populate({
        path: "model",
        model: VehicleTypeModel,
        select: { name: 1, _id: 0 },
      })
      .populate({
        path: "zoneAlarm",
        // model: PhoneBookModel,
        // select: { 'firstName': 1, 'lastName': 1, 'phoneNumber': 1 }
        populate: {
          path: "smsReceivers",
        },
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
    const vehicles = await VehicleModel.find({ lastLocation: { $ne: null } })

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
      .populate("lastLocation");

    console.log(vehicles, "qa");
    if (!vehicles) {
      return res.json({
        code: 404,
        message: "There is no vehicle ",
      });
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

      // console.log("comes until here 22");
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
      return res.json(values);
    });
    console.log("comes until here 33");
  } catch (error) {
    // logger.error(ex);
    console.log(error);
    return res.json({
      messageSys: error.message,
      message:
        "someghing went wrong in sending alarm in getLastLocationOfAllDevice",
      code: 500,
    });
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

    console.log(req.body, "89888888");
    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });
    console.log(vehicle);

    if (!vehicle) {
      return res.json({
        message: "vehicle not founded !",
        code: 404,
      });
    }
    let receivers = await PhoneBookModel.find({
      phoneNumber: { $in: [...new Set(phoneNumbers)] },
    });
    console.log(receivers, "this is ph");
    var setting = {
      sendSMS: sendSMS.toString() == "true" ? true : false,
      rcvSMSNumbers: smsNumbers,
      sendEmail: sendEmail.toString() == "true" ? true : false,
      rcvEmails: emails,
      smsReceivers: receivers,
    };

    if (settingsType.toString().toLowerCase() === "speed") {
      console.log("speedddddddddddddddddddddddd");
      await vehicle
        .updateOne({ speedAlarm: setting }, { multi: true })
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
    let vehiclAlarmset = vehicle.getAlarmSettings(settingsType);
    return res.json({ vehiclAlarmset, code: 200 });

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
    console.log("runned tests controller ");
    const data = {
      deviceName: "GT06",
      date: new Date(),
      IMEI: "121234",
      lat: 5603045.987456458,
      lng: 4272308.6579039795,
      speed: 190,
      sat: 154,
      raw: "thisdataisraw",
    };
    const lastdata = new Date();
    FMXXXXController.savePacketData(data, lastdata);
    // GT06Controller.savePacketData(data, lastdata);

    // console.log(req.user);
    // const allVehicles = await VehicleModel.find()
    //   .setAuthorizationUser(req.user)
    //   .select({
    //     _id: 1,
    //     deviceIMEI: 1,
    //     driverName: 1,
    //     driverPhoneNumber: 1,
    //     gpsDataCount: 1,
    //     lastLocation: 1,
    //     plate: 1,
    //     simNumber: 1,
    //     trackerModel: 1,
    //     vehicleName: 1,
    //     speedAlarm: 1,
    //     maxSpeed: 1,
    //     maxPMDistance: 1,
    //     createDate: 1,
    //     permissibleZone: 1,
    //     vehicleStatus: 1,
    //     zoneAlarm: 1,
    //     fuel: 1,
    //     currentMonthDistance: 1,
    //     usage: 1,
    //     model: 1,
    //   });
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
    // return res.json({
    //   allVehicles,
    // });
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

const setPolygon = async (req, res) => {
  var id = req.body.id;
  var Polygon = req.body.coordinates;
  var createDate = new Date();
  var creator = req.user._id;
  var sendSMS = req.body.sendSMS ? req.body.sendSMS : false;
  var smsNumbers = req.body.smsNumbers;
  var smsReceivers = req.body.smsReceivers;
  var sendEmail = req.body.sendEmail ? req.body.sendEmail : false;
  var emails = req.body.emails;
  var smsInterval = req.body.smsInterval || 3;

  console.log(req.body, "this is body");

  let receivers = await PhoneBookModel.find({
    phoneNumber: { $in: [...new Set(smsReceivers)] },
  });
  var alarmSetting = {
    sendSMS: sendSMS.toString() === "true",
    rcvSMSNumbers: smsNumbers,
    smsReceivers: receivers,
    sendEmail: sendEmail.toString() === "true",
    rcvEmails: emails,
  };

  var zoneSetting = {
    createDate: createDate,
    creator: creator,
    coordinates: Polygon,
    alarmInterval: smsInterval,
  };

  console.log(receivers, "receivers");
  if (!id) {
    return res.json({
      msg: "id required",
      code: "422",
      validate: false,
      field: "vehicleIMEI",
    });
  }
  const foundedandupdated = await VehicleModel.findOneAndUpdate(
    { _id: id },
    {
      zoneAlarm: alarmSetting,
      permissibleZone: zoneSetting,
    },
    { upsert: true, new: true }
  );

  console.log(foundedandupdated, "foundedandupdated");
  return res.json({ foundedandupdated, code: 200 });
  //         .code(422);
  // } else {
  //     VehicleModel.findOneAndUpdate({ _id: id },
  //         {
  //             zoneAlarm: alarmSetting,
  //             permissibleZone: zoneSetting
  //         },
  //         { upsert: true , new: true},
  //         (error, vehicle) => {
  //             if (error) {
  //                 return res({
  //                     msg: error
  //                 })
  //                     .code(500);
  //             } else if (!vehicle) {
  //                 return res({
  //                     msg: 'vehicle not found'
  //                 })
  //                     .code(404);
  //             } else {
  //                 return res(vehicle)
  //                     .code(200);
  //             }
  //         });
  // }
};

const deletePolygon = async (req, res) => {
  var deviceId = req.params.id;
  if (!deviceId) {
    return res.json({
      msg: "id required",
      code: "422",
      validate: false,
      field: "vehicleIMEI",
    });
  } else {
    const deletePer = await VehicleModel.updateOne(
      { _id: deviceId },
      { $unset: { permissibleZone: 1 } }
    );
    console.log(deletePer);
    return res.json({
      code: 200,
      message: "Permission Zone Delete Successfully",
    });
  }
};

// OK
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
    console.log(arrayOfIMEIS, "befor");

    for (var i = 0; i < req.body.IMEIs.length; i++) {
      arrayOfIMEIS.push({ deviceIMEI: req.body.IMEIs[i] });
    }
    console.log(arrayOfIMEIS, "after");

    var condition = { $or: arrayOfIMEIS };

    const vehiclefounded = await VehicleModel.find(condition);

    res.json({
      code: 200,
      vehiclefounded,
    });
    // .exec(function (err, vehicles) {
    //     if (err) {
    //         return res({
    //             msg: err
    //         })
    //             .code(500);
    //     } else {
    //         return res({
    //             msg: 'fetched successfully',
    //             vehicles: vehicles,
    //             code: 200
    //         })
    //             .code(200);
    //     }
    // });
  } catch (ex) {
    logger.error(ex);
    return res({
      msg: ex,
    }).code(500);
  }
};

const reportDeviceStatus = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error(
        "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
      );
    }

    const { reportDevices } = await reports.getReportDevices(req);

    reportDevices.select({
      deviceIMEI: 1,
      _id: 1,
    });
    const deviceIMEI = (await reportDevices).map(
      ({ deviceIMEI: vehicleIMEI }) => vehicleIMEI
    );

    const vehicleStatus = await VehicleStatusModel.aggregate()
      .match({
        $and: [
          { vehicleIMEI: { $in: deviceIMEI } },
          {
            $and: [
              { date: { $gte: new Date(startDate) } },
              { date: { $lte: new Date(endDate) } },
            ],
          },
        ],
      })
      .group({
        _id: "$vehicleIMEI",
        status: {
          $push: {
            _id: "$_id",
            date: "$date",
            status: "$status",
            desc: "$desc",
          },
        },
      })
      .lookup({
        from: "vehicles",
        localField: "_id",
        foreignField: "deviceIMEI",
        as: "device",
      })
      .unwind("device")
      .lookup({
        from: "devicegroups",
        localField: "device._id",
        foreignField: "devices",
        as: "device.groups",
      })
      .replaceRoot({
        $mergeObjects: [
          "$$ROOT",
          {
            groups: "$device.groups.name",
            device: {
              IMEI: "$device.deviceIMEI",
              type: "$device.type",
              simNumber: "$device.simNumber",
            },
            driver: {
              name: "$device.driverName",
              phoneNumber: "$device.driverPhoneNumber",
            },
          },
        ],
      })
      .sort({ _id: -1 });
    return res.json({ vehicleStatus, code: 200 });
  } catch (err) {
    console.error(err);
    return res.json({ msg: err.message, code: 500 });
  }
};

const exportDeviceStatusReportToPdf = async (req, res) => {
  try {
    const {
      reportData: vehiclesStatusData,
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    const round = (floatingPoint, fractionDigits = 2) =>
      parseFloat(floatingPoint).toFixed(fractionDigits);
    const persianDate = (dateString) =>
      dateString
        ? moment(new Date(dateString)).format("jYYYY/jM/jD HH:mm:ss")
        : null;

    const reportContext = {
      title: "Statuses of Devices",
      date: new Date(),
      reporter: req.user,
      header: `گزارش وضعیت ها (از ${
        startDate ? persianDate(startDate) : "ابتدا"
      } تا ${endDate ? persianDate(endDate) : "کنون"})`,
      startDate,
      endDate,
      vehiclesStatusData,
      round,
      persianDate,
    };
    // console.log(vehiclesStatusData,"vehiclesStatusData")
    const filePath = await reports.getPdfReport(
      "devicestatuses.jade",
      reportContext
    );

    return res.download(filePath);
  } catch (err) {
    console.log(err);
    return res.json({ msg: err.message, code: 500 });
  }
};

const reportDeviceChanges = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error(
        "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
      );
    }

    const { reportDevices } = await reports.getReportDevices(req);

    reportDevices.select({
      deviceIMEI: 1,
      _id: 1,
    });
    const deviceId = (await reportDevices).map(
      ({ _id: vehicleId }) => vehicleId
    );

    const vehiclesChangesData = await ActionEventModel.aggregate().match({
      $and: [
        { objectId: { $in: deviceId } },
        {
          $or: [
            { date: { $gte: new Date(startDate) } },
            { date: { $lte: new Date(endDate) } },
          ],
        },
      ],
    });
    // .lookup({
    //   from: "users",
    //   localField: "userId",
    //   foreignField: "_id",
    //   as: "user",
    // })
    // .unwind("$user")
    // .group({
    //   _id: "$objectId",
    //   changes: {
    //     $push: {
    //       _id: "$_id",
    //       user: "$user",
    //       date: "$date",
    //       objectModel: "$objectModel",
    //       objectId: "$objectId",
    //       actionType: "$actionType",
    //       fieldName: "$fieldName",
    //       oldValue: "$oldValue",
    //       newValue: "$newValue",
    //     },
    //   },
    // })
    // .lookup({
    //   from: "vehicles",
    //   localField: "_id",
    //   foreignField: "_id",
    //   as: "device",
    // })
    // .unwind("device")
    // .lookup({
    //   from: "devicegroups",
    //   localField: "device._id",
    //   foreignField: "devices",
    //   as: "device.groups",
    // })
    // .replaceRoot({
    //   $mergeObjects: [
    //     "$$ROOT",
    //     {
    //       groups: "$device.groups.name",
    //       device: {
    //         IMEI: "$device.deviceIMEI",
    //         type: "$device.type",
    //         simNumber: "$device.simNumber",
    //       },
    //       driver: {
    //         name: "$device.driverName",
    //         phoneNumber: "$device.driverPhoneNumber",
    //       },
    //     },
    //   ],
    // });
    return res.json({ vehiclesChangesData, code: 200 });
  } catch (err) {
    console.log(err);
    return res.json({ msg: err.message });
  }
};

const exportDeviceChangesReportToPdf = async (req, res) => {
  try {
    const {
      reportData: vehiclesChangesData,
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    const round = (floatingPoint, fractionDigits = 2) =>
      parseFloat(floatingPoint).toFixed(fractionDigits);
    const persianDate = (dateString) =>
      dateString
        ? moment(new Date(dateString)).format("jYYYY/jM/jD HH:mm:ss")
        : null;

    const reportContext = {
      title: "تغییرات دستگاه",
      date: new Date(),
      reporter: req.user,
      header: `گزارش تغییرات (از ${
        startDate ? persianDate(startDate) : "ابتدا"
      } تا ${endDate ? persianDate(endDate) : "کنون"})`,
      startDate,
      endDate,
      vehiclesChangesData,
      round,
      persianDate,
    };
    const filePath = await reports.getPdfReport(
      "devicechanges.jade",
      reportContext
    );
    return res.download(filePath);
  } catch (error) {
    console.log(error);
    return res({ msg: error.message });
  }
};

const reportDriverVehicles = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error(
        "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
      );
    }

    const { reportDevices } = await reports.getReportDevices(req);

    reportDevices.select({
      deviceIMEI: 1,
      driverName: 1,
      _id: 1,
    });
    const driverName = (await reportDevices).map(
      ({ driverName: driverFullName }) => driverFullName
    );

    const driverVehiclesData = await ActionEventModel.aggregate([
      {
        $match: {
          $and: [
            { oldValue: { $in: driverName } },
            {
              $or: [
                { date: { $gte: new Date(startDate) } },
                { date: { $lte: new Date(endDate) } },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "objectId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: "$vehicle" },
      { $unset: "vehicle.alarms" },
      {
        $lookup: {
          from: "devicegroups",
          localField: "vehicle._id",
          foreignField: "devices",
          as: "group",
        },
      },
      { $unwind: "$group" },
      { $unset: "group.devices" },
      { $unset: "group.sharees" },
      { $set: { "vehicle.groups": "$group" } },
      {
        $group: {
          _id: "$oldValue",
          vehicles: {
            $push: {
              plate: "$vehicle.plate",
              date: "$date",
              type: "$vehicle.type",
              group: "$vehicle.groups.name",
            },
          },
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "driverName",
          as: "currentVehicle",
        },
      },

      { $unwind: "$currentVehicle" },
      { $unset: "currentVehicle.alarms" },
      {
        $lookup: {
          from: "devicegroups",
          localField: "currentVehicle._id",
          foreignField: "devices",
          as: "group",
        },
      },
      { $unwind: "$group" },
      { $unset: "group.devices" },
      { $unset: "group.sharees" },
      { $set: { "currentVehicle.groups": "$group.name" } },
      { $unset: "group" },
    ]);
    return res.json({ driverVehiclesData, code: 200 });
  } catch (err) {
    console.log(err);

    return res.json({ msg: err.message, code: 500 });
  }
};

const exportDriverVehiclesReportToPdf = async (req, res) => {
  try {
    const {
      reportData: driverVehiclesData,
      dateFilter: { start: startDate, end: endDate },
    } = req.body;

    if (
      !driverVehiclesData ||
      driverVehiclesData === undefined ||
      driverVehiclesData === null
    ) {
      return res.json({ message: "please enter  *reportDate* ", code: 400 });
    }

    const round = (floatingPoint, fractionDigits = 2) =>
      parseFloat(floatingPoint).toFixed(fractionDigits);
    const persianDate = (dateString) =>
      dateString
        ? moment(new Date(dateString)).format("YYYY/M/D HH:mm:ss")
        : null;

    const reportContext = {
      title: "تغییر ماشین‌ها",
      date: new Date(),
      reporter: req.user,
      header: `گزارش تغییرات (از ${
        startDate ? persianDate(startDate) : "ابتدا"
      } تا ${endDate ? persianDate(endDate) : "کنون"})`,
      startDate,
      endDate,
      driverVehiclesData,
      round,
      persianDate,
    };
    const filePath = await reports.getPdfReport(
      "driverVehicles.jade",
      reportContext
    );
    console.log(filePath, "this is pdffile*****^&");
    return res.download(filePath);
  } catch (err) {
    console.log(err);
    return res.json({ msg: err.message, code: 500 });
  }
};

const reportDeviceLocations = async (req, res) => {
  try {
    const {
      type,
      dateFilter: { start: startDate, end: endDate },
      speedFilter: { min: minSpeed, max: maxSpeed },
      timeFilter: { start: startTime, end: endTime },
    } = req.body;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error(
        "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
      );
    }
    if (startTime && endTime && startTime > endTime) {
      throw new Error(
        "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد."
      );
    }
    if (minSpeed && maxSpeed && +minSpeed > +maxSpeed) {
      throw new Error(
        "کمینه سرعت گزارش نمی‌تواند از بیشینه سرعت گزارش بیشتر باشد."
      );
    }
    const { reportDevices } = await reports.getReportDevices(req);
    console.log("cmosd255");
    console.log("this is reportDevice121s ", reportDevices);
    // await reportDevices.select({ deviceIMEI: 1 });
    // // const deviceIMEIs = (await reportDevices).map=>{
    // //     return vehicle => vehicle.deviceIMEI}
    // // ;

    console.log("_______________________________________");
    console.log("iiiii23", reportDevices);
    console.log("_______________________________________");

    const deviceIds = (await reportDevices).map((vehicle) => vehicle._id);
    console.log("deviceIds211", deviceIds);

    const reportLocations = GPSDataModel.aggregate()
      .match({ vehicleId: { $in: deviceIds } })
      .addFields({
        dateCreated: {
          $dateFromString: {
            dateString: { $substr: ["$date", 0, 34] },
          },
        },
        dateCreatedHour: {
          $hour: {
            date: {
              $dateFromString: {
                dateString: {
                  $substr: ["$date", 0, 34],
                },
              },
            },
            timezone: "Asia/Tehran",
          },
        },
      });
    console.log("reportLocations8888", reportLocations);

    if (startDate) {
      reportLocations.match({
        dateCreated: { $gte: new Date(startDate) },
      });
    }
    if (endDate) {
      reportLocations.match({
        dateCreated: { $lte: new Date(endDate) },
      });
    }
    if (minSpeed) {
      reportLocations.match({ speed: { $gte: +minSpeed } });
    }
    if (maxSpeed) {
      reportLocations.match({ speed: { $lte: +maxSpeed } });
    }
    if (startTime) {
      reportLocations.match({
        dateCreatedHour: { $gte: startTime },
      });
    }
    if (endTime) {
      reportLocations.match({
        dateCreatedHour: { $lt: endTime },
      });
    }
    const vehiclesLocationData = await reportLocations
      .group({
        _id: "$vehicleId",
        locations: {
          $push: {
            date: "$dateCreated",
            latitude: "$lat",
            longitude: "$lng",
            address: "$address",
            speed: "$speed",
            url: "$url",
          },
        },
        minSpeed: { $min: "$speed" },
        maxSpeed: { $max: "$speed" },
        avgSpeed: { $avg: "$speed" },
        lastLocation: {
          $last: { address: "$address", date: "$date" },
        },
      })
      .lookup({
        from: "vehicles",
        localField: "_id",
        foreignField: "_id",
        as: "device",
      })
      .unwind("device")
      .lookup({
        from: "devicegroups",
        localField: "device._id",
        foreignField: "devices",
        as: "device.groups",
      })
      .replaceRoot({
        $mergeObjects: [
          "$$ROOT",
          {
            groups: "$device.groups.name",
            device: {
              IMEI: "$device.deviceIMEI",
              type: "$device.type",
              simNumber: "$device.simNumber",
              fuel: "$device.fuel",
            },
            driver: {
              name: "$device.driverName",
              phoneNumber: "$device.driverPhoneNumber",
            },
          },
        ],
      });

    return res.json(vehiclesLocationData);
  } catch (ex) {
    console.log(ex);
    return res.json({ msg: ex.message });
  }
};

const exportDeviceLocationsReportToPdf = async (req, res) => {
  try {
    if (!req.body.dateFilter && !req.body.eportData) {
      return res.json({
        messag: "reportData is required ",
        code: 400,
      });
    }
    const {
      reportData: vehiclesLocationData,
      dateFilter: { start: startDate, end: endDate },
      speedFilter: { min: minSpeed, max: maxSpeed },
    } = req.body;
    const distance = (vehicle) =>
      geolib.getPathLength(vehicle.locations) / 1000.0;
    const round = (floatingPoint, fractionDigits = 2) =>
      parseFloat(floatingPoint).toFixed(fractionDigits);
    const persianDate = (dateString) =>
      dateString
        ? moment(new Date(dateString)).format("jYYYY/jM/jD HH:mm:ss")
        : null;

    const reportContext = {
      title: "Locations of Devices",
      date: new Date(),
      reporter: req.user,
      header: `گزارش موقعیت دستگاه‌ها (از ${
        startDate ? persianDate(startDate) : "ابتدا"
      } تا ${endDate ? persianDate(endDate) : "کنون"})`,
      startDate,
      endDate,
      minSpeed,
      maxSpeed,
      vehiclesLocationData,
      distance,
      round,
      persianDate,
    };
    const filePath = await reports.getPdfReport(
      "devicelocations.jade",
      reportContext
    );
    console.log(filePath, "5871452");
    return res.download(filePath);
  } catch (error) {
    console.log(error);
    return res.json({
      messageSys: error.message,
      message: "something went wrong in exportDeviceLocationsReportToPdf ",
      code: 500,
    });
  }
};

// const reportDeviceLocations2=  async(req, res) => {
//   try {
//     const {
//         type,
//         dateFilter: { start: startDate, end: endDate },
//         speedFilter: { min: minSpeed, max: maxSpeed },
//         timeFilter: { start: startTime, end: endTime },
//     } = req.body;
//     if (
//         startDate &&
//         endDate &&
//         new Date(startDate) > new Date(endDate)
//     ) {
//         throw new Error(
//             'تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد.'
//         );
//     }
//     if (startTime && endTime && startTime > endTime) {
//         throw new Error(
//             'ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد.'
//         );
//     }
//     if (minSpeed && maxSpeed && +minSpeed > +maxSpeed) {
//         throw new Error(
//             'کمینه سرعت گزارش نمی‌تواند از بیشینه سرعت گزارش بیشتر باشد.'
//         );
//     }
//     const { reportDevices } = await reports.getReportDevices(req);
//     reportDevices.select({ deviceIMEI: 1 });
//     const deviceIMEIs = (await reportDevices).map(
//         vehicle => vehicle.deviceIMEI
//     );
//     const deviceIds = (await reportDevices).map(
//         vehicle => vehicle._id
//     );
//     console.log("e[so")

//     const reportLocations = GPSDataModel.aggregate()
//         .match({ vehicleId: { $in: deviceIds } })
//         .addFields({
//             dateCreated: {
//                 $dateFromString: {
//                     dateString: { $substr: ['$date', 0, 34] },
//                 },
//             },
//             dateCreatedHour: {
//                 $hour: {
//                     date: {
//                         $dateFromString: {
//                             dateString: {
//                                 $substr: ['$date', 0, 34],
//                             },
//                         },
//                     },
//                     timezone: 'Asia/Tehran',
//                 },
//             },
//         });
//     if (startDate) {
//         reportLocations.match({
//             dateCreated: { $gte: new Date(startDate) },
//         });
//     }
//     if (endDate) {
//         reportLocations.match({
//             dateCreated: { $lte: new Date(endDate) },
//         });
//     }
//     if (minSpeed) {
//         reportLocations.match({ speed: { $gte: +minSpeed } });
//     }
//     if (maxSpeed) {
//         reportLocations.match({ speed: { $lte: +maxSpeed } });
//     }
//     if (startTime) {
//         reportLocations.match({
//             dateCreatedHour: { $gte: startTime },
//         });
//     }
//     if (endTime) {
//         reportLocations.match({
//             dateCreatedHour: { $lt: endTime },
//         });
//     }
//     const vehiclesLocationData = await reportLocations
//         .group({
//             _id: '$vehicleId',
//             locations: {
//                 $push: {
//                     date: '$dateCreated',
//                     latitude: '$lat',
//                     longitude: '$lng',
//                     address: '$address',
//                     speed: '$speed',
//                     url: '$url',
//                 },
//             },
//             minSpeed: { $min: '$speed' },
//             maxSpeed: { $max: '$speed' },
//             avgSpeed: { $avg: '$speed' },
//             lastLocation: {
//                 $last: { address: '$address', date: '$date' },
//             },
//         })
//         .lookup({
//             from: 'vehicles',
//             localField: '_id',
//             foreignField: '_id',
//             as: 'device',
//         })
//         .unwind('device')
//         .lookup({
//             from: 'devicegroups',
//             localField: 'device._id',
//             foreignField: 'devices',
//             as: 'device.groups',
//         })
//         .replaceRoot({
//             $mergeObjects: [
//                 '$$ROOT',
//                 {
//                     groups: '$device.groups.name',
//                     device: {
//                         IMEI: '$device.deviceIMEI',
//                         type: '$device.type',
//                         simNumber: '$device.simNumber',
//                         fuel: '$device.fuel',
//                     },
//                     driver: {
//                         name: '$device.driverName',
//                         phoneNumber: '$device.driverPhoneNumber',
//                     },
//                 },
//             ],
//         });

//     return res.json({vehiclesLocationData , code :500})
// } catch (ex) {
//     console.log(ex)
//     return res.json({ msg: ex.message,code :500 })
// }
// }

const reportDeviceAlarms = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
      timeFilter: { start: startTime, end: endTime },
      groupFilter, deviceFilter } = req.body;
    // const { } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error(
        "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
      );
    }
    if (startTime && endTime && startTime > endTime) {
      throw new Error(
        "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد."
      );
    }
    console.log(new Date(startDate).toUTCString(), "ooo");
    // console.log(ISODate(endDate), "ooo");

    // this was external function

    const reportDevices = await VehicleModel.find()
      .setAuthorizationUser(req.user)
      .select("_id");
    // // console.log("commmmmmes222",reportDevices);
    // console.log("ee2")
    // if (groupFilter.length) {
    //   console.log("ee3")
    var groupDevices = await DeviceGroupModel.aggregate()
      .match({
        devices: {
          $in: reportDevices.map((item) => {
            return new mongoose.Types.ObjectId(item);
          }),
        },
      })

      .unwind("devices")
      .group({ _id: null, devices: { $addToSet: "$devices" } });

    const reportAlarms = VehicleAlarmModel.aggregate()
      .match({ vehicleId: { $in: deviceFilter } })
      .addFields({
        dateCreated: {
          $dateFromString: {
            dateString: { $substr: ["$date", 0, 34] },
          },
        },
        dateCreatedHour: {
          $hour: {
            date: {
              $dateFromString: {
                dateString: {
                  $substr: ["$date", 0, 34],
                },
              },
            },
            timezone: "Asia/Tehran",
          },
        },
      });
    if (startDate) {
      reportAlarms.match({
        dateCreated: { $gte: new Date(startDate) },
      });
    }
    if (endDate) {
      reportAlarms.match({
        dateCreated: { $lte: new Date(endDate) },
      });
    }
    if (startTime) {
      reportAlarms.match({
        dateCreatedHour: { $gte: startTime },
      });
    }
    if (endTime) {
      reportAlarms.match({
        dateCreatedHour: { $lt: endTime },
      });
    }
    const vehiclesAlarmData = await reportAlarms
      .group({
        _id: "$vehicleId",
        alarms: {
          $push: {
            date: "$dateCreated",
            type: "$type",
            desc: "$desc",
            hour: "$dateCreatedHour",
          },
        },
      })
      .lookup({
        from: "vehicles",
        localField: "_id",
        foreignField: "_id",
        as: "device",
      })
      .unwind("device")
      .lookup({
        from: "devicegroups",
        localField: "device._id",
        foreignField: "devices",
        as: "device.groups",
      })
      .replaceRoot({
        $mergeObjects: [
          "$$ROOT",
          {
            groups: "$device.groups.name",
            device: {
              IMEI: "$device.deviceIMEI",
              type: "$device.type",
              simNumber: "$device.simNumber",
            },
            driver: {
              name: "$device.driverName",
              phoneNumber: "$device.driverPhoneNumber",
            },
          },
        ],
      });

    return res.json({ vehiclesAlarmData, code: 200 });
  } catch (error) {
    console.log(error);

    return res.json({ msg: error.message, code: 404 });
  }
};

// const reportDeviceAlarms = async (req, res) => {
//   try {
//     const {
//       dateFilter: { start: startDate, end: endDate },
//       timeFilter: { start: startTime, end: endTime },
//     } = req.body;
//     const { groupFilter, deviceFilter } = req.body;

//     if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
//       throw new Error(
//         "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
//       );
//     }
//     if (startTime && endTime && startTime > endTime) {
//       throw new Error(
//         "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد."
//       );
//     }
//     console.log(new Date(startDate).toUTCString() , "ooo");
//     // console.log(ISODate(endDate), "ooo");

//     // this was external function

//     const reportDevices = await VehicleModel.find().setAuthorizationUser(req.user).select("_id")
//     // // console.log("commmmmmes222",reportDevices);
//     // console.log("ee2")
//     // if (groupFilter.length) {
//     //   console.log("ee3")
//     var groupDevices = await DeviceGroupModel.aggregate()
//       .match({
//         devices: {
//           $in: reportDevices.map((item) => {
//             return new mongoose.Types.ObjectId(item);
//           }),
//         },
//       })

//       .unwind("devices")
//       .group({ _id: null, devices: { $addToSet: "$devices" } })
//       // return res.json({groupDevices})
//       // console.log("runnnn befor  vehicel ")
//       // return res.json({groupDevices})

//       .then(async(response)=>{
//         // console.log("dd")
//         const reportAlarms =await  VehicleAlarmModel.aggregate(
//          [
//           {$match :{
//             vehicleId: { $in: response[0].devices }
//           }},
//           {$addFields :{
//             dateCreated: {
//               $dateFromString: {
//                   dateString: { $substr: ['$date', 0, 34] },
//               },
//           },
//           dateCreatedHour: {
//               $hour: {
//                   date: {
//                       $dateFromString: {
//                           dateString: {
//                               $substr: ['$date', 0, 34],
//                           },
//                       },
//                   },
//                   timezone: 'Asia/Tehran',
//               },
//           },
//           }

//         },
//         { $match:{$and :[
//                 {"dateCreated": { $gte: new Date(startDate) }},
//                 {"dateCreated": { $lte: new Date(endDate) }},

//         ]
//         }}

//          ]
//         )
//         // .match({$and:[{ vehicleId: { $in: response[0].devices }}]})
//         // .addFields({
//         //     dateCreated: {
//         //         $dateFromString: {
//         //             dateString: { $substr: ['$date', 0, 34] },
//         //         },
//         //     },
//         //     dateCreatedHour: {
//         //         $hour: {
//         //             date: {
//         //                 $dateFromString: {
//         //                     dateString: {
//         //                         $substr: ['$date', 0, 34],
//         //                     },
//         //                 },
//         //             },
//         //             timezone: 'Asia/Tehran',
//         //         },

//         //     },
//         // })
//         // .limit(1)
//         .then((response)=>{

//           return res.json(response)
//         //   if (startDate && !startDate===null ) {
//         //     response.match({
//         //         dateCreated: { $gte: new Date(startDate) },
//         //     });
//         // }
//         // if (endDate && !endDate===null ) {
//         //   response.match({
//         //         dateCreated: { $lte: new Date(endDate) },
//         //     });
//         // }
//         // if (startTime  && !startTime===null)  {
//         //   response.match({
//         //         dateCreatedHour: { $gte: startTime },
//         //     });
//         // }
//         // if (endTime  && !endTime===null) {
//         //   response.match({
//         //         dateCreatedHour: { $lt: endTime },
//         //     });
//         // }

//       //   response.group({
//       //     _id: '$vehicleId',
//       //     alarms: {
//       //         $push: {
//       //             date: '$dateCreated',
//       //             type: '$type',
//       //             desc: '$desc',
//       //             hour: '$dateCreatedHour',
//       //         },
//       //     },
//       // })
//       // .lookup({
//       //     from: 'vehicles',
//       //     localField: '_id',
//       //     foreignField: '_id',
//       //     as: 'device',
//       // })
//       // .unwind('device')
//       // .lookup({
//       //     from: 'devicegroups',
//       //     localField: 'device._id',
//       //     foreignField: 'devices',
//       //     as: 'device.groups',
//       // })
//       // .replaceRoot({
//       //     $mergeObjects: [
//       //         '$$ROOT',
//       //         {
//       //             groups: '$device.groups.name',
//       //             device: {
//       //                 IMEI: '$device.deviceIMEI',
//       //                 type: '$device.type',
//       //                 simNumber: '$device.simNumber',
//       //             },
//       //             driver: {
//       //                 name: '$device.driverName',
//       //                 phoneNumber: '$device.driverPhoneNumber',
//       //             },
//       //         },
//           // ],
//       })

//       //  return res.json(response )

//       // })

// //  return res.json(reportAlarms)

//     // if (startDate && !startDate===null ) {
//     //     reportAlarms.match({
//     //         dateCreated: { $gte: new Date(startDate) },
//     //     });
//     // }
//     // if (endDate && !endDate===null ) {
//     //     reportAlarms.match({
//     //         dateCreated: { $lte: new Date(endDate) },
//     //     });
//     // }
//     // if (startTime  && !startTime===null)  {
//     //     reportAlarms.match({
//     //         dateCreatedHour: { $gte: startTime },
//     //     });
//     // }
//     // if (endTime  && !endTime===null) {
//     //     reportAlarms.match({
//     //         dateCreatedHour: { $lt: endTime },
//     //     });
//     // }
//     // return res.json({reportAlarms})
//     // reportAlarms
//     // .group({
//     //         _id: '$vehicleId',
//     //         alarms: {
//     //             $push: {
//     //                 date: '$dateCreated',
//     //                 type: '$type',
//     //                 desc: '$desc',
//     //                 hour: '$dateCreatedHour',
//     //             },
//     //         },
//     //     })
//     //     .lookup({
//     //         from: 'vehicles',
//     //         localField: '_id',
//     //         foreignField: '_id',
//     //         as: 'device',
//     //     })
//     //     .unwind('device')
//     //     .lookup({
//     //         from: 'devicegroups',
//     //         localField: 'device._id',
//     //         foreignField: 'devices',
//     //         as: 'device.groups',
//     //     })
//     //     .replaceRoot({
//     //         $mergeObjects: [
//     //             '$$ROOT',
//     //             {
//     //                 groups: '$device.groups.name',
//     //                 device: {
//     //                     IMEI: '$device.deviceIMEI',
//     //                     type: '$device.type',
//     //                     simNumber: '$device.simNumber',
//     //                 },
//     //                 driver: {
//     //                     name: '$device.driverName',
//     //                     phoneNumber: '$device.driverPhoneNumber',
//     //                 },
//     //             },
//     //         ],
//     //     })

//     // return res.json(reportAlarms)

// })

//   } catch (ex) {
//     console.log(ex);
//     return res.json({ msg: ex.message, code: 500 });
//   }
// };

const exportDeviceAlarmsReportToPdf = async (req, res) => {
  try {
    const {
      reportData: vehiclesAlarmData,
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    const round = (floatingPoint, fractionDigits = 2) =>
      parseFloat(floatingPoint).toFixed(fractionDigits);
    const persianDate = (dateString) =>
      dateString
        ? moment(new Date(dateString)).format("jYYYY/jM/jD HH:mm:ss")
        : null;

    const reportContext = {
      title: "Alarms of Devices",
      date: new Date(),
      reporter: req.user,
      header: `گزارش هشدارها (از ${
        startDate ? persianDate(startDate) : "ابتدا"
      } تا ${endDate ? persianDate(endDate) : "کنون"})`,
      startDate,
      endDate,
      vehiclesAlarmData,
      round,
      persianDate,
    };
    const filePath = await reports.getPdfReport(
      "devicealarms.jade",
      reportContext
    );
    return res.download(filePath);
  } catch (err) {
    console.log(err);
    return res.json({ msg: err.message, code: 400 });
  }
};

const getLastLocationsOfDeviceInP = async (req, res) => {
  try {
    //   //[1,2,3]
      var devices = req.body.devices;
      var bTime = req.body.bTime;
      var eTime = req.body.eTime;
    //   // var limit = req.body.limit;

    //   // console.log(bTime, eTime, "9999");

    //   var hexSeconds = Math.floor(bTime).toString(16);
    //   var hexSeconds2 = Math.floor(eTime).toString(16);

    //   // console.log(hexSeconds, hexSeconds2, "iiiiii");

    //   var bId = new mongoose.Types.ObjectId(hexSeconds + "0000000000000000");

    //   var eId = new mongoose.Types.ObjectId(hexSeconds2 + "0000000000000000");

    //       const gpsfounded = await GPSDataModel.aggregate({
    //         $match:{
    //   $and:[
    //     {
    //                   // "IMEI" : ($in : devices)
    //                   IMEI: { $in: devices }

    //     },
    //     {
    //       _id :{
    //         $gte: new mongoose.Types.ObjectId(bId),
    //         $lte: new mongoose.Types.ObjectId(eId),
    //       }
    //     },

    //   ]
    // },

    //   }).group ({
    //         _id: "$_id",

    //         data: {
    //           $push: { location: ["$lat", "$lng"] },
    //         }}
    //       )
    //       // .$group({ _id: null, devices:{ $push:{ location: ["$lat", "$lng"] } }})

    //   // .unwind("$IMEI")
    //   .limit(1)

    //       $push: { location: ["$lat", "$lng"] }
    //     },
    // //  $group:{
    //   "_id":"$IMEI",
    //   "data":{"lat":"$lat"}
    // },
    const gpsfounded = await GPSDataModel.aggregate([
      {
        $match: {
          IMEI: {
            $in: devices,
          },
          date: {
            $gte: new Date(bTime),
            $lte: new Date(eTime),
          },
        },
      },
      {
        $group: {
          _id: "$IMEI",
          locations: { $push: { lat: "$lat", lng: "$lng" } },
        },
      },
      {
        $project: {
          _id: 0,
          IMEI: "$_id",
          locations: {
            $map: {
              input: "$locations",
              as: "location",
              in: ["$$location.lat", "$$location.lng"],
            },
          },
        },
       
      },
    ])

    return res.json({
      gpsfounded,
      code: 200,
    });

    // console.log(eId, bId, "uuuuuuuuuuu");

    // var deviceCond = new Array();
    // var deviceCond2 = new Array();
    // var foundedDevice = new Array();
    // var cordinate = new Array();
    // var cordinateAG= new Array();

    // for (var i = 0; i < devices.length; i++) {
    //   deviceCond.push({ IMEI: devices[i] });
    //   deviceCond2.push(devices[i]);
    // }
    // console.log(deviceCond);
    // console.log(deviceCond2);

    // for (var i = 0; i < devices.length; i++) {
    //   var gpsfounded = await GPSDataModel.find (
    //     {
    //     $and: [
    //       {
    //         IMEI: deviceCond2[i],
    //       },
    //       {
    //         _id: {
    //           $gte: new mongoose.Types.ObjectId(bId),
    //           $lte: new mongoose.Types.ObjectId(eId),
    //         },
    //       },
    //     ],
    //   }

    //   ).limit(20)
    //   var cordinationfounded = gpsfounded.map(async (item) => {
    //     var ii = [];
    //     let pp = [item.lat, item.lng];
    //     // console.log("item", item.IMEI);
    //     i
    //     ii.push(pp);
    //     cordinate.push(...ii);
    //     cordinateAG.push({"IMEI":item.IMEI , location :cordinate})
    //     // console.log("this is cordinate ", cordinate)
    //   });

    // console.log(gpsfounded);
    // foundedDevice.push(gpsfounded);

    // foundedDevice.push({imei:gpsfounded[i].IMEI,location:[gpsfounded[i].lat,gpsfounded[i].lng]})
    // console.log('ramythisisfounddevice88',gpsfounded)
    // }

    // return res.json({ cordinateAG });
    // cordinateAG
    // var findCondition = {
    //   $and: [
    //     {
    //       $or: deviceCond,
    //     },
    //     {
    //       _id: {
    //         $gte: new mongoose.Types.ObjectId(bId),
    //         $lte: new mongoose.Types.ObjectId(eId),
    //       },
    //     },
    //   ],
    // };

    // console.log("this comes until here8888887!", findCondition);
    // console.log("this comes until here8888887!", findCondition);
    // const { page, limit} = req.body;
    const page = parseInt(req.body.page) - 1 || 0;
    //  ?limit=
    const limit = parseInt(req.body.limit) || 5;
    //  ?search
    var arrrr = [];

    //     const gpsfounded = await GPSDataModel.find({
    // $and:[
    //   {
    //                   $or: deviceCond,
    //   },
    //   {
    //     _id :{
    //       $gte: new mongoose.Types.ObjectId(bId),
    //       $lte: new mongoose.Types.ObjectId(eId),
    //     }
    //   },

    // ]

    // })
    //     // .$group({ _id: null, devices: { location: ["$lat", "$lng"] } })

    // // .unwind("$IMEI")
    // .select(" IMEI").limit(100)

    // .then((resp)=>{

    //  resp.map(async(item)=>{
    //   let iii=  await  GPSDataModel.find({IMEI:item.IMEI}).select ("lat lng IMEI").project( {IMEI:1, location: ["$lat","$lng"] })
    //     // console.log(iii)

    // })
    // })
    return res.json({ arrrr });

    // .then((resp)=>{
    // return resp.
    // }
    //     // )
    // console.log(devices)
    //     const gpsfounded = await GPSDataModel.aggregate(
    //       {
    //         $match: {
    //           $and: [
    //             {
    //               $or: devices,
    //             },
    //             {
    //               _id: {
    //                 $gte: new mongoose.Types.ObjectId(bId),
    //                 $lte: new mongoose.Types.ObjectId(eId),
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     {
    //        $project: {IMEI:1, location: ["$lat","$lng"] }}
    //        ).limit(10)

    // {
    //       $group: {
    //         _id: "$IMEI",
    //         location:[]

    //     }}
    // {  $project: {IMEI:1,     $push: { location: ["$lat", "$lng"] } }}

    // {
    //   $group: {
    //     _id: "$_id",
    //     IMEI: " $IMEI",

    //     data: {
    //       $push: { location: ["$lat", "$lng"] },
    //     },
    //   },
    // },

    // .project({
    //           lat: 1,
    //           lng: 1,
    //           date: 1,
    //         });
    //   const [userResult] = await mongoose.model('devicegroup').aggregate([
    //     {
    //         $match: {
    //             $or: [{ user: userId }, { sharees: userId }],
    //         },
    //     },
    //     { $unwind: '$devices' },
    //     {
    //         $group: {
    //             _id: null,
    //             devices: { $addToSet: '$devices' },
    //         },
    //     },
    // ]);

    // .skip(page * limit)
    // .limit(limit);

    // .limit(limit * 1)
    // .skip((page - 1) * limit)

    // .project({ })

    // const gpsfounded = await GPSDataModel.find(findCondition).select(
    //   "lat lng "
    // )

    // .limit(limit * 1)
    // .skip((page - 1) * limit)
    // const gpsfounded2 = await GPSDataModel.find(findCondition).select(
    //   "address"
    // )  .limit(1)

    // console.log(gpsfounded[0]._id.getTimestamp(),"llsosooso")
    // console.log(gpsfounded);

    // exec(function (err, locations) {
    //       if (err) {
    //           // logger.error(err);
    //           console.log(err)
    //           return res.json({
    //               msg: err,
    //               code :500
    //             })
    //       }
    //       else if (!locations) {
    //           return res.json({
    //               msg: 'There is no vehicles'
    //               ,code:404
    //           })
    //       }
    //       else {
    //           return res.json({ locations: locations, code: 200 }).code(200);
    //       }
    //   });
  } catch (err) {
    // logger.error(ex);
    console.log(err);
    return res.json({
      msg: err.message,
      code: 500,
    });
  }
};
const reports = {
  getPdfReport: (template, context) => {
    return new Promise((resolve, reject) => {
      const html = jade.renderFile(
        path.resolve(REPORT_TEMPLATE_DIR, template),
        context
      );
      const reportConfig = {
        header: {
          height: "15mm",
          contents: `
                        <div style="text-align: center; font-size: 10px;">
                            ${context.header} 
                        </div>
                        <hr/>
                    `,
        },
        footer: {
          height: "15mm",
          contents: `
                        <hr/>
                        <span style="color: #444;font-size: 10px;">{{page}}</span>
                        /<span>{{pages}}</span>
                    `,
        },
        orientation: "portrait",
        border: "1",
        timeout: 100000,
      };
      const fileName = `${context.title
        .toLowerCase()
        .replace(/ /g, "-")}-${moment(context.date).format(
        "jYYYY-jM-jD-HH-mm-ss"
      )}.pdf`;
      pdf
        .create(html, reportConfig)
        .toFile(`reports/${fileName}`, (error, stream) => {
          if (error) {
            reject(error);
          }
          resolve(stream.filename);
        });
    });
  },

  getReportDevices: async (req) => {
    const { groupFilter, deviceFilter } = req.body;
    console.log("ee");
    console.log(groupFilter, "groupFilter", deviceFilter, "deviceFilter");
    const reportDevices = await VehicleModel.find().setAuthorizationUser(
      req.user
    );
    console.log("commmmmmes222", reportDevices);
    console.log("ee2");

    if (groupFilter.length) {
      console.log("ee3");
      const groupDevices = await DeviceGroupModel.aggregate()
        .match({
          _id: {
            $in: groupFilter.map((item) => {
              return item;
            }),
          },
        })
        .unwind("devices")
        .group({ _id: null, devices: { $addToSet: "$devices" } });
      if (groupDevices && groupDevices.length) {
        console.log("ee4");

        reportDevices.find({
          _id: { $in: groupDevices[0].devices },
        });
      }
    }
    console.log("ee5");

    console.log("commmmmmes");
    console.log(reportDevices, "reportDevices2");

    if (deviceFilter.length) {
      await reportDevices.find({
        deviceIMEI: { $in: deviceFilter },
      });
    }
    console.log(reportDevices, "arash ramyyyyyyy");
    return { reportDevices };
  },
  getReportDevices2: async (req, res) => {
    console.log("xozzzz");
    const { groupFilter, deviceFilter } = req.body;
    console.log(groupFilter, "groupFilter", deviceFilter, "deviceFilter");
    const reportDevices = await VehicleModel.find()
      .setAuthorizationUser(req.user)
      .select("_id");
    // const reportDevices =await  VehicleModel.aggregate()
    // .unwind("_id")
    // .setAuthorizationUser(req.user)
    console.log(reportDevices, "2xozzzz");

    // console.log(reportDevices,"reportDevices**********");

    // if (groupFilter.length) {

    // const groupDevices = await DeviceGroupModel.aggregate()
    //   .match({
    //     _id: {
    //       $in: groupFilter.map((item) => {
    //         return item;
    //       }),
    //     },
    //   })
    //   .unwind("devices")
    //   // .unwind("_id")
    //   .group({ _id: null, devices: { $addToSet: "$devices" } })
    //   // .unwind("_id")

    // if (groupDevices && groupDevices.length)
    //   reportDevices.find({
    //     _id: { $in: groupDevices[0].devices },
    //   })

    //   console.log(groupDevices,"groupDevices");
    // }

    // console.log(deviceFilter,"deviceFilter");

    // console.log(reportDevices, "reportDevices222222*");

    // return res.json({reportDevices})

    // if (deviceFilter.length) {
    //         reportDevices.map((item) => {
    //           return item;
    //         });
    // }
    // reportDevices.select({ deviceIMEI: 1 });

    return { reportDevices };
  },
  getReportDevices3: async (req) => {
    const { groupFilter, deviceFilter } = req.body;
    const reportDevices = VehicleModel.find().setAuthorizationUser(req.user);

    console.log(reportDevices, "userrrrr555555");
    if (groupFilter.length) {
      const dd = await DeviceGroupModel.find({
        id: { $in: ["5b740879365e010646bc70e9"] },
      });
      console.log(dd, "88888888888889");
      const groupDevices = await DeviceGroupModel.aggregate().match({
        _id: {
          $in: ["5b740879365e010646bc70e9"],
        },
      });
      // .unwind('devices')
      // .group({ _id: null, devices: { $addToSet: '$devices' } });
      console.log(groupDevices, "line 66666");

      if (groupDevices && groupDevices.length)
        reportDevices.find({
          _id: { $in: groupDevices[0].devices },
        });
    }

    if (deviceFilter.length) {
      reportDevices.find({
        deviceIMEI: { $in: deviceFilter },
      });
    }
    console.log(reportDevices, "8525");
    return { reportDevices };
  },

  // getReportDevices: async (req) => {
  //   const { groupFilter, deviceFilter } = req.body;
  //   console.log(req.user, "befor");
  //   const reportDevices = await VehicleModel.find().setAuthorizationUser(
  //     req.user
  //   );
  //   console.log("----------------------------");
  //   // console.log(req.user,"after")
  //   console.log(reportDevices, "reportDevices");
  //   console.log(groupFilter.length, "groupFilter");
  //   console.log(groupFilter, "groupFilter2");

  //   console.log("----------------------------");

  //   let groupfounded = groupFilter.map(async (item) => {
  //     let arrayGr = [];
  //     let foundedGroupp = await DeviceGroupModel.findById(item);
  //     console.log(foundedGroupp, "this is iiiii");

  //     foundedGroupp.devices.map((item) => {
  //       console.log(item, "this is devices of group");
  //       arrayGr.push(item);
  //     });
  //     console.log(arrayGr, "arrayGrw");
  //     return arrayGr;
  //   });
  //   console.log(groupfounded.arrayGr, "groupfoundedgroupfounded");
  //   console.log("groupfoundedgroupfounded");

  //   // return { reportDevices };
  // },
};

var helpers = {};

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
  setPolygon,
  deletePolygon,
  getBachInfoViaIMEI,
  reportDeviceLocations,
  getLastLocationsOfDeviceInP,
  reportDeviceAlarms,
  exportDeviceLocationsReportToPdf,
  reportDeviceStatus,
  exportDeviceStatusReportToPdf,
  reportDeviceChanges,
  exportDeviceChangesReportToPdf,
  reportDriverVehicles,
  exportDriverVehiclesReportToPdf,
  exportDeviceAlarmsReportToPdf,
};

// const reportDeviceAlarms = async (req, res) => {
//   try {
//     const {
//       dateFilter: { start: startDate, end: endDate },
//       timeFilter: { start: startTime, end: endTime },
//       deviceFilter,
//       groupFilter,
//     } = req.body;

//     console.log(req.body, "body");

//     if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
//       throw new Error(
//         "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
//       );
//     }
//     if (startTime && endTime && startTime > endTime) {
//       throw new Error(
//         "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد."
//       );
//     }
//     3;

//     console.log(req.user, "befor");
//     const reportDevices = await VehicleModel.find()
//       .setAuthorizationUser()
//     return res.json({reportDevices})
//         // console.log(reportDevices,"reportDevices22")
//         var slarr = []
//         reportDevices.map((item)=>{
//           // console.log(item._id,"=")
//           slarr.push(item._id )
//         })
//         // console.log(slarr,"slarr")

//       //   var arrrrr = []

//       //  let oooo= reportDevices.map((item)=>{

//       //     console.log(item._id,"this is id item ")
//       //     arrrrr.push(...item)
//       //     console.log(arrrrr)
//       //     return arrrrr

//       //   })
//       //   return res.json({oooo})

//   //   let rep = reportDevices.map(async (item) => {
//   //     console.log(item._id)
//   //     console.log(item._id,"comes until here")
//   //     let arr = [];
//   //     const reportAlarms = await VehicleAlarmModel.findOne({
//   //       vehicleId: item._id,
//   //     });
//   //     arr.push(reportAlarms);

//   // })
//   console.log(endDate,"endDate")
//   console.log(startDate,"startDate")
//   console.log(new Date(endDate) ,"new end")
//   console.log(new Date(startDate),"new start")

// //   const reportAlarms =await VehicleAlarmModel.aggregate()
// //   .match({

// //     // date: { $lte: new Date(endDate) }
// //        $and: [

// //    { vehicleId: { $in: ["653cb036313585c4bb731f82"] } },
// //         // { date: { $gte: new Date(startDate) } }
// //   ]

// //       // $and: [
// //         // { vehicleId: { $in: slarr } },

// //       //  { $and: [
// //       //   { date: { $gte: new Date(startDate) } },
// //       //   { date: { $lte: new Date(endDate) } }]
// //       //  }

// //       // ]

// // })
// // .limit(90)
// const reportAlarms = await VehicleAlarmModel.findOne({
//         vehicleId: { $in: slarr } ,
//       })

//   // .addFields({
//   //     dateCreated: {
//   //         $dateFromString: {
//   //             dateString: { $substr : ['$date', 0, 34] },
//   //         },
//   //     },
//   //     dateCreatedHour: {
//   //         $hour: {
//   //             date: {
//   //                 $dateFromString: {
//   //                     dateString: {
//   //                         $substr : ['$date', 0, 34],
//   //                     },
//   //                 },
//   //             },
//   //             timezone: 'Asia/Tehran',
//   //         },
//   //     },
//   // })

//   // console.log("comessss")
//   // if (startDate) {
//     //  match({
//     //     dateCreated: { $gte: new Date(startDate) },
//     // });
// // }
// // if (endDate) {
// //     reportAlarms.match({
// //         dateCreated: { $lte: new Date(endDate) },
// //     });
// // }
// // if (startTime) {
// //     reportAlarms.match({
// //         dateCreatedHour: { $gte: startTime },
// //     });
// // }
// // if (endTime) {
// //      reportAlarms.match({
// //         dateCreatedHour: { $lt: endTime },
// //     });
// // }
// // const vehiclesAlarmData = await reportAlarms
// //                     .group({
// //                         _id: '$vehicleId',
// //                         alarms: {
// //                             $push: {
// //                                 date: '$dateCreated',
// //                                 type: '$type',
// //                                 desc: '$desc',
// //                                 hour: '$dateCreatedHour',
// //                             },
// //                         },
// //                     })
// //                     .lookup({
// //                         from: 'vehicles',
// //                         localField: '_id',
// //                         foreignField: '_id',
// //                         as: 'device',
// //                     })
// //                     .unwind('device')
// //                     .lookup({
// //                         from: 'devicegroups',
// //                         localField: 'device._id',
// //                         foreignField: 'devices',
// //                         as: 'device.groups',
// //                     })
// //                     .replaceRoot({
// //                         $mergeObjects: [
// //                             '$$ROOT',
// //                             {
// //                                 groups: '$device.groups.name',
// //                                 device: {
// //                                     IMEI: '$device.deviceIMEI',
// //                                     type: '$device.type',
// //                                     simNumber: '$device.simNumber',
// //                                 },
// //                                 driver: {
// //                                     name: '$device.driverName',
// //                                     phoneNumber: '$device.driverPhoneNumber',
// //                                 },
// //                             },
// //                         ],
// //                     });

//       // console.log(reportAlarms);

//       // return arr;
//     // });
//     console.log(reportAlarms,"++++++++++++++++++++++++++++++++++++")
//             // arr.push(reportAlarms);
//            return res.json({ reportAlarms });
//     // console.log(reportDevices, "after");
//     let arr = [];

//     // res.json({ reportAlarms });

//     // console.log("----------------------------");
//     // // console.log(req.user,"after")
//     // console.log(reportDevices,"reportDevices")

//     //   console.log("comes in reportDeviceAlarms");
//     //   const {
//     //     dateFilter: { start: startDate, end: endDate },
//     //     timeFilter: { start: startTime, end: endTime },
//     //   } = req.body;

//     //   if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
//     //     throw new Error(
//     //       "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد."
//     //     );
//     //   }
//     //   if (startTime && endTime && startTime > endTime) {
//     //     throw new Error(
//     //       "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد."
//     //     );
//     //   }
//     //   console.log("arashramyyyyy55");

//     //   const { reportDevices } = await reports.getReportDevices(req);
//     //   // console.log("arashramyyyyy", reportDevices);

//     //   // reportDevices.select({ _id: 1 });
//     //   const deviceIds = (await reportDevices).map(
//     //     ({ _id: vehicleId }) => vehicleId,
//     //     console.log(vehicleId, "ooo")
//     //   );
//   } catch (err) {
//     // console.log(err )
//     return res.json({
//       message: "something went wrong in  reportDeviceAlarms",
//       msgSys: err.message,
//       code: 400,
//     });
//   }
// };
