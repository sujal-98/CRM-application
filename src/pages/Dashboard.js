import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  useTheme,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Segment as SegmentIcon,
  Send as SendIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { selectUser } from '../store/slices/authSlice';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalCustomers: 0,
      totalSegments: 0,
      totalCampaigns: 0,
      messagesSent: 0,
      messagesFailed: 0,
      successRate: 0
    },
    recentCampaigns: [],
    recentSegments: [],
    campaignPerformance: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user.email]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/dashboard/stats?email=${user.email}`);
      if (response.data.status === 'success') {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              p: 1,
              borderRadius: 2,
              color: color
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">Error loading dashboard: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your campaigns today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/segments/create')}
          >
            Create Segment
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Customers"
            value={dashboardData.overview.totalCustomers}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Segments"
            value={dashboardData.overview.totalSegments}
            icon={<SegmentIcon />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Campaigns"
            value={dashboardData.overview.totalCampaigns}
            icon={<CampaignIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Messages Sent (Last 10 Campaigns)"
            value={dashboardData.overview.messagesSent}
            icon={<SendIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Failed Messages (Last 10 Campaigns)"
            value={dashboardData.overview.messagesFailed}
            icon={<ErrorIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Success Rate (Last 10 Campaigns)"
            value={`${dashboardData.overview.successRate}%`}
            icon={<SuccessIcon />}
            color={theme.palette.success.main}
          />
        </Grid>

        {/* Campaign Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Last 3 Campaigns Performance
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.campaignPerformance}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill={theme.palette.success.main} name="Messages Sent" />
                  <Bar dataKey="failed" fill={theme.palette.error.main} name="Messages Failed" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Segments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Segments
            </Typography>
            <List>
              {dashboardData.recentSegments?.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent segments" />
                </ListItem>
              ) : (
                dashboardData.recentSegments?.map((segment) => (
                  <React.Fragment key={segment._id}>
                    <ListItem>
                      <ListItemText
                        primary={segment.name}
                        secondary={`Created: ${new Date(segment.createdAt).toLocaleDateString()} • ${segment.customerIds?.length || 0} customers`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/segments/${segment._id}`)}
                      >
                        View
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Campaigns */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Campaigns
            </Typography>
            <List>
              {dashboardData.recentCampaigns?.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent campaigns" />
                </ListItem>
              ) : (
                dashboardData.recentCampaigns?.map((campaign) => (
                  <React.Fragment key={campaign._id}>
                    <ListItem>
                      <ListItemText
                        primary={campaign.name}
                        secondary={`Created: ${new Date(campaign.createdAt).toLocaleDateString()}`}
                      />
                      <Chip
                        label={campaign.status}
                        color={
                          campaign.status === 'COMPLETED' ? 'success' :
                          campaign.status === 'RUNNING' ? 'info' :
                          campaign.status === 'FAILED' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 