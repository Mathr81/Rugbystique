const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {});
      console.log("[database] => successfully connected");
      return mongoose.connection;
    } catch (error) {
      console.error("[database] => error while connecting :", error);
    }
  };