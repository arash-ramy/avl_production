// console.log("indexjs")
// const DeviceCronJobs = require('./DeviceCronJobs').CronJob();
const ServerCronJobs = require('./ServerCronJobs');
const DeviceCronJobs = require('./DeviceCronJobs').CronJob;

// console.log("comes until here 2")


const scheduleCron = async () => {
    console.log("this runnnnnnn 852147896")
    ServerCronJobs.run()
    DeviceCronJobs()
}


module.exports = {
    DeviceCronJobs,
    scheduleCron,
};
