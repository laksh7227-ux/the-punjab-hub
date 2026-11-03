import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { seedUsers, seedBusinesses } from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "punjabhub_store.json");

class LocalStore {
  constructor() {
    this.data = {
      users: [],
      businesses: []
    };
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;

    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf8");
        this.data = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not read local store, re-initializing:", e.message);
    }

    if (!Array.isArray(this.data.users) || this.data.users.length === 0) {
      this.data.users = JSON.parse(JSON.stringify(seedUsers));
    }
    if (!Array.isArray(this.data.businesses) || this.data.businesses.length === 0) {
      this.data.businesses = JSON.parse(JSON.stringify(seedBusinesses));
    }

    this.save();
    this.initialized = true;
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      console.error("Error saving local store:", err.message);
    }
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  createDoc(obj) {
    if (!obj) return null;
    const doc = this.clone(obj);
    doc.toObject = () => this.clone(doc);
    return doc;
  }
}

const store = new LocalStore();

// Chainable query helper for Businesses
class BusinessQuery {
  constructor(filter = {}) {
    this.filter = filter;
    this._populate = [];
    this._sort = null;
    this._limit = null;
  }

  populate(field, select = "") {
    this._populate.push({ field, select: select ? select.split(/\s+/).filter(Boolean) : [] });
    return this;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  execute() {
    let results = store.data.businesses.filter((b) => {
      // Check status
      if (this.filter.status && b.status !== this.filter.status) {
        return false;
      }

      // Check owner
      if (this.filter.owner) {
        const targetOwner = String(this.filter.owner._id || this.filter.owner);
        const currentOwner = String(b.owner?._id || b.owner);
        if (targetOwner !== currentOwner) return false;
      }

      // Check city
      if (this.filter.city) {
        if (this.filter.city instanceof RegExp) {
          if (!this.filter.city.test(b.city)) return false;
        } else if (typeof this.filter.city.$regex === "string") {
          const re = new RegExp(this.filter.city.$regex, this.filter.city.$options || "i");
          if (!re.test(b.city)) return false;
        } else if (typeof this.filter.city === "string") {
          if (!b.city.toLowerCase().includes(this.filter.city.toLowerCase())) return false;
        }
      }

      // Check category
      if (this.filter.category) {
        if (this.filter.category instanceof RegExp) {
          if (!this.filter.category.test(b.category)) return false;
        } else if (typeof this.filter.category.$regex === "string") {
          const re = new RegExp(this.filter.category.$regex, this.filter.category.$options || "i");
          if (!re.test(b.category)) return false;
        } else if (typeof this.filter.category === "string") {
          if (!b.category.toLowerCase().includes(this.filter.category.toLowerCase())) return false;
        }
      }

      // Check $or regex search
      if (Array.isArray(this.filter.$or)) {
        const matchesOr = this.filter.$or.some((condition) => {
          for (const key of Object.keys(condition)) {
            const val = b[key];
            if (!val) continue;
            const cond = condition[key];
            if (cond instanceof RegExp && cond.test(val)) return true;
            if (cond?.$regex) {
              const re = new RegExp(cond.$regex, cond.$options || "i");
              if (re.test(val)) return true;
            }
            if (typeof cond === "string" && val.toLowerCase().includes(cond.toLowerCase())) {
              return true;
            }
          }
          return false;
        });
        if (!matchesOr) return false;
      }

      return true;
    });

    // Sort
    if (this._sort) {
      const [key, dir] = Object.entries(this._sort)[0] || ["createdAt", -1];
      results.sort((a, b) => {
        const aVal = a[key] ? new Date(a[key]).getTime() || a[key] : 0;
        const bVal = b[key] ? new Date(b[key]).getTime() || b[key] : 0;
        return dir === -1 ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
      });
    }

    // Limit
    if (typeof this._limit === "number") {
      results = results.slice(0, this._limit);
    }

    // Populate
    return results.map((b) => {
      const doc = store.createDoc(b);
      for (const pop of this._populate) {
        if (pop.field === "owner") {
          const ownerId = String(doc.owner?._id || doc.owner);
          const ownerUser = store.data.users.find((u) => String(u._id) === ownerId);
          if (ownerUser) {
            if (pop.select.length > 0) {
              const populatedOwner = { _id: ownerUser._id };
              pop.select.forEach((field) => {
                populatedOwner[field] = ownerUser[field];
              });
              doc.owner = populatedOwner;
            } else {
              doc.owner = {
                _id: ownerUser._id,
                name: ownerUser.name,
                email: ownerUser.email
              };
            }
          }
        }
      }
      return doc;
    });
  }

  then(resolve, reject) {
    try {
      const result = this.execute();
      return Promise.resolve(result).then(resolve, reject);
    } catch (e) {
      return Promise.reject(e).then(resolve, reject);
    }
  }

  catch(reject) {
    return this.then(null, reject);
  }
}

// Chainable query helper for Users
class UserQuery {
  constructor(finder) {
    this.finder = finder;
    this.includePassword = false;
  }

