const moment = require("moment");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const VehicleStatusModel = require("../model/GpsLocation/VehicleStatusModel");
const VehicleTypeModel = require("../model/GpsLocation/VehicleTypeModel");
const path = require("path");
const mongoose = require("mongoose");

const DeviceGroupModel = require("../model/GpsLocation/DeviceGroupeModel");
const VehicleAlarmModel = require("../model/GpsLocation/VehicleAlarmModel");
const REPORT_TEMPLATE_DIR = path.resolve(__dirname, "..", "template", "report");

// async function reportDeviceAlarms(req, res) {
//   try {
//     const {
//       dateFilter: { start: startDate, end: endDate },
//       timeFilter: { start: startTime, end: endTime },
//       groupFilter,
//       deviceFilter,
//     } = req.body;
//     const userId = req.user._id;
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

//     console.log(deviceFilter, "DEVICE");
//     var vehicleG = await DeviceGroupModel.aggregate([
//       {
//         $match: {
//           $and: [
//             { $or: [{ user: userId }, { sharees: userId }] },
//             {
//               devices: {
//                 $in: deviceFilter.map((item) => {
//                   return new mongoose.Types.ObjectId(item);
//                 }),
//               },
//             },
//           ],
//         },
//       },
//       { $unwind: "$devices" },
//       {
//         $group: {
//           _id: null,
//           devices: { $addToSet: "$devices" },
//         },
//       },
//     ]);

//     // return res.json(vehicleG[0].devices )
//     const reportAlarms =  VehicleAlarmModel.aggregate([
//       {
//         $match: {$and :[
//             {vehicleId: { $in: vehicleG[0].devices }},
     
//         ]   
//         },
//       },
//       {
//         $addFields: {
//           dateCreated: {
//             $dateFromString: {
//               dateString: { $substr: ["$date", 0, 34] },
//             },
//           },
//           dateCreatedHour: {
//             $hour: {
//               date: {
//                 $dateFromString: {
//                   dateString: {
//                     $substr: ["$date", 0, 34],
//                   },
//                 },
//               },
//               timezone: "Asia/Tehran",
//             },
//           },
//         },
//       },
//     //  {
//     //      $project:{
//     //         dateCreated : { $gte: {"$dateCreated": new Date(startDate) }}

//     //      }
//     //  }
//     //   {
//     //     $match: 
       
//     //         {$dateCreated:{ $gte: new Date(startDate),$lte: new Date(startDate)}},
//     //   },
//     ]).limit(1000000)
// .then((response)=>{

//         // return res.json({response})

//           console.log("l1")
//         if (startDate &&!startDate === null) {
//             response.match({
//               date: { $gte: startDate },
//             });
//           }
//           if (endDate&&!endDate === null) {
//             response.match({
//               date: { $lte: new Date(endDate) },
//             });
//           }
//         //   if (startTime&&!startTime === null) {
//         //     response.match({
//         //       dateCreatedHour: { $gte: startTime },
//         //     });
//         //   }
//         //   if (endTime && !endTime ===null) {
//         //     response.match({
//         //       dateCreatedHour: { $lt: endTime },
//         //     });
//         //   }
//           console.log("l2")
//           return res.json(response)
//         //   const vehiclesAlarmData =  response.aggregate({
//         //       $group:{
//         //           id:"$_id"
//         //       }
//         //   })
//         //     .group({
//         //       _id: "$vehicleId",
//         //       alarms: {
//         //         $push: {
//         //           date: "$dateCreated",
//         //           type: "$type",
//         //           desc: "$desc",
//         //           hour: "$dateCreatedHour",
//         //         },
//         //       },
//         //     })
//         //     .lookup({
//         //       from: "vehicles",
//         //       localField: "_id",
//         //       foreignField: "_id",
//         //       as: "device",
//         //     })
//         //     .unwind("device")
//         //     .lookup({
//         //       from: "devicegroups",
//         //       localField: "device._id",
//         //       foreignField: "devices",
//         //       as: "device.groups",
//         //     })
//         //     .replaceRoot({
//         //       $mergeObjects: [
//         //         "$$ROOT",
//         //         {
//         //           groups: "$device.groups.name",
//         //           device: {
//         //             IMEI: "$device.deviceIMEI",
//         //             type: "$device.type",
//         //             simNumber: "$device.simNumber",
//         //           },
//         //           driver: {
//         //             name: "$device.driverName",
//         //             phoneNumber: "$device.driverPhoneNumber",
//         //           },
//         //         },
//         //       ],
//         // })
//         // return res.json(vehiclesAlarmData)

        

