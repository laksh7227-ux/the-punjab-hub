import mongoose from "mongoose";
import { localUser } from "../data/localStore.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["user", "manufacturer", "admin", "superadmin"],
      default: "user"
    },
    plan: {
      type: String,
      enum: ["free", "plus"],
      default: "free"
    }
  },
  { timestamps: true }
);

// Prevent mongoose OverwriteModelError in case of hot reloading
const MongooseUser = mongoose.models.User || mongoose.model("User", userSchema);

const UserProxy = {
  findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findOne(query);
    }
    return localUser.findOne(query);
  },

  findById(id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findById(id);
    }
    return localUser.findById(id);
  },

  create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.create(data);
    }
    return localUser.create(data);
  },

  findByIdAndUpdate(id, updates, options) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findByIdAndUpdate(id, updates, options);
    }
    return localUser.findByIdAndUpdate(id, updates, options);
  },

  countDocuments(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.countDocuments(query);
    }
    return localUser.countDocuments();
  },

  find(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.find(query);
    }
    return localUser.find();
  },

  // Direct access to underlying Mongoose model if needed
  mongooseModel: MongooseUser,
  schema: userSchema
};

export default UserProxy;