  select(fields = "") {
    if (fields.includes("+passwordHash")) {
      this.includePassword = true;
    }
    return this;
  }

  execute() {
    const user = this.finder();
    if (!user) return null;
    const doc = store.createDoc(user);
    if (!this.includePassword) {
      delete doc.passwordHash;
    }
    return doc;
  }

  then(resolve, reject) {
    try {
      const result = this.execute();
      return Promise.resolve(result).then(resolve, reject);
    } catch (e) {
      return Promise.reject(e).then(resolve, reject);
    }
  }

  catch(reject) {
    return this.then(null, reject);
  }
}

export const localUser = {
  findOne(query) {
    return new UserQuery(() => {
      if (query.email) {
        const qEmail = query.email.trim().toLowerCase();
        return store.data.users.find((u) => u.email.toLowerCase() === qEmail);
      }
      if (query._id) {
        const qId = String(query._id);
        return store.data.users.find((u) => String(u._id) === qId);
      }
      return null;
    });
  },

  findById(id) {
    return new UserQuery(() => {
      const targetId = String(id?._id || id);
      return store.data.users.find((u) => String(u._id) === targetId);
    });
  },

  async create(data) {
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role: data.role || "user",
      plan: data.plan || "free",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.data.users.push(newUser);
    store.save();

    const doc = store.createDoc(newUser);
    delete doc.passwordHash;
    return doc;
  },

  async findByIdAndUpdate(id, updates, options = {}) {
    const targetId = String(id?._id || id);
    const index = store.data.users.findIndex((u) => String(u._id) === targetId);
    if (index === -1) return null;

    const user = store.data.users[index];
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    store.save();

    const doc = store.createDoc(user);
    if (!options.select?.includes("+passwordHash")) {
      delete doc.passwordHash;
    }
    return doc;
  },

  async countDocuments() {
    return store.data.users.length;
  },

  find() {
    return store.data.users.map((u) => {
      const doc = store.createDoc(u);
      delete doc.passwordHash;
      return doc;
    });
  }
};

export const localBusiness = {
  find(filter) {
    return new BusinessQuery(filter);
  },

  findById(id) {
    const targetId = String(id?._id || id);
    const b = store.data.businesses.find((item) => String(item._id) === targetId);
    if (!b) return Promise.resolve(null);
    return Promise.resolve(store.createDoc(b));
  },

  async create(data) {
    const newBusiness = {
      _id: new mongoose.Types.ObjectId().toString(),
      owner: String(data.owner?._id || data.owner),
      name: data.name.trim(),
      category: data.category.trim(),
      city: data.city.trim(),
      description: data.description.trim(),
      phone: String(data.phone || "").trim(),
      website: String(data.website || "").trim(),
      status: data.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.data.businesses.unshift(newBusiness);
    store.save();

    return store.createDoc(newBusiness);
  },

  async findByIdAndUpdate(id, updates, _options = {}) {
    const targetId = String(id?._id || id);
    const index = store.data.businesses.findIndex((b) => String(b._id) === targetId);
    if (index === -1) return null;

    const business = store.data.businesses[index];
    Object.assign(business, updates, { updatedAt: new Date().toISOString() });
    store.save();

    return store.createDoc(business);
  },

  async findByIdAndDelete(id) {
    const targetId = String(id?._id || id);
    const index = store.data.businesses.findIndex((b) => String(b._id) === targetId);
    if (index === -1) return null;

    const [deleted] = store.data.businesses.splice(index, 1);
    store.save();

    return store.createDoc(deleted);
  },

  async countDocuments(filter = {}) {
    const q = new BusinessQuery(filter);
    return q.execute().length;
  }
};

export default store;
