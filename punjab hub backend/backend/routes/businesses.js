import { Router } from "express";
import mongoose from "mongoose";
import Business from "../Models/business.js";
import User from "../Models/user.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Browse businesses. Defaults to approved listings.
router.get("/", async (req, res, next) => {
  try {
    const { q = "", city = "", category = "", status = "approved" } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (q) {
      const search = String(q).slice(0, 100);
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } }
      ];
    }

    if (city) {
      filter.city = {
        $regex: String(city).slice(0, 80),
        $options: "i"
      };
    }

    if (category) {
      filter.category = {
        $regex: String(category).slice(0, 80),
        $options: "i"
      };
    }

    const businesses = await Business.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: businesses.length,
      businesses
    });
  } catch (error) {
    next(error);
  }
});

// Get the current user's listings. Admins can review all listings.
router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id?.toString?.() || req.user.id || req.user._id;
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);

    const filter = isAdmin ? {} : { owner: userId };

    const businesses = await Business.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: businesses.length,
      businesses
    });
  } catch (error) {
    next(error);
  }
});

// Get single business by ID
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid business ID format."
      });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({
        message: "Business listing not found."
      });
    }

    res.json({
      success: true,
      business
    });
  } catch (error) {
    next(error);
  }
});

// Submit a listing. Allows manufacturers, users (upgrades them), and admins.
router.post(
  "/",
  requireAuth,
  async (req, res, next) => {
    try {
      const {
        name, category, city, description, phone = "", website = ""
      } = req.body;

      if (![name, category, city, description].every(
        (value) => typeof value === "string" && value.trim()
      )) {
        return res.status(400).json({
          message: "Name, category, city and description are required fields."
        });
      }

      const userId = req.user._id?.toString?.() || req.user.id || req.user._id;

      // If user registered as explorer, elevate them to manufacturer
      if (req.user.role === "user") {
        await User.findByIdAndUpdate(userId, { role: "manufacturer" });
      }

      // Admins are approved immediately; manufacturers default to approved or pending
      const initialStatus = ["admin", "superadmin"].includes(req.user.role) ? "approved" : "approved";

      const business = await Business.create({
        owner: userId,
        name: name.trim(),
        category: category.trim(),
        city: city.trim(),
        description: description.trim(),
        phone: String(phone || "").trim(),
        website: String(website || "").trim(),
        status: initialStatus
      });

      res.status(201).json({
        success: true,
        message: "Listing published successfully on PunjabHub AI.",
        business
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update a listing (Owner or Admin)
router.put(
  "/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid business ID."
        });
      }

      const existing = await Business.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          message: "Business listing not found."
        });
      }

      const userId = req.user._id?.toString?.() || req.user.id || req.user._id;
      const isOwner = String(existing.owner?._id || existing.owner) === String(userId);
      const isAdmin = ["admin", "superadmin"].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "You do not have permission to edit this listing."
        });
      }

      const { name, category, city, description, phone, website } = req.body;
      const updates = {};

      if (typeof name === "string" && name.trim()) updates.name = name.trim();
      if (typeof category === "string" && category.trim()) updates.category = category.trim();
      if (typeof city === "string" && city.trim()) updates.city = city.trim();
      if (typeof description === "string" && description.trim()) updates.description = description.trim();
      if (phone !== undefined) updates.phone = String(phone).trim();
      if (website !== undefined) updates.website = String(website).trim();

      const updated = await Business.findByIdAndUpdate(req.params.id, updates, { new: true });

      res.json({
        success: true,
        message: "Listing updated successfully.",
        business: updated
      });
    } catch (error) {
      next(error);
    }
  }
);

// Approve or reject a listing (Admin only)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin", "superadmin"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid business ID."
        });
      }

      const { status } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          message: "Status must be pending, approved or rejected."
        });
      }

      const business = await Business.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      if (!business) {
        return res.status(404).json({
          message: "Business not found."
        });
      }

      res.json({
        success: true,
        message: `Listing status updated to ${status}.`,
        business
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a listing (Owner or Admin)
router.delete(
  "/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid business ID."
        });
      }

      const existing = await Business.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          message: "Business listing not found."
        });
      }

      const userId = req.user._id?.toString?.() || req.user.id || req.user._id;
      const isOwner = String(existing.owner?._id || existing.owner) === String(userId);
      const isAdmin = ["admin", "superadmin"].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "You do not have permission to delete this listing."
        });
      }

      await Business.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Business listing deleted successfully."
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
