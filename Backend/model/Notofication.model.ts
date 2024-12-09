import mongoose, { Document, Schema, model } from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  connectId: { type: String, required: true }, 
  message: { type: String, required: true },
  viewed: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
