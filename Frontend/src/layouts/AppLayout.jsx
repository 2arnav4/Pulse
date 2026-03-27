import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import styles from "./AppLayout.module.css";
import CreateWorkspaceModal from "../pages/Dashboard/CreateWorkspaceModal";

export default function AppLayout() {
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const location = useLocation();

  // Allow pages (e.g. Dashboard) to update their UI immediately after creation.
  const handleWorkspaceCreated = (newSpace) => {
    window.dispatchEvent(
      new CustomEvent("workspace-created", { detail: newSpace }),
    );
  };

  useEffect(() => {
    setIsCreateWorkspaceOpen(false);
  }, [location.pathname]);

  // Allow any page to open the create workspace modal.
  useEffect(() => {
    const openModal = () => setIsCreateWorkspaceOpen(true);
    window.addEventListener("open-create-workspace", openModal);
    return () => window.removeEventListener("open-create-workspace", openModal);
  }, []);

  return (
    <div className={styles.appContainer}>
      <Sidebar onNewWorkspace={() => setIsCreateWorkspaceOpen(true)} />
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
}
