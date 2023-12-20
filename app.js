const dotenv=require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const controller =require("./controller/userController")
const cors = require('cors')
const morgan = require('morgan');
const net = require('net');

const app = express();
const chalk = require ('chalk');
var path = require("path");
const { headerAuth } = require("./utils/authHeader");
var http = require("http");
var cron = require('node-cron');
var shell = require('shelljs');



var http = require("http");
const { GT06Controller  } = require("./controller/GT06Controller");
const { FMXXXXController } = require("./controller/FMXXXXController");

shell.exec('node --version');

 require("./DB/DbConnection");


app.use(morgan(chalk` {hex('
#fff200
').bold :method} {hex('#f57a33').bold :url} {hex('#9dff00').bold  :status} {hex('#ff0000').bold :response-time ms }-  :res[content-length]  `, new Date().getDay));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
  }
  next();
});

app.use('/media',headerAuth,express.static(path.resolve('./public')));
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const UserRouter = require("./router/user");
const DeviceRouter = require("./router/device");
const DeviceGroupRouter = require("./router/deviceGroupe");
const GPSLocation = require("./router/gpslocation");
const something = require("./router/cronTest");
// ServerCronJobs.run()


app.use("/api/v1/user", UserRouter);
app.use("/api/v1/gpsdata", GPSLocation);
app.use("/api/v1/device", DeviceRouter);
app.use("/api/v1/devicegroup", DeviceGroupRouter);
app.use("/api/v1/testcron", something)

// create server
const server = app.listen(process.env.PORT, () => {
    console.log(
      `Server is running on http://localhost:${process.env.PORT}`
    );
  });





  const createServer = Controller => {
    const controller = new Controller();
    return net.createServer(socket => {
        socket.on('data', data => {
            console.log("socket on")
            controller.insertNewMessage(data, socket);
            console.log(data)
        });
        socket.on('error', error => console.log("something went wrong in app io"));
    });
};



createServer(GT06Controller).listen(10000);
createServer(FMXXXXController).listen(4000);
  
  // unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(` 🔥🔥🔥shutting down the server for unhandle promise rejection`);
  console.log(err)
    server.close(() => {
      process.exit(1);
    });
  });
  

      
// shell.echo('hello world');

// cron.schedule('*/3 * * * * *', () => {
//   console.log(new Date());
// });
// connect dbx