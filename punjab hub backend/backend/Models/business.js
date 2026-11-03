import mongoose from "mongoose";
import { localBusiness } from "../data/localStore.js";

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ""
    },
    website: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// Prevent mongoose OverwriteModelError in case of hot reloading
const MongooseBusiness = mongoose.models.Business || mongoose.model("Business", businessSchema);

const BusinessProxy = {
  find(filter) {
    if (mongoose.connection.readyState === 1) {
      return MongooseBusiness.find(filter);
    }
    return localBusiness.find(filter);
  },

  findById(id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseBusiness.findById(id);
    }
    return localBusiness.findById(id);
  },

  create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseBusiness.create(data);
    }
    return localBusiness.create(data);
  },

  findByIdAndUpdate(id, updates, options) {
    if (mongoose.connection.readyState === 1) {
      return MongooseBusiness.findByIdAndUpdate(id, updates, options);
    }
    return localBusiness.findByIdAndUpdate(id, updates, options);
  },

  findByIdAndDelete(id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseBusiness.findByIdAndDelete(id);
    }
    return localBusiness.findByIdAndDelete(id);
  },

  countDocuments(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseBusiness.countDocuments(query);
    }
    return localBusiness.countDocuments(query);
  },

  // Direct access to underlying Mongoose model if needed
  mongooseModel: MongooseBusiness,
  schema: businessSchema
};

export default BusinessProxy;
