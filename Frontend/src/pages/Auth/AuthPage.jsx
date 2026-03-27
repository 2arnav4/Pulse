import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./AuthPage.module.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || (isLogin ? "Login failed" : "Registration failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.brandPanel}>
        <div className={styles.meshBg}></div>
        <div className={styles.brandContent}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>⚡</div>
            <span className={styles.pulseText}>PULSE</span>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <h1 className={styles.taglineHeading}>Move fast.<br/>Stay aligned.</h1>
            <p className={styles.taglineSub}>The Collaboration Engine.</p>
          </motion.div>
          <div className={styles.systemStatus}>
            <span className={styles.statusLabel}>SYSTEM STATUS</span>
            <span className={styles.statusValue}>All systems operational</span>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <motion.div 
          className={styles.formCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className={styles.formTitle}>{isLogin ? "Sign In" : "Create Account"}</h2>
          <p className={styles.formSubtitle}>
            {isLogin ? "Enter your credentials to access the workspace." : "Start collaborating with your team today."}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Username</label>
                <input 
                  className={styles.input} 
                  type="text" 
                  placeholder="yourname" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            )}
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Work Email</label>
              <input 
                className={styles.input} 
                type="email" 
                placeholder="name@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                {isLogin && <span className={styles.forgot}>Forgot?</span>}
              </div>
              <div className={styles.inputWrapper}>
                <input 
                  className={styles.input} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  className={styles.togglePassword} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className={styles.errorText}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (isLogin ? "Signing in..." : "Creating...") : (isLogin ? "Sign In" : "Create Account")}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className={styles.formFooter}>
            {isLogin ? "New here? " : "Already have an account? "}
            <span 
              className={styles.switchMode} 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
            >
              {isLogin ? "Create an account" : "Sign in"}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
