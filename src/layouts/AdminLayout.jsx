import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Button,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Face as FaceIcon,
  VideoLibrary as VideoIcon,
  Security as DetectionsIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import CameraAltIcon from '@mui/icons-material/CameraAlt'; // 🟢 Correct

import { useLogoutMutation } from '../api/mutation';

const drawerWidth = 240;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const { mutate: logout } = useLogoutMutation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    // logout();
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <DashboardIcon color="primary" /> },
    { label: 'All Users', path: '/admin/users', icon: <PeopleIcon color="secondary" /> },
    { label: 'Create User', path: '/admin/users/create', icon: <PeopleIcon sx={{ color: '#00bcd4' }} /> },
    { label: 'Upload Face', path: '/admin/upload-face', icon: <FaceIcon sx={{ color: '#ff7043' }} /> },
    { label: 'Upload Video', path: '/admin/upload-video', icon: <VideoIcon sx={{ color: '#66bb6a' }} /> },
    { label: 'Detections', path: '/admin/detections', icon: <DetectionsIcon sx={{ color: '#ba68c8' }} /> },
    { label: 'Profile', path: '/admin/profile', icon: <ProfileIcon sx={{ color: '#ffa726' }} /> },
    { label: 'Live Stream', path: '/admin/live-stream', icon: <CameraAltIcon sx={{ color: '#4fc3f7' }} /> },

  ];

  const drawerContent = (
    <Box>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
          <ProfileIcon />
        </Avatar>
        <Typography variant="subtitle1" noWrap>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              '&.active': {
                bgcolor: '#333',
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              },
              '&:hover': {
                bgcolor: '#2a2a2a',
              },
              transition: 'all 0.3s ease',
              mb: 0.5,
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                variant: 'body1',
                sx: { fontWeight: 'medium' },
                color: 'white' 
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <CssBaseline />
      {/* Top AppBar (light theme) */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: '#fff',
          color: '#333',
          boxShadow: 'none',
          borderBottom: '1px solid #ccc',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
              Face Recognition System
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: 'none',
              color: '#ff7043',
              borderColor: '#ff7043',
              '&:hover': {
                bgcolor: 'rgba(255, 112, 67, 0.08)',
                borderColor: '#ff7043',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex' }}>
        {/* Dark-themed Drawer only */}
        <ThemeProvider theme={darkTheme}>
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          >
            {isMobile ? (
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: darkTheme.palette.background.paper,
                  },
                }}
              >
                {drawerContent}
              </Drawer>
            ) : (
              <Drawer
                variant="permanent"
                sx={{
                  '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: darkTheme.palette.background.paper,
                  },
                }}
                open
              >
                {drawerContent}
              </Drawer>
            )}
          </Box>
        </ThemeProvider>

        {/* Main Content (light theme) */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            bgcolor: '#f9f9f9', // light background
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default AdminLayout;
