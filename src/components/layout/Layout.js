import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 240;

const Layout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setSidebarOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit" size="large">
                <Badge badgeContent={3} color="primary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar
                  src={user?.avatar}
                  alt={user?.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: '64px',
          bgcolor: theme.palette.background.default,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          sx: {
            width: 200,
            maxWidth: '100%',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <Typography variant="body1">Profile</Typography>
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <Typography variant="body1">Settings</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography variant="body1" color="error">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout; 