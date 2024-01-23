var schedule = require('node-cron').CronJob;

const GPSDataModel = require("../model/GpsLocation/GPSDataModel")
const VehicleModel = require("../model/GpsLocation/VehicleModel")
const AlarmModel = require("../model/GpsLocation/VehicleAlarmModel")

var { SMSGW } = require('../utils/smsgw');
var geolib = require('geolib');


var CronJob = function () {
var m_checkPmDistanceIns;


var checkPMDistance = async function (IMEI, lastIndex, thr, phoneNumber, deviceId, sim) {
    try {
        if (lastIndex) {
           var data=  await  GPSDataModel.find(
                {
                    $and: [
                        {IMEI: IMEI},
                        {'_id': {$gt: lastIndex}}
                    ]
                })
                
                
                if (!data) {
                  
                }
                else {
                    var locations = new Array;
                    for (var i = 0; i < data.length; i++) {
                        locations.push({latitude: data[i].lat, longitude: data[i].lng});
                    }
                    var dist = (geolib.getPathLength(locations) / 1000.0).toFixed(2);
                    if (parseFloat(dist) > parseFloat(thr)) {
                        var newAlarm = new AlarmModel({
                            type: "Over Distance",
                            date: (new Date()),
                            vehicleId: deviceId,
                            desc: "most be " + thr + " but is " + dist
                        });
                        await newAlarm.save().then(()=>{
                            const vehicle=       VehicleModel.findOne({'deviceIMEI': IMEI}).exec(function(error, vehicle){
                                if(vehicle){
                                    vehicle.alarms.push(newAlarm._id);
                                     vehicle.save();
                                }
                            });
                        })
                        var header = "Kaveh AVL  \r\n";
                        var msg = header + "Your max distance for PM should be " + thr + " but your distance from last check is " + dist + " \r\n";
                        msg += "Sim Number: " + sim + " , IMEI: " + IMEI + "\r\n";
                        var sign = msg + " \r\n infinite secure life with Kaveh";
                        const numbers = [phoneNumber];
                        SMSGW().sendSmsToNumber(sign, numbers);
                    }
                }
            
        }
        else{
                var  data=await   GPSDataModel.find({IMEI: IMEI})
             
                 if (!data) {
            
                }
                else {
                    console.log("2else")

                    var locations = new Array;
                    for (var i = 0; i < data.length; i++) {
                        locations.push({latitude: data[i].lat, longitude: data[i].lng});
                        console.log(locations,"locations")

                    }
                    var dist = (geolib.getPathLength(locations) / 1000.0).toFixed(2);
                    if (parseFloat(dist) > parseFloat(thr)) {

                        var newAlarm = new AlarmModel({
                            type: "Over Distance",
                            date: (new Date()).AsDateJs(),
                            vehicleId: deviceId,
                            desc: "most be " + thr + " but is " + dist
                        });
                        console.log("5155")

                        await newAlarm.save()
                        .then(async()=>{
                            console.log("comessss")
                                let vehicle =   await    VehicleModel.findOne({'deviceIMEI': IMEI})
                            if(vehicle){
                                console.log("bod2")

                                vehicle.alarms.push(newAlarm._id);
                                vehicle.save();
                            }
                            console.log("bod")
                        })
                        
                       

                        var header = "Kaveh AVL  \r\n";
                        var msg = header + "Your max distance for PM should be " + thr + " but your distance from last check is " + dist + " \r\n";
                        msg += "Sim Number: " + sim + " , IMEI: " + IMEI + "\r\n";
                        var sign = msg + " \r\n infinite secure life with Kaveh";
                        const numbers = [phoneNumber];
                        SMSGW().sendSmsToNumber(sign, numbers);
                    }
                }
            
        }
    }
    catch(err){
        console.log(err)
    }
}

var checkAllPMDistance = function () {
    try {
        const hhh= async()=> {

               var vehicles=await VehicleModel.find();


               for(var i = 632 ; i < vehicles.length; i++){
    
    
   checkPMDistance(vehicles[i].deviceIMEI, vehicles[i].lastPMIndex, vehicles[i].maxPMDistance, vehicles[i].driverPhoneNumber, vehicles[i]._id, vehicles[i].simNumber);

               }

       }
       hhh()

}
    catch (ex) {
console.log(ex)    }
}

var startScheduleEngine = function () {
    checkAllPMDistance();
}
const EVERY_WEEK_ON_FRIDAY_3_AM = '00 00 12 * * 1-7'; 

cron.schedule(EVERY_WEEK_ON_FRIDAY_3_AM, () => {
    try{
    startScheduleEngine()
}catch(err){
    console.log(err)
}

});


return {
    startScheduleEngine: startScheduleEngine
}
}

module.exports.CronJob = CronJob;
