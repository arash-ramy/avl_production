var mongoose = require("mongoose");

var path = require("path");
var moment = require("moment");
var jade = require("jade");
var pdf = require("html-pdf");
var path = require("path");

var templatesDir = path.resolve(__dirname, "template");

console.log(templatesDir);

const GPSDataModel = require("../model/GpsLocation/GPSDataModel");
const VehicleModel = require("../model/GpsLocation/VehicleModel");
const { AddressCache } = require("../utils/addresscache");
const { relativeTimeRounding } = require("moment");

const getGPSData = async (req, res) => {
  try {
    const foundedGpsData = await GPSDataModel.find({});

    if (!foundedGpsData) {
      return res.json({
        message: "There is no gps data",
        code: 400,
      });
    }

    res.json({ foundedGpsData, code: "200" });
  } catch (error) {
    // logger.error(error);
    return res.json({
      messageSys: error.message,
      message: "something went wrong in getGPSData",
      code: 500,
    });
  }
};
const getGPSDataIMEI = async (req, res) => {
  console.log("hello");
  try {
    const vehicleId = req.params.id;
    let { count } = req.params;
    let { skip } = req.params;

    if (!vehicleId) {
      return res.json({
        message: "vehicle not found",
        code: 422,
        validate: false,
        field: "vehicleId",
      });
    }
    console.log(req.params);

    count = !count || !+count ? 10 : +count;
    skip = !skip || !+skip ? 0 : +skip;
    console.log(count, skip, "this is count and skip");
    console.log(vehicleId, "rrrrr");
    const foundedItem = await GPSDataModel.find({ vehicleId: vehicleId });
    // .skip(skip)
    // .limit(count)
    // .sort({ date: -1 });
    console.log(foundedItem, "foundedItem");
    if (!foundedItem) {
      return res.json({
        message: "There is no gps data",
        code: 400,
      });
    }

    return res.json({ foundedItem, code: 200 });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      messageSys: error.message,
      code: 500,
      error: "somthing went wrong in  getGPSDataIMEI",
    });
  }
};
const getAllIMEIs = async (req, res) => {
  try {
    const AllGpsbyImei = await GPSDataModel.aggregate([
      {
        $group: {
          _id: "$IMEI",
          count: { $sum: 1 },
        },
      },
    ]);

    // console.log(AllGpsbyImei)
    return res.json({
      AllGpsbyImei,
      code: 200,
    });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      messageSys: error.message,
      message: "somthing went wrong in getAllIMEIs .",
      code: 500,
    });
  }
};

const updateAddressOfLocations = async (req, res) => {
  try {
    const foundedGps = await GPSDataModel.find().sort({ date: -1 });

    if (!foundedGps) {
      return res.json({
        message: "something went wrong in updateAddressOfLocations",
        messageSys: error.message,
        code: 500,
      });
    }
    console.log(foundedGps);

    // if(foundedGps[index]){
    // }
    var reverseTraverse = function (data, index) {
      console.log("yes exist");
      console.log(data);
      if (data[index]) {
        var tmpData = data[index];
        new AddressCache()
          .findAddress(tmpData.lat, tmpData.lng)
          .then((addr) => {
            if (addr) {
              console.log(addr, "this is ");
              tmpData.address = addr;
              tmpData.save().then(() => {
                console.log("successs");
                reverseTraverse(data, index + 1);
                console.log("pppp");
              });
            }
          })
          .catch((e) => console.log(e));
      }
    };
    return res.json({ msg: "Donee" });

    // reverseTraverse(foundedGps, 0);
    // console.log("io")

    // .exec(function (err, data) {
    //     if (err) {
    //         logger.error(err);
    //         return res({
    //             msg: err
    //         }).code(500);
    //     }
    //     else if (!data) {
    //         return res({
    //             msg: 'There is no gps data'
    //         }).code(404);
    //     }
    //     else {
    //         {
    //             var reverseTraverse = function(data, index){
    //                 if(data[index]) {
    //                     var tmpData = data[index];
    //                         new AddressCache()
    //                             .findAddress(tmpData.lat, tmpData.lng)
    //                             .then(addr => {
    //                                 if (addr) {
    //                                     tmpData.address = addr;
    //                                     tmpData.save();
    //                                     reverseTraverse(
    //                                         data,
    //                                         index + 1
    //                                     );
    //                                 }
    //                             })
    //                             .catch(e => logger.error(e));
    //                 }
    //                 else return;
    //             }
    //             reverseTraverse(data, 0);

    //         }
    //         return res({msg: "Done"}).code(200);
    //     }});
  } catch (error) {
    // logger.error(ex);
    return res.json({
      message: "something went wrong in updateAddressOfLocations",
      messageSys: error.message,
      code: 500,
    });
  }
};

