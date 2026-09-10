import { useState, useEffect } from "react";
import "./index.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/api";
const fetchFromBackend = (path, options = {}) =>
  fetch(`${BACKEND_URL}${path}`, {
    credentials: "include",
    ...options,
  });
const parseCartResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Cart request failed");
  }
  if (!Array.isArray(data)) {
    throw new Error("Cart response was not an array");
  }
  return data;
};
const getViewFromPath = () =>
  window.location.pathname.startsWith("/catalog") ? "catalog" : "landing";

const landingSignals = [
  "Curated desktop systems, monitors, and components",
  "Designed for creators, streamers, and builders",
  "Fast checkout, premium drops, live stock visibility",
];

const landingTestimonials = [
  {
    quote:
      "The whole store feels curated. I found a display and desk setup that looked editorial, not mass-market.",
    name: "Aarav Mehta",
    role: "Content creator",
  },
  {
    quote:
      "Fast, clean, and visually sharp. The catalog is easy to scan and the products actually feel premium.",
    name: "Nina Brooks",
    role: "Streaming setup builder",
  },
  {
    quote:
      "It has the confidence of a niche hardware brand, but the shopping flow stays simple and direct.",
    name: "Daniel Park",
    role: "PC enthusiast",
  },
];

/* ─── Landing Page ─────────────────────────────────────────────────────── */
function LandingPage({ onExplore }) {
  return (
    <div className="landing-page">
      <div className="landing-noise" />
      <header className="landing-nav">
        <div className="landing-brandmark">
          <span className="brandmark-dot" />
          Tech Store
        </div>
        <nav className="landing-nav-links">
          <button type="button" className="landing-nav-link">
            Home
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={onExplore}
          >
            Catalog
          </button>
          <button type="button" className="landing-nav-link">
            Builds
          </button>
        </nav>
        <div className="landing-nav-actions">
          <button className="nav-cta" onClick={onExplore}>
            Enter store
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-stage">
          <div className="stage-halo stage-halo-one" />
          <div className="stage-halo stage-halo-two" />
          <div className="stage-halo stage-halo-three" />
          <img
            src="/image.png"
            alt="Retro display"
            className="floating-asset asset-display"
          />
          <img
            src="/image copy.png"
            alt="Blue desktop monitor"
            className="floating-asset asset-monitor"
          />
          <img
            src="/image copy 2.png"
            alt="Server rack"
            className="floating-asset asset-rack"
          />
          <img
            src="/image copy 4.png"
            alt="Open desktop chassis"
            className="floating-asset asset-chassis"
          />
          <div className="landing-hero-copy landing-hero-copy-centered">
            <h1 className="landing-title">
              Shop the
              <br />
              gear that
              <br />
              upgrades
              <br />
              your setup
            </h1>
            <p className="landing-subtitle">
              A more cinematic storefront for desktops, displays, and creative
              gear.
            </p>
            <div className="landing-actions">
              <div className="catalog-invite">
                <img
                  src="/cursor.png"
                  alt="Cursor"
                  className="catalog-cursor"
                />
                <button className="cta-button" onClick={onExplore}>
                  Open Shop Catalog
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              <a href="#collection" className="ghost-link">
                see testimonials
              </a>
            </div>
            <div className="landing-signal-list">
              {landingSignals.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="landing-section landing-section-proof"
        id="collection"
      >
        <div className="section-intro">
          <p className="section-label">Testimonials</p>
          <h2>
            People remember the atmosphere first, then how easy it was to buy.
          </h2>
        </div>
        <div className="proof-layout">
          <div className="proof-visual">
            <div className="proof-badge">Trusted setups</div>
            <img
              src="/image copy.png"
              alt="Desktop monitor"
              className="proof-monitor"
            />
            <img
              src="/image copy 4.png"
              alt="Open chassis system"
              className="proof-chassis"
            />
          </div>
          <div className="testimonial-stack">
            {landingTestimonials.map((item) => (
              <article className="testimonial-card" key={item.name}>
                <p className="testimonial-quote">"{item.quote}"</p>
                <div className="testimonial-meta">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Version Banner ───────────────────────────────────────────────────── */
function VersionBanner({ version }) {
  if (!version) return null;
  const isV1 = version.toLowerCase() === "v1";
  const bg = isV1 ? "#2563eb" : "#10b981";
  return (
    <div
      style={{
        backgroundColor: bg,
        color: "white",
        padding: "8px 16px",
        textAlign: "center",
        fontWeight: "700",
        fontSize: "0.9rem",
        letterSpacing: "0.05em",
      }}
    >
      🟢 Running Version: {version}
    </div>
  );
}

/* ─── Live Status Widget ───────────────────────────────────────────────── */
function StatusWidget({ info }) {
  if (!info) return null;
  const version = info.version || "unknown";
  const isV1 = version.toLowerCase().includes("v1");
  const accent = isV1 ? "#2563eb" : "#10b981";
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "rgba(10,10,20,0.92)",
        border: `1px solid ${accent}44`,
        padding: "14px 18px",
        borderRadius: "10px",
        color: "white",
        zIndex: 8888,
        fontFamily: "monospace",
        fontSize: "0.8rem",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        backdropFilter: "blur(8px)",
        minWidth: "200px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
        <span
          style={{
            fontWeight: "700",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          Live Traffic Monitor
        </span>
      </div>
      <div>
        <span style={{ color: "#888" }}>Status:</span>{" "}
        <span style={{ color: accent, fontWeight: "700" }}>{info.status}</span>
      </div>
      <div>
        <span style={{ color: "#888" }}>Hostname:</span> {info.hostname}
      </div>
      <div>
        <span style={{ color: "#888" }}>Version: </span>
        <span style={{ color: accent, fontWeight: "700" }}>{version}</span>
      </div>
      <div>
        <span style={{ color: "#888" }}>DB:</span> {info.db}
      </div>
      <div>
        <span style={{ color: "#888" }}>Redis:</span> {info.redis}
      </div>
    </div>
  );
}

/* ─── Cart Sidebar ─────────────────────────────────────────────────────── */
function CartSidebar({ cart, onClose, onCheckout, onUpdateQuantity }) {
  const [paymentMethod, setPaymentMethod] = useState("online");
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0,
  );
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "#0f1117",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.3rem", color: "white" }}>
            Cart ({count} items)
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#666", marginTop: "60px" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "14px",
                  marginBottom: "16px",
                  padding: "14px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "72px",
                    height: "72px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.target.style.background = "#1e2130";
                    e.target.src = "";
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "white",
                      marginBottom: "4px",
                      fontSize: "0.95rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      color: "#2563eb",
                      fontWeight: "700",
                      marginBottom: "10px",
                    }}
                  >
                    ${Number(item.price).toFixed(2)}
                  </div>
                  {/* Quantity Controls */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "0" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity || 1, "decrease")
                      }
                      style={{
                        width: "30px",
                        height: "30px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                        cursor: "pointer",
                        borderRadius: "6px 0 0 6px",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <div
                      style={{
                        width: "40px",
                        height: "30px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderLeft: "none",
                        borderRight: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "700",
                      }}
                    >
                      {item.quantity || 1}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity || 1, "increase")
                      }
                      style={{
                        width: "30px",
                        height: "30px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "#2563eb",
                        color: "white",
                        cursor: "pointer",
                        borderRadius: "0 6px 6px 0",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    flexShrink: 0,
                  }}
                >
                  ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background: "#0a0c14",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "white",
                marginBottom: "20px",
              }}
            >
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p
                style={{
                  color: "#888",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "10px",
                }}
              >
                Payment Method
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  { value: "online", label: "💳 Credit / Debit Card" },
                  { value: "cod", label: "💵 Cash on Delivery (COD)" },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      color: "white",
                      background:
                        paymentMethod === value
                          ? "rgba(37,99,235,0.2)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        paymentMethod === value
                          ? "1px solid #2563eb"
                          : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <input
                      type="radio"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      style={{ accentColor: "#2563eb" }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <button
              className="cta-button"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: "10px",
              }}
              onClick={() => onCheckout(paymentMethod)}
            >
              Complete Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────────────────────── */
function App() {
  const [view, setView] = useState(getViewFromPath);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [deployInfo, setDeployInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  // Live /api/health polling every 1 s
  useEffect(() => {
    const poll = () =>
      fetchFromBackend("/health")
        .then((r) => r.json())
        .then(setDeployInfo)
        .catch(() => {});
    poll();
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sync = () => setView(getViewFromPath());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigateTo = (v) => {
    const path = v === "catalog" ? "/catalog" : "/";
    if (window.location.pathname !== path)
      window.history.pushState({}, "", path);
    setView(v);
  };

  const fetchProducts = () => {
    setLoading(true);
    fetchFromBackend("/products")
      .then((r) => {
        if (!r.ok) throw new Error("Backend unavailable");
        return r.json();
      })
      .then((d) => {
        setProducts(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchCart = () =>
    fetchFromBackend("/cart")
      .then(parseCartResponse)
      .then(setCart)
      .catch((e) => console.error("fetchCart error", e));

  const addToCart = (product) =>
    fetchFromBackend("/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then(parseCartResponse)
      .then(setCart)
      .catch((e) => console.error("addToCart error", e));

  const updateQuantity = (productId, currentQuantity, action) => {
    const endpoint =
      action === "increase"
        ? `/cart/${productId}/increment`
        : `/cart/${productId}/decrement`;

    return fetchFromBackend(endpoint, {
      method: "POST",
    })
      .then(parseCartResponse)
      .then(setCart)
      .catch((e) => {
        console.error("updateQuantity error", e);
        fetchCart();
      });
  };

  const handleCheckout = (paymentMethod) =>
    fetchFromBackend("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_method: paymentMethod }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          alert(`✅ Order placed! ID: ${d.orderId}`);
          setCart([]);
          setShowCart(false);
        } else {
          alert("Checkout failed: " + (d.error || "unknown error"));
        }
      })
      .catch(() => alert("Checkout failed — backend error"));

  const safeCart = Array.isArray(cart) ? cart : [];
  const cartCount = safeCart.reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <>
      <VersionBanner version={deployInfo?.version} />

      {view === "landing" ? (
        <LandingPage onExplore={() => navigateTo("catalog")} />
      ) : (
        <div className="layout">
          {/* Header */}
          <header>
            <div
              className="brand"
              onClick={() => navigateTo("landing")}
              style={{ cursor: "pointer" }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#2563eb" />
                <path
                  d="M8 16H24M16 8V24"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Tech Store
            </div>

            <div className="search-bar">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search products..." />
            </div>

            <nav className="nav-links">
              <button
                id="cart-btn"
                className="nav-link"
                onClick={() => setShowCart(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "600",
                }}
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span
                    style={{
                      background: "#2563eb",
                      color: "white",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </nav>
          </header>

          <div className="categories">
            {[
              "Monitors",
              "Keyboards",
              "Components",
              "Accessories",
              "Audio",
              "Case",
            ].map((c) => (
              <span key={c} className="category-item">
                {c}
              </span>
            ))}
          </div>

          <main className="container">
            <div className="hero">
              <h1>
                Upgrade Your Desk.
                <br />
                Elevate Your Performance.
              </h1>
              <p>
                Browse our curated collection of professional tech products.
                Free shipping on all orders over $99.
              </p>
            </div>

            {loading && (
              <p style={{ textAlign: "center", color: "#888" }}>
                Loading products…
              </p>
            )}

            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id || product.sku} className="product-card">
                  <div className="image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/400x300/1e2130/555?text=Tech+Store";
                      }}
                    />
                  </div>
                  <span className="product-tag">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="price-row">
                    <span className="price">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <button
                      id={`add-to-cart-${product.id}`}
                      className="add-btn"
                      onClick={() => addToCart(product)}
                      title="Add to cart"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {showCart && (
            <CartSidebar
              cart={safeCart}
              onClose={() => setShowCart(false)}
              onCheckout={handleCheckout}
              onUpdateQuantity={updateQuantity}
            />
          )}
        </div>
      )}

      <StatusWidget info={deployInfo} />
    </>
  );
}

export default App;
