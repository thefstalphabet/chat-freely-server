const mongoose = require("mongoose");
const { DB_URL } = require("../config");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};
module.exports = connectDB;
