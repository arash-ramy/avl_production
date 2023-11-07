// var proxy = require("node-tcp-proxy");
// var newProxy = proxy.createProxy(11002, "31.47.39.172", 11002);
// //   31.47.39.172
const express = require("express");

const app = express();

app.listen(11001, "31.47.39.172", (req,res) => {
  console.log("Listening on port ", 11002)
});











// var http = require("http");
// const { GT06Controller } = require("./controller/GT06Controller");
// var serverS = http.createServer(function (req,res){
//   console.log(req)
// })
// serverS.listen(11002,'31.47.39.172:11001' ,() => {
  
//   console.log("app runnign on 31.47.....");
// });




