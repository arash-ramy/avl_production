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
const vehiclesAlarmData = require("../model/GpsLocation/VehicleAlarmModel");
const UserModel = require("../model/User/user");
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
      message: "something went wrong in Adding vehicle addDevice",
      error: error.message,
    });
  }
}
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
        code: 200,
      });
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
    console.log(error);
    return res.json({
      message: error.message,
      code: 500,
    });
  }
}
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
    console.log(error);

    return res.json({
      message: "something went wrong in Add device ",
      code: 400,
      messageSys: error.message,
    });
  }
}
async function getDeviceModels(req, res) {
  try {
    const foundedItem1 = await VehicleTypeModel.find().select({
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
    console.log(error);

    return res.json({
      messageSys: error.message,
      message: "something went wrong in getDeviceModels . ",
      code: 500,
    });
  }
}

async function getDeviceModelsBerif(req, res) {
  try {
    const foundedItem1 = await VehicleTypeModel.find().select({
      name: 1,
      _id: 1,
    });
    const foundedItem = await VehicleTypeModel.aggregate([
      {
        $project: {
          label: "$name",
          value: "$_id",
        },
      },
      {
        $unset: "_id",
      },
    ]);
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
    console.log(error);

    return res.json({
      messageSys: error.message,
      message: "something went wrong in getDeviceModels . ",
      code: 500,
    });
  }
}

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
  } catch (error) {
    return res.json({
      message: "somthing went wrong in deleteDeviceStatus .",
      messageSys: error.message,
      code: 400,
    });
  }
}
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
        return res.json({ msg: "OK", code: 200 });
      });
    }
  } catch (error) {
    return res.json({ message: error.message, code: 404 });
  }
}
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
  } catch (error) {
    return res.json({ msg: error.message, code: 500 });
  }
}

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

async function setSOS(req, res) {
  try {
    const { IMEI, sos } = req.params;
    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });
    if (!vehicle) {
      return res.json({ msg: "vehicle not found", code: 404 });
    }
     if(s)

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
    return res.json({
      messageSys: error.message,
      code: 500,
      message: "somthing went wrong in Set Sos",
    });
  }
}
async function getDevices(req, res) {
  try {
 
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

        populate: {
          path: "smsReceivers",
        },
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

        populate: {
          path: "smsReceivers",
        },
      })
      .sort({ _id: -1 })
      .lean()
      .clone();

    return res.json({
      allVehicles,
      code: 200,
    });
  } catch (error) {
    console.log(error);

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

    const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI });

    if (!vehicle) {
      return res.json({
        message: "vehicle not founded !",
        code: 404,
      });
    }
    let receivers = await PhoneBookModel.find({
      phoneNumber: { $in: [...new Set(phoneNumbers)] },
    });
    var setting = {
      sendSMS: sendSMS.toString() == "true" ? true : false,
      rcvSMSNumbers: smsNumbers,
      sendEmail: sendEmail.toString() == "true" ? true : false,
      rcvEmails: emails,
      smsReceivers: receivers,
    };

    if (settingsType.toString().toLowerCase() === "speed") {
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
  } catch (error) {
    return res.json({
      messageSys: error.message,
      code: 500,
    });
  }
}

const setPolygon = async (req, res) => {
  try {
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

    return res.json({ foundedandupdated, code: 200 });
  } catch (err) {
    res.json({ message: "something went wrong in setPolygon", err, code: 400 });
  }
};

const deletePolygon = async (req, res) => {
  try {
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
      return res.json({
        code: 200,
        message: "Permission Zone Delete Successfully",
      });
    }
  } catch (err) {
    res.json({
      message: "something went wrong in deletePolygon",
      err,
      code: 400,
    });
  }
};

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

    for (var i = 0; i < req.body.IMEIs.length; i++) {
      arrayOfIMEIS.push({ deviceIMEI: req.body.IMEIs[i] });
    }

    var condition = { $or: arrayOfIMEIS };

    const vehiclefounded = await VehicleModel.find(condition);

    res.json({
      code: 200,
      vehiclefounded,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      msg: error,
      code: 400,
      messageSys: "something went wrong in getBachInfoViaIMEI ",
    });
  }
};

const reportDeviceStatus = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.json({
        message: "check the dates ",
        messageSys: "reportDriverVehicles",
        code: 400,
      });
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
  console.log("sdsdsd");
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.json({
        message: "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد.",
        messageSys: "reportDriverVehicles",
        code: 400,
      });
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
    return res.json({ msg: error.message });
  }
};

const reportDriverVehicles = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
    } = req.body;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.json({
        message: "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد",
        messageSys: "reportDriverVehicles",
        code: 400,
      });
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
      return res.json({
        message: "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد",
        messageSys: "reportDriverVehicles",
        code: 400,
      });
    }
    if (startTime && endTime && startTime > endTime) {
      return res.json({
        message: "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد.",
        messageSys: "reportDriverVehicles",
        code: 400,
      });
    }
    if (minSpeed && maxSpeed && +minSpeed > +maxSpeed) {
      return res.json({
        message: "کمینه سرعت گزارش نمی‌تواند از بیشینه سرعت گزارش بیشتر باشد",
        messageSys: "reportDriverVehicles",
        code: 400,
      });
    }
    const { reportDevices } = await reports.getReportDevices(req);

    const deviceIds = (await reportDevices).map((vehicle) => vehicle._id);

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
    console.log("arashramy comes heer");
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

    console.log(
      vehiclesLocationData,
      "vehiclesLocationDatavehiclesLocationDatavehiclesLocationData"
    );
    const persianDate = (dateString) =>
      dateString
        ? moment(new Date(dateString)).format("YYYY/M/D HH:mm:ss")
        : null;
    var ss = req.user;
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
    // console.log(filePath, "5871452");
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

