import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Building2, ShieldCheck, UserCheck, Lock, Mail, ArrowRight } from "lucide-react";

const Login = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === "admin") {
      setEmail("munjaba@factohr.com");
      setPassword("Munjaba@123");
    } else {
      setEmail("vishwajeet@factohr.com");
      setPassword("Vishwajeet@123");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        padding: "1.5rem",
      }}
    >
      <div
        className="fade-in"
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(21, 28, 44, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "2.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          color: "#fff",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.4)",
            }}
          >
            <Building2 size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>FactoHR</h1>
          <p style={{ fontSize: "0.88rem", color: "#94a3b8", marginTop: "0.25rem" }}>
            Enterprise HR Management System
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid #f43f5e",
              color: "#f43f5e",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: "#cbd5e1" }}>
              Work Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: "2.5rem", background: "rgba(15, 23, 42, 0.6)", color: "#fff", borderColor: "rgba(255, 255, 255, 0.1)" }}
                placeholder="name@factohr.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: "#cbd5e1" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: "2.5rem", background: "rgba(15, 23, 42, 0.6)", color: "#fff", borderColor: "rgba(255, 255, 255, 0.1)" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem", marginTop: "0.5rem", fontSize: "1rem" }}
          >
            {loading ? "Authenticating..." : "Sign In to Portal"}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* One-click Demo Account Fillers */}
        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", textAlign: "center", marginBottom: "1rem" }}>
            Demo Quick Login
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ background: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", borderColor: "rgba(37, 99, 235, 0.3)", padding: "0.6rem" }}
              onClick={() => handleQuickFill("admin")}
            >
              <ShieldCheck size={16} />
              <div style={{ textAlign: "left", lineHeight: "1.2" }}>
                <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>Admin</div>
                <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>munjaba@factohr.com</div>
              </div>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.3)", padding: "0.6rem" }}
              onClick={() => handleQuickFill("employee")}
            >
              <UserCheck size={16} />
              <div style={{ textAlign: "left", lineHeight: "1.2" }}>
                <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>Employee</div>
                <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>vishwajeet@factohr.com</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
