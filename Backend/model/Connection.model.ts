import mongoose, { Schema, Document, model } from "mongoose";

// Define the interface for the Connection document
export interface ConnectionDocument extends Document {
  userId: string;
  userConnection?: string[]; // Optional array of connected userIds
}

// Define the schema for the Connection model
const connectionSchema = new Schema<ConnectionDocument>(
  {
    userId: { type: String, required: true, unique: true },
    userConnection: { type: [String], default: [] }, // Array of userIds
  },
  { timestamps: true }
);

// Create or get the Connection model
const Connection = mongoose.models.Connection || model<ConnectionDocument>("Connection", connectionSchema);

export default Connection;
