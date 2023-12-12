const chalk = require("chalk");
const mongoose = require('mongoose');
var ObjectId = require("mongoose").Types.ObjectId;
const VehicleAlarmModel = require("../model/GpsLocation/VehicleAlarmModel");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const GPSDataModel = require("../model/GpsLocation/GPSDataModel");

const { AddressCache } = require("../utils/addresscache");
const { SMSGW } = require("../utils/smsgw");
const { util } = require("../utils/util");
// const { logger } = require("../utility/customlog");
const { SpeedSMSText } = require("../template/sms/alarms");
const { ZoneSMSText } = require("../template/sms/alarms");
// const { BackToZoneSMSText } = require("../template/sms/alarms");
const moment = require("moment");
const { ShortenerLink } = require("../utils/shortenerLink");

class GPSController {
  constructor() {
    this.timerId = null;
    this.messageQueue = [];
  }

  static async parsePacket(packet, socket) {
    throw new Error("Not Implemented");
  }

  static async savePacketData(data, force = false, lastData) {
    try{
    console.log(data,"*** savePacketData RUNNED");
    // console.log("two");
    console.log(data, "data");
    console.log(lastData, "lastDataaaa");

    const gpsData = new GPSDataModel(data);

    console.log(gpsData,"gpsData ramy")
    const valid = await this.checkGPSDataInterval(gpsData, lastData);

    console.log(valid,"valid***");
    

    if (valid || force) {
      // logger.debug(
      //   { event: "NEW_PACKET", type: gpsData.deviceName },
      //   { IMEI: gpsData.IMEI, time: gpsData.date }
      // );
      gpsData.url = `http://maps.google.com/maps?q=${gpsData.lat},${gpsData.lng}`;


      this.checkSpeed(gpsData);

      const gpsdataaa = await gpsData.save();

      // console.log("until here");

      console.log(gpsData,"gpsData")
      gpsData.address = await new AddressCache().findAddress(
        gpsData.lat,
        gpsData.lng
      );

      // console.log(gpsdataaa, "this is gpsdataaa");
      await gpsdataaa.save();

      // console.log(gpsData.IMEI, "gpsData.IMEI");

      // query to find out deviceId
      const foundedVehicle =   await VehicleModel.findOne({ deviceIMEI: gpsData.IMEI });

      // console.log(foundedVehicle,"foundedVehicle")
      // console.log(gpsData,"gpsData")

      if (!foundedVehicle) {
        // console.log("vehicle is not found")
      }
      gpsData.vehicleId = foundedVehicle._id;
            await gpsData.save();
            // console.log(gpsData,"gpsData2")

     
      // console.log(gpsData,"gpsData");
      this.checkZone(gpsData);
    }
  }catch(e){
    console.log(e)
  }
  }


  static async checkSpeed({ speed, IMEI, url }) {
    try {

      // console.log("happend")
      const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI })
        .select("_id lastLocation maxSpeed driverName driverPhoneNumber alarms simNumber plate")
        .populate("lastLocation").populate("speedAlarm")
      if (vehicle) {
        // console.log("vehicle2",vehicle)
        // console.log("speed",+speed)
        // console.log("IMEI",IMEI)
        // console.log("vehicle.maxSpeed",vehicle.maxSpeed)

        const lastSpeed = vehicle.lastLocation.speed || 0;
        // console.log("lastSpeed",lastSpeed)

        if(speed > vehicle.maxSpeed){
          // console.log("speed is greather then max")
        }
        if(lastSpeed < vehicle.maxSpeed){
          // console.log("speed is greather then max")
        }

        if(vehicle){
          // console.log("object1")
          if(speed > vehicle.maxSpeed){
            // console.log("object2")
            // console.log("object2 d", +lastSpeed,+speed)

            if(lastSpeed < speed){
              console.log("object3")
            }
          }
        }
        // console.log(speed,vehicle.maxSpeed,"ramy")

        if (vehicle && +speed > +vehicle.maxSpeed 
          // && lastSpeed < +vehicle.maxSpeed
          )  {
          try {
            // console.log("yes of course")
            const lastAlarm = await VehicleAlarmModel.findOne({
              _id: vehicle.alarms[vehicle.alarms.length - 1],
            });
            const alarmBreak = moment(new Date(lastAlarm.date))
              .add(30, "m")
              .toDate();

              // console.log(moment(new Date(),"new Date()"))
              // console.log(alarmBreak,"alarmBreak")


            
            // if (alarmBreak > new Date()) return  console.log("hello m");
          } catch (e) {}
          const newAlarm = new VehicleAlarmModel({
            type: "Over Speed",
            date: new Date(),
            vehicleId: vehicle._id,
            desc: `must be ${vehicle.maxSpeed} but is ${speed}`,
          });
          await newAlarm.save();
          vehicle.alarms.push(newAlarm._id);
          vehicle.save();


          // this.sendSpeedSMS(
          //   vehicle,
          //   speed,
          //   IMEI,
          //   url,
          //   vehicle.driverName,
          //   "09381378120"
          // );
          // console.log("55555555")

          // console.log(vehicle.lastLocation.address,"vehicle.address")
            let address = vehicle.lastLocation.address;

          this.sendSpeedEmail(vehicle, speed, IMEI, address);
        }
      }
    } catch (error) {
      // logger.error(ex);
      console.log(error);
    }
  }
