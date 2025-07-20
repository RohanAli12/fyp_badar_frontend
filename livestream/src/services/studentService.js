import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// Fetch all students from the API
export const fetchStudents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/students/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Fetch student by roll number
export const fetchStudentByRollNumber = async (rollNumber) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/students/${rollNumber}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

// Parse roll number from video URL
export const parseRollNumberFromVideoUrl = (videoUrl) => {
  try {
    // Extract the filename from the URL
    const urlParts = videoUrl.split("/");
    const filename = urlParts[urlParts.length - 1];

    // Parse roll number from filename format: rollNumber_timestamp.mp4
    const rollNumber = filename.split("_")[0];

    return rollNumber;
  } catch (error) {
    console.error("Error parsing roll number from URL:", error);
    return null;
  }
};

// Get student video URL by roll number
export const getStudentVideoUrl = (rollNumber) => {
  return `${API_BASE_URL}/media/videos/${rollNumber}_${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}_${new Date()
    .toTimeString()
    .slice(0, 8)
    .replace(/:/g, "")}.mp4`;
};

// Mock student data structure (replace with actual API response)
export const mockStudentData = [
  {
    id: 1,
    rollNumber: "1",
    name: "Ahmed Khan",
    department: "Computer Science",
    semester: "6th",
    email: "ahmed.khan@university.edu",
    phone: "+92-300-1234567",
    enrollmentDate: "2021-09-01",
    videoUrl: "http://localhost:8000/media/videos/1_20250712_161208.mp4",
    photoUrl: "http://localhost:8000/media/photos/1.jpg",
  },
  {
    id: 2,
    rollNumber: "2",
    name: "Fatima Ali",
    department: "Electrical Engineering",
    semester: "4th",
    email: "fatima.ali@university.edu",
    phone: "+92-300-2345678",
    enrollmentDate: "2021-09-01",
    videoUrl: "http://localhost:8000/media/videos/2_20250712_161208.mp4",
    photoUrl: "http://localhost:8000/media/photos/2.jpg",
  },
  {
    id: 3,
    rollNumber: "3",
    name: "Muhammad Hassan",
    department: "Mechanical Engineering",
    semester: "8th",
    email: "muhammad.hassan@university.edu",
    phone: "+92-300-3456789",
    enrollmentDate: "2021-09-01",
    videoUrl: "http://localhost:8000/media/videos/3_20250712_161208.mp4",
    photoUrl: "http://localhost:8000/media/photos/3.jpg",
  },
];

// Save detection screenshot to local storage
export const saveDetectionScreenshot = (screenshot, studentData) => {
  try {
    const detection = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      screenshot: screenshot,
      student: studentData,
      location: "Live Stream Detection",
      confidence: 0.95, // You can adjust this based on face detection confidence
    };

    // Get existing detections from localStorage
    const existingDetections = JSON.parse(
      localStorage.getItem("detections") || "[]"
    );

    // Add new detection
    const updatedDetections = [detection, ...existingDetections];

    // Save back to localStorage
    localStorage.setItem("detections", JSON.stringify(updatedDetections));

    return detection;
  } catch (error) {
    console.error("Error saving detection:", error);
    throw error;
  }
};

// Get all detections from localStorage
export const getDetections = () => {
  try {
    return JSON.parse(localStorage.getItem("detections") || "[]");
  } catch (error) {
    console.error("Error getting detections:", error);
    return [];
  }
};

// Clear all detections
export const clearDetections = () => {
  localStorage.removeItem("detections");
};
