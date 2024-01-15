const moment = require("moment");
const path = require("path");
const mongoose = require("mongoose");
// const {
//   DeviceGroupModel,
//   VehicleAlarmModel,
// } = require("../model/GpsLocation"); // Assuming these models exist in a common file
const VehicleAlarmModel = require("../model/GpsLocation/VehicleAlarmModel");

const DeviceGroupModel = require("../model/GpsLocation/DeviceGroupeModel");
const VehicleStatusModel = require("../model/GpsLocation/VehicleStatusModel");
const ActionEventModel = require("../model/GpsLocation/ActionEventModel");
const GPSDataModel = require("../model/GpsLocation/GPSDataModel");

const REPORT_TEMPLATE_DIR = path.resolve(__dirname, "..", "template", "report");

const reportDeviceAlarms = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
    } = req.body;
    const userId = req.user._id;

    // Input validation for date and time
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.json({message:"Start date cannot be after end date.",messageSys:"reportDeviceAlarms",code:400})


    }
    if (startTime && endTime && startTime > endTime) {
      return res.json({message:"Start time cannot be after end time.",messageSys:"reportDeviceAlarms",code:400})

    }

    // User role check
    const isAdmin = req.user?.username === "admiedn" || req.user?.username === "arsash";
    
    // Fetch vehicles based on user role
    const vehiclesFounded = isAdmin
      ? await DeviceGroupModel.aggregate([{ $unwind: "$devices" }, { $group: { _id: null, devices: { $addToSet: "$devices" } } }])
      : await DeviceGroupModel.aggregate([
          {
            $match: {
              $and: [
                { $or: [{ user: userId }, { sharees: userId }] },
                {
                  devices: {
                    $in: deviceFilter.map((item) => new mongoose.Types.ObjectId(item)),
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
          {
            $lookup: {
              from: "vehicles",
              let: { ddd: "$devices" },
              as: "deviceramy",
              pipeline: [
                {
                  $match: {
                    _id: { $in: deviceFilter.map((item) => new mongoose.Types.ObjectId(item)) },
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

    const catchIMEI = vehiclesFounded[0].fID[0];
    // Fetch report alarms based on filters
    const reportAlarms = await VehicleAlarmModel.aggregate([
      {
        $match: {
          vehicleId: { $in: catchIMEI.map((item) => new mongoose.Types.ObjectId(item)) },
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
                  dateString: { $substr: ["$date", 0, 34] },
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
            { dateCreated: { $gte: new Date(startDate), $lte: new Date(endDate) } },
            { dateCreatedHour: { $gte: startTime, $lt: endTime } },
          ],
        },
      },
      {
        $group: {
          _id: "$vehicleId",
          alarms: {
            $push: {
              date: "$date",
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

    return res.json({data:reportAlarms,code:200});
  } catch (error) {
    console.error(error);
    return res.json({ msg: error.message, code: 400 });
  }
};

const reportDeviceStatus = async (req, res) => {
  try {
    const {
      dateFilter: { start: startDate, end: endDate },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
    } = req.body;

    const userId = req.user._id;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    
      return res.json({message:"تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد.",messageSys:"reportDriverVehicles",code:400})

    }
    if (startTime && endTime && startTime > endTime) {
      return res.json({message:"ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد",messageSys:"reportDriverVehicles",code:400})

    
    }

    // console.log(req.body, "dosokdofsefi");
    // if (this.authUser && !this.authUser.isAdmin()) {

  

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
      var userString = userId.toString();
      var imeis = vehiclesFounded[0].IMEIS[0];

        // return res.json({imeis})

        // return res.json(imeis)
      var StatusFounded = await VehicleStatusModel.aggregate([
        {
          $match: {
            $and: [
              { vehicleIMEI:{$in:imeis}},
              {
                $and: [
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
      ])
      // .limit(10)
      //  return     res.json(vehiclesFounded[0].IMEIS[0] );

      // $group: {
      //   _id: null,
      //   devices: { $addToSet: "$devices" },
      // },
     return res.json({data:StatusFounded,code:200});
    
  } catch (err) {
    console.log(err);
    return res.json({message:"something went wrong in reportDeviceStatus ", code:400})
    
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

    // console.log(req.body)
    // console.log(req.body)
    
    // console.log("runned")
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
     
      return res.json({message:"تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد.",messageSys:"reportDeviceLocations",code:400})

    }
    if (startTime && endTime && startTime > endTime) {
   
      return res.json({message:"ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد.",messageSys:"reportDeviceLocations",code:400})

    }
    if (minSpeed && maxSpeed && +minSpeed > +maxSpeed) {
    
      return res.json({message:"کمینه سرعت گزارش نمی‌تواند از بیشینه سرعت گزارش بیشتر باشد.",messageSys:"reportDeviceLocations",code:400})

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
    // console.log(startTime, endTime);
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
                  fuel: "$device.fuel",
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
    ])
    // .limit(10);

    return res.json({data:reportLocations,code :200});
  } catch (err) {
    console.log(err);
    return res.json({error :err.message,messageSys:"reportDeviceLocations",code:400})
  }
};

const reportDriverVehicles = async (req, res) => {
  try {
    var {
      type,
      dateFilter: { start: startDate, end: endDate },
      speedFilter: { min: minSpeed, max: maxSpeed },
      timeFilter: { start: startTime, end: endTime },
      groupFilter,
      deviceFilter,
    } = req.body;
    let userId = req.user._id;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
   return res.json({message:"check the dates ",messageSys:"reportDriverVehicles",code:400})
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
      {
        $match: {
          $and: [
            { oldValue: { $in: outputvehcile } },
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
        $lookup: {
          from: "vehicles",
          localField: "objectId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: "$vehicle" },
      { $unset: "vehicle.alarms" },
      {
        $lookup: {
          from: "devicegroups",
          localField: "vehicle._id",
          foreignField: "devices",
          as: "group",
        },
      },
      { $unwind: "$group" },
      { $set: { "vehicle.groups": "$group" } },
      {
        $group: {
          _id: "$oldValue",
          vehicles: {
            $push: {
              plate: "$vehicle.plate",
              date: "$date",
              type: "$vehicle.type",
              group: "$vehicle.groups.name",
            },
          },
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "driverName",
          as: "currentVehicle",
        },
      },

      { $unwind: "$currentVehicle" },
      { $unset: "currentVehicle.alarms" },
      {
        $lookup: {
          from: "devicegroups",
          localField: "currentVehicle._id",
          foreignField: "devices",
          as: "group",
        },
      },
      { $unwind: "$group" },
      { $unset: "group.devices" },
      { $unset: "group.sharees" },
      { $set: { "currentVehicle.groups": "$group.name" } },
      { $unset: "group" },
    ]);

    return res.json({ data:operation, code: 200 });
  } catch (error) {
    console.log(error);
    return res.json({
      messageSys: error.message,
      code: 400,
      message:"something went wrong in reportDriverVehicles"
    });
  }
};

// until here
const reportDeviceChanges = async (req, res) => {
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
      // ,{$unwind:"$deviceramy"},
      {
        $group: {
          _id: "$deviceramy._id",
          _isd: { $addToSet: "$deviceramy._id" },
        },
        // result: { $push: { k: "$deviceramy._id", v: "$deviceramy._id" } }
      },
      { $unset: ["_id"] },

      // {
      //   $project: {
      //     _id: 0,
      //     mergedObject: {
      //       $mergeObjects: {
      //         // _id: "$_id",
      //         _isd: "$_isd"
      //       }
      //     }
      //   }
      // },
      // {
      //   $merge: {
      //     into: "_isd" // Specify the name for the result collection
      //   }
      // }
      // }
      // {
      //   $project :{
      //   ss: { $push: { k: "$deviceramy._id" }}
      //   }
      // }

      // }
      // {
      //   $unset: ["_id"],
      // },
      //    {
      //   $replaceRoot: {
      //     newRoot:{ FID :"$IMEIS"},

      //   },
      // },
      // actionevents

      // {$group:{

      //   _id:"$deviceramy._id"

      // }}

      // {
      //   $project: {
      //    _id:"$deviceramy._id"
      //   }
      // }
      // {
      //   $lookup: {
      //     from: "actionevents",

      //     let: {  middd:"$_isd"},

      //     as: "foundedAction",

      //     pipeline: [
      //       {
      //         $match: {
      //           $and: [
      //             { objectId: { $in:"$$middd" },}
      //             // {
      //             //     $or: [
      //             //         { date: { $gte: new Date(startDate) } },
      //             //         { date: { $lte: new Date(endDate) } },
      //             //     ],
      //             // },
      //         ],
      //         },
      //       },
      //     ],
      //   },
      // },
    ]);

    // var operationOnActionEvent = ActionEventModel.aggregate([
    //   {$match: }
    var ooo = vehiclesFounded[0]._isd[0];
    // return res.json({ooo})



    // .map((item) => {
    //   return new mongoose.Types.ObjectId(item);
    // }),

    // let dd = vehiclesFounded[0].resultVariable.ss[0]
    let ActionPr =await  ActionEventModel.aggregate([
      {
        $match: {
          $and: [
            { objectId: { $in: ooo } },
            {
              $or: [
                { date: { $gte: new Date(startDate) } },
                { date: { $lte: new Date(endDate) } },
              ],
            },
          ],
        },
      },
      {$lookup:{
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
        }
     },
     {$unwind:"$user"},
     {$group:{
      _id: '$objectId',
      changes: {
          $push: {
              _id: '$_id',
              user: '$user',
              date: '$date',
              objectModel: '$objectModel',
              objectId: '$objectId',
              actionType: '$actionType',
              fieldName: '$fieldName',
              oldValue: '$oldValue',
              newValue: '$newValue',
          },
      },
  }},
  {
    $lookup:{
      from: 'vehicles',
      localField: '_id',
      foreignField: '_id',
      as: 'device',
  }
  },
  {
    $unwind:'$device'},
    {$lookup:{
      from: 'devicegroups',
      localField: 'device._id',
      foreignField: 'devices',
      as: 'device.groups',
  }}
,{$replaceRoot:{
  newRoot: {
  $mergeObjects: [
      '$$ROOT',
      {
          groups: '$device.groups.name',
          device: {
              IMEI: '$device.deviceIMEI',
              type: '$device.type',
              simNumber: '$device.simNumber',
          },
          driver: {
              name: '$device.driverName',
              phoneNumber: '$device.driverPhoneNumber',
          },
      },
  ],
}
}}
    ]);

    return res.json({data: ActionPr,code:200 });
  } catch (err) {
    console.log(err);
    return res.json({
      messageSys: err.message,
      code: 500,
      message: "something went wrong in reportDeviceChanges",
    });
  }
};

const reportDeviceLocationsCustome = async (req, res) => {
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

    return res.json({message: "تاریخ شروع گزارش نمی‌تواند از تاریخ پایان گزارش جلوتر باشد.",messageSys:"reportDeviceAlarms",code:400})

  }
  if (startTime && endTime && startTime > endTime) {

    return res.json({message:  "ساعت شروع گزارش نمی‌تواند از ساعت پایان گزارش جلوتر باشد.",messageSys:"reportDeviceAlarms",code:400})

  }
  if (minSpeed && maxSpeed && +minSpeed > +maxSpeed) {
   
    return res.json({message: "کمینه سرعت گزارش نمی‌تواند از بیشینه سرعت گزارش بیشتر باشد.",messageSys:"reportDeviceAlarms",code:400})

  }
  if (startTime === null && endTime === null) {
    startTime = 0;
    endTime = 24;
  }
  if (minSpeed === null && maxSpeed === null) {
    minSpeed = 0;
    maxSpeed = 180;
  }

  var vehiclesFounded = await DeviceGroupModel.aggregate([
    {$match: {
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
  },  {
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
  },      { $unset: ["_id"] },
])
var ii = vehiclesFounded[0].fID[0];
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
  {$group:{
    _id:"$IMEI"
    ,
    locations:{
      $addToSet:{
        lat:"$lat",
        lng:"$lng"
        
      }
    },
  }},
  {
    $project:{
      _id: 0,
      IMEI: "$_id",
      locations: {
        $map: {
          input: "$locations",
          as: "location",
          in: ["$$location.lat", "$$location.lng"],
        },
      },
    }
  }
])
return res.json({reportLocations,code:200})

}catch(err){
  return res.json({message:"something went  wrong in reportDeviceLocationsCustome",messageSys:err.message,code:500})
}


}

module.exports = {
  reportDeviceAlarms,
  reportDeviceStatus,
  reportDeviceLocations,
  reportDriverVehicles,
  reportDeviceChanges,
  reportDeviceLocationsCustome
};
