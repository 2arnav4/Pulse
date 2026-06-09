import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DemoBanner from "../components/DemoBanner";
import styles from "./AppLayout.module.css";
import CreateWorkspaceModal from "../pages/Dashboard/CreateWorkspaceModal";

export default function AppLayout() {
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [createdWorkspaces, setCreatedWorkspaces] = useState([]);

  const handleWorkspaceCreated = (newSpace) => {
    if (!newSpace?.id) return;
    setCreatedWorkspaces((prev) =>
      prev.some((space) => space.id === newSpace.id)
        ? prev
        : [...prev, newSpace],
    );
  };

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
        <DemoBanner />
        <Outlet context={{ createdWorkspaces }} />
      </main>

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
}
