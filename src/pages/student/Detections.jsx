import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Button,
  Stack,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  VideoLibrary as VideoIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  CalendarToday as DateIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useStudentDetections } from "../../api/mutation";

const StudentDetections = () => {
  const theme = useTheme();
  const { data, isLoading, isError, error, refetch } = useStudentDetections();
  const detections = data?.detections || [];
  const [visibleCount, setVisibleCount] = useState(10); // ⬅ Initial visible count
  const visibleDetections = detections.slice(0, visibleCount);

  // Determine role - default to 'user' if not specified
  const getDetectionRole = (detection) => {
    return (
      detection.created_by_role ||
      (detection.created_by_name?.toLowerCase().includes("admin")
        ? "admin"
        : "user")
    );
  };

  // Calculate admin vs general user detections
  const adminDetections = detections.filter(
    (d) => getDetectionRole(d) === "admin"
  ).length;
  const userDetections = detections.length - adminDetections;

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
      alert(`Failed to download: ${filename}`);
    }
  };

  const handleDownloadScreenshots = (screenshots) => {
    if (!Array.isArray(screenshots) || screenshots.length === 0) return;

    screenshots.forEach((relativeUrl) => {
      const fullUrl = `http://127.0.0.1:8000${relativeUrl}`;
      const parts = relativeUrl.split("/");
      const filename = parts[parts.length - 1];
      downloadFile(fullUrl, filename);
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 0.5,
            }}
          >
            Recognition History
          </Typography>
          {/* <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {isLoading
              ? "Loading your recognition data..."
              : `${detections.length} records found`}
          </Typography> */}
        </Box>
        {/* <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh data">
            <IconButton onClick={refetch} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            disabled={isLoading}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={isLoading || detections.length === 0}
          >
            Export
          </Button>
        </Stack> */}
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Failed to load recognition data"}
        </Alert>
      ) : detections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recognition records found
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your face recognition history will appear here once detected.
          </Typography>
          {/* <Button variant="contained" onClick={refetch}>
            Refresh
          </Button> */}
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={4} alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Recognitions
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {detections.length}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recognized By
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AdminIcon color="primary" />
                      <Typography variant="h6">
                        {adminDetections} Admin
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <UserIcon color="secondary" />
                      <Typography variant="h6">
                        {userDetections} General
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Box>

          <Paper
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Recognized By
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Evidence</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleDetections.map((row) => {
                    const role = getDetectionRole(row);
                    const isAdmin = role === "admin";
                    const screenshots =
                      row.screenshots_list ||
                      (row.screenshots_urls
                        ? row.screenshots_urls.split(",")
                        : []);

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: isAdmin
                                  ? theme.palette.primary.main
                                  : theme.palette.secondary.main,
                                fontSize: 14,
                              }}
                            >
                              {row.created_by_name?.charAt(0) || "U"}
                            </Avatar>
                            <Typography variant="body2">
                              {row.created_by_name || "System"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={isAdmin ? <AdminIcon /> : <UserIcon />}
                            label={isAdmin ? "Admin" : "General User"}
                            color={isAdmin ? "primary" : "secondary"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {row.output_video_url && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VideoIcon />}
                                onClick={() =>
                                  window.open(row.output_video_url, "_blank")
                                }
                                sx={{ width: "fit-content" }}
                              >
                                View Video
                              </Button>
                            )}
                            {screenshots.length > 0 && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ImageIcon />}
                                onClick={() =>
                                  handleDownloadScreenshots(screenshots)
                                }
                                sx={{ width: "fit-content" }}
                              >
                                Download Screenshots ({screenshots.length})
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">
                              {new Date(row.created_at).toLocaleDateString()}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(row.created_at).toLocaleTimeString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => console.log("View details", row.id)}
                            startIcon={<SecurityIcon />}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {visibleCount < detections.length && (
              <Box sx={{ textAlign: "center", p: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                >
                  Load More
                </Button>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default StudentDetections;
