const User = require("../models/User");

function generateCode() {
  // 6-character code, easy to read/share, e.g. "K3F9QZ"
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/pair/my-code — returns (and creates if needed) this user's share code
exports.getMyCode = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.partner) {
      const partner = await User.findById(user.partner);
      return res.status(200).json({
        paired: true,
        partner: { firstName: partner.firstName, lastName: partner.lastName },
        pairedAt: user.pairedAt,
      });
    }

    if (!user.pairCode) {
      // Keep generating until we get one that isn't already taken
      let code;
      let exists = true;
      while (exists) {
        code = generateCode();
        exists = await User.findOne({ pairCode: code });
      }
      user.pairCode = code;
      await user.save();
    }

    res.status(200).json({ paired: false, pairCode: user.pairCode });
  } catch (err) {
    console.error("getMyCode error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// POST /api/pair/connect  { code }
exports.pairWithCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Enter your partner's code." });

    const me = await User.findById(req.userId);
    if (me.partner) {
      return res.status(400).json({ message: "You're already paired with someone." });
    }

    const partner = await User.findOne({ pairCode: code.toUpperCase().trim() });
    if (!partner) {
      return res.status(404).json({ message: "That code doesn't match anyone. Double check it." });
    }
    if (partner._id.equals(me._id)) {
      return res.status(400).json({ message: "You can't pair with yourself." });
    }
    if (partner.partner) {
      return res.status(400).json({ message: "That person is already paired with someone else." });
    }

    const now = new Date();
    me.partner = partner._id;
    me.pairedAt = now;
    partner.partner = me._id;
    partner.pairedAt = now;

    await me.save();
    await partner.save();

    res.status(200).json({
      message: `You're paired with ${partner.firstName} now 💌`,
      partner: { firstName: partner.firstName, lastName: partner.lastName },
    });
  } catch (err) {
    console.error("pairWithCode error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
