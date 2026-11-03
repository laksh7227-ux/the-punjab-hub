import jwt from "jsonwebtoken";
import User from "../Models/user.js";

function getSecret() {
  return process.env.JWT_SECRET || "punjabhub_ai_secure_jwt_secret_2026_fallback";
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({
        message: "Please log in first to access this resource."
      });
    }

    const payload = jwt.verify(token, getSecret());
    if (!payload?.id) {
      return res.status(401).json({
        message: "Invalid authentication token."
      });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({
        message: "Account not found or no longer active."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again."
      });
    }
    return res.status(401).json({
      message: "Invalid or expired authorization token."
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You don't have permission for this action."
      });
    }
    next();
  };
}
