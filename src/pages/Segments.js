import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  useTheme,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { CONDITIONS } from '../components/segments/FlowSegmentBuilder';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import MessageSuggestions from '../components/campaigns/MessageSuggestions';

const Segments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const user = useSelector(selectUser);
  const email = user?.email;
  const [startCampaignDialog, setStartCampaignDialog] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [campaignMessage, setCampaignMessage] = useState('');
  const [campaignLoading, setCampaignLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [segmentPurpose, setSegmentPurpose] = useState('');

  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://crm-backend-y93k.onrender.com/api/segments/${email}`);
        console.log('Segments Response:', response.data);
        
        if (response.data.status === 'success' && response.data.data && response.data.data.segments) {
          setSegments(response.data.data.segments);
        } else {
          console.warn('No segments data in response:', response.data);
          setSegments([]);
        }
      } catch (error) {
        console.error('Error fetching segments:', error);
        setSegments([]);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchSegments();
    }
  }, [email]);

  const handleCreateSegment = () => {
    navigate('/segments/create');
  };

  const handlePreviewSegment = (segment) => {
    setPreviewData({
      ...segment,
      audienceSize: segment.audienceSize || 0,
    });
    setPreviewDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRule = (rule) => {
    const condition = CONDITIONS.find((c) => c.value === rule.condition || c.value === rule.field);
    return `${condition?.label || rule.condition || rule.field} ${rule.comparator || rule.operator} ${rule.value}${
      condition?.unit ? ` ${condition.unit}` : ''
    }`;
  };

  const handleStartCampaign = (segment) => {
    setSelectedSegment(segment);
    setSegmentPurpose(`Engage customers in segment: ${segment.name}`);
    setStartCampaignDialog(true);
  };

  const handleCampaignSubmit = async () => {
    setCampaignLoading(true);
    try {
      // Create and automatically start the campaign
      const response = await axios.post('https://crm-backend-y93k.onrender.com/api/campaigns', {
        segmentId: selectedSegment._id,
        messageTemplate: campaignMessage,
        email: user.email,
        name: `Campaign for ${selectedSegment.name}`,
        audienceSize: selectedSegment.customerIds?.length || 0
      });

      if (response.data.status === 'success') {
        enqueueSnackbar('Campaign created and started successfully!', { variant: 'success' });
        setStartCampaignDialog(false);
        setCampaignMessage('');
        setSegmentPurpose('');
      }
    } catch (error) {
      console.error('Campaign error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to create and start campaign', { 
        variant: 'error' 
      });
    } finally {
      setCampaignLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Segments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSegment}
        >
          Create Segment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Rules</TableCell>
              <TableCell>Audience Size</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !segments || segments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No segments found.
                </TableCell>
              </TableRow>
            ) : (
              segments.map((segment) => (
                <TableRow key={segment._id}>
                  <TableCell>{segment.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {segment.conditionString ? (
                        <Typography variant="body2">{segment.conditionString}</Typography>
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>{segment.customerIds.length?.toLocaleString() || 0}</TableCell>
                  <TableCell>{formatDate(segment.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handlePreviewSegment(segment)}
                    >
                      <CampaignIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStartCampaign(segment)}
                      sx={{ ml: 1 }}
                    >
                      Start Campaign
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Audience Preview</DialogTitle>
        <DialogContent>
          {previewData && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {previewData.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Estimated Audience Size: {previewData.customerIds.length?.toLocaleString?.() || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Rules:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {previewData.rules?.conditions
                    ? previewData.rules.conditions.map((rule, index) => (
                        <React.Fragment key={index}>
                          <Chip size="small" label={formatRule(rule)} />
                          {index < (previewData.rules.conditions.length - 1) && previewData.rules.operator && (
                            <Chip
                              size="small"
                              label={previewData.rules.operator}
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </React.Fragment>
                      ))
                    : Array.isArray(previewData.rules)
                    ? previewData.rules.map((rule, index) => (
                        <React.Fragment key={index}>
                          <Chip size="small" label={formatRule(rule)} />
                        </React.Fragment>
                      ))
                    : null}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Start Campaign Dialog */}
      <Dialog
        open={startCampaignDialog}
        onClose={() => setStartCampaignDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Start Campaign for "{selectedSegment?.name}"</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Audience Size: {selectedSegment?.customerIds.length || 0}
            </Typography>
            
            <TextField
              label="Campaign Purpose"
              fullWidth
              value={segmentPurpose}
              onChange={(e) => setSegmentPurpose(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              placeholder="e.g., Promote new products, Re-engage customers"
            />

            <MessageSuggestions
              audience={selectedSegment?.name || ''}
              purpose={segmentPurpose}
              onSelectMessage={(message) => setCampaignMessage(message)}
            />

            <TextField
              label="Message Template"
              fullWidth
              multiline
              minRows={3}
              value={campaignMessage}
              onChange={e => setCampaignMessage(e.target.value)}
              placeholder="Use suggested message or write your own. Use {customerName} for personalization."
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStartCampaignDialog(false);
            setCampaignMessage('');
            setSegmentPurpose('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleCampaignSubmit}
            disabled={campaignLoading || !campaignMessage}
            variant="contained"
            color="primary"
          >
            {campaignLoading ? 'Starting...' : 'Start Campaign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Segments; 