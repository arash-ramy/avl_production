/*eslint-disable */
// const {
//     VehicleModel,
//     VehicleAlarmModel
// } = require('../models/gpslocation');
const { Request, Response, Application } =require( 'express');

const VehicleModel = require("../model/GpsLocation/VehicleModel");
const VehicleAlarmModel = require("../model/GpsLocation/VehicleAlarmModel");

// const { logger } = require('../utility/customlog');
const cron = require("node-cron");
const moment = require("moment");

const { SMSGW } = require("../utils/smsgw");

const { util } = require("../utils/util");

const { DelayLocation } = require("../template/sms/alarms");
const smsgw = SMSGW();
const jalali_moment = require("moment-jalaali");
console.log("object 888");

class DeviceCheckLastLocationDelayCron {

  static async checkLastLocationDelay() {
    console.log("comes until here checkLastLocationDelay*")
    try {
      // console.log("comes here 001");
      const today = new Date();
      let delays = [];

      [
        "کاوه سودا",
        "کاوه سیلیس",
        "فلوت کاویان",
        "متانول کاوه",
        "کربنات کاوه",
        "ابهر سیلیس",
        "مظروف یزد",
        "دفتر مرکزی",
      ].map((group) => {
        console.log("+", group);
        delays.push({
          groupName: group,
          vehicles: [],
          receivers: this.getReceivers(group),
        });
      });
      console.log(delays,"delaysssssssss")

      const vehicles = await VehicleModel.find()
        .select("_id deviceIMEI lastLocation driverName plate")
        .populate("lastLocation")
        .populate({
          path: "groups",
          // select: "name",
        })
        console.log("___________________________________________________________________________")

      console.log(vehicles,"vehicles")

      const result = vehicles.map(async (vehicle) => {
        try {
          const lastLocationDurationDays = vehicle.lastLocation
            ? moment
                .duration(today.getTime() - vehicle.lastLocation.date.getTime())
                .asDays()
            : 0;
          console.log(lastLocationDurationDays,"lastLocationDurationDays")
          console.log(vehicle._id,"___id")

          const lastVehicleDelayAlarm = await VehicleAlarmModel.findOne(
            {
              vehicleId: vehicle._id,
              type: "Delay Alarm",
            },
            "date"
          ).sort({ date: -1 });
          console.log(lastVehicleDelayAlarm,"iiiiiiiiiiiiiiiiii");
          console.log(vehicle.groups[0], "9999999999999");
          // console.log( delays.findIndex(delay => delay.groupName === vehicle?.groups[0]?.name),"0000000000000");

          if (
            lastLocationDurationDays > 5 &&
            (!lastVehicleDelayAlarm ||
              (lastVehicleDelayAlarm &&
                moment
                  .duration(
                    today.getTime() -
                      new Date(lastVehicleDelayAlarm.date).getTime()
                  )
                  .asDays() > 5)) &&
            vehicle.groups[0] !== undefined
          ) {
            console.log(vehicle.groups[0].name,"ddddp")
            if (vehicle.groups[0].name !== "اسقاطی") {
              console.log("comes in ESGHATI ")
              const newAlarm = new VehicleAlarmModel({
                type: "Delay Alarm",
                date: new Date(),
                vehicleId: vehicle._id,
                desc:
                  "location not received for " +
                  Math.floor(lastLocationDurationDays) +
                  " days",
              });
               const saveProcess = await newAlarm.save();
              console.log(saveProcess,"saveProcess*")
              const delayIndex = delays.findIndex(
                (delay) => delay.groupName === vehicle?.groups[0]?.name
              );

              console.log("delayIndex" ,delayIndex)

              delays[delayIndex].vehicles.push({
                IMEI: vehicle.deviceIMEI,
                driverName: vehicle.driverName,
                plate: vehicle.plate,
                lastLocationDurationDays: Math.floor(lastLocationDurationDays),
              });
            }
          }
          console.log("ramy this is  delays" ,delays[0].vehicles)
          return delays;
          
        } catch (e) {
          // logger.error(e);
          console.log("something went wrong in checkLastLocationDelay ", e);
        }
      });
      // return Response.json({
      //   result,
      //   message:"this is result ramy"
      // })

      Promise.all(result)
      .then(async (values) => {
        console.log("____________________________________________________")
        console.log(values,"result***")


        // this service is not wroking ******
          this.sendDelaySmsToAdmins(values, today);
      });  
    } catch (ex) {
      console.log(
        "something went wrong in DeviceCheckLastLocationDelayCron ",
        ex
      );
    }
  }

  static sendDelaySmsToAdmins(delays, today) {
    console.log(delays,"thisislenght*")
    delays[0].map(delay => {
      console.log(delay.vehicles,"vehicles****----")
        if (delay.vehicles.length > 0) {
            const {
                groupName,
                vehicles,
                receivers
            } = delay;
            let todayPersianDate = jalali_moment(
                today.toISOString()
                    .replace('T', ' '),
                'YYYY-M-D'
            )
                .format('jYYYY/jM/jD');
            const context = {
                groupName,
                vehicles,
                today: todayPersianDate,
                subject: 'Kaveh AVL Delay Alarm',
                alarmType: 'Delay Alarm',
                email: receivers.email,
            };
            util.send_email('mail/alarms/delay', context, e => console.error(e));
            const message = DelayLocation(groupName, vehicles.length);
            smsgw.sendSmsToNumber(message, receivers.phone)
                .catch(e => logger.error(e));
        }
    });

}

  static getReceivers(groupName) {
    switch (groupName) {
      case "کاوه سودا":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
      case "کاوه سیلیس":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
      case "فلوت کاویان":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
      case "متانول کاوه":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
      case "کربنات کاوه":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
      case "ابهر سیلیس":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
      case "مظروف یزد":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
      case "دفتر مرکزی":
        return {
          phone: ["09381378120", "09370713134"],
          email: ["ar-rahimi@kavehglass.com", "arashramy@gmail.com"],
        };
    }
  }

  static run() {
    // const EVERY_DAY_AT_8_AM = '45 6 * * *'; // 6:45 AM every day
    // cron.schedule(EVERY_DAY_AT_8_AM, () => {
    (function () {
      DeviceCheckLastLocationDelayCron.checkLastLocationDelay().catch((e) =>
        console.log(
          "something went wrong in DeviceCheckLastLocationDelayCron ",
          e
        ) 
      );
      // });
    })();
  }
}

module.exports = { DeviceCheckLastLocationDelayCron };
