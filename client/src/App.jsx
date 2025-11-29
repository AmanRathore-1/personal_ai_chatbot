import { useState } from "react";
import Admin from "./components/Admin.jsx";
import Chat from "./components/Chat.jsx";
import Sidebar from "./components/Sidebar.jsx";

export default function App() {
  const [view, setView] = useState("chat"); // chat | admin

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} />

      <div className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Personal AI Chatbot</h2>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Connected to your personal DB
            </div>
          </div>

          <button
            className="btn"
            style={{ padding: "8px 12px", borderRadius: 10 }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>

        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {view === "chat" ? <Chat /> : <Admin />}
        </div>
      </div>
    </div>
  );
}
