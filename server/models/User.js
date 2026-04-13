// File: server/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: String,      // stored as "DD/MM/YYYY" string exactly as user typed
      required: true,
    },
    sunSign: {
      type: String,      // e.g. "Capricorn (Makar Rashi)"
      required: true,
    },
    nakshatra: {
      type: String,      // e.g. "Uttara Ashadha"
      default: 'Unknown',
    },
  },
  { timestamps: true }   // adds createdAt, updatedAt automatically
);

export default mongoose.model('User', userSchema);
