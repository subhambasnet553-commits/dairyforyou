const User = require("../models/User");
const CalendarEvent = require("../models/CalendarEvent");

// POST /api/calendar/events  { type, title, date }
exports.createEvent = async (req, res) => {
  try {
    const { type, title, date } = req.body;

    if (!type || !title || !date) {
      return res.status(400).json({ message: "Type, title, and date are all required." });
    }
    if (!["birthday", "anniversary", "special", "plan"].includes(type)) {
      return res.status(400).json({ message: "Not a valid event type." });
    }

    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You need to pair with someone first." });
    }

    const event = await CalendarEvent.create({
      owner: me._id,
      partner: me.partner,
      type,
      title: title.trim(),
      date,
      status: type === "plan" ? "pending" : "confirmed",
      proposedBy: me._id,
    });

    res.status(201).json({ message: "Added to your calendar.", event });
  } catch (err) {
    console.error("createEvent error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/calendar/events — every event either partner added
exports.listEvents = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You need to pair with someone first." });
    }

    const events = await CalendarEvent.find({
      $or: [
        { owner: me._id, partner: me.partner },
        { owner: me.partner, partner: me._id },
      ],
    }).sort({ date: 1 });

    res.status(200).json({
      events: events.map((e) => ({
        id: e._id,
        type: e.type,
        title: e.title,
        date: e.date,
        status: e.status,
        proposedByMe: e.proposedBy.equals(me._id),
      })),
    });
  } catch (err) {
    console.error("listEvents error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// POST /api/calendar/events/:id/respond  { action: "accept" | "decline" }
exports.respondToPlan = async (req, res) => {
  try {
    const { action } = req.body;
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action." });
    }

    const event = await CalendarEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Plan not found." });

    if (event.proposedBy.equals(req.userId)) {
      return res.status(400).json({ message: "You can't respond to your own plan." });
    }
    if (event.type !== "plan") {
      return res.status(400).json({ message: "Only plans need a response." });
    }

    event.status = action === "accept" ? "confirmed" : "declined";
    await event.save();

    res.status(200).json({ message: `Plan ${event.status}.`, event });
  } catch (err) {
    console.error("respondToPlan error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
