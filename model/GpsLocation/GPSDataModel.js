const mongoose = require('mongoose');

const VehicleModel = require('./VehicleModel');
// const { logger } = require('../../utility/customlog');

const { Schema } = mongoose;

const GPSSchema = new Schema({
    protocolId: { type: String },
    vehicleId: {
        type: Schema.ObjectId,
        ref: 'vehicle',
    },
    deviceName: { type: String },
    date: { type: Date },
    IMEI: { type: String },
    type: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    speed: { type: Number },
    sat: { type: Number },
    fuelConnection: { type: String },
    GPSTracking: { type: String },
    alarm: { type: String },
    voltage: { type: String },
    signalStrength: { type: String },
    url: { type: String },
    address: { type: String },
    raw: { type: Buffer },
});

GPSSchema.index({ vehicleId: 1 });

GPSSchema.post('save', async gpsData => {
    try{
    const vehicle = await VehicleModel.findOne({
        deviceIMEI: gpsData.IMEI,
    }).populate("lastLocation")




    // console.log(vehicle,"yydydyydydydy")

    // console.log(vehicle.lastLocation,"22222")
    // console.log(gpsData.id,"gpsData.id")


    if (vehicle) {
        vehicle.lastLocation = gpsData.id;
        vehicle.gpsDataCount = await mongoose.model('gpsdata').countDocuments({
            IMEI: gpsData.IMEI,
        });
        await vehicle.save();
        // console.log(vehicle,"ddd")
    } 

}
catch(error){
    console.log(error)
}
});

const GPSDataModel = mongoose.model('gpsdata', GPSSchema);

module.exports = GPSDataModel;
