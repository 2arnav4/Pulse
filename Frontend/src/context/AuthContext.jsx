import { useState, useEffect } from "react";
import api from "../services/api";
import { DEMO_USER, resetDemoStore } from "../services/demoStore";
import { AuthContext } from "./authCore";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("Pulse_token"));
  const [isDemoMode, setIsDemoMode] = useState(
    localStorage.getItem("Pulse_demo_mode") === "true",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.getItem("Pulse_demo_mode") === "true") {
        setUser(DEMO_USER);
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("Pulse_token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (error) {
          console.log("Token expired or invalid -- ", error);
          localStorage.removeItem("Pulse_token");
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    localStorage.removeItem("Pulse_demo_mode");
    setIsDemoMode(false);
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("Pulse_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (username, email, password) => {
    localStorage.removeItem("Pulse_demo_mode");
    setIsDemoMode(false);
    const res = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("Pulse_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const enterDemoMode = () => {
    resetDemoStore();
    localStorage.removeItem("Pulse_token");
    localStorage.setItem("Pulse_demo_mode", "true");
    setToken(null);
    setUser(DEMO_USER);
    setIsDemoMode(true);
  };

  const logout = () => {
    localStorage.removeItem("Pulse_token");
    localStorage.removeItem("Pulse_demo_mode");
    setUser(null);
    setToken(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDemoMode,
        login,
        register,
        logout,
        enterDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
