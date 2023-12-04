const mongoose = require('mongoose');
const GPSDataModel = require('../model/GpsLocation/GPSDataModel');
require('../DB/DbConnection');
const 
    VehicleModel
    
 = require('../model/GpsLocation/VehicleModel');


console.log("this is pop")
const fixLastLocation  =async ()=> {




     const vehicles = await  VehicleModel.find()
        .select('deviceIMEI')
        for (let index = 0; index < vehicles.length; index++) {
                    const vehicle = vehicles[index];
                    // console.log(vehicle)
                   const dd= vehicle.gpsDataCount = await GPSDataModel.countDocuments({
                        IMEI: vehicle.deviceIMEI,
                    })
                    const lastLocation = await GPSDataModel.findOne({
                        IMEI: vehicle.deviceIMEI,
                    })
                        .sort({ date: -1 })
                        .limit(1)
                        vehicle.lastLocation = lastLocation ? lastLocation._id : null;
                        await vehicle.save();
                        // console.log(index, vehicle);
                }
                    
                    
       

            }

if (require.main === module) {
    fixLastLocation().then(mongoose.disconnect);
}

module.exports = { fixLastLocation };
