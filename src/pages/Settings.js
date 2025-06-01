import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ApiIcon from '@mui/icons-material/Api';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Tab Navigation */}
      <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<NotificationsActiveIcon />} label="Notifications" />
          <Tab icon={<ApiIcon />} label="API" />
          <Tab icon={<WarningAmberIcon color="error" />} label="Danger" />
        </Tabs>
      </Paper>

      {/* Profile Settings */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Settings
                </Typography>
                <Box component="form" sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    defaultValue="Acme Corp"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue="admin@acmecorp.com"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    defaultValue="+1 (555) 123-4567"
                    margin="normal"
                  />
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Update Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notification Settings */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email Notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Receive email notifications for campaign updates and segment changes
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Campaign Alerts"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Get notified when campaigns are completed or encounter issues
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <FormControlLabel control={<Switch />} label="Segment Updates" />
                  <Typography variant="body2" color="text.secondary">
                    Receive notifications when segment sizes change significantly
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* API Settings */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API Settings
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Your API keys are used to authenticate requests to the XenoCRM API. Keep them
                  secure and never share them publicly.
                </Alert>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="API Key"
                    type="password"
                    defaultValue="••••••••••••••••"
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Button variant="outlined" size="small">
                          Regenerate
                        </Button>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Webhook URL"
                    defaultValue="https://your-domain.com/webhook"
                    margin="normal"
                    helperText="URL to receive campaign and segment updates"
                  />
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Save API Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Danger Zone */}
      <TabPanel value={tab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={6}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h6" color="error" gutterBottom>
                  Danger Zone
                </Typography>
                <Alert severity="error" sx={{ mb: 2 }}>
                  These actions are irreversible. Please proceed with caution.
                </Alert>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="error" sx={{ mr: 2 }}>
                    Export All Data
                  </Button>
                  <Button variant="contained" color="error">
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Settings; 