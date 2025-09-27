const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    tgId: { type: String, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    language: { type: String },
    photoUrl: { type: String },
    isPremium: { type: Boolean },

    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    stats: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

userSchema.index({ tgId: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
