import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

//Create Context
export const AuthContext = createContext();

// Simple hook to use it inside components easily
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. When app loads, check if we already have a token saved
    const loadUser = async () => {
      const token = localStorage.getItem("Pulse_token");
      if (token) {
        try {
          //Talk to the protected backend route we just built!
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (error) {
          console.log("Token expired or invalid -- ", error);
          localStorage.removeItem("Pulse_token");
        }
      }
      setLoading(false); // stop the laoding screen
    };
    loadUser();
  }, []);

  // 2. login Logic
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("Pulse_token", res.data.token); // Save token securely
    setUser(res.data.user); // Save user data globally
  };

  // 3. Register Logic
  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("Pulse_token", res.data.token); // Save token securely
    setUser(res.data.user); // Save user data globally
  };

  // 4. Logout Logic
  const logout = () => {
    localStorage.removeItem("Pulse_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
