import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Segment as SegmentIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Rule as RuleIcon,
  LogoutOutlined as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/' 
  },
  {
    text: 'Audience',
    icon: <PeopleIcon />,
    subItems: [
      { text: 'Segments', icon: <SegmentIcon />, path: '/segments' },
      { text: 'Rule Builder', icon: <RuleIcon />, path: '/rule-builder' },
    ]
  },
  {
    text: 'Campaigns',
    icon: <CampaignIcon />,
    subItems: [
      { text: 'Campaign History', icon: <CampaignIcon />, path: '/campaigns' },
    ]
  },

  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/settings' 
  },
];

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openGroups, setOpenGroups] = React.useState({
    Audience: true,
    Campaigns: true,
  });

  const handleGroupClick = (group) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderMenuItem = (item, level = 0) => {
    const isActive = item.path ? isPathActive(item.path) : false;
    const isGroup = item.subItems !== undefined;
    const isOpen = isGroup ? openGroups[item.text] : false;

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            selected={isActive}
            onClick={() => {
              if (isGroup) {
                handleGroupClick(item.text);
              } else {
                navigate(item.path);
                if (isMobile) onClose();
              }
            }}
            sx={{
              borderRadius: 1,
              pl: level * 2 + 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive ? theme.palette.primary.main : 'inherit',
                minWidth: 36,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            />
            {isGroup && (isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
          </ListItemButton>
        </ListItem>
        {isGroup && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => renderMenuItem(subItem, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <img src="/logo.png" alt="XenoCRM" style={{ height: 32 }} />
        <Box sx={{ typography: 'h6', fontWeight: 'bold', color: theme.palette.primary.main }}>
          XenoCRM
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            mb: 2,
            borderRadius: 2,
            py: 1,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              backgroundColor: theme.palette.error.light,
            },
          }}
        >
          Logout
        </Button>
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.main,
          }}
        >
          <Box sx={{ typography: 'subtitle2', fontWeight: 'bold', mb: 1, color: 'white' }}>
            Need Help?
          </Box>
          <Box sx={{ typography: 'body2', color: 'white' }}>
            Check our documentation or contact support
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
              bgcolor: 'background.paper',
              boxShadow: '1px 0 2px 0 rgba(0,0,0,0.05)',
              top: 0,
              height: '100%',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar; 