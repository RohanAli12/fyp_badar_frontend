import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Square,
  User,
  Clock,
  MapPin,
  AlertCircle,
  Wifi,
  Monitor,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchStudentByRollNumber,
  saveDetectionScreenshot,
  mockStudentData,
} from "../services/studentService";

// Import face-api.js
import * as faceapi from "face-api.js";

const LiveStream = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState("inactive");
  const [cameraMode, setCameraMode] = useState("local"); // 'local', 'external'
  const [externalCameraUrl, setExternalCameraUrl] = useState(
    "http://192.168.100.20:8080/video"
  );
  const [cameraError, setCameraError] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [detectedFaces, setDetectedFaces] = useState([]);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load the required models
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/modles"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/modles"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/modles"),
        ]);
        setModelsLoaded(true);
        console.log("Face detection models loaded successfully");
      } catch (error) {
        console.error("Error loading face detection models:", error);
        toast.error("Failed to load face detection models");
      }
    };

    loadModels();
  }, []);

  // Check if student exists in mock data (replace with API call)
  const findStudent = (rollNo) => {
    return mockStudentData.find((student) => student.rollNumber === rollNo);
  };

  // Create face matcher for the target student
  const createFaceMatcher = async (student) => {
    if (!student.photoUrl || !modelsLoaded) return null;

    try {
      // Load the student's reference image
      const referenceImage = await faceapi.fetchImage(student.photoUrl);

      // Detect face and compute descriptor
      const referenceDetection = await faceapi
        .detectSingleFace(referenceImage)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (referenceDetection) {
        // Create labeled descriptor for the student
        const labeledDescriptor = new faceapi.LabeledFaceDescriptors(
          student.rollNumber,
          [referenceDetection.descriptor]
        );

        // Create face matcher
        const matcher = new faceapi.FaceMatcher(labeledDescriptor, 0.6); // 0.6 threshold
        return matcher;
      }
    } catch (error) {
      console.error("Error creating face matcher:", error);
    }
    return null;
  };

  const startStreaming = async () => {
    if (!rollNumber.trim()) {
      toast.error("Please enter a roll number");
      return;
    }

    if (cameraMode === "external" && !externalCameraUrl.trim()) {
      toast.error("Please enter external camera URL");
      return;
    }

    if (!modelsLoaded) {
      toast.error("Face detection models are still loading. Please wait.");
      return;
    }

    try {
      // Try to fetch from API first, fallback to mock data
      let student;
      try {
        student = await fetchStudentByRollNumber(rollNumber);
      } catch (apiError) {
        console.log("API not available, using mock data");
        student = findStudent(rollNumber);
      }

      if (!student) {
        toast.error("Student not found with this roll number");
        return;
      }

      setStudentData(student);
      setIsStreaming(true);
      setDetectionStatus("active");
      toast.success(`Started streaming for ${student.name}`);

      // Create face matcher for the student
      const matcher = await createFaceMatcher(student);
      setFaceMatcher(matcher);

      // Start detection monitoring
      detectionIntervalRef.current = setInterval(() => {
        checkForFaceDetection();
      }, 1000); // Check every 1 second for real-time detection
    } catch (error) {
      console.error("Error starting stream:", error);
      toast.error("Failed to start streaming");
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setStudentData(null);
    setFaceDetected(false);
    setDetectionStatus("inactive");
    setFaceMatcher(null);
    setDetectedFaces([]);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    toast.success("Streaming stopped");
  };

  const checkForFaceDetection = useCallback(async () => {
    if (!isStreaming || !modelsLoaded) {
      setFaceDetected(false);
      return;
    }

    try {
      let input;

      if (cameraMode === "local" && webcamRef.current) {
        input = webcamRef.current.video;
      } else if (cameraMode === "external") {
        // For external camera, we need to create an image element
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = externalCameraUrl;
        input = img;
      }

      if (!input) return;

      // Detect all faces with landmarks and descriptors
      const detections = await faceapi
        .detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceDescriptors();

      setDetectedFaces(detections);

      if (detections.length > 0) {
        setFaceDetected(true);

        // Check if any detected face matches our target student
        if (faceMatcher && studentData) {
          let matchFound = false;

          detections.forEach((detection) => {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

            if (
              bestMatch.label === studentData.rollNumber &&
              bestMatch.distance < 0.6
            ) {
              matchFound = true;
              console.log(
                `Target student ${studentData.name} detected! Distance: ${bestMatch.distance}`
              );
            }
          });

          if (matchFound) {
            // Prevent multiple detections within 5 seconds
            const now = Date.now();
            if (lastDetectionTime && now - lastDetectionTime < 5000) {
              return;
            }

            // Capture screenshot and save detection
            captureAndSaveDetection();
            setLastDetectionTime(now);
          }
        }
      } else {
        setFaceDetected(false);
      }

      // Draw detection results on canvas
      drawDetectionResults(detections);
    } catch (error) {
      console.error("Error in face detection:", error);
      setFaceDetected(false);
    }
  }, [
    isStreaming,
    modelsLoaded,
    cameraMode,
    externalCameraUrl,
    faceMatcher,
    studentData,
    lastDetectionTime,
  ]);

  const drawDetectionResults = (detections) => {
    if (!canvasRef.current || !webcamRef.current) return;

    const canvas = canvasRef.current;
    const video = webcamRef.current.video;

    if (!video) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    // Resize detections to match display size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Clear canvas
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw detection boxes
    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;

      // Draw bounding box
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw label
      if (faceMatcher && studentData) {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const label =
          bestMatch.label === studentData.rollNumber
            ? `${studentData.name} (${bestMatch.distance.toFixed(2)})`
            : `Unknown (${bestMatch.distance.toFixed(2)})`;

        ctx.fillStyle =
          bestMatch.label === studentData.rollNumber ? "#00ff00" : "#ff0000";
        ctx.font = "16px Arial";
        ctx.fillText(label, box.x, box.y - 10);
      }
    });
  };

  const captureAndSaveDetection = useCallback(async () => {
    if (!studentData) return;

    setIsProcessing(true);

    try {
      let screenshot;

      if (cameraMode === "local" && webcamRef.current) {
        screenshot = webcamRef.current.getScreenshot();
      } else if (cameraMode === "external") {
        // For external camera, we'll use the URL directly
        screenshot = externalCameraUrl;
      }

      if (!screenshot) return;

      // Save detection to localStorage
      const detection = saveDetectionScreenshot(screenshot, studentData);

      // Update local state
      setDetections((prev) => [detection, ...prev]);

      toast.success(`Student ${studentData.name} detected! Screenshot saved.`);
    } catch (error) {
      console.error("Error capturing detection:", error);
      toast.error("Failed to save detection");
    } finally {
      setIsProcessing(false);
    }
  }, [studentData, cameraMode, externalCameraUrl]);

  const captureScreenshot = () => {
    if (!studentData) return;

    let screenshot;

    if (cameraMode === "local" && webcamRef.current) {
      screenshot = webcamRef.current.getScreenshot();
    } else if (cameraMode === "external") {
      screenshot = externalCameraUrl;
    }

    if (screenshot) {
      try {
        const detection = saveDetectionScreenshot(screenshot, studentData);
        setDetections((prev) => [detection, ...prev]);
        toast.success("Manual screenshot captured!");
      } catch (error) {
        toast.error("Failed to save screenshot");
      }
    }
  };

  const handleCameraError = () => {
    setCameraError(true);
    toast.error("Local camera not available. Please try external camera mode.");
  };

  const resetCameraMode = () => {
    setCameraMode("local");
    setExternalCameraUrl("http://192.168.100.20:8080/video");
    setCameraError(false);
  };

  // Load existing detections on component mount
  useEffect(() => {
    const existingDetections = JSON.parse(
      localStorage.getItem("detections") || "[]"
    );
    setDetections(existingDetections);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="live-stream-container">
      <div className="stream-controls">
        <div className="roll-number-input">
          <User className="icon" />
          <input
            type="text"
            placeholder="Enter Student Roll Number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            disabled={isStreaming}
          />
        </div>

        <div className="control-buttons">
          {!isStreaming ? (
            <button
              className="btn btn-primary"
              onClick={startStreaming}
              disabled={!rollNumber.trim() || !modelsLoaded}
            >
              <Camera className="icon" />
              {modelsLoaded ? "Start Stream" : "Loading Models..."}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopStreaming}>
              <Square className="icon" />
              Stop Stream
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={captureScreenshot}
            disabled={!isStreaming}
          >
            <Camera className="icon" />
            Manual Capture
          </button>
        </div>
      </div>

      {/* Camera Mode Selection */}
      <div className="camera-mode-selection">
        <h3>Camera Options</h3>
        <div className="camera-modes">
          <button
            className={`camera-mode-btn ${
              cameraMode === "local" ? "active" : ""
            }`}
            onClick={() => setCameraMode("local")}
            disabled={isStreaming}
          >
            <Monitor className="icon" />
            Local Camera
          </button>
          <button
            className={`camera-mode-btn ${
              cameraMode === "external" ? "active" : ""
            }`}
            onClick={() => setCameraMode("external")}
            disabled={isStreaming}
          >
            <Wifi className="icon" />
            External Camera
          </button>
        </div>

        {/* External Camera URL Input */}
        {cameraMode === "external" && (
          <div className="external-camera-input">
            <input
              type="text"
              placeholder="Enter external camera URL (e.g., http://192.168.1.100:8080/video)"
              value={externalCameraUrl}
              onChange={(e) => setExternalCameraUrl(e.target.value)}
              disabled={isStreaming}
            />
            <p className="help-text">
              Common formats: /video, /stream, /mjpeg, /snapshot, or just the
              base URL
            </p>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="camera-error-message">
            <AlertCircle className="icon" />
            <p>Local camera not available. Try external camera mode.</p>
            <button className="btn btn-secondary" onClick={resetCameraMode}>
              Reset Camera Mode
            </button>
          </div>
        )}
      </div>

      <div className="stream-content">
        <div className="webcam-section">
          <div className="webcam-container">
            {/* Local Camera */}
            {cameraMode === "local" && !cameraError && (
              <div className="camera-wrapper">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="webcam"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user",
                  }}
                  onUserMediaError={handleCameraError}
                />
                <canvas
                  ref={canvasRef}
                  className="detection-canvas"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                  }}
                />
              </div>
            )}

            {/* External Camera */}
            {cameraMode === "external" && externalCameraUrl && (
              <>
                {/* Try video stream first */}
                <video
                  src={externalCameraUrl}
                  autoPlay
                  muted
                  className="webcam"
                  onError={(e) => {
                    console.log("Video stream failed, trying image stream");
                    // If video fails, we'll show an error message
                  }}
                />
                {/* Fallback image stream */}
                <img
                  src={externalCameraUrl}
                  alt="External Camera"
                  className="webcam"
                  style={{ display: "none" }}
                  onLoad={(e) => {
                    // If image loads successfully, show it and hide video
                    e.target.style.display = "block";
                    const videoElement = e.target.previousElementSibling;
                    if (videoElement) videoElement.style.display = "none";
                  }}
                  onError={() => {
                    toast.error(
                      "Failed to load external camera. Please check the URL and ensure the camera is accessible."
                    );
                  }}
                />
              </>
            )}

            {/* Camera Not Available */}
            {cameraMode === "local" && cameraError && (
              <div className="camera-not-available">
                <Monitor className="icon large" />
                <h3>Camera Not Available</h3>
                <p>Please try external camera mode.</p>
              </div>
            )}

            {/* No Source Selected */}
            {cameraMode === "external" && !externalCameraUrl && (
              <div className="camera-not-available">
                <Wifi className="icon large" />
                <h3>External Camera</h3>
                <p>Please enter external camera URL above.</p>
              </div>
            )}

            {/* Processing overlay */}
            {isProcessing && (
              <div className="processing-overlay">
                <div className="processing-spinner"></div>
                <p>Saving detection...</p>
              </div>
            )}

            {/* Face detection status */}
            <div className={`face-status ${faceDetected ? "detected" : ""}`}>
              {faceDetected ? (
                <div className="status-detected">
                  <AlertCircle className="icon" />
                  {detectedFaces.length} Face(s) Detected
                </div>
              ) : (
                <div className="status-scanning">
                  <Camera className="icon" />
                  Scanning for faces...
                </div>
              )}
            </div>
          </div>

          {studentData && (
            <div className="student-info">
              <h3>Target Student</h3>
              <div className="student-card">
                <img
                  src={
                    studentData.photoUrl || "https://via.placeholder.com/150"
                  }
                  alt={studentData.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <div className="student-details">
                  <h4>{studentData.name}</h4>
                  <p>
                    <strong>Roll No:</strong> {studentData.rollNumber}
                  </p>
                  <p>
                    <strong>Department:</strong> {studentData.department}
                  </p>
                  <p>
                    <strong>Semester:</strong> {studentData.semester}
                  </p>
                  <p>
                    <strong>Video:</strong> {studentData.videoUrl}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detection History */}
        <div className="detection-history">
          <h3>Recent Detections</h3>
          <div className="detection-list">
            {detections.slice(0, 5).map((detection, index) => (
              <div key={index} className="detection-item">
                <img
                  src={detection.screenshot}
                  alt="Detection"
                  className="detection-thumbnail"
                />
                <div className="detection-info">
                  <h4>{detection.studentName}</h4>
                  <p>
                    <Clock className="icon small" />
                    {new Date(detection.timestamp).toLocaleString()}
                  </p>
                  <p>
                    <MapPin className="icon small" />
                    {detection.location}
                  </p>
                </div>
              </div>
            ))}
            {detections.length === 0 && (
              <p className="no-detections">No detections yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
