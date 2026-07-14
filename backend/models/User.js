const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    pairCode: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls before a code is generated
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    pairedAt: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      default: "",
      maxlength: [280, "Bio is too long"],
    },
    profilePicture: {
      type: String, // base64 data URL or an image link — kept simple, no file storage needed
      default: "",
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
    preferences: {
      notifyOnEntry: { type: Boolean, default: true },
      notifyOnPlan: { type: Boolean, default: true },
      reminderDays: { type: Number, default: 3 }, // remind me if I haven't written in X days
      theme: { type: String, enum: ["pink", "purple", "blue"], default: "pink" },
      unlockDays: { type: Number, default: 30, min: 1, max: 365 }, // how long MY entries stay locked
    },
  },
  { timestamps: true }
);

// Hash the password before saving, but only if it changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare a plaintext password against the stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never send the password hash back in API responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
