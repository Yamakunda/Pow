const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    await mongoose.connect("mongodb+srv://sonnguyenyamakun:lz4fPhvy2eTgPuFp@pow.7sneh.mongodb.net/?retryWrites=true&w=majority&appName=Pow");
    console.log("Connect Success!");
  } catch (error) {
    console.log("Connect Error!");
  }
}