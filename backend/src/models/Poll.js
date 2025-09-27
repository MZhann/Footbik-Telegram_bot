const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  id:       { type: String, required: true },         // Telegram user.id (строка)
  username: { type: String },                         // @tag (может отсутствовать/меняться)
  name:     { type: String },                         // "First Last"
  choice:   { type: String, enum: ["join", "decline", null], default: null },
  updatedAt:{ type: Date, default: Date.now }
}, { _id: false });

const PollSchema = new mongoose.Schema({
  chatId:    { type: String, required: true },
  messageId: { type: Number, required: true },        // message_id с опросом
  pollId:    { type: String, required: true, unique: true }, // sent.poll.id
  title:     { type: String, required: true },
  options:   [{ id: Number, text: String }],          // 0 -> join, 1 -> decline
  createdBy: {
    id:       { type: String, required: true },
    username: { type: String },
    name:     { type: String }
  },
  votes:     { type: [VoteSchema], default: [] },
  status:    { type: String, enum: ["ACTIVE", "CLOSED"], default: "ACTIVE", index: true },
  closedAt:  { type: Date },    
}, { timestamps: true });

PollSchema.index({ chatId: 1, messageId: 1 }, { unique: true });
PollSchema.index({ chatId: 1, createdAt: -1 }); 
PollSchema.index({ chatId: 1, status: 1, createdAt: -1 }); // fast latest-active lookups


PollSchema.pre("save", function(next) {
  if (this.closedAt && this.status !== "CLOSED") {
    this.status = "CLOSED";
  }
  next();
});

module.exports = mongoose.model("Poll", PollSchema);
