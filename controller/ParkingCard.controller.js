const ParkingCard = require("../model/ParkingCard.model");
const ParkingSession = require("../model/ParkingSession.model");
const NodeWebcam = require('node-webcam');
const path = require('path');
const fs = require('fs');

const webcamOptions = {
  width: 1280,
  height: 720,
  quality: 100,
  delay: 0,
  saveShots: true,
  output: "jpeg",
  device: false,
  callbackReturn: "location"
};

const Webcam = NodeWebcam.create(webcamOptions);

// Function to capture photo
const capturePhoto = (cardId, action) => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // const photoDir = path.join(__dirname, '../photos');
    const photoDir = './photos';
    
    if (!fs.existsSync(photoDir)){
      fs.mkdirSync(photoDir);
    }

    const photoPath = path.join(photoDir, `${cardId}_${action}_${timestamp}.jpg`);
    
    Webcam.capture(photoPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
// Create a new parking card
module.exports.createParkingCard = async (req, res) => {
  try {
    // const { card_id, name, type, address, member_start, member_end } = req.body;
    const newCard = new ParkingCard(req.body);
    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Get all parking cards
module.exports.getParkingCards = async (req, res) => {
  try {
    const cards = await ParkingCard.find({type: "member"});
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get a single parking card by ID
module.exports.getParkingCardById = async (req, res) => {
  try {
    const card = await ParkingCard.find({ card_id: req.params.id });
    if (!card) return res.status(404).json({ message: "Parking card not found" });
    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a parking card by ID
module.exports.updateParkingCard = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCard = await ParkingCard.findOneAndUpdate({ card_id: id }, req.body)
    if (!updatedCard) return res.status(404).json({ message: "Parking card not found" });
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Delete a parking card by ID
// module.exports.deleteParkingCard = async (req, res) => {
//   try {
//     const deletedCard = await ParkingCard.find({ card_id: req.params.id }).deleteOne();
//     if (!deletedCard) return res.status(404).json({ message: "Parking card not found" });
//     res.status(200).json({ message: "Parking card deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
module.exports.deleteParkingCard = async (req, res) => {
  try {
    const deletedCard = await ParkingCard.findOne({ card_id: req.params.id });
    if (!deletedCard) return res.status(404).json({ message: "Parking card not found" });
    deletedCard.name = "Không có";
    deletedCard.type = "guest";
    deletedCard.address = "Không có";
    deletedCard.member_start = new Date();
    deletedCard.member_end = new Date();
    await deletedCard.save();
    res.status(200).json({ message: "Member deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports.getParkingCardSessions = async (req, res) => {
  try {
    // const sessions = await ParkingSession.find().sort({ createdAt: -1 }).limit(5);
    const sessions = await ParkingSession.find().sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports.parkIn = async (req, res) => {
  try {
    const card = await ParkingCard.findOne({ card_id: req.body.card_id });
    if (!card) return res.status(404).json({ message: "Parking card not found" });
    const session = await ParkingSession.create({ 
      card_id: card.card_id,
      in: true,
      time_in: new Date(),
      time_out: new Date()
    });
    session.save();
    res.status(200).json({ message: `Card ${card.card_id} parked in` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports.parkOut = async (req, res) => {
  try {
    const card = await ParkingCard.findOne({ card_id: req.body.card_id });
    if (!card) return res.status(404).json({ message: "Parking card not found" });

    const lastSession = await ParkingSession.findOne({ card_id: card.card_id, in: true }).sort({ time_in: -1 });
    if (!lastSession) return res.status(404).json({ message: "Parking card not parked in" });

    const timeOut = new Date();
    // Calculate cost
    let cost = 0;
    if (card.type =="member" && timeOut >= card.member_start && timeOut <= card.member_end) {
      cost = 0;
    } else {
      const durationInMinutes = (timeOut - lastSession.time_in) / (1000 * 60);
      cost = Math.max(Math.round((durationInMinutes / 60) * 5000 / 1000) * 1000, 1000);
    }

    // Create a new parking session
    const newSession = new ParkingSession({
      card_id: card.card_id,
      in: false,
      time_in: lastSession.time_in,
      time_out: timeOut,
      cost: cost
    });
    await newSession.save();

    res.status(200).json({ message: `Card ${card.card_id} parked out`,cost: cost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.parkInOut = async (req, res) => {
  try {
    let card = await ParkingCard.findOne({ card_id: req.body.card_id });
    if (!card) {
      await ParkingCard.create({ card_id: req.body.card_id });
      card = await ParkingCard.findOne({ card_id: req.body.card_id });
    }

    const lastSession = await ParkingSession.findOne({ card_id: card.card_id }).sort({ createdAt: -1 });

    if (!lastSession || !lastSession.in) {
      // Perform park in
      const photoPath = await capturePhoto(card.card_id, 'in');
      
      const newSession = new ParkingSession({
        card_id: card.card_id,
        in: true,
        time_in: new Date(),
        time_out: new Date(),
        photo_path: photoPath
      });
      await newSession.save();

      res.status(200).json({ message: `Card ${card.card_id} parked in`, photo: photoPath });
    } else {
      // Perform park out
      const timeOut = new Date();
      let cost = 0;
      if (card.type == "member" && timeOut >= card.member_start && timeOut <= card.member_end) {
        cost = 0;
      } else {
        const durationInMinutes = (timeOut - lastSession.time_in) / (1000 * 60);
        cost = Math.max(Math.round((durationInMinutes / 60) * 5000 / 1000) * 1000, 1000);
      }

      const photoPath = await capturePhoto(card.card_id, 'out');

      const newSession = new ParkingSession({
        card_id: card.card_id,
        in: false,
        time_in: lastSession.time_in,
        time_out: timeOut,
        cost: cost,
        photo_path: photoPath
      });
      await newSession.save();

      res.status(200).json({ message: `Card ${card.card_id} parked out`, cost: cost, photo: photoPath });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.getLastSession = async (req, res) => {
  try {
    const session = await ParkingSession.findOne().sort({ createdAt: -1 }).limit(1);
    if (!session) return res.status(404).json({ message: "Parking session not found" });
    var inout = false;
    console.log(session);
    if (session.in == false) {
      var outsessions = await ParkingSession.findOne({ card_id: session.card_id, in: true }).sort({ createdAt: -1 }).limit(1);
      inout = true;
    }
    res.status(200).json({inout: inout, session: session , outsessions: outsessions });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}