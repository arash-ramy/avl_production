const moment = require("moment");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const VehicleStatusModel = require("../model/GpsLocation/VehicleStatusModel");
const VehicleTypeModel = require("../model/GpsLocation/VehicleTypeModel");
const path = require("path");
const mongoose = require("mongoose");

const DeviceGroupModel = require("../model/GpsLocation/DeviceGroupeModel");
const VehicleAlarmModel = require("../model/GpsLocation/VehicleAlarmModel");
const { EROFS } = require("constants");
const GPSDataModel = require("../model/GpsLocation/GPSDataModel");
const ActionEventModel = require("../model/GpsLocation/ActionEventModel");
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
                  return new mongoose.Types.ObjectId(
                    "5992786811dc0505f290f86b"
                  );
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
    ]);

    // return res.json({reportDevices})
    const reportAlarms = VehicleAlarmModel.aggregate()
      .match({
        vehicleId: {
          $in: deviceFilter.map((item) => {
            return new mongoose.Types.ObjectId(item);
          }),
        },
      })
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
    const vehiclesAlarmData = reportAlarms
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

// this work ramy
const reportDeviceAlarms2 = async (req, res) => {
  try {
    console.log(req.user?.username, "ramyyyyyyy");

    const {
      dateFilter: { start: startDate, end: endDate },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
    } = req.body;
    const userId = req.user._id;
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

    console.log(req.body, "dosokdofsefi");
    // if (this.authUser && !this.authUser.isAdmin()) {
    if (req.user?.username === "asdmin" || req.user?.username === "arsash") {
      console.log("the user is  ADMIN");

      var vehiclesFounded = await DeviceGroupModel.aggregate([
        { $unwind: "$devices" },
        {
          $group: {
            _id: null,
            devices: { $addToSet: "$devices" },
          },
        },
      ]);
    } else {
      console.log("the user is not ADMIN");

      var vehiclesFounded = await DeviceGroupModel.aggregate([
        {
          $match: {
            $and: [
              { $or: [{ user: userId }, { sharees: userId }] },
              {
                devices: {
                  $in: deviceFilter.map((item) => {
                    return new mongoose.Types.ObjectId(item);
                  }),
                },
              },
            ],
          },
        },
        // { $unwind: "$devices" },
        // {
        //   $group: {
        //     _id: null,
        //     devices: { $addToSet: "$devices" },
        //   },
        // },
        {
          $lookup: {
            from: "vehicles",
            // localField: 'devices',
            // foreignField: '_id',
            let: { ddd: "$devices" },

            as: "deviceramy",
            pipeline: [
              {
                $match: {
                  _id: {
                    $in: deviceFilter.map((item) => {
                      return new mongoose.Types.ObjectId(item);
                    }),
                  },
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            fID: { $addToSet: "$deviceramy._id" },
          },
        },
        { $unset: ["_id"] },
      ]);
    }
    // return res.json(vehiclesFounded[0].fID[0])
    // var ss = "arashrahimi".substr(0, 2);
    // console.log(vehiclesFounded,"vehiclesFoundedddddd");
    // return res.json(vehiclesFounded)
    var catchIMEI = vehiclesFounded[0].fID[0];
    const reportAlarms = await VehicleAlarmModel.aggregate(
      [
        {
          $match: {
            vehicleId: {
              $in: catchIMEI.map((item) => {
                return new mongoose.Types.ObjectId(item);
              }),
            },
          },
        },

        {
          $addFields: {
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
              },
            },
          },
        },

        {
          $match: {
            $and: [
              {
                dateCreated: {
                  $gte: new Date(startDate), // specify the start date
                  $lte: new Date(endDate), // specify the end date
                },
              },
              {
                dateCreatedHour: { $gte: startTime, $lt: endTime },
              },
            ],
          },
        },
        {
          $group: {
            _id: "$vehicleId",
            alarms: {
              $push: {
                date: "$dateCreated",
                type: "$type",
                desc: "$desc",
                hour: "$dateCreatedHour",
              },
            },
          },
        },
        {
          $lookup: {
            from: "vehicles",
            localField: "_id",
            foreignField: "_id",
            as: "device",
          },
        },
        {
          $unwind: "$device",
        },
        {
          $lookup: {
            from: "devicegroups",
            localField: "device._id",
            foreignField: "devices",
            as: "device.groups",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
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
            },
          },
        },
      ],
      { allowDiskUse: true }
    );

    return res.json(reportAlarms);
  } catch (error) {
    console.log(error);
  }
};

