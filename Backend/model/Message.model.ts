import mongoose, { Document, Schema, model } from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // userId of the sender
  receiver: { type: String, required: true }, // userId of the receiver
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);
