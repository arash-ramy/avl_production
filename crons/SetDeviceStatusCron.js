const  VehicleModel  = require('../model/GpsLocation/VehicleModel');
const VehicleStatusModel = require('../model/GpsLocation/VehicleStatusModel');
// const { logger } = require('../utility/customlog');
const cron = require('node-cron');
class DeviceStatusCron {
    static async checkAllDevicesStatus() {
        try {
            console.log("checkAllDevicesStatus runned")
            const vehicle = await VehicleModel.find({})
                .populate('lastLocation')
                .populate('vehicleStatus');
                let status = '';
            if(vehicle){
                let now = new Date()
                // console.log(now,"this is now")
                console.log(vehicle.length)
                for (var i = 0; i < vehicle.length; i++) {
                    if (vehicle[i].vehicleStatus.status !== 'تصادفی' && vehicle[i].vehicleStatus.status !== 'در تعمیرگاه') {
                        if (!vehicle[i].lastLocation) {
                            status = 'بدون داده';
                        } else {
                            // console.log("here vehicle ****")
                            let lastLocationDate = vehicle[i].lastLocation.date;
                            let diffDays = Math.floor((now - lastLocationDate) / (1000 * 60 * 60 * 24));
                            if (diffDays < 1) {
                                status = 'به روز';
                            } else if (diffDays < 7 && diffDays >= 1) {
                                status = 'کمتر از یک هفته';
                            } else if (diffDays < 30 && diffDays >= 7) {
                                status = 'کمتر از یک ماه';
                            } else if (diffDays >= 30) {
                            status = 'بیش از یک ماه';
                            }
                            // console.log(status)
                            // console.log("------")
                            // console.log(now)
                            // console.log(lastLocationDate)
                            // console.log(diffDays)
                            // console.log(status)
                            // console.log("------")
                            // console.log(lastLocationDate,"lastLocationDate")
                            // console.log(vehicle[i]  ,"vehicle[i].lastLocation")
                        }
                        // console.log("this here runned222")
                        if (vehicle[i].vehicleStatus === undefined || vehicle[i].vehicleStatus.status !== status) {
                            // console.log("this here runned333")
                            let vehicleStatus = new VehicleStatusModel({
                                vehicleIMEI: vehicle[i].deviceIMEI,
                                status: status,
                                date: now,
                            });
                            // console.log("this here runned44")
                            await vehicleStatus.save();
                            vehicle[i].vehicleStatus = vehicleStatus._id;
                            vehicle[i].save();
                        }
                    }
                }
            }
        } catch (ex) {
            // logger.error(ex);
            console.log("error",ex)
        }
    }
    static run() {
        const EVERY_DAY_AT_8_AM = '0 8 * * *'; // 8 AM every day
        cron.schedule(EVERY_DAY_AT_8_AM, () => {
            // (function(){
            DeviceStatusCron.checkAllDevicesStatus()
                .catch(e =>
                    // logger.error(e)
                    console.log("something went wrong in device status cron :",e)
                    )
            // })();
        });
    }
}
module.exports = { DeviceStatusCron };
(function(){
    //Bunch of code...
})();