// OK
  static async sendSpeedSMS(vehicle, speed, IMEI, url, driverName) {
    // console.log("SMSGW")

    const smsgw = SMSGW();
    const { rcvSMSNumbers } = vehicle.speedAlarm || {};
    const receivers = rcvSMSNumbers ? rcvSMSNumbers.split(";") : [];
    const driverFamilyName =
      driverName.split(" ")[driverName.split(" ").length - 1];
    receivers.push(vehicle.driverPhoneNumber);
    // console.log("SMSGW2")

    let shortLink = await ShortenerLink()
      .zayaShortenerLink(url)
      .catch(() => {
        return url;
      });
      // console.log("SMSGW3")

    const message = SpeedSMSText(
      speed,
      vehicle.maxSpeed,
      IMEI,
      shortLink,
      driverFamilyName
    );

    smsgw
      .sendSmsToNumber(message, [...new Set(receivers)])
      .catch((e) => logger.error(e));
      // console.log("SMSGW4")

  }

  static sendSpeedEmail(vehicle, speed, IMEI, address) {
    // console.log("sendSpeedEmail")
    // console.log(vehicle,"vehicle")

    const { rcvEmails } = vehicle.speedAlarm || {};

    // console.log(rcvEmails,"rcvEmails")

    const { simNumber, driverName, plate, driverPhoneNumber } = vehicle;
    // console.log({vehicle, speed, IMEI, address},"vehicle, speed, IMEI, address")
    const context = {
      IMEI,
      speed,
      simNumber,
      driverName,
      plate,
      driverPhone: driverPhoneNumber,
      lastLocation: address,
      email: rcvEmails,
      subject: "Kaveh AVL Speed Alarm",
      lastLocationDate: "--------",
      alarmType: "Over speed",
    };
    // console.log("send_email")

    util.send_email("mail/alarms/speed", context, (e) => console.error(e));
    // console.log("bye")
  }

  // this function do =>
  static async checkGPSDataInterval({ date, IMEI, speed }, lastRecord) {
    try {
      // console.log("*** checkGPSDataInterval RUNNED");

      const vehicle = await VehicleModel.findOne({
        deviceIMEI: IMEI,
      })
        .select("lastLocation maxSpeed")
        .populate("lastLocation");

      // console.log(lastRecord, "lastRecord");
      // console.log(vehicle, "vehicle");
      if (!vehicle) return false;
      lastRecord = lastRecord || vehicle.lastLocation;

      // console.log(vehicle.lastLocation,"mailLastLocatoin")
      if (!lastRecord) return true;
      const tenMinutes = 10 * 60 * 1000;
      return (
        Math.abs(date - lastRecord.date) >= tenMinutes ||
        Math.abs(lastRecord.speed - speed) >= 10 ||
        speed >= (vehicle.maxSpeed || 100)
      );
      
    } catch (e) {
      // logger.error(e);
      console.log(e)
      return false;
    }
  }

  startTaskManager() {
    this.timerId = setInterval(() => {
      console.log("object");
      if (this.messageQueue.length > 0) {
        const { packet, socket } = this.messageQueue.shift();
        this.constructor.parsePacket(packet, socket).catch((e) => {
          if (!(e instanceof RangeError)) {
            logger.error(e);
          }
        });
      } else {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }, 1000);
  }

  insertNewMessage(packet, socket) {
    try {
      const newMessage = { packet, socket };
      this.messageQueue.push(newMessage);
      if (!this.timerId) this.startTaskManager();
    } catch (err) {
     console.log(err)
    }
  }

  static inside(point, polygon) {
    var x = point[0],
      y = point[1];
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i][0],
        yi = polygon[i][1];
      var xj = polygon[j][0],
        yj = polygon[j][1];
      var intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  static async checkZone({ IMEI, lat, lng, address }) {
    console.log("checkZone ")

    // console.log({ IMEI, lat, lng, address },"checkZone 2")
    try {
      const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI }).populate(
        "lastLocation"
      );
      console.log(vehicle.permissibleZone,"vehicle-permissibleZone")
      if (vehicle && vehicle.permissibleZone) {
        // console.log( vehicle.permissibleZone," vehicle.permissibleZone")

        var permissibleZone = vehicle.permissibleZone;
        var point = [lat, lng];
        var driverName = vehicle.driverName;
        var driverPhoneNumber = vehicle.driverPhoneNumber;
        var alarmInterval = permissibleZone.alarmInterval || "3";
        var status = "";
       const alarm  = await   VehicleAlarmModel.findOne({
          $and: [
            {
              vehicleId: vehicle._id,
              type: "Out of Zone",
            },
          ],
        })
          .sort({ _id: "desc" })
          
          console.log(alarm,"dd")


          // .exec(async (err, alarm) => {
          //   if (err) {
          //     console.log("this found vehicle 52548 ")
          //   } else {
          //     let now = new Date().AsDateJs();
          //     let lastAlarmDate = alarm ? new Date(alarm.date) : now;
          //     let diffHour = Math.floor(Math.abs(lastAlarmDate - now) / 36e5); // Hour
          //     console.log("comes into zonnnne")
          //     // out of zone alarm
          //     if (
          //       vehicle &&
          //       !GPSController.inside(point, permissibleZone.coordinates) &&
          //       (diffHour >= alarmInterval ||
          //         vehicle.zoneStatus === "IN" ||
          //         vehicle.zoneStatus === undefined)
          //     ) {
          //       const newAlarm
                
                
          //       = new VehicleAlarmModel({
          //         type: "Out of Zone",
          //         date: new Date().AsDateJs(),
          //         vehicleId: vehicle._id,
          //         desc: `vehicle location [${point}] is out of permissible zone`,
          //       });
          //       await newAlarm.save();
          //       vehicle.alarms.push(newAlarm._id);
          //       vehicle.zoneStatus = "OUT";
          //       vehicle.save();

          //       status = "OUT";

          //       if (vehicle.zoneAlarm.sendSMS) {
          //         this.sendZoneSMS(
          //           vehicle,
          //           permissibleZone,
          //           point,
          //           IMEI,
          //           address,
          //           driverName,
          //           driverPhoneNumber,
          //           status
          //         );
          //       }
          //       if (vehicle.zoneAlarm.sendEmail) {
          //         this.sendZoneEmail(vehicle, permissibleZone, point, IMEI);
          //       }
          //     }

          //     // back to permissible zone alarm
          //     else if (
          //       vehicle &&
          //       GPSController.inside(point, permissibleZone.coordinates) &&
          //       vehicle.zoneStatus === "OUT"
          //     ) {
          //       const newAlarm = new VehicleAlarmModel({
          //         type: "Back to Zone",
          //         date: new Date().AsDateJs(),
          //         vehicleId: vehicle._id,
          //         desc: `vehicle Come Back to permissible zone`,
          //       });
          //       await newAlarm.save();
          //       vehicle.alarms.push(newAlarm._id);
          //       vehicle.zoneStatus = "IN";
          //       vehicle.save();

          //       status = "IN";

          //       if (vehicle.zoneAlarm.sendSMS) {
          //         this.sendZoneSMS(
          //           vehicle,
          //           permissibleZone,
          //           point,
          //           IMEI,
          //           address,
          //           driverName,
          //           driverPhoneNumber,
          //           status
          //         );
          //       }
          //       if (vehicle.zoneAlarm.sendEmail) {
          //         this.sendZoneEmail(vehicle, permissibleZone, point, IMEI);
          //       }
          //     }
          //   }
          // });
      }
    } catch (err) {
      console.log(err)
    }
  }
  static sendZoneSMS(
    vehicle,
    permissibleZone,
    point,
    IMEI,
    address,
    driverName,
    driverPhoneNumber,
    status
  ) {
    console.log("this comes until here 555")
    const smsgw = SMSGW();
    const { rcvSMSNumbers } = vehicle.zoneAlarm || {};
    const receivers = rcvSMSNumbers ? rcvSMSNumbers.split(";") : [];
    receivers.push(vehicle.driverPhoneNumber);
    let message = "";
    if (status === "OUT") {
      message = ZoneSMSText(point, permissibleZone, IMEI, address, driverName);
    } else if (status === "IN") {
      // message = BackToZoneSMSText(IMEI, driverName);
    }
    smsgw
      .sendSmsToNumber(message, [...new Set(receivers)])
      .catch((e) => console.log(e));
  }

  static sendZoneEmail(vehicle, permissibleZone, point, IMEI) {
    // console.log("sendZoneEmail")

    const { rcvEmails } = vehicle.zoneAlarm || {};
    const { simNumber, driverName, plate, driverPhoneNumber } = vehicle;
    const context = {
      IMEI,
      point,
      simNumber,
      driverName,
      plate,
      driverPhone: driverPhoneNumber,
      email: rcvEmails,
      subject: "Kaveh AVL Permissible Zone Alarm",
      alarmType: "Out of Zone",
    };
    util.send_email("mail/alarms/zone", context, (e) => console.error(e));
  }

  // *************************************************
  static async sendLocationSMS(message, receiver) {
    // console.log("sendLocationSMS")
    const smsgw = SMSGW();
    const data = await smsgw.sendSmsToNumber(message, receiver, true);
    return data;
  }
}

module.exports = { GPSController };