const reportDeviceStatus2 = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
    } = req.body;
    const userId = req.user._id;
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

    console.log(req.body, "dosokdofsefi");
    // if (this.authUser && !this.authUser.isAdmin()) {

    if (req.user?.username === "admin" || req.user?.username === "arash") {
      console.log("the user is  ADMIN");

      var vehiclesFounded = await DeviceGroupModel.aggregate([
        { $unwind: "$devices" },
        {
          $group: {
            _id: null,
            devices: { $addToSet: "$devices" },
          },
        },
      ]);
    } else {
      console.log("the user is not ADMIN");

      var vehiclesFounded = await DeviceGroupModel.aggregate([
        {
          $match: {
            $and: [
              { $or: [{ user: userId }, { sharees: userId }] },
              {
                devices: {
                  $in: deviceFilter.map((item) => {
                    return new mongoose.Types.ObjectId(item);
                  }),
                },
              },
            ],
          },
        },
        // { $unwind: "$devices" },

        //   $group: {
        //     _id: null,
        //     devices: { $addToSet: "$devices" },
        //   },
        // },
        {
          $lookup: {
            from: "vehicles",
            // localField: "devices",
            // foreignField:"5fb8b502d61a492f96dfc934",
            let: { idN: "$_id" },

            as: "deviceramy",

            pipeline: [
              {
                $match: {
                  _id: {
                    $in: deviceFilter.map((item) => {
                      return new mongoose.Types.ObjectId(item);
                    }),
                  },
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: null,

            IMEIS: { $addToSet: "$deviceramy.deviceIMEI" },
          },
        },
        {
          $unset: ["_id"],
        },
        //    {
        //   $replaceRoot: {
        //     newRoot: {
        //       $mergeObjects: [
        //         "$ROOT",
        //         {
        //           THISISIMEI: "$imei",

        //         },
        //       ],
        //     },
        //   },
        // },
      ]);
      //  return     res.json(vehiclesFounded[0].IMEIS[0] );
      var imeis = vehiclesFounded[0].IMEIS[0];
      console.log(vehiclesFounded[0].IMEIS[0]);
      var StatusFounded = await VehicleStatusModel.aggregate([
        {
          $match: {
            $and: [
              { vehicleIMEI: { $in: imeis } },
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
          $group: {
            _id: "$vehicleIMEI",
            status: {
              $push: {
                _id: "$_id",
                date: "$date",
                status: "$status",
                desc: "$desc",
              },
            },
          },
        },
        {
          $lookup: {
            from: "vehicles",
            localField: "_id",
            foreignField: "deviceIMEI",
            as: "device",
          },
        },
        // { $unwind: "$device.devices" },
        { $unwind: "$device" },
        {
          $lookup: {
            from: "devicegroups",
            localField: "device._id",
            foreignField: "devices",
            as: "device.groups",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
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
            },
          },
        },
      ]);
      //  return     res.json(vehiclesFounded[0].IMEIS[0] );

      // $group: {
      //   _id: null,
      //   devices: { $addToSet: "$devices" },
      // },
      res.json(StatusFounded);
    }
  } catch (err) {
    console.log(err);
  }
};

const reportDeviceLocations = async (req, res) => {
  try {
    const userId = req.user._id;

    var {
      type,
      dateFilter: { start: startDate, end: endDate },
      speedFilter: { min: minSpeed, max: maxSpeed },
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
    if (minSpeed && maxSpeed && +minSpeed > +maxSpeed) {
      throw new Error(
        "کمینه سرعت گزارش نمی‌تواند از بیشینه سرعت گزارش بیشتر باشد."
      );
    }
    if (startTime === null && endTime === null) {
      startTime = 0;
      endTime = 24;
    }
    var vehiclesFounded = await DeviceGroupModel.aggregate([
      {
        $match: {
          $and: [
            { $or: [{ user: userId }, { sharees: userId }] },
            {
              devices: {
                $in: deviceFilter.map((item) => {
                  return new mongoose.Types.ObjectId(item);
                }),
              },
            },
          ],
        },
      },
      // { $unwind: "$devices" },
      // {
      //   $group: {
      //     _id: null,
      //     devices: { $addToSet: "$devices" },
      //   },
      // },
      {
        $lookup: {
          from: "vehicles",
          // localField: 'devices',
          // foreignField: '_id',
          let: { ddd: "$devices" },

          as: "deviceramy",
          pipeline: [
            {
              $match: {
                _id: {
                  $in: deviceFilter.map((item) => {
                    return new mongoose.Types.ObjectId(item);
                  }),
                },
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          fID: { $addToSet: "$deviceramy._id" },
        },
      },
      { $unset: ["_id"] },
    ]);
    var ii = vehiclesFounded[0].fID[0];
    console.log(startTime, endTime);
    const reportLocations = await GPSDataModel.aggregate([
      {
        $match: {
          vehicleId: {
            $in: ii.map((item) => {
              return new mongoose.Types.ObjectId(item);
            }),
          },
        },
      },
      {
        $addFields: {
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
        },
      },

      {
        $match: {
          $and: [
            {
              dateCreated: {
                $gte: new Date(startDate), // specify the start date
                $lte: new Date(endDate), // specify the end date
              },
            },
            {
              dateCreatedHour: { $gte: startTime, $lt: endTime },
            },
          ],
        },
      },
      {
        $group: {
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
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "device",
        },
      },
      {
        $unwind: "$device",
      },
      {
        $lookup: {
          from: "devicegroups",
          localField: "device._id",
          foreignField: "devices",
          as: "device.groups",
        },
      },
      {
        $replaceRoot:  {
          newRoot: {
          $mergeObjects: [
              '$$ROOT',
              {
                  groups: '$device.groups.name',
                  device: {
                      IMEI: '$device.deviceIMEI',
                      type: '$device.type',
                      simNumber: '$device.simNumber',
                      fuel: '$device.fuel',
                  },
                  driver: {
                      name: '$device.driverName',
                      phoneNumber: '$device.driverPhoneNumber',
                  },
              },
          ],
        }
      }
      }
    ]).limit(10);

    return res.json(reportLocations);
  } catch (err) {
    console.log(err);
  }
};


const reportDriverVehicles = async (req, res) => {
try{
  var {
    type,
    dateFilter: { start: startDate, end: endDate },
    speedFilter: { min: minSpeed, max: maxSpeed },
    timeFilter: { start: startTime, end: endTime },
    groupFilter,
    deviceFilter,
  } = req.body;
  let userId = req.user._id
if (
    startDate &&
    endDate &&
    new Date(startDate) > new Date(endDate)
) {
    throw new Error(
        'تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد.'
    );
}




var vehiclesFounded = await DeviceGroupModel.aggregate([
  {
    $match: {
      $and: [
        { $or: [{ user: userId }, { sharees: userId }] },
        {
          devices: {
            $in: deviceFilter.map((item) => {
              return new mongoose.Types.ObjectId(item);
            }),
          },
        },
      ],
    },
  },
  // { $unwind: "$devices" },
  // {
  //   $group: {
  //     _id: null,
  //     devices: { $addToSet: "$devices" },
  //   },
  // },
  {
    $lookup: {
      from: "vehicles",
      // localField: 'devices',
      // foreignField: '_id',
      let: { ddd: "$devices" },

      as: "deviceramy",
      pipeline: [
        {
          $match: {
            _id: {
              $in: deviceFilter.map((item) => {
                return new mongoose.Types.ObjectId(item);
              }),
            },
          },
        },
      ],
    },
  },
  {
    $group: {
      _id: null,
      IMEIS: { $addToSet: "$deviceramy.deviceIMEI" },
      driverName: { $addToSet: "$deviceramy.driverName" },
    },
  },
  // { $unset: ["_id"] },
]);
// return res.json(vehiclesFounded[0].driverName[0])
let outputvehcile = vehiclesFounded[0].driverName[0];
var operation = await ActionEventModel.aggregate([

{$match :{
  $and:[
    { oldValue: { $in:outputvehcile} },
    {
        $or: [
            { date: { $gte: new Date(startDate) } },
            { date: { $lte: new Date(endDate) } },
        ],
    },
  ]
}},
{
  $lookup:{
    from: 'vehicles',
    localField: 'objectId',
    foreignField: '_id',
    as: 'vehicle',
  }
  
 
}, {$unwind :"$vehicle"}
,
{ $unset: 'vehicle.alarms' },

]).limit(10)




return res.json(operation)


}
catch(error){
  console.log(error)
return res.json({
  messageSys:error.message,
  code :500
})
}
}

// until here 
const reportDeviceChanges = async (req, res) => {
  const userId = req.user._id;

    var {
      type,
      dateFilter: { start: startDate, end: endDate },
      speedFilter: { min: minSpeed, max: maxSpeed },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
    } = req.body;

}











module.exports = {
  reportDeviceAlarms,
  reportDeviceAlarms2,
  reportDeviceStatus2,
  reportDeviceLocations,
  reportDriverVehicles,
  reportDeviceChanges
};
