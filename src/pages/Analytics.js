import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data for analytics
const mockData = {
  campaignPerformance: [
    { date: '2024-01', delivered: 1200, opened: 800, clicked: 400 },
    { date: '2024-02', delivered: 1500, opened: 1000, clicked: 500 },
    { date: '2024-03', delivered: 1800, opened: 1200, clicked: 600 },
    { date: '2024-04', delivered: 2000, opened: 1400, clicked: 700 },
  ],
  segmentEngagement: [
    { segment: 'High Value', engagement: 75, size: 245 },
    { segment: 'Inactive', engagement: 25, size: 1234 },
    { segment: 'New Users', engagement: 45, size: 567 },
    { segment: 'Engaged', engagement: 85, size: 890 },
  ],
};

const Analytics = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Campaign Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Performance Over Time
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    stroke={theme.palette.primary.main}
                    name="Delivered"
                  />
                  <Line
                    type="monotone"
                    dataKey="opened"
                    stroke={theme.palette.success.main}
                    name="Opened"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicked"
                    stroke={theme.palette.warning.main}
                    name="Clicked"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Segment Engagement */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Segment Engagement
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.segmentEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="engagement"
                    fill={theme.palette.primary.main}
                    name="Engagement Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Engagement Rate
              </Typography>
              <Typography variant="h3" color="primary">
                57.5%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all segments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Audience Size
              </Typography>
              <Typography variant="h3" color="primary">
                2,936
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active users in segments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Success Rate
              </Typography>
              <Typography variant="h3" color="primary">
                82.3%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on engagement metrics
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 