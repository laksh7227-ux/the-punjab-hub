export const seedUsers = [
  {
    _id: "67ae1a111111111111111101",
    name: "PunjabHub Administrator",
    email: "admin@punjabhub.ai",
    passwordHash: "$2a$10$TMiW9VgFU6WfTBTpkQ/MaOzYkG0Q65BYWyAJr.ozlaTp8Gg/KYjMy", // AdminPassword123!
    role: "admin",
    plan: "plus",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z")
  },
  {
    _id: "67ae1a222222222222222202",
    name: "Gurpreet Singh",
    email: "gurpreet@ludhianawoolens.com",
    passwordHash: "$2a$10$efRAt0RbAUxuhIaSvS1xtOfCDefRCObf2vZd9VsxB.fMx0V6AtVRy", // Password123!
    role: "manufacturer",
    plan: "plus",
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z")
  }
];

export const seedBusinesses = [
  {
    _id: "67ae2b111111111111111101",
    owner: "67ae1a222222222222222202",
    name: "Ludhiana Woolens & Knitwear",
    category: "Manufacturing",
    city: "Ludhiana",
    description: "Premium industrial woolens, thermal garments, hosiery, and export-grade knitwear produced using modern computerized flat-knitting looms.",
    phone: "+91 98140 12345",
    website: "https://ludhianawoolens.example.com",
    status: "approved",
    createdAt: new Date("2026-01-10T10:00:00.000Z"),
    updatedAt: new Date("2026-01-10T10:00:00.000Z")
  },
  {
    _id: "67ae2b222222222222222202",
    owner: "67ae1a222222222222222202",
    name: "Doaba Sports Goods",
    category: "Manufacturing",
    city: "Jalandhar",
    description: "World-class handcrafted cricket bats, FIFA-grade footballs, athletic protective pads, and gymnasium equipment shipped across 24 countries.",
    phone: "+91 98150 23456",
    website: "https://doabasports.example.com",
    status: "approved",
    createdAt: new Date("2026-01-12T11:30:00.000Z"),
    updatedAt: new Date("2026-01-12T11:30:00.000Z")
  },
  {
    _id: "67ae2b333333333333333303",
    owner: "67ae1a222222222222222202",
    name: "Golden Heritage Phulkari",
    category: "Textiles",
    city: "Amritsar",
    description: "Authentic artisanal Phulkari embroidery, handcrafted bridal dupattas, ethnic silk shawls, and bespoke heritage Punjabi textiles.",
    phone: "+91 98720 34567",
    website: "https://goldenheritage.example.com",
    status: "approved",
    createdAt: new Date("2026-01-14T09:15:00.000Z"),
    updatedAt: new Date("2026-01-14T09:15:00.000Z")
  },
  {
    _id: "67ae2b444444444444444404",
    owner: "67ae1a222222222222222202",
    name: "Mohali Precision Automation",
    category: "Machinery",
    city: "Mohali",
    description: "High-tolerance CNC machined components, automated robotic welding jigs, sensorized conveyor systems, and industrial tooling for Tier-1 OEMs.",
    phone: "+91 98880 45678",
    website: "https://mohaliprecision.example.com",
    status: "approved",
    createdAt: new Date("2026-01-16T14:45:00.000Z"),
    updatedAt: new Date("2026-01-16T14:45:00.000Z")
  },
  {
    _id: "67ae2b555555555555555505",
    owner: "67ae1a222222222222222202",
    name: "Gobindgarh Forge & Alloys",
    category: "Manufacturing",
    city: "Mandi Gobindgarh",
    description: "Heavy structural steel bars, thermo-mechanically treated (TMT) rebars, and custom alloy billets engineered for heavy infrastructure projects.",
    phone: "+91 98141 56789",
    website: "https://gobindgarhforge.example.com",
    status: "approved",
    createdAt: new Date("2026-01-18T16:20:00.000Z"),
    updatedAt: new Date("2026-01-18T16:20:00.000Z")
  },
  {
    _id: "67ae2b666666666666666606",
    owner: "67ae1a222222222222222202",
    name: "Malwa Agri-Harvest Systems",
    category: "Agriculture",
    city: "Bathinda",
    description: "Advanced tractor-mounted laser land levelers, zero-till seed drills, automated grain dryers, and mechanized crop residue management systems.",
    phone: "+91 98765 67890",
    website: "https://malwaagri.example.com",
    status: "approved",
    createdAt: new Date("2026-01-20T12:00:00.000Z"),
    updatedAt: new Date("2026-01-20T12:00:00.000Z")
  }
];
