const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB connection is successful");
});

connection.on("error", (error:any) => {
  console.log("Error in MongoDB connection", error);
});

module.exports = mongoose;
