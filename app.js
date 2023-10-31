const dotenv=require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const controller =require("./controller/userController")
const cors = require('cors')
const app = express();
// process.on("uncaughtException", (err) => {
//     console.log("UNCAUGHT EXCEPTION! 💥💥🚀 Shutting down ...");
//     console.log(err.name, err.message);
//     process.exit(1);
//   });
  
// connect db
const connectDatabase = require("./DB/DbConnection");
connectDatabase();


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

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const UserRouter = require("./router/user");

// authorization
// app.use(function(req, res, next) {
//   // res.setHeader('authorization',SetHeaderss )
//   next();
// });


app.use("/api/v1/user", UserRouter);


app.use(function (req, res, next) {
  console.log(req.headers,"this is headers sec time")

  // res.header('authorization', req.headers;
  // res.json(props);
  // req.props = props;
  next();
});

// create server
const server = app.listen(process.env.PORT, () => {
    console.log(
      `Server is running on http://localhost:${process.env.PORT}`
    );
  });
  
  // unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`shutting down the server for unhandle promise rejection`);
  
    server.close(() => {
      process.exit(1);
    });
  });