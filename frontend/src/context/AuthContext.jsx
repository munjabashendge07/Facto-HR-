import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);
const login = async (email, password) => {
  setError(null);

  try {
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    setUser(res.data.user || res.data);

    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Login failed";

    setError(msg);
    throw new Error(msg);
  }
};

  const updateUserProfile = async (data) => {
    try {
      const res = await API.put("/auth/profile", data);
      setUser(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile";
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, fetchCurrentUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
