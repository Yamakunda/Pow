const ParkingCardRoutes = require("./parkingcard.route");

module.exports = (app) => {
  app.use("/card", ParkingCardRoutes);

};