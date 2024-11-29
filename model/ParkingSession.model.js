const mongoose = require("mongoose");

const ParkingSessionSchema = new mongoose.Schema({
  card_id: {
    type: String,
    required: true,
  },
  in: {
    type: Boolean,
    required: true,
    default: true,
  },
  time_in: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  time_out: {
    type: Date,
    required: true,
    default: Date.now()
  },
  cost: {
    type: Number,
    required: true,
    default: 0,
  },
  photo_path: {
    type: String,
    required: false,
  }
}, { timestamps: true });

const ParkingSession = mongoose.model("Session", ParkingSessionSchema, "sessions");

module.exports = ParkingSession;