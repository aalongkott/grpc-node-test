const PROTO_PATH = "./restaurant.proto";

var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

const mongoose = require("mongoose");
const Menu = require("../models/menu.js");
require("dotenv").config();

mongoose.connect(process.env.DB_URL);

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error", err);
});

mongoose.connection.once("open", () => console.log("Connected to Database"));

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

const { v4: uuidv4 } = require("uuid");
var restaurantProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(restaurantProto.RestaurantService.service, {
  getAllMenu: async (_, callback) => {
    const menu = await Menu.find({});
    callback(null, { menu });
  },
  get: async (call, callback) => {
    const menuItem = await Menu.findById(call.request.id);

    if (menuItem) {
      callback(null, menuItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: async (call, callback) => {
    const requestBody = call.request;
    const menu = new Menu({
      _id: uuidv4(),
      name: requestBody.name,
      price: requestBody.price,
    });
    await menu.save();

    callback(null, menu);
  },
  update: async (call, callback) => {
    const requestBody = call.request;

    const updatedMenu = await Menu.findByIdAndUpdate(call.request.id, {
      $set: requestBody,
    });

    updatedMenu.name = requestBody.name;
    updatedMenu.price = requestBody.price;

    if (updatedMenu) {
      callback(null, updatedMenu);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  },
  remove: async (call, callback) => {
    const removedMenu = await Menu.findByIdAndDelete(call.request.id);
    if (removedMenu) {
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

server.bind("127.0.0.1:30043", grpc.ServerCredentials.createInsecure());
console.log("Server running at http://127.0.0.1:30043");
server.start();
