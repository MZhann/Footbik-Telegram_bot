// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    tgId: { type: String, required: true, unique: true }, // user.id
    username: { type: String }, // @tag (может меняться/отсутствовать)
    firstName: { type: String },
    lastName: { type: String },
    language: { type: String }, // language_code
    photoUrl: { type: String }, // виджет дает photo_url; иначе храни свой CDN-URL
    isPremium: { type: Boolean }, // если получаешь это поле
    // твои данные приложения:
    roles: [{ type: String, default: "user" }],
    stats: {
      goals: { type: Number, default: 0 },
      games: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Helpful unique index
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
