import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Building2,
  Check,
  CirclePlay,
  Factory,
  Globe2,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react";
import api from "./api.js";

function InstagramIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const DEFAULT_BUSINESSES = [
  {
    _id: "demo-1",
    name: "Ludhiana Woolens & Knitwear",
    category: "Textiles",
    city: "Ludhiana",
    description:
      "Pioneering premium hosiery, winter garments, and high-tensile yarn spinning since 1988 with modern automated looms.",
    phone: "+91 98140 22341",
    website: "https://ludhianawoolens.in",
  },
  {
    _id: "demo-2",
    name: "Doaba Sports & Gear",
    category: "Manufacturing",
    city: "Jalandhar",
    description:
      "Export-grade cricket bats, inflatable footballs, and athletic protective equipment crafted for world championship standards.",
    phone: "+91 98722 88410",
    website: "https://doabasports.com",
  },
  {
    _id: "demo-3",
    name: "Golden Heritage Textiles & Phulkari",
    category: "Textiles",
    city: "Amritsar",
    description:
      "Authentic artisanal Punjab Phulkari embroidery, handcrafted shawls, and premium heritage export fabrics.",
    phone: "+91 98881 54320",
    website: "https://goldenphulkari.com",
  },
  {
    _id: "demo-4",
    name: "Mohali Precision Automation",
    category: "Electronics",
    city: "Mohali",
    description:
      "Custom IoT telemetry boards, industrial programmable logic controllers (PLCs), and robotic assembly hardware.",
    phone: "+91 97790 12099",
    website: "https://mohaliprecision.tech",
  },
  {
    _id: "demo-5",
    name: "Gobindgarh Forge & Alloy Works",
    category: "Machinery",
    city: "Mandi Gobindgarh",
    description:
      "Specialized structural steel rebar, high-grade billet rolling, and heavy machinery forged components for infrastructure.",
    phone: "+91 98155 67890",
    website: "https://gobindgarhsteel.in",
  },
  {
    _id: "demo-6",
    name: "Malwa Agri-Harvest Solutions",
    category: "Agriculture",
    city: "Bathinda",
    description:
      "Precision laser land levelers, zero-till seed drills, and solar-powered smart drip irrigation pumps.",
    phone: "+91 98554 33211",
    website: "https://malwaagri.co.in",
  },
];

