/* eslint-disable */
const chalk = require("chalk");

var ObjectId = require("mongoose").Types.ObjectId;
// const {
//     GPSDataModel,
//     VehicleModel,
//     VehicleAlarmModel: AlarmModel,
// } = require('../model/GpsLocation/');
const VehicleAlarmModel = require("../model/GpsLocation/VehicleAlarmModel");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const GPSDataModel = require("../model/GpsLocation/GPSDataModel");

const { AddressCache } = require("../utils/addresscache");
// const { SMSGW } = require("../utils/smsgw");
// const { util } = require("../utility/util");
// const { logger } = require("../utility/customlog");
// const { SpeedSMSText } = require("../template/sms/alarms");
// const { ZoneSMSText } = require("../template/sms/alarms");
// const { BackToZoneSMSText } = require("../template/sms/alarms");
const moment = require("moment");
// const { ShortenerLink } = require("../utility/shortenerLink");

class GPSController {
  constructor() {
    this.timerId = null;
    this.messageQueue = [];
  }

  static async parsePacket(packet, socket) {
    throw new Error("Not Implemented");
  }

  static async savePacketData(data, force = false, lastData) {
    // console.log("*** savePacketData RUNNED");
    // console.log("two");
    // console.log(data, "data");
    // console.log(lastData, "lastDataaaa");

    const gpsData = new GPSDataModel(data);
    const valid = await this.checkGPSDataInterval(gpsData, lastData);

    // console.log("third", valid);
    // console.log("gpsData", gpsData);

    if (valid || force) {
      // logger.debug(
      //   { event: "NEW_PACKET", type: gpsData.deviceName },
      //   { IMEI: gpsData.IMEI, time: gpsData.date }
      // );
      gpsData.url = `http://maps.google.com/maps?q=${gpsData.lat},${gpsData.lng}`;
      const gpsdataaa = await gpsData.save();

      // console.log("until here");

      gpsData.address = await new AddressCache().findAddress(
        gpsData.lat,
        gpsData.lng
      );
      // console.log(gpsdataaa, "this is gpsdataaa");
      await gpsdataaa.save();

      // console.log(gpsData.IMEI, "gpsData.IMEI");

      // query to find out deviceId
      const foundedVehicle =   await VehicleModel.findOne({ deviceIMEI: gpsData.IMEI });
      if (!foundedVehicle) {
        console.log("vehicle is not found")
      }
      gpsData.vehicleId = foundedVehicle._id;
            await gpsData.save();
     
      console.log(gpsData,"gpsData");
      this.checkSpeed(gpsData);
      // this.checkZone(gpsData);
    }
  }

