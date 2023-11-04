const Validator = require("validatorjs");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const VehicleStatusModel = require("../model/GpsLocation/VehicleStatusModel");
const VehicleTypeModel = require("../model/GpsLocation/VehicleTypeModel");

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
      })
    } 
     if (vehicle.deviceIMEI !== deviceIMEI) {

      if (VehicleModel.exists({ deviceIMEI: deviceIMEI })) {
        return res.json({
          msg: "وسیله نقلیه دیگری با این IMEI موجود است",
          code :"400"
        })
      }
    } 
    
    
      const oldVehicle = { ...vehicle._doc };
      simNumber && (vehicle.simNumber = simNumber);
      deviceIMEI && (vehicle.deviceIMEI = deviceIMEI);
      plate && (vehicle.plate = plate);
      name && (vehicle.vehicleName = name);
      model &&
        (vehicle.model = await VehicleTypeModel.findOne({ name: model }));
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



async function addDeviceModels(req, res) {
    try {
        const name = req.body.vehicleType
        const typeExist = await VehicleTypeModel.exists({name})
        if (typeExist) {
            return res.json({
                msg: 'این مدل قبلا در سامانه ثبت گردیده است',
                code :400
            })
        }
        const vehicleType = new VehicleTypeModel({name})
        await vehicleType.save()
        return res.json({vehicleType,
        code:200})
    } catch (error ) {
        // logger.error(ex);
        return res({
            message:"something went wrong in Add device ",
            code :400,
            messageSys: error.message,
        })
    }
}














const NodeGeocoder = require('node-geocoder');

async function tests (req,res){

  const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
  const dataa =geocoder.reverse({lat:35.6741, lon:51.44159}, function(err, ress) {
    console.log(ress);
    return res.json({ress})
  });


}
module.exports = {
  addDevice,
  editDevice,
  addDeviceModels,
  tests
};
