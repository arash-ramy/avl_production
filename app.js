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

// Swagger setup
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "Your API Description",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./router/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // app.use(bodyParser.json({limit: "150mb" }));
  app.use(express.json({limit: "150mb" }));
  // app.use(bodyParser.urlencoded({ extended: true ,limit: "150mb"}));
  app.use(express.urlencoded({ extended: true, limit: "150mb" }));
  const { GT06Controller  } = require("./controller/GT06Controller");
  const { FMXXXXController } = require("./controller/FMXXXXController");
  const { MVT380Controller  } = require("./controller/MVT380Controller");

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
  const UserRouter = require("./router/user");
  const DeviceRouter = require("./router/device");
  const DeviceGroupRouter = require("./router/deviceGroupe");
  const GPSLocation = require("./router/gpslocation");
  // const testCron = require("./router/cronTest");

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection 🔥🔥🔥 :', promise, 'reason:', reason);
    // Log the error or perform cleanup
  });
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception 💥💥🚀:', error);
    // Log the error or perform cleanup
  });


  app.use('/media',headerAuth,express.static(path.resolve('./public')));
  app.use("/api/v1/user", UserRouter);
  app.use("/api/v1/gpsdata", GPSLocation);
  app.use("/api/v1/device", DeviceRouter);
  app.use("/api/v1/devicegroup", DeviceGroupRouter);
  // app.use("/api/v1/crontest", testCron);
  app.on('error', (err) => {
    console.error('Express App Error:', err);
    // Log the error or perform cleanup
  });
  app.use('*', (req, res) => res.json({message:'Not Found',code:404}))

    
  app.use((err, req, res, next) => {
    console.error(err.stack);


    res.json({errors:err,message:"somehting went wrong please chech them ." });
  });

  
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
  createServer(MVT380Controller).listen(11000);
  createServer(FMXXXXController).listen(11002);
  createServer(FMXXXXController).listen(11003);
  createServer(FMXXXXController).listen(11004);
  createServer(FMXXXXController).listen(11005);
  createServer(FMXXXXController).listen(11006);

  createServer(GT06Controller).listen(12000);
  createServer(MVT380Controller).listen(13000);
  createServer(FMXXXXController).listen(18000);

  createServer(FMXXXXController).listen(4000);



