import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Sidebar, Header } from "./components/Navbar";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import { Loader2 } from "lucide-react";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (user) {
      if (user.role === "Admin") {
        setActiveTab("dashboard");
      } else {
        setActiveTab("profile");
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main, #f8fafc)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Loader2 size={40} className="spin" style={{ color: "#2563eb" }} />
          <span style={{ fontWeight: 700, color: "var(--text-muted, #64748b)" }}>
            Loading Enterprise FactoHR Portal...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const isAdmin = user.role === "Admin";

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-wrapper">
        <Header />
        <div className="content-body">
          {isAdmin ? (
            <AdminDashboard activeTab={activeTab} />
          ) : (
            <EmployeeDashboard user={user} activeTab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;