//       })
//     // return res.json({reportAlarms,"dkd":"dkk"})
//     //     if (startDate) {
//     //       reportAlarms.match({
//     //         dateCreated: { $gte: new Date(startDate) },
//     //       });
//     //     }
//     //     if (endDate) {
//     //       reportAlarms.match({
//     //         dateCreated: { $lte: new Date(endDate) },
//     //       });
//     //     }
//     //     if (startTime) {
//     //       reportAlarms.match({
//     //         dateCreatedHour: { $gte: startTime },
//     //       });
//     //     }
//     //     if (endTime) {
//     //       reportAlarms.match({
//     //         dateCreatedHour: { $lt: endTime },
//     //       });
//     //     }
//     //     const vehiclesAlarmData = await reportAlarms
//     //       .group({
//     //         _id: "$vehicleId",
//     //         alarms: {
//     //           $push: {
//     //             date: "$dateCreated",
//     //             type: "$type",
//     //             desc: "$desc",
//     //             hour: "$dateCreatedHour",
//     //           },
//     //         },
//     //       })
//     //       .lookup({
//     //         from: "vehicles",
//     //         localField: "_id",
//     //         foreignField: "_id",
//     //         as: "device",
//     //       })
//     //       .unwind("device")
//     //       .lookup({
//     //         from: "devicegroups",
//     //         localField: "device._id",
//     //         foreignField: "devices",
//     //         as: "device.groups",
//     //       })
//     //       .replaceRoot({
//     //         $mergeObjects: [
//     //           "$$ROOT",
//     //           {
//     //             groups: "$device.groups.name",
//     //             device: {
//     //               IMEI: "$device.deviceIMEI",
//     //               type: "$device.type",
//     //               simNumber: "$device.simNumber",
//     //             },
//     //             driver: {
//     //               name: "$device.driverName",
//     //               phoneNumber: "$device.driverPhoneNumber",
//     //             },
//     //           },
//     //         ],
//     //   })
//     //   .then((response) => {
//     //     return res.json({ response });
//     //   });

//     // return res.json({ vehicleG });
//   } catch (error) {
//     console.log(error);
//   }
// }


const reportDeviceAlarms = async (req, res) => {
    try {
            const userId = req.user._id;

        const {
          dateFilter: { start: startDate, end: endDate },
          timeFilter: { start: startTime, end: endTime },
          groupFilter,
                deviceFilter,
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
        // const { reportDevices } = await reports.getReportDevices(req);
        // reportDevices.select({ _id: 1 });
        // const deviceIds = (await reportDevices).map(
        //   ({ _id: vehicleId }) => vehicleId
        // );



        var reportDevices = await DeviceGroupModel.aggregate([
                  {
                    $match: {
                      $and: [
                        { $or: [{ user: userId }, { sharees: userId }] },
                        {
                          devices: {
                            $in: deviceFilter.map((item) => {
                              return new mongoose.Types.ObjectId('5992786811dc0505f290f86b');
                            }),
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: "$devices" },
                  {
                    $group: {
                      _id: null,
                      devices: { $addToSet: "$devices" },
                    },
                  },
        ])

    // return res.json({reportDevices})
        const reportAlarms = VehicleAlarmModel.aggregate()
          .match({ vehicleId: {$in: deviceFilter.map((item) => {
            return new mongoose.Types.ObjectId(item);
          })}})
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
      } catch (ex) {
        console.log(ex);
        return res.json({ msg: ex.message, code: 500 });
      }
};

module.exports = {
  reportDeviceAlarms,
};
