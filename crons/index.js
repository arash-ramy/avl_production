// console.log("indexjs")
// const DeviceCronJobs = require('./DeviceCronJobs').CronJob();
const ServerCronJobs = require('./ServerCronJobs');
const DeviceCronJobs = require('./DeviceCronJobs').CronJob;

// console.log("comes until here 2")


const something = async () => {
    ServerCronJobs.run()
    DeviceCronJobs()
}


module.exports = {
    // DeviceCronJobs,
    something,
};
