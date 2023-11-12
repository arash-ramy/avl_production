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
    count = !count || !+count ? 10 : +count;
    skip = !skip || !+skip ? 0 : +skip;
    console.log(count, skip, "this is count and skip");

    const foundedItem = await GPSDataModel.find({ vehicleId })
      .skip(skip)
      .limit(count)
      .sort({ date: -1 });

    if (!foundedItem) {
      return res.json({
        message: "There is no gps data",
        code: 400,
      });
    }

    return res.json({ data, code: 200 });
  } catch (error) {
    // logger.error(ex);
    return res.json({
      messageSys: error.message,
      code: 500,
    });
  }
};
const getAllIMEIs = async (req, res) => {
  try {
    GPSDataModel.aggregate(
      [
        {
          $group: {
            _id: "$IMEI",
            count: { $sum: 1 },
          },
        },
      ],
      function (err, result) {
        if (err) {
          logger.error(ex);
          return res.json({
            msg: err,
          });
        } else {
          return res.json(result);
        }
      }
    );
  } catch (error) {
    // logger.error(ex);
    return res.json({
      error: error.message,
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
    console.log("IMEI",IMEI);

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
    console.log(gpsDate)
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

module.exports = {
  updateAddressOfLocations,
  getGPSData,
  getGPSDataIMEI,
  getAllIMEIs,
  getGPSDataIMEIReport,
};
