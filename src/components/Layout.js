import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { logout, selectUser } from '../store/slices/authSlice';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleProfileMenuClose();
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: theme.palette.primary.main }}>
          XenoCRM
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'XenoCRM'}
          </Typography>
          
          {/* User Profile Menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            {user?.avatar ? (
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                {user?.name?.[0]?.toUpperCase() || <AccountIcon />}
              </Avatar>
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 