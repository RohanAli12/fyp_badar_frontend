import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Paper,
} from '@mui/material';
import ScreenshotModal from './ScreenshotModal';

// Dummy detections
const dummyDetections = Array.from({ length: 21 }).map((_, index) => ({
  id: index + 1,
  roll_number: `STU-${1000 + index}`,
  video_url: 'https://example.com/video.mp4',
  output_video_url: 'https://example.com/output.mp4',
  created_by: `User${index % 3}`,
  screenshots_urls: [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/160',
  ],
  stats: `{ "detections": ${Math.floor(Math.random() * 20 + 1)} }`,
  created_at: '2025-07-14',
}));

const DetectionTable = ({ search }) => {
  const [page, setPage] = useState(0);
  const [selectedScreenshots, setSelectedScreenshots] = useState(null);
  const rowsPerPage = 5;

  const filtered = dummyDetections.filter((item) =>
    item.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    item.created_by.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenScreenshots = (urls) => setSelectedScreenshots(urls);
  const handleCloseScreenshots = () => setSelectedScreenshots(null);

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Roll No</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Video</TableCell>
            <TableCell>Stats</TableCell>
            <TableCell>Screenshots</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.roll_number}</TableCell>
              <TableCell>{row.created_by}</TableCell>
              <TableCell>
                <a href={row.output_video_url} target="_blank" rel="noreferrer">
                  View Video
                </a>
              </TableCell>
              <TableCell>{row.stats}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleOpenScreenshots(row.screenshots_urls)}
                >
                  View Screenshots
                </Button>
              </TableCell>
              <TableCell>{row.created_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5]}
      />

      {/* Screenshot Preview Modal */}
      <ScreenshotModal
        open={!!selectedScreenshots}
        images={selectedScreenshots || []}
        onClose={handleCloseScreenshots}
      />
    </Paper>
  );
};

export default DetectionTable;
