const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const menuSchema = new Schema(
  {
    _id: String,
    name: String,
    price: Number,
  },
  { timestamps: false, versionKey: false }
);

const MenuModel = mongoose.model("Menu", menuSchema, "menus");

module.exports = MenuModel;
