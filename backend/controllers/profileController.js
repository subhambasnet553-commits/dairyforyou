const User = require("../models/User");

// GET /api/profile/me
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// PUT /api/profile  { bio, profilePicture, skip }
// "skip" just marks onboarding done without requiring bio/picture
exports.updateProfile = async (req, res) => {
  try {
    const { bio, profilePicture } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (bio !== undefined) user.bio = bio.slice(0, 280);
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    user.onboarded = true;

    await user.save();
    res.status(200).json({ message: "Profile updated.", user });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// PUT /api/profile/password  { currentPassword, newPassword }
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Fill in both password fields." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.userId);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword; // pre-save hook re-hashes this
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// PUT /api/profile/email  { newEmail, currentPassword }
exports.changeEmail = async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;
    if (!newEmail || !currentPassword) {
      return res.status(400).json({ message: "Fill in your new email and current password." });
    }

    const user = await User.findById(req.userId);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const existing = await User.findOne({ email: newEmail.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "That email is already in use." });
    }

    user.email = newEmail.toLowerCase();
    await user.save();

    res.status(200).json({ message: "Email updated.", user });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Please enter a valid email." });
    }
    console.error("changeEmail error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// PUT /api/profile/preferences  { notifyOnEntry, notifyOnPlan, reminderDays, theme, unlockDays }
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { notifyOnEntry, notifyOnPlan, reminderDays, theme, unlockDays } = req.body;

    if (notifyOnEntry !== undefined) user.preferences.notifyOnEntry = notifyOnEntry;
    if (notifyOnPlan !== undefined) user.preferences.notifyOnPlan = notifyOnPlan;
    if (reminderDays !== undefined) user.preferences.reminderDays = reminderDays;
    if (theme !== undefined) user.preferences.theme = theme;
    if (unlockDays !== undefined) user.preferences.unlockDays = Math.min(365, Math.max(1, unlockDays));

    await user.save();
    res.status(200).json({ message: "Preferences saved.", user });
  } catch (err) {
    console.error("updatePreferences error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// POST /api/profile/unpair — breaks the pairing for both accounts (data stays intact)
exports.unpair = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You're not paired with anyone." });
    }

    const partner = await User.findById(me.partner);
    me.partner = null;
    me.pairedAt = null;
    me.pairCode = null; // force a fresh code next time
    await me.save();

    if (partner) {
      partner.partner = null;
      partner.pairedAt = null;
      partner.pairCode = null;
      await partner.save();
    }

    res.status(200).json({ message: "You've been unpaired." });
  } catch (err) {
    console.error("unpair error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// DELETE /api/profile  { currentPassword }
exports.deleteAccount = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ message: "Enter your password to confirm deletion." });
    }

    const user = await User.findById(req.userId);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is incorrect." });
    }

    // Unpair partner first so they aren't left pointing at a deleted account
    if (user.partner) {
      await User.findByIdAndUpdate(user.partner, { partner: null, pairedAt: null, pairCode: null });
    }

    await User.findByIdAndDelete(req.userId);
    res.status(200).json({ message: "Account deleted." });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/profile/summary — relationship summary for the Profile panel
exports.getSummary = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(200).json({ paired: false });
    }
    const partner = await User.findById(me.partner);

    res.status(200).json({
      paired: true,
      pairedAt: me.pairedAt,
      me: { firstName: me.firstName, lastName: me.lastName, bio: me.bio, profilePicture: me.profilePicture },
      partner: {
        firstName: partner.firstName,
        lastName: partner.lastName,
        bio: partner.bio,
        profilePicture: partner.profilePicture,
      },
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/profile/stats — writing streaks and totals
exports.getStats = async (req, res) => {
  try {
    const DiaryEntry = require("../models/DiaryEntry");
    const CalendarEvent = require("../models/CalendarEvent");

    const me = await User.findById(req.userId);
    const myEntries = await DiaryEntry.find({ author: req.userId }).sort({ entryDate: -1 });

    // Streak: count consecutive days ending today (or yesterday, so missing "today" doesn't zero it out)
    let streak = 0;
    if (myEntries.length > 0) {
      const dateSet = new Set(myEntries.map((e) => e.entryDate));
      let cursor = new Date();
      // if today has no entry yet, start counting from yesterday instead
      if (!dateSet.has(cursor.toISOString().slice(0, 10))) {
        cursor.setDate(cursor.getDate() - 1);
      }
      while (dateSet.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    let totalPlans = 0;
    let confirmedPlans = 0;
    if (me.partner) {
      const events = await CalendarEvent.find({
        $or: [
          { owner: req.userId, partner: me.partner },
          { owner: me.partner, partner: req.userId },
        ],
        type: "plan",
      });
      totalPlans = events.length;
      confirmedPlans = events.filter((e) => e.status === "confirmed").length;
    }

    res.status(200).json({
      writingStreak: streak,
      totalEntries: myEntries.length,
      totalPlans,
      confirmedPlans,
      memberSince: me.createdAt,
    });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
