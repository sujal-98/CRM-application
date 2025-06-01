import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Stack,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  Group as AudienceIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/campaigns?email=${user.email}`);
      if (response.data.status === 'success') {
        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'RUNNING':
        return 'info';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryStats = (campaign) => {
    const sent = campaign.stats?.final?.sent || campaign.stats?.sent || 0;
    const failed = campaign.stats?.final?.failed || campaign.stats?.failed || 0;
    const total = campaign.audienceSize;
    const successRate = ((sent / total) * 100).toFixed(1);

    return { sent, failed, total, successRate };
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
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Delivery Stats</TableCell>
              <TableCell>Success Rate</TableCell>
              <TableCell>Timeline</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No campaigns found
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => {
                const stats = getDeliveryStats(campaign);
                return (
                  <TableRow key={campaign._id}>
                    <TableCell>
                      <Typography variant="subtitle2">{campaign.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title="Total Audience">
                          <Chip
                            icon={<AudienceIcon />}
                            label={`${stats.total} recipients`}
                            variant="outlined"
                            size="small"
                          />
                        </Tooltip>
                        <Tooltip title="Successfully Sent">
                          <Chip
                            icon={<SuccessIcon />}
                            label={stats.sent}
                            color="success"
                            size="small"
                          />
                        </Tooltip>
                        <Tooltip title="Failed">
                          <Chip
                            icon={<FailedIcon />}
                            label={stats.failed}
                            color="error"
                            size="small"
                          />
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 100,
                            height: 8,
                            borderRadius: 1,
                            bgcolor: 'grey.200',
                            overflow: 'hidden',
                            display: 'flex'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${stats.successRate}%`,
                              bgcolor: 'success.main',
                              height: '100%'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {stats.successRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Started: {formatDate(campaign.startedAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed: {formatDate(campaign.completedAt)}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Campaigns; 