const reportDeviceAlarms = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
    } = req.body;
    // const { } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.json({
        message: "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد.",
        messageSys: "parsePacket",
        code: 400,
      });
    }
    if (startTime && endTime && startTime > endTime) {
      return res.json({
        message: "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد.",
        messageSys: "parsePacket",
        code: 400,
      });
    }

    const reportDevices = await VehicleModel.find()
      .setAuthorizationUser(req.user)
      .select("_id");

    var groupDevices = await DeviceGroupModel.aggregate([
      {
        $match: {
          devices: {
            $in: reportDevices.map((item) => {
              return new mongoose.Types.ObjectId(item);
            }),
          },
        },
      },
    ]);

    res.json({ groupDevices });
  } catch (error) {
    console.log(error);

    return res.json({ msg: error.message, code: 404 });
  }
};

const exportDeviceAlarmsReportToPdf = async (req, res) => {
  try {
    var {
      type,
      dateFilter: { start: startDate, end: endDate },
      speedFilter: { min: minSpeed, max: maxSpeed },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
      reportData: vehiclesAlarmData,
    } = req.body;

    if (startTime === null && endTime === null) {
      startTime = 0;
      endTime = 24;
    }

    if (minSpeed === null && maxSpeed === null) {
      minSpeed = 0;
      maxSpeed = 150;
    }

    const round = (floatingPoint, fractionDigits = 2) =>
      parseFloat(floatingPoint).toFixed(fractionDigits);
    const persianDate = (dateString) =>
      dateString
        ? moment(new Date(dateString)).format("YYYY/M/D HH:mm:ss")
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
    var devices = req.body.devices;
    var bTime = req.body.bTime;
    var eTime = req.body.eTime;
    if (
      req.body.devices.length === 0 ||
      req.body.devices[0] == "" ||
      req.body.devices[0] === null
    ) {
      return res.json({
        message: "please check your inputs ",
        code: 400,
      });
    }

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
    ]);

    return res.json({
      gpsfounded,
      code: 200,
    });

    const page = parseInt(req.body.page) - 1 || 0;
    const limit = parseInt(req.body.limit) || 5;
    var arrrr = [];

    return res.json({ arrrr });
  } catch (err) {
    console.log(err);
    return res.json({
      msg: err.message,
      code: 400,
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
        "YYYY-M-D-HH-mm-ss"
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

    const reportDevices = await VehicleModel.find().setAuthorizationUser(
      req.user
    );

    if (groupFilter.length) {
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

    if (deviceFilter.length) {
      await reportDevices.find({
        deviceIMEI: { $in: deviceFilter },
      });
    }
    return { reportDevices };
  },
  getReportDevices2: async (req, res) => {
    const { groupFilter, deviceFilter } = req.body;
    const reportDevices = await VehicleModel.find()
      .setAuthorizationUser(req.user)
      .select("_id");

    return { reportDevices };
  },
  getReportDevices3: async (req) => {
    const { groupFilter, deviceFilter } = req.body;
    const reportDevices = VehicleModel.find().setAuthorizationUser(req.user);

    if (groupFilter.length) {
      const dd = await DeviceGroupModel.find({
        id: { $in: ["5b740879365e010646bc70e9"] },
      });
      const groupDevices = await DeviceGroupModel.aggregate().match({
        _id: {
          $in: ["5b740879365e010646bc70e9"],
        },
      });

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
    return { reportDevices };
  },
};
const setUserDeviceModel = async (req, res) => {
  try {
    const { username, deviceModel } = req.body;

    var user = await UserModel.findOne({ username });
    console.log("comes here 0")
  var founded_vehcile_model  = await VehicleTypeModel.find({
      name: { $in: deviceModel },
  });
  console.log(founded_vehcile_model)
    if (!user) {
      return res.json({ message: "user is not exist ", code: 404 });
    }
    console.log("comes here 1" )
    var iii = await UserModel.updateOne(
      { username: username },
      { $set: { deviceModel: founded_vehcile_model } }
   );
//    var iii = await UserModel.updateOne(
//     { username: username },
//     { $unset: { deviceModel: deviceModel } }
//  );
    // var iii = await UserModel.aggregate([
    //   {$match:{
    //     username:username}
    //   },
    //   {
    //     $set  : {
    //       deviceModel :deviceModel
    //       }
      
    //   },
    // ]);
    return res.json({ msg: "user updated!", code:200 })
  } catch (err) {
    return res.json({err: err.message, code: 400 });
  }
};

const getDevicesImei = async (req, res) => {
  const imei = req.params.imei
  console.log(imei)
  if(!imei){
    return res.json({message:"imei is not valid "})
  }
  var imeifound =await  VehicleModel.findOne({deviceIMEI:imei})

  return res.json({imeifound})
}
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
  setUserDeviceModel,
  getDeviceModelsBerif,
  getDevicesImei
};