const getGPSDataIMEIReport = async (req, res) => {
  try {
    var IMEI = req.params.IMEI;
    console.log("IMEI", IMEI);

    if (!IMEI) {
      return res
        .json({
          msg: "IMEI required",
          code: "422",
          validate: false,
          field: "IMEI",
        })
        .code(422);
    }

    const gpsDate = await GPSDataModel.find({ IMEI: IMEI }).sort({ date: -1 });
    console.log(gpsDate);
    if (!gpsDate) {
      return res.json({ message: "There is no gps data" });
    } else {
      var locals = {
        locations: gpsDate,
        IMEI: IMEI,
      };
      // console.log(path.resolve(__dirname, "..", 'template'))
      // console.log(locals)
      var html = jade.renderFile(
        templatesDir + "/report/devicelocation.jade",
        locals
      );

      // pdf
      //   .create(html, { orientation: "landscape", border: "1" })
      //   .toFile("report.pdf", function (err, stream) {
      //     res.file(stream.filename);
      //     A;
      //   });
    }
    return res.json({ message: "success" });

    //     .exec(function (err, data) {
    //     if (err) {
    //         logger.error(err);
    //         return res({
    //             msg: err
    //         }).code(500);
    //     }
    //     else if (!data) {
    //         return res({
    //             msg: 'There is no gps data'
    //         }).code(404);
    //     }
    //     else {
    //         var locals = {
    //             locations: data,
    //             IMEI: IMEI
    //         }
    //         var html = jade.renderFile(templatesDir + "/report/devicelocation.jade", locals);
    //         pdf.create(html, { "orientation": "landscape", "border": "1"}).toFile("report.pdf", function(err, stream){
    //             res.file(stream.filename);
    //         });
    //     }
    // })
  } catch (error) {
    // logger.error(ex);
    console.log(error);

    return res.json({
      message: "something went wrong getGPSDataIMEIReport",
      messageSys: error.message,
      code: 500,
    });
  }
};

const getNLastDataIMEI = async (req, res) => {
  try {
    var IMEI = req.params.IMEI;
    var count = req.params.count;
    if (!IMEI) {
      return res({
        msg: "IMEI required",
        code: "404",
        validate: false,
        field: "IMEI",
      });
    }

    if (!count) count = 10;

    GPSDataModel.find({ IMEI: IMEI })
      .sort({ date: -1 })
      .limit(count)

      .exec(function (err, data) {
        if (err) {
          logger.error(err);
          return res({
            msg: err,
          }).code(500);
        } else if (!data) {
          return res({
            msg: "There is no gps data",
          }).code(404);
        } else {
          VehicleModel.findOne({ deviceIMEI: IMEI }).exec(function (
            err,
            vehicle
          ) {
            if (err) {
              logger.error(err);
              return res({
                msg: err,
              }).code(500);
            } else if (!vehicle) {
              return res({
                msg: "There is no vehicle",
              }).code(404);
            } else {
              if (data[0]) {
                var oneDay = 24 * 60 * 60 * 1000;
                var startDate = new Date(data[0].date);
                var endDate = new Date();
                var remainingDate = Math.round(
                  Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)
                );
                data[0].lastLocationDiff = remainingDate;
              }
              return res(data).code(200);
            }
          });
        }
      });
  } catch (ex) {
    logger.error(ex);
    return res({
      msg: ex,
    }).code(500);
  }
};


module.exports = {
  updateAddressOfLocations,
  getGPSData,
  getGPSDataIMEI,
  getAllIMEIs,
  getNLastDataIMEI,
  getGPSDataIMEIReport,
  
};
