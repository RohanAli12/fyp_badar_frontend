import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  User,
  Clock,
  Trash2,
} from "lucide-react";
import { getDetections, clearDetections } from "../services/studentService";

const DetectionHistory = () => {
  const [detections, setDetections] = useState([]);
  const [filteredDetections, setFilteredDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const loadDetections = async () => {
      setLoading(true);
      try {
        const detectionData = getDetections();
        setDetections(detectionData);
        setFilteredDetections(detectionData);
      } catch (error) {
        console.error("Error loading detections:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDetections();
  }, []);

  // Filter detections based on search and filters
  useEffect(() => {
    let filtered = detections;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (detection) =>
          detection.student?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          detection.student?.rollNumber?.includes(searchTerm) ||
          detection.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by student
    if (selectedStudent) {
      filtered = filtered.filter(
        (detection) => detection.student?.rollNumber === selectedStudent
      );
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter((detection) => {
        const detectionDate = new Date(detection.timestamp);
        return detectionDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredDetections(filtered);
  }, [detections, searchTerm, selectedStudent, dateFilter]);

  const getUniqueStudents = () => {
    const students = detections.map((d) => d.student).filter(Boolean);
    return [...new Map(students.map((s) => [s.rollNumber, s])).values()];
  };

  const downloadDetection = (detection) => {
    try {
      // Create a link to download the screenshot
      const link = document.createElement("a");
      link.href = detection.screenshot;
      link.download = `detection_${
        detection.student?.rollNumber || "unknown"
      }_${detection.timestamp}.jpg`;
      link.click();
    } catch (error) {
      console.error("Error downloading detection:", error);
    }
  };

  const deleteDetection = (detectionId) => {
    const updatedDetections = detections.filter((d) => d.id !== detectionId);
    setDetections(updatedDetections);
    localStorage.setItem("detections", JSON.stringify(updatedDetections));
  };

  const clearAllDetections = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all detections? This action cannot be undone."
      )
    ) {
      clearDetections();
      setDetections([]);
      setFilteredDetections([]);
    }
  };

  const getStatusColor = (confidence) => {
    if (confidence >= 0.9) return "status-confirmed";
    if (confidence >= 0.7) return "status-pending";
    return "status-unknown";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading detection history...</p>
      </div>
    );
  }

  return (
    <div className="detection-history-container">
      <div className="page-header">
        <h2>Detection History</h2>
        <p>Total Detections: {detections.length}</p>
        {detections.length > 0 && (
          <button className="btn btn-danger" onClick={clearAllDetections}>
            <Trash2 className="icon" />
            Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search className="icon" />
          <input
            type="text"
            placeholder="Search by name, roll number, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter className="icon" />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {getUniqueStudents().map((student) => (
                <option key={student.rollNumber} value={student.rollNumber}>
                  {student.name} ({student.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Calendar className="icon" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Detections List */}
      <div className="detections-list">
        {filteredDetections.length === 0 ? (
          <div className="no-detections">
            <Clock className="icon large" />
            <h3>No Detections Found</h3>
            <p>No detections match your current filters.</p>
          </div>
        ) : (
          filteredDetections.map((detection) => (
            <div key={detection.id} className="detection-item">
              <div className="detection-image">
                <img src={detection.screenshot} alt="Detection" />
                <div
                  className={`status-badge ${getStatusColor(
                    detection.confidence
                  )}`}
                >
                  {(detection.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <div className="detection-details">
                <div className="student-info">
                  <h3>{detection.student?.name || "Unknown Student"}</h3>
                  <p className="roll-number">
                    <User className="icon" />
                    Roll No: {detection.student?.rollNumber || "N/A"}
                  </p>
                  <p className="department">
                    Department: {detection.student?.department || "N/A"}
                  </p>
                </div>

                <div className="detection-meta">
                  <p className="timestamp">
                    <Clock className="icon" />
                    {new Date(detection.timestamp).toLocaleString()}
                  </p>
                  <p className="location">
                    <MapPin className="icon" />
                    {detection.location}
                  </p>
                  <p className="confidence">
                    Confidence: {(detection.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="detection-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => downloadDetection(detection)}
                  >
                    <Download className="icon" />
                    Download
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteDetection(detection.id)}
                  >
                    <Trash2 className="icon" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {detections.length > 0 && (
        <div className="summary-stats">
          <div className="stat-card">
            <h4>Total Detections</h4>
            <p>{detections.length}</p>
          </div>
          <div className="stat-card">
            <h4>Unique Students</h4>
            <p>{getUniqueStudents().length}</p>
          </div>
          <div className="stat-card">
            <h4>Average Confidence</h4>
            <p>
              {detections.length > 0
                ? (
                    (detections.reduce((sum, d) => sum + d.confidence, 0) /
                      detections.length) *
                    100
                  ).toFixed(1)
                : "0"}
              %
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionHistory;
