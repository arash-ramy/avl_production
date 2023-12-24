// const { DatabaseBackupCron } = require('./DatabaseBackupCron');
// const { DeviceStatusCron } = require('./SetDeviceStatusCron');
// const { DeviceMonthlyDistanceCron } = require('./calculateCurrentMonthDistanceOfVehicle');
const { DeviceCheckLastLocationDelayCron } = require('./sendSmsForDelayedVehicles')
console.log("comes until here 3")
class ServerCronJobs {
    static run() {
        console.log("servercronjobsssss")
        // DatabaseBackupCron.run();
        // DeviceStatusCron.run();
        // DeviceMonthlyDistanceCron.run();
        DeviceCheckLastLocationDelayCron.run();
    }
}

module.exports = ServerCronJobs;
