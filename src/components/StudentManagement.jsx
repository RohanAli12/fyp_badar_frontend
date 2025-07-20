import { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Building,
  Calendar,
  Video,
  Mail,
  Phone,
} from "lucide-react";
import { fetchStudents, mockStudentData } from "../services/studentService";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from API first
        let studentData;
        try {
          studentData = await fetchStudents();
        } catch (apiError) {
          console.log("API not available, using mock data");
          studentData = mockStudentData;
        }

        setStudents(studentData);
      } catch (error) {
        console.error("Error loading students:", error);
        setError("Failed to load students");
        // Fallback to mock data
        setStudents(mockStudentData);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="student-management-container">
      <div className="page-header">
        <h2>Student Database</h2>
        <p>Total Students: {students.length}</p>
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="students-grid">
        {students.map((student) => (
          <div key={student.id} className="student-card">
            <div className="student-photo">
              <img
                src={student.photoUrl || "https://via.placeholder.com/150"}
                alt={student.name}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            </div>

            <div className="student-details">
              <h3>{student.name}</h3>
              <div className="student-info">
                <p className="roll-number">
                  <User className="icon" />
                  <strong>Roll No:</strong> {student.rollNumber}
                </p>
                <p className="department">
                  <Building className="icon" />
                  <strong>Department:</strong> {student.department}
                </p>
                <p className="semester">
                  <GraduationCap className="icon" />
                  <strong>Semester:</strong> {student.semester}
                </p>
                <p className="enrollment">
                  <Calendar className="icon" />
                  <strong>Enrolled:</strong>{" "}
                  {new Date(student.enrollmentDate).toLocaleDateString()}
                </p>
              </div>

              <div className="contact-info">
                <p>
                  <Mail className="icon" />
                  <strong>Email:</strong> {student.email}
                </p>
                <p>
                  <Phone className="icon" />
                  <strong>Phone:</strong> {student.phone}
                </p>
              </div>

              {student.videoUrl && (
                <div className="video-info">
                  <p>
                    <Video className="icon" />
                    <strong>Video URL:</strong>
                  </p>
                  <a
                    href={student.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-link"
                  >
                    {student.videoUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="no-students">
          <User className="icon large" />
          <h3>No Students Found</h3>
          <p>No students are currently registered in the system.</p>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
