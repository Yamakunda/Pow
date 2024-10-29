const express = require("express");
const controller = require("../controller/ParkingCard.controller");
const router = express.Router();

router.get("/", controller.getParkingCards);
router.get("/:id", controller.getParkingCardById);
router.post("/", controller.createParkingCard);
router.put("/", controller.updateParkingCard);
router.delete("/", controller.deleteParkingCard);
router.post("/parkin", controller.parkIn);
router.post("/parkout", controller.parkOut);

module.exports = router;