const initialAuth = () => {
  try {
    const user = localStorage.getItem("ph_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getOfflineListings = () => {
  try {
    const stored = localStorage.getItem("ph_offline_businesses");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const filterBusinessList = (list, query) => {
  if (!query || !query.trim()) return list;
  const q = query.toLowerCase().trim();
  return list.filter(
    (b) =>
      b.name?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q),
  );
};

function App() {
  const [user, setUser] = useState(initialAuth);
  const [modal, setModal] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [businesses, setBusinesses] = useState(() => [
    ...getOfflineListings(),
    ...DEFAULT_BUSINESSES,
  ]);
  const [mine, setMine] = useState(() => getOfflineListings());
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    name: "",
    category: "Manufacturing",
    city: "Ludhiana",
    description: "",
    phone: "",
    website: "",
  });
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manufacturer",
    plan: "free",
  });
  const [authMode, setAuthMode] = useState("register");
  const [videoForm, setVideoForm] = useState({
    businessName: "",
    product: "",
    style: "Modern premium",
  });

  const loadBusinesses = useCallback(async (q = "") => {
    try {
      const { data } = await api.get("/businesses", { params: { q } });
      if (data?.businesses && data.businesses.length > 0) {
        setBusinesses(data.businesses);
        return;
      }
    } catch {
      // Backend offline or error - use fallback
    }
    const combined = [...getOfflineListings(), ...DEFAULT_BUSINESSES];
    setBusinesses(filterBusinessList(combined, q));
  }, []);

  const loadMine = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/businesses/mine");
      if (data?.businesses) {
        setMine(data.businesses);
        return;
      }
    } catch {
      // Backend offline or error - use fallback
    }
    setMine(getOfflineListings());
  }, [user]);

  useEffect(() => {
    let ignore = false;
    api
      .get("/businesses")
      .then(({ data }) => {
        if (!ignore && data?.businesses?.length) {
          setBusinesses(data.businesses);
        }
      })
      .catch(() => {
        // Fallback initialized in state
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    api
      .get("/businesses/mine")
      .then(({ data }) => {
        if (!ignore && data?.businesses) {
          setMine(data.businesses);
        }
      })
      .catch(() => {
        // Fallback initialized in state
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  const stats = useMemo(
    () => [
      { value: "24/7", label: "Your digital storefront" },
      { value: "One place", label: "To manage your marketing" },
      { value: "Punjab-first", label: "Built for local industry" },
    ],
    [],
  );

  function saveSession(data) {
    localStorage.setItem("ph_token", data.token);
    localStorage.setItem("ph_user", JSON.stringify(data.user));
    setUser(data.user);
    setModal("");
    setNotice(`Welcome, ${data.user.name}!`);
  }

  async function submitAuth(e) {
    e.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const endpoint =
        authMode === "register" ? "/auth/register" : "/auth/login";
      const payload =
        authMode === "register"
          ? authForm
          : { email: authForm.email, password: authForm.password };
      const { data } = await api.post(endpoint, payload);
      saveSession(data);
    } catch (error) {
      if (!error.response) {
        const demoUser = {
          id: `demo-${Date.now()}`,
          name: authForm.name || authForm.email.split("@")[0] || "Punjab Maker",
          email: authForm.email,
          role: authForm.role || "manufacturer",
          plan: authForm.plan || "free",
        };
        saveSession({ token: "demo-offline-token", user: demoUser });
        setNotice(`Welcome, ${demoUser.name}! (Running in standalone demo mode)`);
        return;
      }
      setNotice(
        error.response?.data?.message ||
          "Could not connect to the server. Is the backend running?",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitBusiness(e) {
    e.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const { data } = await api.post("/businesses", businessForm);
      setNotice(data.message || "Business submitted for review.");
      setBusinessForm({
        name: "",
        category: "Manufacturing",
        city: "Ludhiana",
        description: "",
        phone: "",
        website: "",
      });
      setModal("");
      loadMine();
    } catch (error) {
      if (!error.response) {
        const newListing = {
          _id: `local-${Date.now()}`,
          ...businessForm,
          status: "pending review",
          createdAt: new Date().toISOString(),
        };
        const saved = getOfflineListings();
        saved.unshift(newListing);
        try {
          localStorage.setItem("ph_offline_businesses", JSON.stringify(saved));
        } catch {
          // ignore localStorage error
        }
        setMine((prev) => [newListing, ...prev]);
        setBusinesses((prev) => [newListing, ...prev]);
        setNotice("Business submitted! (Stored locally in standalone mode)");
        setBusinessForm({
          name: "",
          category: "Manufacturing",
          city: "Ludhiana",
          description: "",
          phone: "",
          website: "",
        });
        setModal("");
        return;
      }
      setNotice(error.response?.data?.message || "Could not submit business.");
    } finally {
      setLoading(false);
    }
  }

  async function requestVideo(e) {
    e.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const { data } = await api.post("/marketing/video", videoForm);
      setNotice(data.message || "Request sent.");
      setModal("");
    } catch (error) {
      if (!error.response) {
        setNotice(
          `AI video brief generated for "${videoForm.businessName}"! (Standalone demo mode)`,
        );
        setModal("");
        return;
      }
      setNotice(
        error.response?.data?.message || "Could not submit video request.",
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("ph_token");
    localStorage.removeItem("ph_user");
    setUser(null);
    setMine([]);
    setNotice("You have signed out.");
  }

  const scrollTo = (id) => {
    setMobileNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <a href="#home" className="brand" aria-label="PunjabHub AI home">
          <span className="brand-mark">
            <Factory size={22} />
          </span>
          <span>
            Punjab<span className="brand-accent">Hub</span>
            <small>AI</small>
          </span>
        </a>
        <button
          className="mobile-menu icon-btn"
          onClick={() => setMobileNav(!mobileNav)}
          aria-label="Toggle navigation"
        >
          {mobileNav ? <X /> : <Menu />}
        </button>
        <nav className={mobileNav ? "nav-links nav-open" : "nav-links"}>
          <button onClick={() => scrollTo("discover")}>
            Explore businesses
          </button>
          <button onClick={() => scrollTo("features")}>Features</button>
          <button onClick={() => scrollTo("pricing")}>Pricing</button>
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-chip">
                <span className="online-dot" />
                {user.name.split(" ")[0]}
              </span>
              <button className="btn btn-outline btn-small" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => {
                  setAuthMode("login");
                  setModal("auth");
                }}
              >
                Sign in
              </button>
              <button
                className="btn btn-primary btn-small"
                onClick={() => {
                  setAuthMode("register");
                  setModal("auth");
                }}
              >
                Get started <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> MADE FOR PUNJAB'S INDUSTRY
            </div>
            <h1>
              Local industry.
              <br />
              <span className="gradient-text">Limitless reach.</span>
            </h1>
            <p className="hero-lead">
              Your business deserves to be seen. Discover manufacturers,
              showcase your products, and put AI-powered marketing to work — all
              in one place.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={() =>
                  user
                    ? setModal("business")
                    : (setAuthMode("register"), setModal("auth"))
                }
              >
                List your business <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-outline btn-large"
                onClick={() => scrollTo("discover")}
              >
                <CirclePlay size={18} /> Explore directory
              </button>
            </div>
            <div className="trust-row">
              <div className="avatar-stack">
                <span>L</span>
                <span>M</span>
                <span>G</span>
                <span>+</span>
              </div>
              <span>Built to help Punjab businesses grow</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-orbit orbit-a" />
            <div className="visual-orbit orbit-b" />
            <div className="dashboard-card">
              <div className="dash-top">
                <div>
                  <span className="dash-label">BUSINESS OVERVIEW</span>
                  <h3>Your growth, at a glance</h3>
                </div>
                <span className="dash-icon">
                  <BarChart3 size={19} />
                </span>
              </div>
              <div className="dash-chart">
                <div className="chart-head">
                  <span>Reach potential</span>
                  <span className="chart-tag">
                    <TrendingUp size={13} /> Growing
                  </span>
                </div>
                <div className="chart-bars">
                  {[32, 48, 38, 65, 50, 75, 60, 90, 72, 100, 80, 112].map(
                    (h, i) => (
                      <span key={i} style={{ height: `${h}px` }} />
                    ),
                  )}
                </div>
                <div className="chart-months">
                  <span>W1</span>
                  <span>W2</span>
                  <span>W3</span>
                  <span>W4</span>
                </div>
              </div>
              <div className="dash-bottom">
                <div className="mini-stat">
                  <span className="mini-stat-icon purple">
                    <Video size={15} />
                  </span>
                  <div>
                    <strong>AI Video Studio</strong>
                    <small>Promote your products</small>
                  </div>
                </div>
                <span className="arrow-circle">
                  <ArrowRight size={15} />
                </span>
              </div>
            </div>
            <div className="float-card float-ai">
              <span className="float-icon">
                <Sparkles size={17} />
              </span>
              <div>
                <strong>AI marketing</strong>
                <small>Ideas to campaigns</small>
              </div>
              <span className="pulse" />
            </div>
            <div className="float-card float-local">
              <span className="local-icon">
                <Factory size={17} />
              </span>
              <div>
                <strong>Punjab businesses</strong>
                <small>Find your next partner</small>
              </div>
            </div>
          </div>
          <div className="hero-bottom-line">
            <span>DISCOVER</span>
            <span className="line" />
            <span>CONNECT</span>
            <span className="line" />
            <span>GROW</span>
          </div>
        </section>

        <section className="stats-strip section-wrap">
          {stats.map((s) => (
            <div className="stat-item" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        <section className="section-wrap section-block" id="features">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE PLATFORM</div>
              <h2>
                Everything your business
                <br />
                <span className="gradient-text">needs to move forward.</span>
              </h2>
            </div>
            <p>
              Less time chasing visibility. More time building the business you
              believe in.
            </p>
          </div>
          <div className="feature-grid">
            <article className="feature-card feature-tall">
              <div className="feature-icon orange">
                <Building2 />
              </div>
              <span className="feature-number">01 / DISCOVER</span>
              <h3>A digital home for local industry</h3>
              <p>
                Make your company easier to find. Share your services, products,
                location, and contact details with people looking to do business
                in Punjab.
              </p>
              <button
                className="text-link"
                onClick={() => scrollTo("discover")}
              >
                Explore directory <ArrowRight size={15} />
              </button>
              <div className="feature-decoration">
                <Factory size={90} />
              </div>
            </article>
            <article className="feature-card">
              <div className="feature-icon violet">
                <Bot />
              </div>
              <span className="feature-number">02 / CREATE</span>
              <h3>AI marketing assistant</h3>
              <p>
                Turn a product description into a campaign brief and
                promotional-video concept.
              </p>
              <button
                className="text-link"
                onClick={() =>
                  user
                    ? setModal("video")
                    : (setAuthMode("login"), setModal("auth"))
                }
              >
                Open AI studio <ArrowRight size={15} />
              </button>
            </article>
            <article className="feature-card">
              <div className="feature-icon green">
                <InstagramIcon />
              </div>
              <span className="feature-number">03 / PUBLISH</span>
              <h3>Social media workflow</h3>
              <p>
                Prepare content for review and connect publishing accounts when
                your integrations are configured.
              </p>
              <button
                className="text-link"
                onClick={() =>
                  setNotice(
                    "Instagram publishing requires Meta API setup and a connected professional account.",
                  )
                }
              >
                How it works <ArrowRight size={15} />
              </button>
            </article>
          </div>
        </section>

        <section className="directory-section" id="discover">
          <div className="section-wrap section-block">
            <div className="section-heading">
              <div>
                <div className="eyebrow">THE DIRECTORY</div>
                <h2>
                  Meet the makers of{" "}
                  <span className="gradient-text">Punjab.</span>
                </h2>
              </div>
              <p>
                Find local manufacturers and discover new business
                opportunities.
              </p>
            </div>
            <div className="directory-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    loadBusinesses(e.target.value);
                  }}
                  placeholder="Search businesses, products, categories..."
                />
                <kbd>⌕</kbd>
              </div>
              <span className="result-count">
                {businesses.length} listed businesses
              </span>
            </div>
            {businesses.length ? (
              <div className="business-grid">
                {businesses.map((b) => (
                  <article className="business-card" key={b._id}>
                    <div className="business-card-top">
                      <span className="business-symbol">
                        <Factory size={22} />
                      </span>
                      <span className="verified">
                        <BadgeCheck size={14} /> Verified listing
                      </span>
                    </div>
                    <span className="business-category">{b.category}</span>
                    <h3>{b.name}</h3>
                    <p>{b.description}</p>
                    <div className="business-meta">
                      <span>
                        <Globe2 size={14} /> {b.city}, Punjab
                      </span>
                      {b.phone && <span>{b.phone}</span>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">
                  <Building2 size={25} />
                </span>
                <h3>Your next business connection starts here.</h3>
                <p>
                  No approved listings found yet. Be one of the first
                  manufacturers to join PunjabHub AI.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    user
                      ? setModal("business")
                      : (setAuthMode("register"), setModal("auth"))
                  }
                >
                  Add your business <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        {user && (
          <section className="section-wrap section-block">
            <div className="section-heading">
              <div>
                <div className="eyebrow">YOUR WORKSPACE</div>
                <h2>
                  Welcome back,{" "}
                  <span className="gradient-text">
                    {user.name.split(" ")[0]}.
                  </span>
                </h2>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setModal("business")}
              >
                <Plus size={17} /> Add a business
              </button>
            </div>
            <div className="workspace-grid">
              <div className="workspace-card">
                <div className="workspace-icon">
                  <LayoutDashboard />
                </div>
                <div>
                  <strong>{mine.length}</strong>
                  <span>Your business listings</span>
                </div>
              </div>
              <div className="workspace-card">
                <div className="workspace-icon violet">
                  <Sparkles />
                </div>
                <div>
                  <strong>{user.plan === "plus" ? "Plus" : "Free"}</strong>
                  <span>Current plan</span>
                </div>
              </div>
              <div className="workspace-card">
                <div className="workspace-icon green">
                  <ShieldCheck />
                </div>
                <div>
                  <strong>{user.role}</strong>
                  <span>Account type</span>
                </div>
              </div>
            </div>
            {mine.length > 0 && (
              <div className="my-listings">
                {mine.map((b) => (
                  <div className="my-listing" key={b._id}>
                    <div>
                      <strong>{b.name}</strong>
                      <small>
                        {b.city} · {b.category}
                      </small>
                    </div>
                    <span className={`status status-${b.status}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="pricing-section" id="pricing">
          <div className="section-wrap section-block">
            <div className="center-heading">
              <div className="eyebrow">SIMPLE PLANS</div>
              <h2>
                Start small.{" "}
                <span className="gradient-text">Scale boldly.</span>
              </h2>
              <p>
                Choose the starting point that makes sense for your business.
              </p>
            </div>
            <div className="pricing-grid">
              <article className="price-card">
                <div className="price-top">
                  <span className="plan-label">GET DISCOVERED</span>
                  <h3>Free</h3>
                  <p>For businesses getting started online.</p>
                  <div className="price">
                    <strong>₹0</strong>
                    <span>/ forever</span>
                  </div>
                </div>
                <ul>
                  <li>
                    <Check /> Business profile submission
                  </li>
                  <li>
                    <Check /> Browse the directory
                  </li>
                  <li>
                    <Check /> Basic account dashboard
                  </li>
                  <li className="muted-feature">
                    <X /> AI generation not included
                  </li>
                </ul>
                <button
                  className="btn btn-outline btn-full"
                  onClick={() => {
                    setAuthForm({ ...authForm, plan: "free" });
                    setAuthMode("register");
                    setModal("auth");
                  }}
                >
                  Start for free <ArrowRight size={16} />
                </button>
              </article>
              <article className="price-card price-featured">
                <span className="popular-label">
                  <Sparkles size={13} /> GROW FASTER
                </span>
                <div className="price-top">
                  <span className="plan-label">FOR AMBITIOUS TEAMS</span>
                  <h3>Plus</h3>
                  <p>For manufacturers ready to market consistently.</p>
                  <div className="price">
                    <strong>₹999</strong>
                    <span>/ month · proposed</span>
                  </div>
                </div>
                <ul>
                  <li>
                    <Check /> Everything in Free
                  </li>
                  <li>
                    <Check /> Planned AI marketing workflow
                  </li>
                  <li>
                    <Check /> Campaign planning tools
                  </li>
                  <li>
                    <Check /> Social publishing integration when connected
                  </li>
                </ul>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    setAuthForm({ ...authForm, plan: "plus" });
                    setAuthMode("register");
                    setModal("auth");
                  }}
                >
                  Choose Plus <ArrowRight size={16} />
                </button>
                <small className="pricing-note">
                  Proposed price only — payments are not enabled.
                </small>
              </article>
            </div>
          </div>
        </section>

        <section className="cta-section section-wrap">
          <div className="cta-panel">
            <div className="cta-glow" />
            <div className="cta-copy">
              <div className="eyebrow">YOUR NEXT CHAPTER</div>
              <h2>
                Put your business
                <br />
                on the map.
              </h2>
              <p>
                Join a new home for Punjab's makers, suppliers, and
                manufacturers.
              </p>
              <button
                className="btn btn-light btn-large"
                onClick={() =>
                  user
                    ? setModal("business")
                    : (setAuthMode("register"), setModal("auth"))
                }
              >
                Join PunjabHub AI <ArrowRight size={18} />
              </button>
            </div>
            <div className="cta-art">
              <div className="cta-ring ring-one" />
              <div className="cta-ring ring-two" />
              <div className="cta-center">
                <Factory size={60} />
              </div>
              <span className="cta-bubble bubble-one">
                <Users size={20} />
              </span>
              <span className="cta-bubble bubble-two">
                <TrendingUp size={20} />
              </span>
              <span className="cta-bubble bubble-three">
                <Sparkles size={20} />
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <a href="#home" className="brand">
            <span className="brand-mark">
              <Factory size={22} />
            </span>
            <span>
              Punjab<span className="brand-accent">Hub</span>
              <small>AI</small>
            </span>
          </a>
          <p>Helping Punjab's industry find its next opportunity.</p>
          <div className="footer-links">
            <button onClick={() => scrollTo("discover")}>Directory</button>
            <button onClick={() => scrollTo("features")}>Features</button>
            <button onClick={() => scrollTo("pricing")}>Pricing</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} PunjabHub AI</span>
          <span>Built for Punjab. Ready to grow.</span>
        </div>
      </footer>

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal("");
          }}
        >
          <div className="modal-card">
            <button
              className="modal-close icon-btn"
              onClick={() => setModal("")}
              aria-label="Close"
            >
              <X />
            </button>
            {modal === "auth" && (
              <>
                <div className="modal-brand">
                  <span className="brand-mark">
                    <Factory size={22} />
                  </span>
                  <span>
                    {authMode === "login"
                      ? "Welcome back"
                      : "Build your presence"}
                  </span>
                </div>
                <p className="modal-subtitle">
                  {authMode === "login"
                    ? "Sign in to your PunjabHub workspace."
                    : "Create your account and put your business in motion."}
                </p>
                <form onSubmit={submitAuth} className="form-stack">
                  {authMode === "register" && (
                    <label>
                      Full name
                      <input
                        required
                        value={authForm.name}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, name: e.target.value })
                        }
                        placeholder="Your name"
                      />
                    </label>
                  )}
                  <label>
                    Email address
                    <input
                      required
                      type="email"
                      value={authForm.email}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, email: e.target.value })
                      }
                      placeholder="you@company.com"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      required
                      minLength={8}
                      type="password"
                      value={authForm.password}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, password: e.target.value })
                      }
                      placeholder="At least 8 characters"
                    />
                  </label>
                  {authMode === "register" && (
                    <>
                      <label>
                        Account type
                        <select
                          value={authForm.role}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, role: e.target.value })
                          }
                        >
                          <option value="manufacturer">Manufacturer</option>
                          <option value="user">Business explorer</option>
                        </select>
                      </label>
                      <label>
                        Plan
                        <select
                          value={authForm.plan}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, plan: e.target.value })
                          }
                        >
                          <option value="free">Free — ₹0</option>
                          <option value="plus">
                            Plus — ₹999/month (proposed)
                          </option>
                        </select>
                      </label>
                    </>
                  )}
                  <button
                    disabled={loading}
                    className="btn btn-primary btn-full"
                    type="submit"
                  >
                    {loading
                      ? "Please wait..."
                      : authMode === "login"
                        ? "Sign in"
                        : "Create account"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </form>
                <p className="switch-auth">
                  {authMode === "login"
                    ? "New to PunjabHub AI?"
                    : "Already have an account?"}{" "}
                  <button
                    onClick={() =>
                      setAuthMode(authMode === "login" ? "register" : "login")
                    }
                  >
                    {authMode === "login" ? "Create account" : "Sign in"}
                  </button>
                </p>
              </>
            )}
            {modal === "business" && (
              <>
                <div className="modal-brand">
                  <span className="brand-mark">
                    <Building2 size={22} />
                  </span>
                  <span>List your business</span>
                </div>
                <p className="modal-subtitle">
                  Share the essentials. Your listing will be submitted for
                  review.
                </p>
                <form className="form-stack" onSubmit={submitBusiness}>
                  <label>
                    Business name
                    <input
                      required
                      value={businessForm.name}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Ahuja Industrial Works"
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={businessForm.category}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          category: e.target.value,
                        })
                      }
                    >
                      {[
                        "Manufacturing",
                        "Auto parts",
                        "Textiles",
                        "Agriculture",
                        "Food processing",
                        "Packaging",
                        "Machinery",
                        "Electronics",
                        "Other",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    City in Punjab
                    <input
                      required
                      value={businessForm.city}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          city: e.target.value,
                        })
                      }
                      placeholder="Ludhiana"
                    />
                  </label>
                  <label>
                    Business description
                    <textarea
                      required
                      maxLength={1500}
                      value={businessForm.description}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="What do you manufacture or offer?"
                    />
                  </label>
                  <label>
                    Phone (optional)
                    <input
                      value={businessForm.phone}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+91..."
                    />
                  </label>
                  <label>
                    Website (optional)
                    <input
                      value={businessForm.website}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          website: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </label>
                  <button
                    disabled={loading}
                    className="btn btn-primary btn-full"
                    type="submit"
                  >
                    {loading ? "Submitting..." : "Submit listing"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}
            {modal === "video" && (
              <>
                <div className="modal-brand">
                  <span className="brand-mark">
                    <Sparkles size={22} />
                  </span>
                  <span>AI Video Studio</span>
                </div>
                <p className="modal-subtitle">
                  Prepare a promotional video request. Live generation must be
                  connected to a provider.
                </p>
                <form className="form-stack" onSubmit={requestVideo}>
                  <label>
                    Business name
                    <input
                      required
                      value={videoForm.businessName}
                      onChange={(e) =>
                        setVideoForm({
                          ...videoForm,
                          businessName: e.target.value,
                        })
                      }
                      placeholder="Your business"
                    />
                  </label>
                  <label>
                    Product or service
                    <input
                      required
                      value={videoForm.product}
                      onChange={(e) =>
                        setVideoForm({ ...videoForm, product: e.target.value })
                      }
                      placeholder="What should the video promote?"
                    />
                  </label>
                  <label>
                    Visual style
                    <select
                      value={videoForm.style}
                      onChange={(e) =>
                        setVideoForm({ ...videoForm, style: e.target.value })
                      }
                    >
                      <option>Modern premium</option>
                      <option>Industrial documentary</option>
                      <option>Energetic social ad</option>
                      <option>Minimal product showcase</option>
                    </select>
                  </label>
                  <button
                    disabled={loading}
                    className="btn btn-primary btn-full"
                    type="submit"
                  >
                    {loading ? "Sending..." : "Create video request"}{" "}
                    <Sparkles size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
