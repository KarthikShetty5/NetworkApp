import mongoose, { Document, Schema, model } from "mongoose";

export interface ProfileDocument extends Document {
  userId: string;
  name?: string;
  instagram?: string; // Optional field
  imageUrl?: string; // Optional field
  phone?: string; // Optional field
  email?: string; // Optional field
  password?: string; //
  location: {
    longitude: number;
    latitude: number;
  };
}

const profileSchema = new Schema<ProfileDocument>(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    instagram: { type: String, trim: true, default: null },
    imageUrl: { type: String, required:false },
    password: { type: String, required:false},
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[0-9]{10,15}$/.test(v); // Validates international phone numbers
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email validation
        },
        message: (props: any) => `${props.value} is not a valid email address!`,
      },
      default: null,
    },
    location: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
  },
  {
    timestamps: true, 
  }
);

const Profile =
  mongoose.models.Profile || model<ProfileDocument>("Profile", profileSchema);

export default Profile;
