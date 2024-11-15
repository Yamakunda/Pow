const ParkingCard = require("../model/ParkingCard.model");
const ParkingSession = require("../model/ParkingSession.model");
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
    const cards = await ParkingCard.find();
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get a single parking card by ID
module.exports.getParkingCardById = async (req, res) => {
  try {
    const card = await ParkingCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Parking card not found" });
    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a parking card by ID
module.exports.updateParkingCard = async (req, res) => {
  try {
    const updatedCard = await ParkingCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCard) return res.status(404).json({ message: "Parking card not found" });
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Delete a parking card by ID
module.exports.deleteParkingCard = async (req, res) => {
  try {
    const deletedCard = await ParkingCard.findByIdAndDelete(req.params.id);
    if (!deletedCard) return res.status(404).json({ message: "Parking card not found" });
    res.status(200).json({ message: "Parking card deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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

    res.status(200).json({ message: `Card ${card.card_id} parked out`, cost: cost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.parkInOut = async (req, res) => {
  try {
    const card = await ParkingCard.findOne({ card_id: req.body.card_id });
    if (!card) return res.status(404).json({ message: "Parking card not found" });

    const lastSession = await ParkingSession.findOne({ card_id: card.card_id }).sort({ createdAt: -1 });

    if (!lastSession || !lastSession.in) {
      // Perform park in
      const newSession = new ParkingSession({
        card_id: card.card_id,
        in: true,
        time_in: new Date(),
        time_out: new Date()
      });
      await newSession.save();

      res.status(200).json({ message: `Card ${card.card_id} parked in` });
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

      const newSession = new ParkingSession({
        card_id: card.card_id,
        in: false,
        time_in: lastSession.time_in,
        time_out: timeOut,
        cost: cost
      });
      await newSession.save();

      res.status(200).json({ message: `Card ${card.card_id} parked out`, cost: cost });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
