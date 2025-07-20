import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  CameraAlt,
  Visibility,
  Stop,
  CheckCircle,
  Error as ErrorIcon,
  Download,
} from "@mui/icons-material";

const LiveStream = () => {
  // Refs for DOM elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rollNumberInputRef = useRef(null);
  const extImageRef = useRef(null);

  // State variables
  const [status, setStatus] = useState("");
  const [apiStatus, setApiStatus] = useState({ message: "", severity: "info" });
  const [cameraMode, setCameraMode] = useState("local");
  const [rollNumber, setRollNumber] = useState("");
  const [storedFaces, setStoredFaces] = useState([]);
  const [matchFound, setMatchFound] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [matchedFace, setMatchedFace] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFacesDialog, setShowFacesDialog] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [externalCameraUrl, setExternalCameraUrl] = useState("");
  const [targetFaceDescriptor, setTargetFaceDescriptor] = useState(null);
  const [screenshotTaken, setScreenshotTaken] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [showMatchHistory, setShowMatchHistory] = useState(false);
  const [matchHistory, setMatchHistory] = useState([]);
  const [storedFaceDescriptors, setStoredFaceDescriptors] = useState([]);
  const [currentDetections, setCurrentDetections] = useState([]);

  // API Configuration
  const API_BASE_URL = "http://localhost:8000";
  const API_ENDPOINT = "/api/public/faces/";

  // Detection interval ref
  const detectionInterval = useRef(null);
  const currentStream = useRef(null);
  const modelsLoadedRef = useRef(false);
  const targetFaceDescriptorRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  // Setup canvas when component mounts
  useEffect(() => {
    setupCanvas();
  }, []);

  // Check if URL is an image URL
  const isImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i);
  };

  // Initialize models
  const loadModels = async () => {
    if (modelsLoadedRef.current) {
      console.log("Models already loaded (ref check)");
      return true;
    }

    if (modelsLoaded) {
      console.log("Models already loaded (state check)");
      modelsLoadedRef.current = true;
      return true;
    }

    try {
      setStatus("Loading models...");
      setApiStatus({
        message: "Loading face detection models...",
        severity: "info",
      });

      await faceapi.nets.ssdMobilenetv1.loadFromUri("/modles");
      console.log("SSD MobileNet model loaded");

      await faceapi.nets.faceLandmark68Net.loadFromUri("/modles");
      console.log("Face Landmark model loaded");

      await faceapi.nets.faceRecognitionNet.loadFromUri("/modles");
      console.log("Face Recognition model loaded");

      setStatus("Models loaded!");
      setApiStatus({
        message: "Models loaded successfully",
        severity: "success",
      });
      setModelsLoaded(true);
      modelsLoadedRef.current = true;
      return true;
    } catch (error) {
      setStatus("Error loading models");
      setApiStatus({
        message: `Error loading models: ${error.message}`,
        severity: "error",
      });
      return false;
    }
  };

  // Load stored faces from API
  const loadStoredFaces = async () => {
    setApiStatus({
      message: "Loading faces from API...",
      severity: "info",
    });

    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`);
      console.log("API Response:", response.data);
      const faces = response.data.files || [];
      console.log("Faces from API:", faces);
      setStoredFaces(faces);

      if (faces.length === 0) {
        setApiStatus({
          message: "No faces found in database",
          severity: "warning",
        });
        return [];
      }

      setApiStatus({
        message: `Loaded ${faces.length} faces successfully`,
        severity: "success",
      });

      // Load face descriptors for recognition and return them
      const descriptors = await loadStoredFaceDescriptors(faces);
      console.log(
        "Final descriptors returned from loadStoredFaces:",
        descriptors
      );
      return descriptors;
    } catch (error) {
      console.error("Error loading faces:", error);
      setApiStatus({
        message: `Error loading faces: ${error.message}`,
        severity: "error",
      });
      return [];
    }
  };

  // Load stored face descriptors
  const loadStoredFaceDescriptors = async (faces) => {
    console.log("loadStoredFaceDescriptors called with faces:", faces);
    console.log("modelsLoaded:", modelsLoaded);

    if (!modelsLoadedRef.current) {
      console.log("Models not loaded, loading now...");
      const loaded = await loadModels();
      if (!loaded) {
        console.log("Failed to load models");
        return [];
      }
    }

    if (faces.length === 0) {
      console.log("No faces to process");
      return [];
    }

    setApiStatus({
      message: "Loading face descriptors for recognition...",
      severity: "info",
    });

    const descriptors = [];

    try {
      console.log("Processing", faces.length, "faces...");

      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        console.log(`Processing face ${i + 1}/${faces.length}:`, face);
        console.log(`Face name: ${face.name}, Face URL: ${face.url}`);

        try {
          // Create an image element to load the stored face
          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = (error) => {
              console.log(
                `CORS error for ${face.name}, trying without CORS...`
              );
              // Try without CORS if it fails
              const imgNoCors = new Image();
              imgNoCors.onload = resolve;
              imgNoCors.onerror = reject;
              imgNoCors.src = face.url;
            };
            img.src = face.url;
          });

          console.log(
            `Image loaded for ${face.name}, dimensions:`,
            img.naturalWidth,
            "x",
            img.naturalHeight
          );

          // Detect faces and extract descriptors
          const detections = await faceapi
            .detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

          console.log(
            `Face detection for ${face.name}:`,
            detections.length,
            "faces found"
          );

          if (detections.length > 0) {
            // Store the descriptor with face info
            descriptors.push({
              face: face,
              descriptor: detections[0].descriptor,
            });
            console.log(`✅ Loaded descriptor for ${face.name}`);
          } else {
            console.log(`❌ No face detected in ${face.name}`);
          }
        } catch (error) {
          console.error(`Error loading descriptor for ${face.name}:`, error);
        }
      }

      console.log("Final descriptors array:", descriptors);
      setStoredFaceDescriptors(descriptors);
      setApiStatus({
        message: `Loaded ${descriptors.length} face descriptors for recognition`,
        severity: "success",
      });
      console.log(
        `Ready for face recognition with ${descriptors.length} stored faces`
      );
      return descriptors;
    } catch (error) {
      console.error("Error loading face descriptors:", error);
      setApiStatus({
        message: "Error loading face descriptors",
        severity: "error",
      });
      return [];
    }
  };

  // Find target face by roll number
  const findTargetFaceByRollNumber = async (rollNumber, descriptors = null) => {
    console.log(
      "findTargetFaceByRollNumber called with rollNumber:",
      rollNumber
    );

    // Use provided descriptors or fall back to state
    const faceDescriptors = descriptors || storedFaceDescriptors;
    console.log("faceDescriptors length:", faceDescriptors.length);
    console.log("faceDescriptors:", faceDescriptors);

    if (!rollNumber) {
      console.log("No roll number provided");
      return null;
    }

    if (faceDescriptors.length === 0) {
      console.log("No stored face descriptors available");
      setApiStatus({
        message: "No face descriptors loaded. Please try again.",
        severity: "error",
      });
      return null;
    }

    // Look for faces that contain the roll number in their filename
    console.log("Searching for faces containing roll number:", rollNumber);
    console.log("All face descriptors to search through:", faceDescriptors);

    const targetFaces = faceDescriptors.filter((faceData) => {
      console.log("Checking faceData:", faceData);
      console.log("faceData.face:", faceData.face);
      console.log("faceData.face.name:", faceData.face.name);

      const faceName = faceData.face.name.toLowerCase();
      const rollNumberLower = rollNumber.toLowerCase();
      const includesRollNumber = faceName.includes(rollNumberLower);
      console.log(
        `Face: ${faceName}, includes ${rollNumberLower}: ${includesRollNumber}`
      );
      return includesRollNumber;
    });

    console.log("Target faces found:", targetFaces);

    if (targetFaces.length === 0) {
      console.log(`No face found for roll number: ${rollNumber}`);
      setApiStatus({
        message: `No face found for roll number: ${rollNumber}. Available faces: ${faceDescriptors
          .map((f) => f.face.name)
          .join(", ")}`,
        severity: "error",
      });
      return null;
    }

    // Use the first matching face
    const targetFace = targetFaces[0];
    console.log("Selected target face:", targetFace);
    setApiStatus({
      message: `Found target face for roll number ${rollNumber}: ${targetFace.face.name}`,
      severity: "success",
    });

    return targetFace;
  };

  // Compare with target face
  const compareWithTargetFace = async (detectedFace) => {
    if (!targetFaceDescriptorRef.current || !detectedFace.descriptor) {
      console.log(
        "Cannot compare: targetFaceDescriptorRef.current:",
        targetFaceDescriptorRef.current,
        "detectedFace.descriptor:",
        !!detectedFace.descriptor
      );
      return null;
    }

    try {
      const threshold = 0.6; // Similarity threshold (lower = more strict)

      // Calculate distance between descriptors
      const distance = faceapi.euclideanDistance(
        detectedFace.descriptor,
        targetFaceDescriptorRef.current.descriptor
      );

      // Convert distance to similarity (0-1 scale)
      const similarity = Math.max(0, 1 - distance);

      if (similarity >= threshold) {
        return {
          face: targetFaceDescriptorRef.current.face,
          similarity: similarity,
          distance: distance,
          isMatch: true,
        };
      } else {
        return {
          face: targetFaceDescriptorRef.current.face,
          similarity: similarity,
          distance: distance,
          isMatch: false,
        };
      }
    } catch (error) {
      console.error("Error comparing faces:", error);
      return null;
    }
  };

  // Display comparison results
  const displayComparisonResults = (results) => {
    if (!results) {
      setComparisonResults(null);
      return;
    }

    setComparisonResults(results);

    if (results.isMatch && !matchFound) {
      setMatchFound(true);
      setMatchedFace(results.face.name);
      setStatus(`MATCH FOUND! Face recognized for roll number: ${rollNumber}`);
      takeScreenshot();
    }
  };

  // Take screenshot
  const takeScreenshot = () => {
    if (screenshotTaken) return; // Prevent multiple screenshots

    try {
      const screenshotCanvas = document.createElement("canvas");
      const ctx = screenshotCanvas.getContext("2d");
      screenshotCanvas.width = 640;
      screenshotCanvas.height = 480;

      if (cameraMode === "local" && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      } else if (cameraMode === "external" && extImageRef.current) {
        ctx.drawImage(extImageRef.current, 0, 0, 640, 480);
      }

      if (canvasRef.current) {
        ctx.drawImage(canvasRef.current, 0, 0);
      }

      // Create organized filename with folder structure
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const timeStr = now.toISOString().slice(11, 19).replace(/:/g, "-"); // HH-MM-SS
      const timestamp = now.getTime();

      // Create folder structure: face_matches/YYYY-MM-DD/
      const folderName = `face_matches/${dateStr}`;
      const fileName = `match_${rollNumber}_${timeStr}_${timestamp}.png`;
      const fullPath = `${folderName}/${fileName}`;

      const url = screenshotCanvas.toDataURL("image/png");
      setScreenshotUrl(url);

      // Store match data
      storeMatchData(rollNumber, fullPath, now);

      console.log("Screenshot taken and saved");
      setApiStatus({
        message: `Screenshot saved: ${fullPath}`,
        severity: "success",
      });
      setScreenshotTaken(true);
    } catch (error) {
      console.error("Error taking screenshot:", error);
      setApiStatus({ message: "Error taking screenshot", severity: "error" });
    }
  };

  // Download screenshot
  const downloadScreenshot = () => {
    if (!screenshotUrl) {
      setApiStatus({
        message: "No screenshot available to download",
        severity: "warning",
      });
      return;
    }

    try {
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = screenshotUrl;

      // Create filename with timestamp
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const timeStr = now.toISOString().slice(11, 19).replace(/:/g, "-"); // HH-MM-SS
      const fileName = `face_match_${rollNumber}_${dateStr}_${timeStr}.png`;

      link.download = fileName;
      link.style.display = "none";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setApiStatus({
        message: `Screenshot downloaded as ${fileName}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading screenshot:", error);
      setApiStatus({
        message: "Error downloading screenshot",
        severity: "error",
      });
    }
  };

  // Store match data in localStorage
  const storeMatchData = (rollNumber, filePath, timestamp) => {
    try {
      // Get existing match data
      const existingData = localStorage.getItem("faceMatchHistory") || "[]";
      const matchHistory = JSON.parse(existingData);

      // Create new match record
      const matchRecord = {
        id: Date.now(),
        rollNumber: rollNumber,
        fileName: filePath,
        timestamp: timestamp.toISOString(),
        targetFace: targetFaceDescriptor
          ? targetFaceDescriptor.face.name
          : "unknown",
        cameraMode: cameraMode,
        similarity: comparisonResults
          ? comparisonResults.similarity
          : "unknown",
      };

      // Add to history
      matchHistory.push(matchRecord);

      // Keep only last 100 records
      if (matchHistory.length > 100) {
        matchHistory.splice(0, matchHistory.length - 100);
      }

      // Save back to localStorage
      localStorage.setItem("faceMatchHistory", JSON.stringify(matchHistory));
      console.log(
        `Match data stored: ${rollNumber} at ${timestamp.toISOString()}`
      );
    } catch (error) {
      console.error("Error storing match data:", error);
    }
  };

  // Get match history
  const getMatchHistory = () => {
    try {
      const existingData = localStorage.getItem("faceMatchHistory") || "[]";
      return JSON.parse(existingData);
    } catch (error) {
      console.error("Error reading match history:", error);
      return [];
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Setup canvas
  const setupCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
      console.log(
        "Canvas setup with dimensions:",
        canvasRef.current.width,
        "x",
        canvasRef.current.height
      );
    }
  };

  // Detect on image
  const detectOnImage = async () => {
    if (!extImageRef.current || !extImageRef.current.src) {
      console.log("Cannot detect: no image source");
      clearCanvas();
      return;
    }

    // Models should already be loaded by this point
    if (!modelsLoadedRef.current) {
      console.log("Models not loaded, this shouldn't happen");
      return;
    }

    try {
      console.log("Starting face detection on image...");
      let detections;

      try {
        detections = await faceapi
          .detectAllFaces(extImageRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();
      } catch (corsError) {
        console.log(
          "CORS error during detection, trying alternative approach..."
        );
        // If CORS error occurs, we can't use face-api.js on this image
        // This is a limitation of the external camera not supporting CORS
        setApiStatus({
          message:
            "External camera doesn't support CORS. Face detection may be limited.",
          severity: "warning",
        });
        return;
      }

      setCurrentDetections(detections);
      console.log("Raw detections:", detections.length);

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (detections.length === 0) {
        console.log("No faces detected in image");
        setComparisonResults(null);
        return;
      }

      const dims = faceapi.matchDimensions(
        canvasRef.current,
        extImageRef.current,
        true
      );
      const resized = faceapi.resizeResults(detections, dims);
      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      console.log("Detection boxes drawn on canvas");
      console.log("Detected", detections.length, "faces in image");

      // Compare with target face if available
      if (detections.length > 0 && targetFaceDescriptorRef.current) {
        console.log(
          "Comparing detected face with target face:",
          targetFaceDescriptorRef.current.face.name
        );
        const comparisonResults = await compareWithTargetFace(detections[0]);
        displayComparisonResults(comparisonResults);
      } else if (detections.length > 0) {
        console.log(
          "Faces detected but no target face set. Target face ref:",
          targetFaceDescriptorRef.current
        );
        console.log("Target face state:", targetFaceDescriptor);
      }
    } catch (error) {
      console.error("Detection error:", error);
      clearCanvas();
    }
  };

  // Detect on video
  const detectOnVideo = async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended)
      return;

    // Models should already be loaded by this point
    if (!modelsLoadedRef.current) {
      console.log("Models not loaded, this shouldn't happen");
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      setCurrentDetections(detections);

      const dims = faceapi.matchDimensions(
        canvasRef.current,
        videoRef.current,
        true
      );
      const resized = faceapi.resizeResults(detections, dims);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);

      if (detections.length > 0) {
        console.log("Detected", detections.length, "faces in video");

        // Compare with target face if available
        if (targetFaceDescriptorRef.current) {
          console.log(
            "Comparing detected face with target face:",
            targetFaceDescriptorRef.current.face.name
          );
          const comparisonResults = await compareWithTargetFace(detections[0]);
          displayComparisonResults(comparisonResults);
        } else {
          console.log(
            "Faces detected but no target face set. Target face ref:",
            targetFaceDescriptorRef.current
          );
          console.log("Target face state:", targetFaceDescriptor);
        }
      } else {
        setComparisonResults(null);
      }
    } catch (error) {
      console.error("Detection error:", error);
      clearCanvas();
    }
  };

  // Start detection
  const startDetection = async () => {
    if (!rollNumber.trim()) {
      setApiStatus({
        message: "Please enter a roll number",
        severity: "warning",
      });
      return;
    }

    if (cameraMode === "external" && !externalCameraUrl.trim()) {
      setApiStatus({
        message: "Please enter external camera URL to continue",
        severity: "warning",
      });
      return;
    }

    // Reset state for new session
    setMatchedFace(null);
    setError("");
    setLoading(true);
    setIsDetecting(true);
    setMatchFound(false);
    setScreenshotUrl(null);
    setScreenshotTaken(false);
    setTargetFaceDescriptor(null);
    setComparisonResults(null);

    try {
      // Step 1: Load faces from API first and get descriptors
      const descriptors = await loadStoredFaces();
      console.log("Loaded descriptors in startDetection:", descriptors);

      // Step 2: Find target face for the specific roll number
      if (descriptors && descriptors.length > 0) {
        const targetFace = await findTargetFaceByRollNumber(
          rollNumber,
          descriptors
        );
        if (!targetFace) {
          setError(
            `No face found for roll number: ${rollNumber}. Please check the roll number or add the face to the database.`
          );
          return;
        }
        setTargetFaceDescriptor(targetFace);
        targetFaceDescriptorRef.current = targetFace;
        console.log("Target face set:", targetFace.face.name);
      } else {
        setError("No faces found in database.");
        return;
      }

      const modelsLoadedSuccessfully = await loadModels();
      if (!modelsLoadedSuccessfully) {
        setError(
          "Failed to load face detection models. Please refresh and try again."
        );
        return;
      }

      if (cameraMode === "local") {
        // Local camera mode
        if (currentStream.current) {
          currentStream.current.getTracks().forEach((track) => track.stop());
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoRef.current.srcObject = stream;
          currentStream.current = stream;
          videoRef.current.onloadeddata = () => {
            setStatus(
              `Searching for face matching roll number: ${rollNumber}...`
            );
            console.log("Local camera loaded successfully");
            detectionInterval.current = setInterval(detectOnVideo, 500);
          };
        } catch (err) {
          setError("Could not access local camera.");
          console.log("Error accessing local camera:", err);
        }
      } else {
        // External camera mode
        const url = externalCameraUrl.trim();
        console.log("External camera mode - Testing URL:", url);
        setStatus("Connecting to external camera...");

        if (isImageUrl(url)) {
          console.log("Using image mode for URL:", url);
          setStatus("Loading external camera image...");

          // Try with CORS first
          extImageRef.current.crossOrigin = "anonymous";
          extImageRef.current.onload = async () => {
            console.log("External camera image loaded successfully with CORS");
            setStatus(
              `Searching for face matching roll number: ${rollNumber}...`
            );
            await detectOnImage();
            detectionInterval.current = setInterval(detectOnImage, 2000);
          };
          extImageRef.current.onerror = (e) => {
            console.log("CORS failed, trying without CORS...");
            // Try without CORS
            extImageRef.current.crossOrigin = null;
            extImageRef.current.onload = async () => {
              console.log("External camera image loaded without CORS");
              setStatus(
                `Searching for face matching roll number: ${rollNumber}...`
              );
              await detectOnImage();
              detectionInterval.current = setInterval(detectOnImage, 2000);
            };
            extImageRef.current.onerror = (e2) => {
              console.log("External camera image load error:", e2);
              setError(
                "Failed to load external camera image. Please check the URL."
              );
              clearCanvas();
            };
            extImageRef.current.src = url;
          };
          extImageRef.current.src = url;
        } else {
          console.log("Using video mode for URL:", url);
          setStatus("Connecting to external camera video stream...");
          videoRef.current.src = url;
          videoRef.current.onloadeddata = () => {
            console.log("External camera video loaded successfully");
            setStatus(
              `Searching for face matching roll number: ${rollNumber}...`
            );
            detectionInterval.current = setInterval(detectOnVideo, 500);
          };
          videoRef.current.onerror = (e) => {
            console.log("External camera video load error:", e);
            console.log("Trying as image fallback...");
            setStatus("Video failed, trying image mode...");

            // Try with CORS first
            extImageRef.current.crossOrigin = "anonymous";
            extImageRef.current.onload = async () => {
              console.log("External camera image loaded as fallback with CORS");
              setStatus(
                `Searching for face matching roll number: ${rollNumber}...`
              );
              await detectOnImage();
              detectionInterval.current = setInterval(detectOnImage, 2000);
            };
            extImageRef.current.onerror = (e2) => {
              console.log("CORS failed in fallback, trying without CORS...");
              // Try without CORS
              extImageRef.current.crossOrigin = null;
              extImageRef.current.onload = async () => {
                console.log(
                  "External camera image loaded as fallback without CORS"
                );
                setStatus(
                  `Searching for face matching roll number: ${rollNumber}...`
                );
                await detectOnImage();
                detectionInterval.current = setInterval(detectOnImage, 2000);
              };
              extImageRef.current.onerror = (e3) => {
                console.log("External camera image fallback also failed:", e3);
                setError(
                  "Failed to connect to external camera. Please check the URL and try again."
                );
                clearCanvas();
              };
              extImageRef.current.src = url;
            };
            extImageRef.current.src = url;
          };
        }
      }
    } catch (err) {
      console.error("Error during detection start:", err);
      setError(err.message);
      stopDetection();
    } finally {
      setLoading(false);
    }
  };

  // Stop detection
  const stopDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }

    if (currentStream.current) {
      currentStream.current.getTracks().forEach((track) => track.stop());
      currentStream.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    clearCanvas();
    setStatus("Detection stopped");
    setIsDetecting(false);
    targetFaceDescriptorRef.current = null;
  };

  // View all stored faces
  const viewAllStoredFaces = async () => {
    setApiStatus({ message: "Loading all faces...", severity: "info" });

    try {
      const response = await axios.get(API_BASE_URL + API_ENDPOINT);
      const faces = response.data.files || [];
      setStoredFaces(faces);

      if (faces.length === 0) {
        setApiStatus({
          message: "No faces found in database",
          severity: "warning",
        });
        return;
      }

      setApiStatus({
        message: `Loaded ${faces.length} faces`,
        severity: "success",
      });
      setShowFacesDialog(true);
    } catch (error) {
      console.error("Error loading faces:", error);
      setApiStatus({
        message: `Error loading faces: ${error.message}`,
        severity: "error",
      });
    }
  };

  // Display match history
  const displayMatchHistory = () => {
    const history = getMatchHistory();
    if (history.length === 0) {
      setApiStatus({ message: "No match history found", severity: "info" });
      return;
    }

    setMatchHistory(history);
    setShowMatchHistory(true);
  };

  const StatusIcon = ({ severity }) => {
    switch (severity) {
      case "success":
        return <CheckCircle color="success" />;
      case "error":
        return <ErrorIcon color="error" />;
      case "warning":
        return <ErrorIcon color="warning" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Face Recognition System
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          gutterBottom
        >
          Enter roll number and start detection
        </Typography>

        {/* Status Message */}
        {apiStatus.message && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 2,
              mb: 2,
              borderRadius: 1,
              backgroundColor: (theme) => {
                switch (apiStatus.severity) {
                  case "error":
                    return theme.palette.error.light;
                  case "warning":
                    return theme.palette.warning.light;
                  case "success":
                    return theme.palette.success.light;
                  default:
                    return theme.palette.info.light;
                }
              },
            }}
          >
            <StatusIcon severity={apiStatus.severity} />
            <Typography>{apiStatus.message}</Typography>
          </Box>
        )}

        {/* Controls */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              inputRef={rollNumberInputRef}
              label="Roll Number"
              variant="outlined"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Visibility />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <RadioGroup
              row
              value={cameraMode}
              onChange={(e) => {
                setCameraMode(e.target.value);
                console.log("Camera mode changed to:", e.target.value);
              }}
            >
              <FormControlLabel
                value="local"
                control={<Radio />}
                label="Local Camera"
              />
              <FormControlLabel
                value="external"
                control={<Radio />}
                label="External Camera"
              />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} sm={5} sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color={isDetecting ? "error" : "primary"}
              onClick={isDetecting ? stopDetection : startDetection}
              disabled={!rollNumber || loading}
              startIcon={isDetecting ? <Stop /> : <CameraAlt />}
              sx={{ flex: 1 }}
            >
              {isDetecting ? "Stop" : "Start Detection"}
              {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>

            <Button
              variant="outlined"
              onClick={viewAllStoredFaces}
              startIcon={<Visibility />}
            >
              View All Faces
            </Button>

            <Button
              variant="outlined"
              onClick={displayMatchHistory}
              startIcon={<Visibility />}
              sx={{ ml: 1 }}
            >
              View Match History
            </Button>
          </Grid>
        </Grid>

        {/* External Camera URL Input */}
        {cameraMode === "external" && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              External Camera Configuration
            </Typography>
            <TextField
              fullWidth
              label="External Camera URL"
              variant="outlined"
              value={externalCameraUrl}
              onChange={(e) => setExternalCameraUrl(e.target.value)}
              placeholder="http://192.168.1.100:8080/video"
              helperText="Enter your IP camera URL. Common formats: /video, /stream, /mjpeg, /snapshot, or just the base URL"
              disabled={isDetecting}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Examples: http://192.168.1.100:8080/video,
              http://192.168.1.100:8080/stream, http://192.168.1.100:8080
            </Typography>
          </Box>
        )}

        {/* Camera Feed */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 480,
            bgcolor: "grey.200",
            borderRadius: 1,
            overflow: "hidden",
            mb: 3,
          }}
        >
          {/* Local Camera Video */}
          {cameraMode === "local" && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: isDetecting ? "block" : "none",
              }}
            />
          )}

          {/* External Camera Video/Image */}
          {cameraMode === "external" && (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display:
                    externalCameraUrl && !isImageUrl(externalCameraUrl)
                      ? "block"
                      : "none",
                }}
                onLoadedData={() => {
                  console.log("External camera video loaded successfully");
                  setApiStatus({
                    message: "External camera video stream connected",
                    severity: "success",
                  });
                }}
                onError={(e) => {
                  console.log("Video stream failed, trying image stream");
                  // Hide video and show image
                  e.target.style.display = "none";
                  if (extImageRef.current) {
                    extImageRef.current.style.display = "block";
                    extImageRef.current.src = externalCameraUrl;
                  }
                }}
              />
              <img
                ref={extImageRef}
                alt="External Camera"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display:
                    externalCameraUrl && isImageUrl(externalCameraUrl)
                      ? "block"
                      : "none",
                }}
                onLoad={(e) => {
                  console.log("External camera image loaded successfully");
                  setApiStatus({
                    message: "External camera image loaded",
                    severity: "success",
                  });
                  // Hide video if it exists
                  if (videoRef.current) {
                    videoRef.current.style.display = "none";
                  }
                }}
                onError={(e) => {
                  console.error("External camera image failed to load:", e);
                  setApiStatus({
                    message:
                      "Failed to load external camera. Please check the URL.",
                    severity: "error",
                  });
                }}
              />
            </>
          )}

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: isDetecting ? "block" : "none",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />

          {!isDetecting && cameraMode === "local" && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "grey.500",
              }}
            >
              <Typography>Click "Start Detection" to begin</Typography>
            </Box>
          )}

          {!isDetecting && cameraMode === "external" && !externalCameraUrl && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "grey.500",
              }}
            >
              <Typography>Please enter external camera URL above</Typography>
            </Box>
          )}

          {/* Detection Status Overlay */}
          {isDetecting && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                padding: 1,
                borderRadius: 1,
                zIndex: 20,
              }}
            >
              <Typography variant="body2">🔍 {status}</Typography>
            </Box>
          )}
        </Box>

        {/* Match Found Display */}
        {matchFound && (
          <Card
            sx={{ mb: 3, borderLeft: "4px solid", borderColor: "success.main" }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <CheckCircle color="success" fontSize="large" />
                <Typography variant="h6" color="success.main">
                  Match Found!
                </Typography>
              </Box>
              <Typography>
                Roll Number: <strong>{rollNumber}</strong>
              </Typography>
              <Typography>
                Matched Face: <strong>{matchedFace}</strong>
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Comparison Results Display */}
        {comparisonResults && (
          <Card
            sx={{
              mb: 3,
              borderLeft: "4px solid",
              borderColor: comparisonResults.isMatch
                ? "success.main"
                : "warning.main",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CheckCircle
                  color={comparisonResults.isMatch ? "success" : "warning"}
                />
                Face Recognition Results
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography>
                  <strong>Looking for:</strong> {rollNumber}
                </Typography>
                <Typography>
                  <strong>Target Face:</strong> {comparisonResults.face.name}
                </Typography>
                <Typography>
                  <strong>Similarity:</strong>{" "}
                  {Math.round(comparisonResults.similarity * 100)}%
                </Typography>
                <Typography>
                  <strong>Distance:</strong>{" "}
                  {comparisonResults.distance.toFixed(3)}
                </Typography>
              </Box>
              {comparisonResults.isMatch ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ MATCH FOUND! Face recognized successfully.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ❌ No match found. Similarity below threshold.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Screenshot Display */}
        {screenshotUrl && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CameraAlt color="primary" />
                  Screenshot Captured
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={downloadScreenshot}
                  color="primary"
                >
                  Download Screenshot
                </Button>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={screenshotUrl}
                  alt="Face match screenshot"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* All Faces Dialog */}
      <Dialog
        open={showFacesDialog}
        onClose={() => setShowFacesDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            All Stored Faces ({storedFaces.length})
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {storedFaces.length === 0 ? (
            <Typography>No faces found in database</Typography>
          ) : (
            <Box sx={{ maxHeight: 600, overflow: "auto" }}>
              <Grid container spacing={3}>
                {storedFaces.map((face, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: 3,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          paddingTop: "100%", // 1:1 aspect ratio
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={face.url}
                          alt={face.name}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain", // Show full image without cropping
                            backgroundColor: "#f5f5f5",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f5f5f5",
                            color: "#666",
                          }}
                        >
                          <Typography variant="body2">
                            Image not available
                          </Typography>
                        </Box>
                      </Box>
                      <CardContent sx={{ p: 2, flexGrow: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "medium",
                            wordBreak: "break-word",
                            textAlign: "center",
                          }}
                        >
                          {face.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFacesDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Match History Dialog */}
      <Dialog
        open={showMatchHistory}
        onClose={() => setShowMatchHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Recent Face Matches</DialogTitle>
        <DialogContent dividers>
          {matchHistory.length === 0 ? (
            <Typography>No match history found</Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Roll Number</TableCell>
                      <TableCell>Target Face</TableCell>
                      <TableCell>File</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matchHistory
                      .slice()
                      .reverse()
                      .map((match) => (
                        <TableRow key={match.id}>
                          <TableCell>
                            {new Date(match.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{match.rollNumber}</TableCell>
                          <TableCell>{match.targetFace}</TableCell>
                          <TableCell>{match.fileName}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMatchHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LiveStream;
