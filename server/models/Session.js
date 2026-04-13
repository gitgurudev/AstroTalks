// File: server/models/Session.js
import mongoose from 'mongoose';

// Each individual message in a conversation
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }   // gives each message its own createdAt
);

// A session = one full conversation thread linked to a user
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
