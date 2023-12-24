/* eslint-disable */
const request = require('request');

function SMSService() {
    // for send sms
    console.log("this is SMS RAMY")
    const smsServiceInfo = {
        username: 'AVL',
        password:'AVL123456',
        numbers: ['2184402'],
        endPoint: 'https://rest.payamak-panel.com/api/SendSMS/SendSMS',
    };

    // for receive sms
    const smsReceiveInfo = {
        username: 'AVL',
        password:'AVL123456',
        location: 1,
        index: 0,
        count: 1,
        endPoint: 'https://rest.payamak-panel.com/api/SendSMS/GetMessages',
    };

    // for sms status
    const smsStatus = {
        username: 'AVL',
        password:'AVL123456',
        endPoint: 'https://rest.payamak-panel.com/api/SendSMS/GetDeliveries2',
    }

    async function sendSmsToNumber(message, receivers, checkStatus = true) {
        const { username, password, numbers, endPoint } = smsServiceInfo;
console.log(smsServiceInfo,"cestramyyyyyy")
        let options = {
            url: endPoint,
            form: {
                username,
                password,
                from: numbers[0],
                to: Array.isArray(receivers) ? receivers.join(',') : receivers,
                text: message,
                isFlash: false,
            },
            timeout: 10000
        };
        console.log("comes in sms ramy***55")
        console.log(options,"cestoptions")

        return new Promise((resolve, reject) => {
            request.post(options, async function (err, res) {
                if (err) {
                    console.log("kkkkkkkkkkkkkkkkkkk")
                    resolve('پیام ارسال نشد')
                } else if (checkStatus === true) {
                    let body = JSON.parse(res.body);
                    let recID = body.Value;
                    console.log(recID,"jjjjjjj")
                    console.log(receivers,"pppppppppppp")

                    setTimeout(()=>{resolve(SMSStatus(recID, receivers))}, 10000);
                } else {
                    console.log("2222222222222222")

                    resolve()
                }
            });
        })
    }

    async function SMSStatus(recID, simNumber) {
        console.log("comes in sms status ")
        const { username, password, endPoint } = smsStatus;
        let options = {
            url: endPoint,
            form: {
                username,
                password,
                recID: recID
            }
        };
        console.log(options,"options5555")

        return new Promise((resolve, reject) => {
             request.post(options, async function (err, res) {
                 if (err) {
                    console.log("f111111111111")

                     reject()
                 } else {
                    console.log("f22222222222")

                     let body = JSON.parse(res.body)
                     console.log(body,"body")

                     let value = body.Value
                     console.log(value,"value987456")

                     if (["1", "8"].includes(value)) {
                        console.log("f333333333333")

                        //  setTimeout(()=>{resolve(ReceiveSMSFromNumber(simNumber))}, 10000);
                     } else {
                        console.log(err,"f444444444444")

                         resolve("مشکلی در دلیور شدن پیام وجود دارد")
                     }
                 }
             });
        })
    }

    async function ReceiveSMSFromNumber(simNumber) {
        const { username, password, location, index, count, endPoint } = smsReceiveInfo;
        let options = {
            url: endPoint,
            form: {
                username,
                password,
                location,
                from: "",
                index,
                count,
            }
        };

        return new Promise((resolve, reject) => {
            request.post(options, async function (err, res) {
                if (err) {
                    reject()
                } else {
                    let response = JSON.parse(res.body)
                    let sender = response.Data[0].Sender
                    if (simNumber.includes(sender)) {
                        let data = response.Data[0].Body
                        resolve(data)

                    } else {
                        resolve("لطفا بعدا مجددا تلاش نمایید")
                    }
                }
            });
        })
    }

    
    return { sendSmsToNumber };
}

module.exports = { SMSGW: SMSService };
