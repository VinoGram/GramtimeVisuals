import { useState, useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "gtv_visitor_captured";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Delay before popup appears (ms)
const POPUP_DELAY = 4000;

export function VisitorCapture() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only show if not already captured
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), POPUP_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    // Mark as seen even if they close without submitting — won't show again
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API}/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          page: window.location.pathname,
          referrer: document.referrer,
        }),
      });
      localStorage.setItem(STORAGE_KEY, "captured");
      toast.success("Thanks! We'll be in touch ✨");
      setVisible(false);
    } catch {
      // Still mark as captured so we don't pester them
      localStorage.setItem(STORAGE_KEY, "captured");
      setVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.3s ease",
      }}
      onClick={e => e.target === e.currentTarget && dismiss()}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .vc-input:focus { border-color: rgba(74,222,128,0.7) !important; box-shadow: 0 0 0 3px rgba(74,222,128,0.12); outline: none; }
      `}</style>

      <div style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #0d1f10 100%)",
        border: "1px solid rgba(74,222,128,0.2)",
        borderRadius: 20, padding: "40px 36px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
        animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1)",
        position: "relative",
      }}>
        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 18,
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700, letterSpacing: "0.3em" }}>
              GRAMTIME VISUALS
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "0 0 8px", lineHeight: 1.2 }}>
            Let's Stay Connected
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
            Drop your email and we'll reach out about availability, packages, and exclusive offers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
              YOUR NAME
            </label>
            <input
              className="vc-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah & Michael"
              style={{
                width: "100%", padding: "11px 14px", boxSizing: "border-box",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, color: "white", fontSize: 14, fontFamily: "inherit",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
              EMAIL ADDRESS *
            </label>
            <input
              className="vc-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%", padding: "11px 14px", boxSizing: "border-box",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, color: "white", fontSize: 14, fontFamily: "inherit",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "13px",
              background: submitting ? "rgba(74,222,128,0.5)" : "#4ade80",
              color: "#000", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 13, letterSpacing: "0.1em",
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "background 0.2s", marginTop: 4,
            }}
          >
            {submitting ? "SENDING…" : "STAY IN TOUCH →"}
          </button>

          <button
            type="button"
            onClick={dismiss}
            style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.3)",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: 0,
              textAlign: "center",
            }}
          >
            No thanks, maybe later
          </button>
        </form>
      </div>
    </div>
  );
}
