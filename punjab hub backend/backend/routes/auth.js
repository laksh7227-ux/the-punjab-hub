import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/user.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function getSecret() {
  return process.env.JWT_SECRET || "punjabhub_ai_secure_jwt_secret_2026_fallback";
}

function createToken(user) {
  const userId = user._id?.toString?.() || user.id || user._id;
  return jwt.sign(
    { id: userId },
    getSecret(),
    { expiresIn: "7d" }
  );
}

function safeUser(user) {
  if (!user) return null;
  const userId = user._id?.toString?.() || user.id || user._id;
  return {
    id: userId,
    _id: userId,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan || "free"
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "user", plan = "free" } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return res.status(400).json({
        message: "Name must be between 2 and 80 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters."
      });
    }

    // Never allow public registration as an administrator.
    if (!["user", "manufacturer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account role. Allowed roles: user, manufacturer."
      });
    }

    const allowedPlan = ["free", "plus"].includes(plan) ? plan : "free";

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: "This email is already registered. Please sign in instead."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role,
      plan: allowedPlan
    });

    res.status(201).json({
      message: "Account created successfully.",
      token: createToken(user),
      user: safeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(String(password), user.passwordHash))
    ) {
      return res.status(401).json({
        message: "Email or password is incorrect."
      });
    }

    res.json({
      message: "Signed in successfully.",
      token: createToken(user),
      user: safeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const { name, plan } = req.body;
    const updates = {};

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim().slice(0, 80);
    }

    if (["free", "plus"].includes(plan)) {
      updates.plan = plan;
    }

    const userId = req.user._id?.toString?.() || req.user.id || req.user._id;
    const updated = await User.findByIdAndUpdate(userId, updates, { new: true });

    res.json({
      message: "Profile updated successfully.",
      user: safeUser(updated || req.user)
    });
  } catch (error) {
    next(error);
  }
});

// Admin endpoint to view registered accounts
router.get("/users", requireAuth, requireRole("admin", "superadmin"), async (_req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      users: users.map(safeUser)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
