import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import "./Auth.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(username, email, password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
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
        <h1 className="auth-card-title">Create an account</h1>
        <p className="auth-card-subtitle">Start collaborating with your team today.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input className="auth-input" type="text" placeholder="yourname" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="auth-input" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <input className="auth-input has-toggle" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          <div className="auth-divider"><span>or continue with</span></div>

          <div className="social-row">
            <button type="button" className="social-btn"><FcGoogle size={18} /> Google</button>
            <button type="button" className="social-btn"><FaGithub size={18} /> Github</button>
          </div>
        </form>
      </div>

      <div className="auth-footer">
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Sign in</span>
      </div>
    </div>
  );
}