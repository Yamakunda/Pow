const mongoose = require("mongoose");
const ParkingCardSchema = new mongoose.Schema({
  card_id:{
    type: String,
    required: true,
    unique: true,
  },
  name:{
    type: String,
    required: true,
    default: "Không có",
  },
  type: {
    type: String,
    required: true,
    default: "guest",
  },
  address:{
    type: String,
    required: true,
    defaut: "Không có",
  },
  member_start:{
    type: Date,
    required: true,
    default: Date.now(),
  },
  member_end:{
    type: Date,
    required: true,
    default: Date.now(),
  }
})
const ParkingCard = mongoose.model("Parking", ParkingCardSchema, "parkings");

module.exports = ParkingCard ;