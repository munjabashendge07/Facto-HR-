import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Clock,
  CircleDollarSign,
  BarChart3,
  Moon,
  Sun,
  LogOut,
  Bell,
  Cake,
  Building2,
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "Admin";

  const adminNavItems = [
    { id: "dashboard", label: "Dashboard & Analytics", icon: LayoutDashboard },
    { id: "employees", label: "Employee Directory", icon: Users },
    { id: "attendance", label: "Attendance Control", icon: CalendarCheck },
    { id: "leaves", label: "Leave Approvals", icon: FileText },
    { id: "regularization", label: "Regularization", icon: Clock },
    { id: "payroll", label: "Payroll System", icon: CircleDollarSign },
    { id: "reports", label: "Reports & Export", icon: BarChart3 },
  ];

  const employeeNavItems = [
    { id: "profile", label: "My Profile", icon: Users },
    { id: "attendance", label: "My Attendance", icon: CalendarCheck },
    { id: "leaves", label: "My Leaves", icon: FileText },
    { id: "regularization", label: "My Regularization", icon: Clock },
    { id: "payroll", label: "My Salary Slips", icon: CircleDollarSign },
    { id: "documents", label: "My Documents", icon: FileText },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-header">
        <div className="brand-logo">
          <Building2 size={22} />
        </div>
        <div>
          <div className="brand-title">FactoHR</div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-sidebar)", fontWeight: 600 }}>
            Enterprise HRMS
          </span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={logout} style={{ color: "#f43f5e" }}>
          <LogOut size={19} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export const Header = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [birthdayAlerts, setBirthdayAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchBirthdayAlerts = async () => {
      try {
        const res = await API.get("/notifications/birthdays");
        if (res.data?.success) {
          const combined = [...(res.data.birthdaysTomorrow || []), ...(res.data.birthdaysToday || [])];
          setBirthdayAlerts(combined);
        }
      } catch (err) {
        console.error("Birthday scan error:", err);
      }
    };
    fetchBirthdayAlerts();
  }, []);

  const isAdmin = user?.role === "Admin";

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
          {isAdmin ? "Admin Portal" : "Self-Service Portal"}
        </h2>
        <span className="badge badge-info" style={{ textTransform: "uppercase" }}>
          {user?.role || "Employee"}
        </span>
      </div>

      <div className="top-bar-right">
        {/* Birthday Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="theme-toggle-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {birthdayAlerts.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  background: "#ec4899",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {birthdayAlerts.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50px",
                width: "320px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                padding: "1rem",
                boxShadow: "var(--hover-shadow)",
                zIndex: 60,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>Birthday Reminders 🎂</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {birthdayAlerts.length} upcoming
                </span>
              </div>

              {birthdayAlerts.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "0.5rem 0" }}>
                  No upcoming birthdays tomorrow.
                </p>
              ) : (
                birthdayAlerts.map((b, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.6rem 0",
                      borderBottom: idx < birthdayAlerts.length - 1 ? "1px dashed var(--border-color)" : "none",
                    }}
                  >
                    <Cake size={24} style={{ color: "#ec4899" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{b.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        🎂 Birthday Tomorrow ({b.dob}) • {b.department}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} style={{ color: "#fbbf24" }} />}
        </button>

        {/* User Profile Badge */}
        <div className="user-profile-badge">
          {user?.profilePic ? (
            <img src={user.profilePic} alt={user.name} className="avatar-img" />
          ) : (
            <div className="avatar-fallback">{user?.name ? user.name.charAt(0) : "M"}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: "0.88rem" }}>{user?.name || "Munjaba Shendge"}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
              {user?.designation || user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header />
    </>
  );
};

export default Navbar;
