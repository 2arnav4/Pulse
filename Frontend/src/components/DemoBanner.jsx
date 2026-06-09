import { useAuth } from "../context/AuthContext";
import { Sparkles } from "lucide-react";
import styles from "./DemoBanner.module.css";

export default function DemoBanner() {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div className={styles.banner}>
      <Sparkles size={16} className={styles.icon} />
      <span>
        <strong>Demo mode</strong> — explore freely and make any changes you like.
        Nothing is saved once you leave.
      </span>
    </div>
  );
}
