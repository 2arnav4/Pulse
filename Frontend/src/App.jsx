import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast"; // <-- IMPORT THIS
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Could replace with a spinner later
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ADD GLOBAL TOASTER HERE */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#FFF1E6", // Your warm cream background
              color: "#3d322c", // Dark text
              border: "1px solid rgba(203, 153, 126, 0.3)", // Terracotta border
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              padding: "16px",
            },
            success: {
              iconTheme: {
                primary: "#A5A58D", // Moss Green
                secondary: "#FFF",
              },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
