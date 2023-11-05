var mongoose = require("mongoose");

var path = require("path");
var moment = require("moment");

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
    console.log(count,skip,"this is count and skip")

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
    try{
        GPSDataModel.aggregate([
            {
                $group: {
                    _id: '$IMEI',
                    count: { $sum: 1}
                }
            }
        ], function (err, result) {
            if (err) {
                logger.error(ex);
                return res({
                    msg: err
                }).code(500);
            } else {
                return res(result).code(200);
            }
        });
    }
    catch(ex){
        logger.error(ex);
        return res({
            msg: ex
        }).code(500);
    }
}




module.exports = {
  getGPSData,
  getGPSDataIMEI,
  getAllIMEIs
};
