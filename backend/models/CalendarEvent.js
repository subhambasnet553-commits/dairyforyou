const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    // Both partners can see every event on the shared calendar
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["birthday", "anniversary", "special", "plan"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Give this event a title"],
      maxlength: 100,
    },
    date: {
      type: Date,
      required: true,
    },
    // Only "plan" events need approval — everything else is added straight to the calendar
    status: {
      type: String,
      enum: ["confirmed", "pending", "declined"],
      default: "confirmed",
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
