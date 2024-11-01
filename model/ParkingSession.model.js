const mongoose = require("mongoose");
const ParkingSessionSchema = new mongoose.Schema({
  card_id:{
    type: String,
    required: true,
  },
  time_in:{
    type: Date,
    required: true,
    default: Date.now,
  },
  time_out:{
    type: Date,
    required: true,
    default: Date.now,
  },
  cost:{
    type: Number,
    required: true,
    default: 0,
  },
})
const ParkingSession = mongoose.model("Session", ParkingSessionSchema, "sessions");

module.exports = ParkingSession ;