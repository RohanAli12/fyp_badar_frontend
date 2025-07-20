import { useState } from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Components
import LiveStream from "./components/LiveStream";
import DetectionHistory from "./components/DetectionHistory";
import StudentManagement from "./components/StudentManagement";

function App() {
  const [activeTab, setActiveTab] = useState("stream");

  return (
    <div className="App">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="header">
        <h1>Student Detection System</h1>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "stream" ? "active" : ""}`}
            onClick={() => setActiveTab("stream")}
          >
            Live Stream
          </button>
          <button
            className={`nav-tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={`nav-tab ${activeTab === "detections" ? "active" : ""}`}
            onClick={() => setActiveTab("detections")}
          >
            Detection History
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === "stream" && <LiveStream />}
        {activeTab === "students" && <StudentManagement />}
        {activeTab === "detections" && <DetectionHistory />}
      </main>
    </div>
  );
}

export default App;
