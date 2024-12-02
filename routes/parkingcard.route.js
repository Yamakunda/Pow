const express = require("express");
const controller = require("../controller/ParkingCard.controller");
const router = express.Router();

router.get("/session", controller.getParkingCardSessions);
router.get("/last", controller.getLastSession);
router.get("/", controller.getParkingCards);
router.get("/:id", controller.getParkingCardById);
router.post("/", controller.createParkingCard);
router.put("/:id", controller.updateParkingCard);
router.delete("/:id", controller.deleteParkingCard);
router.post("/parkin", controller.parkIn);
router.post("/parkout", controller.parkOut);
router.post("/parkinout", controller.parkInOut);
module.exports = router;