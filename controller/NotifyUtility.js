// const { SMSGW } = require('../utility/smsgw');
// const { homepage } = require('../package.json');

// const smsService = SMSGW();




//{config of GPS}
class NotifyUtility {

    // FN-1
    static setServerManual(simNumber, server, port, apn) {
        const message = apn
            ? `3641,A21,1,${server},${port},${apn},,`
            : `SERVER,1,${server},${port},0#`;
        return smsService.sendSmsToNumber(message, simNumber);
    }
    // FN-2
    static setServerAutomatic(simNumber, apn) {
        const port = apn ? 10002 : 10000;
        return NotifyUtility.setServerManual(simNumber, homepage, port, apn);
    }
    // FN-3
    static setSOSNumber(simNumber, sos) {
        const message = `3SOS,A,${sos},09128995907#`;
        return smsService.sendSmsToNumber(message, simNumber);
    }
    // FN-4
    static setAPN(simNumber, apnname, GT = false) {
        if (GT) {
            const message = `APN,${apnname}#`;
            return smsService.sendSmsToNumber(message, simNumber);
        }
        return NotifyUtility.setServerAutomatic(simNumber, apnname);
    }
    // FN-5
    static setInterval(simNumber, interval, GT = false) {
        const message = GT ? `TIMER,${interval}#` : `3641,A12,${interval},0`;
        return smsService.sendSmsToNumber(message, simNumber);
    }
    // FN-6
    static async resetDevice(simNumber, GT = false) {
        if (GT) {
            await smsService.sendSmsToNumber('3641, F01', simNumber);
            await smsService.sendSmsToNumber('3641, F02', simNumber);
        } else {
            await smsService.sendSmsToNumber('RESET#', simNumber);
        }
    }
    // FN-7
    static reconfigureDevice(simNumber) {
        const port = 10002;
        const apn = 'mtnirancell';
        return NotifyUtility.setServerManual(simNumber, homepage, port, apn);
    }
}

module.exports = { NotifyUtility };
