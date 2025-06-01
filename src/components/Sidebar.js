import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Segment as SegmentIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      text: 'Segments',
      icon: <SegmentIcon />,
      path: '/segments'
    },
    {
      text: 'Campaign History',
      icon: <CampaignIcon />,
      path: '/campaigns'
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics'
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings'
    },
    {
      text: 'Profile',
      icon: <ProfileIcon />,
      path: '/profile'
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ 
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 