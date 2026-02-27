import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.module.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Temporary dummy data until we build the real Level 2.1 Backend APIs
  const [workspaces] = useState([
    { id: 1, name: "Engineering Team", role: "Admin", members: 12 },
    { id: 2, name: "Marketing Campaign Q3", role: "Member", members: 5 },
    { id: 3, name: "Personal Projects", role: "Admin", members: 1 },
  ]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="dashboard-layout">
      {/* 1. Global Nav Bar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="brand-logo">P</div>
          <span className="brand-text">Pulse</span>
        </div>
        <div className="nav-user">
          <span className="user-greeting">Welcome, {user?.username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      {/* 2. Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="header-title">Your Workspaces</h1>
            <p className="header-subtitle">
              Select a workspace to jump into your command center.
            </p>
          </div>
          <button
            className="create-workspace-btn"
            onClick={() => alert("Create Modal Coming Soon!")}
          >
            + New Workspace
          </button>
        </header>
        {/* 3. The Grid of Cards */}
        <div className="workspace-grid">
          {workspaces.map((space) => (
            <div
              key={space.id}
              className="workspace-card"
              onClick={() => alert(`Going to ${space.name}...`)}
            >
              <div className="card-top">
                <h3 className="card-title">{space.name}</h3>
                <span className={`role-badge ${space.role.toLowerCase()}`}>
                  {space.role}
                </span>
              </div>
              <div className="card-bottom">
                <div className="member-count">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{space.members} members</span>
                </div>
                <button className="enter-btn">Enter &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
