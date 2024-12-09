const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://abhishekdrai85:Abhishek29@cluster0.4kjtl.mongodb.net/network?retryWrites=true&w=majority&appName=Cluster0");

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB connection is successful");
});

connection.on("error", (error:any) => {
  console.log("Error in MongoDB connection", error);
});

module.exports = mongoose;
