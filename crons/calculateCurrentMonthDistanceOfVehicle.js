console.log("rrrr");
const  VehicleModel  = require("../model/GpsLocation/VehicleModel");
const  GPSDataModel  = require("../model/GpsLocation/GPSDataModel");

// const { logger } = require("../utility/customlog");
const cron = require("node-cron");
const geolib = require("geolib");
const moment = require("moment-jalaali");
const {
  fixLastLocation,
} = require("../node_scripts/populateVehicleGPSDataRelatedValues");
console.log("populateVehicleGPSDataRelatedValues --------")
class DeviceMonthlyDistanceCron {
  static async setDeviceDistance() {

    try {

      const now = new Date();
      const firstDayOfMonthGregorianDate = moment(now).startOf("jMonth");
      const lastDayOfMonthGregorianDate = moment(now).endOf("jMonth");
      const zeroLocations = await GPSDataModel.deleteMany({ lat: 0, lng: 0 });
    //   logger.info(
    //     `${zeroLocations.deletedCount} instances of ${GPSDataModel.modelName} created before ${lastDayOfMonthGregorianDate} has been deleted on ${now}`
    //   );
    console.log("until here 050")

    console.log(firstDayOfMonthGregorianDate,"firstDayOfMonthGregorianDate")
    console.log(lastDayOfMonthGregorianDate,"lastDayOfMonthGregorianDate")

      fixLastLocation();
      console.log("8888")


      const vehicles = await VehicleModel.find({})
      .select("_id deviceIMEI");
    
      if(!vehicles)
      {
        console.log("there is no vehicle  (DeviceMonthlyDistanceCron)")
      }
      vehicles.map(async (vehicle) => {
        console.log(vehicle,"vehicle")
              const locations = await GPSDataModel.aggregate()
                .match({ 
                  $and: [
                    { IMEI: vehicle.deviceIMEI },
                    { date: { $gte: new Date(firstDayOfMonthGregorianDate) } },
                    { date: { $lte: new Date(lastDayOfMonthGregorianDate) } },
                  ],
                })
                .project({
                  lat: 1,
                  lng: 1,
                  date: 1,
                });



                locations.sort(function (a, b) {
                  return new Date(b.date) - new Date(a.date);
              });
              const vehicleLocations = locations.map(
                ({
                    lat,
                    lng
                }) => ({
                    latitude: lat,
                    longitude: lng
                })
                
            );
                // Returns the length of the path in meters as number   ***************************
        const dd= vehicle.currentMonthDistance = (geolib.getPathLength(vehicleLocations) / 1000.0).toFixed(2);
            vehicle.save();


            console.log("currentMonthDistance items successfully inserted .")

              })
    } catch (ex) {
      console.log("something went wrong",ex)

    }
  }

  static run() {
    const EVERY_DAY_AT_1_AM = "0 2 * * *"; // 2 AM every day
    cron.schedule(EVERY_DAY_AT_1_AM, () => {
        // (function(){
      DeviceMonthlyDistanceCron.setDeviceDistance().catch((e) =>
        // logger.error(e)
        console.log("something went wrong",e)
      );
    // })();   
    });
  }
}

module.exports = { DeviceMonthlyDistanceCron };
