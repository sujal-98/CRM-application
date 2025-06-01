import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Grid,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Smith',
    email: 'john.smith@acmecorp.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    role: 'Marketing Manager',
    location: 'San Francisco, CA',
    joinDate: 'January 2023',
    avatar: null,
  });

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add save logic here
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', mr: 3 }}>
                  <Avatar
                    src={profileData.avatar}
                    sx={{ width: 100, height: 100 }}
                  >
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 32,
                        height: 32,
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="h5" gutterBottom>
                      {profileData.name}
                    </Typography>
                  )}
                  <Chip
                    label={profileData.role}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Joined ${profileData.joinDate}`}
                    variant="outlined"
                  />
                </Box>
                <Button
                  variant={isEditing ? 'contained' : 'outlined'}
                  startIcon={<EditIcon />}
                  onClick={isEditing ? handleSave : handleEdit}
                >
                  {isEditing ? 'Save' : 'Edit Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography>{profileData.email}</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography>{profileData.phone}</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography>{profileData.location}</Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography>{profileData.company}</Typography>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Role: {profileData.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since: {profileData.joinDate}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Overview
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Segments Created
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      34
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Campaigns Launched
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      89%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      2.3k
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reach
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 