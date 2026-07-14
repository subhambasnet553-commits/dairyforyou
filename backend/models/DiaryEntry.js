const mongoose = require("mongoose");

const diaryEntrySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Entry can't be empty"],
      maxlength: [5000, "Entry is too long"],
    },
    // Calendar day this entry belongs to, e.g. "2026-07-13".
    // One entry per user per day.
    entryDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // createdAt is what we use to calculate the 30-day unlock
);

diaryEntrySchema.index({ author: 1, entryDate: 1 }, { unique: true });

const DEFAULT_UNLOCK_DAYS = 30;

// Whether this entry has passed its lock period yet.
// unlockDays comes from the AUTHOR's own preference (defaults to 30 if not given).
diaryEntrySchema.methods.isUnlocked = function (unlockDays = DEFAULT_UNLOCK_DAYS) {
  const unlockTime = this.createdAt.getTime() + unlockDays * 24 * 60 * 60 * 1000;
  return Date.now() >= unlockTime;
};

// How many days remain until this entry unlocks (0 if already unlocked)
diaryEntrySchema.methods.daysUntilUnlock = function (unlockDays = DEFAULT_UNLOCK_DAYS) {
  const unlockTime = this.createdAt.getTime() + unlockDays * 24 * 60 * 60 * 1000;
  const msLeft = unlockTime - Date.now();
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
};

module.exports = mongoose.model("DiaryEntry", diaryEntrySchema);
module.exports.DEFAULT_UNLOCK_DAYS = DEFAULT_UNLOCK_DAYS;
