console.log("indexjs")
// const DeviceCronJobs = require('./DeviceCronJobs').CronJob();
const ServerCronJobs = require('./ServerCronJobs');
console.log("comes until here 2")


const something = async () => {
    ServerCronJobs.run()
}


module.exports = {
    // DeviceCronJobs,
    something,
};
