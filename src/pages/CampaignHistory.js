import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// Mock data for campaigns
const mockCampaigns = [
  {
    id: 1,
    name: 'Welcome Back Offer',
    segment: 'Inactive Users',
    status: 'completed',
    sent: 1234,
    delivered: 1110,
    failed: 124,
    audienceSize: 1234,
    createdAt: '2024-03-15T10:30:00Z',
    message: "Hi {name}, we miss you! Here's 20% off on your next order.",
  },
  {
    id: 2,
    name: 'High Value Customer Promotion',
    segment: 'High Value Customers',
    status: 'in_progress',
    sent: 245,
    delivered: 220,
    failed: 25,
    audienceSize: 245,
    createdAt: '2024-03-15T09:15:00Z',
    message: 'Exclusive offer for our valued customers! Get 15% off on premium products.',
  },
  {
    id: 3,
    name: 'New Product Launch',
    segment: 'All Customers',
    status: 'scheduled',
    sent: 0,
    delivered: 0,
    failed: 0,
    audienceSize: 5000,
    createdAt: '2024-03-16T15:00:00Z',
    message: 'Exciting news! Check out our new collection with 10% off.',
  },
];

const CampaignHistory = () => {
  const theme = useTheme();
  const [campaigns] = useState(mockCampaigns);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'scheduled':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'scheduled':
        return 'Scheduled';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDeliveryRate = (delivered, total) => {
    if (total === 0) return 0;
    return Math.round((delivered / total) * 100);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Campaign History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell>Segment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Delivery Rate</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Typography variant="subtitle2">{campaign.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {campaign.message}
                  </Typography>
                </TableCell>
                <TableCell>{campaign.segment}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(campaign.status)}
                    color={getStatusColor(campaign.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={calculateDeliveryRate(
                          campaign.delivered,
                          campaign.audienceSize
                        )}
                        color={
                          campaign.status === 'completed' ? 'success' : 'primary'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {calculateDeliveryRate(
                        campaign.delivered,
                        campaign.audienceSize
                      )}
                      %
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Sent: {campaign.sent.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Delivered: {campaign.delivered.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Failed: {campaign.failed.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CampaignHistory; 