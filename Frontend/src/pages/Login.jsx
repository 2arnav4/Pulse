import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-block">
        <div className="auth-logo-icon">⚡</div>
        <span className="auth-logo-name">Pulse</span>
      </div>

      <div className="auth-card">
        <h1 className="auth-card-title">Welcome back</h1>
        <p className="auth-card-subtitle">Please enter your details to sign in.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="auth-input" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <div className="input-row">
              <label className="input-label">Password</label>
              <span className="forgot-link">Forgot password?</span>
            </div>
            <div className="input-wrapper">
              <input className="auth-input has-toggle" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="remember-row">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember for 30 days</label>
          </div>

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="auth-divider"><span>or continue with</span></div>

          <div className="social-row">
            <button type="button" className="social-btn"><FcGoogle size={18} /> Google</button>
            <button type="button" className="social-btn"><FaGithub size={18} /> Github</button>
          </div>
        </form>
      </div>

      <div className="auth-footer">
        Don't have an account?{" "}
        <span onClick={() => navigate("/register")}>Sign up</span>
      </div>
    </div>
  );
}