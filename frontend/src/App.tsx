import { Routes, Route, Navigate } from "react-router-dom";
import MatchesPage from "./pages/MatchesPage";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BottomNav from "./components/BottomNav";
import { useBootstrapAuth } from "./hooks/useBootstrapAuth";
import "./index.css";

export default function App() {
  useBootstrapAuth();

  return (
    <div className="min-h-screen w-full pb-20">
      {" "}
      {/* space for bottom nav */}
      <div className="mx-auto max-w-md p-4 space-y-4">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