  static async checkSpeed({ speed, IMEI, url }) {
    try {
      console.log("happend")
      const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI })
        .select("_id lastLocation maxSpeed driverName driverPhoneNumber alarms")
        .populate("lastLocation");
      if (vehicle) {
        console.log("vehicle",vehicle)
        console.log("speed",+speed)
        console.log("IMEI",IMEI)
        console.log("vehicle.maxSpeed",vehicle.maxSpeed)

        const lastSpeed = vehicle.lastLocation.speed || 0;
        console.log("lastSpeed",lastSpeed)

        if(speed > vehicle.maxSpeed){
          console.log("speed is greather then max")
        }
        if(lastSpeed < vehicle.maxSpeed){
          console.log("speed is greather then max")
        }

        if(vehicle){
          console.log("object1")
          if(speed > vehicle.maxSpeed){
            console.log("object2")
            console.log("object2 d", +lastSpeed,+speed)

            if(lastSpeed < speed){
              console.log("object3")
            }
          }
        }

        if (vehicle && +speed > +vehicle.maxSpeed && lastSpeed < +vehicle.maxSpeed)  {
          try {
            console.log("yes of course")
            const lastAlarm = await VehicleAlarmModel.findOne({
              _id: vehicle.alarms[vehicle.alarms.length - 1],
            });
            const alarmBreak = moment(new Date(lastAlarm.date))
              .add(30, "m")
              .toDate();
            if (alarmBreak > new Date()) return;
          } catch (e) {}
          const newAlarm = new VehicleAlarmModel({
            type: "Over Speed",
            date: new Date().AsDateJs(),
            vehicleId: vehicle._id,
            desc: `must be ${vehicle.maxSpeed} but is ${speed}`,
          });
          await newAlarm.save();
          vehicle.alarms.push(newAlarm._id);
          vehicle.save();

          this.sendSpeedSMS(
            vehicle,
            speed,
            IMEI,
            url,
            vehicle.driverName,
            vehicle.driverPhoneNumber
          );
          // this.sendSpeedEmail(vehicle, speed, IMEI, address);
        }
      }
    } catch (error) {
      // logger.error(ex);
      console.log(error);
    }
  }

  static async sendSpeedSMS(vehicle, speed, IMEI, url, driverName) {
    const smsgw = SMSGW();

    const { rcvSMSNumbers } = vehicle.speedAlarm || {};
    const receivers = rcvSMSNumbers ? rcvSMSNumbers.split(";") : [];
    const driverFamilyName =
      driverName.split(" ")[driverName.split(" ").length - 1];
    receivers.push(vehicle.driverPhoneNumber);
    let shortLink = await ShortenerLink()
      .zayaShortenerLink(url)
      .catch(() => {
        return url;
      });
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
  }

  static sendSpeedEmail(vehicle, speed, IMEI, address) {
    const { rcvEmails } = vehicle.speedAlarm || {};
    const { simNumber, driverName, plate, driverPhoneNumber } = vehicle;
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
    util.send_email("mail/alarms/speed", context, (e) => console.error(e));
  }

  // this function do =>
  static async checkGPSDataInterval({ date, IMEI, speed }, lastRecord) {
    try {
      console.log("*** checkGPSDataInterval RUNNED");

      const vehicle = await VehicleModel.findOne({
        deviceIMEI: IMEI,
      })
        .select("lastLocation maxSpeed")
        .populate("lastLocation");

      console.log(lastRecord, "lastRecord");

      console.log(vehicle, "vehicle");
      if (!vehicle) return false;
      lastRecord = lastRecord || vehicle.lastLocation;
      if (!lastRecord) return true;
      const tenMinutes = 10 * 60 * 1000;
      return (
        Math.abs(date - lastRecord.date) >= tenMinutes ||
        Math.abs(lastRecord.speed - speed) >= 10 ||
        speed >= (vehicle.maxSpeed || 100)
      );
    } catch (e) {
      logger.error(e);
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
    } catch (ex) {
      logger.error(ex);
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
    try {
      const vehicle = await VehicleModel.findOne({ deviceIMEI: IMEI }).populate(
        "lastLocation"
      );
      if (vehicle && vehicle.permissibleZone) {
        var permissibleZone = vehicle.permissibleZone;
        var point = [lat, lng];
        var driverName = vehicle.driverName;
        var driverPhoneNumber = vehicle.driverPhoneNumber;
        var alarmInterval = permissibleZone.alarmInterval || "3";
        var status = "";
        VehicleAlarmModel.findOne({
          $and: [
            {
              vehicleId: ObjectId(vehicle._id),
              type: "Out of Zone",
            },
          ],
        })
          .sort({ _id: "desc" })
          .exec(async (err, alarm) => {
            if (err) {
              logger.error(err);
            } else {
              let now = new Date().AsDateJs();
              let lastAlarmDate = alarm ? new Date(alarm.date) : now;
              let diffHour = Math.floor(Math.abs(lastAlarmDate - now) / 36e5); // Hour

              // out of zone alarm
              if (
                vehicle &&
                !GPSController.inside(point, permissibleZone.coordinates) &&
                (diffHour >= alarmInterval ||
                  vehicle.zoneStatus === "IN" ||
                  vehicle.zoneStatus === undefined)
              ) {
                const newAlarm = new VehicleAlarmModel({
                  type: "Out of Zone",
                  date: new Date().AsDateJs(),
                  vehicleId: vehicle._id,
                  desc: `vehicle location [${point}] is out of permissible zone`,
                });
                await newAlarm.save();
                vehicle.alarms.push(newAlarm._id);
                vehicle.zoneStatus = "OUT";
                vehicle.save();

                status = "OUT";

                if (vehicle.zoneAlarm.sendSMS) {
                  this.sendZoneSMS(
                    vehicle,
                    permissibleZone,
                    point,
                    IMEI,
                    address,
                    driverName,
                    driverPhoneNumber,
                    status
                  );
                }
                if (vehicle.zoneAlarm.sendEmail) {
                  this.sendZoneEmail(vehicle, permissibleZone, point, IMEI);
                }
              }

              // back to permissible zone alarm
              else if (
                vehicle &&
                GPSController.inside(point, permissibleZone.coordinates) &&
                vehicle.zoneStatus === "OUT"
              ) {
                const newAlarm = new VehicleAlarmModel({
                  type: "Back to Zone",
                  date: new Date().AsDateJs(),
                  vehicleId: vehicle._id,
                  desc: `vehicle Come Back to permissible zone`,
                });
                await newAlarm.save();
                vehicle.alarms.push(newAlarm._id);
                vehicle.zoneStatus = "IN";
                vehicle.save();

                status = "IN";

                if (vehicle.zoneAlarm.sendSMS) {
                  this.sendZoneSMS(
                    vehicle,
                    permissibleZone,
                    point,
                    IMEI,
                    address,
                    driverName,
                    driverPhoneNumber,
                    status
                  );
                }
                if (vehicle.zoneAlarm.sendEmail) {
                  this.sendZoneEmail(vehicle, permissibleZone, point, IMEI);
                }
              }
            }
          });
      }
    } catch (ex) {
      logger.error(ex);
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
      .catch((e) => logger.error(e));
  }

  static sendZoneEmail(vehicle, permissibleZone, point, IMEI) {
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
    const smsgw = SMSGW();
    const data = await smsgw.sendSmsToNumber(message, receiver, true);
    return data;
  }
}

module.exports = { GPSController };
