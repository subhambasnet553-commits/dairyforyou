const User = require("../models/User");
const DiaryEntry = require("../models/DiaryEntry");

function todayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// POST /api/diary/entries  { content }
exports.writeEntry = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Write something first." });
    }

    const entryDate = todayString();

    const existing = await DiaryEntry.findOne({ author: req.userId, entryDate });
    if (existing) {
      return res.status(409).json({ message: "You've already written today's entry." });
    }

    const entry = await DiaryEntry.create({
      author: req.userId,
      content: content.trim(),
      entryDate,
    });

    res.status(201).json({ message: "Entry saved.", entry });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You've already written today's entry." });
    }
    console.error("writeEntry error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/diary/mine — all of your own entries, always fully visible to you
exports.getMyEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ author: req.userId }).sort({ entryDate: -1 });
    const wroteToday = entries.some((e) => e.entryDate === todayString());

    res.status(200).json({
      wroteToday,
      entries: entries.map((e) => ({
        id: e._id,
        content: e.content,
        entryDate: e.entryDate,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    console.error("getMyEntries error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/diary/partner — partner's entries; locked ones show without content
exports.getPartnerEntries = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You're not paired with anyone yet." });
    }

    const entries = await DiaryEntry.find({ author: me.partner }).sort({ entryDate: -1 });
    const partnerUser = await User.findById(me.partner);
    const unlockDays = partnerUser?.preferences?.unlockDays || DiaryEntry.DEFAULT_UNLOCK_DAYS;

    const result = entries.map((e) => {
      const unlocked = e.isUnlocked(unlockDays);
      return {
        id: e._id,
        entryDate: e.entryDate,
        unlocked,
        content: unlocked ? e.content : null,
        daysUntilUnlock: unlocked ? 0 : e.daysUntilUnlock(unlockDays),
      };
    });

    res.status(200).json({ entries: result });
  } catch (err) {
    console.error("getPartnerEntries error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
