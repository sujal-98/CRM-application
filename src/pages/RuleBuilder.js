import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import FlowSegmentBuilder, { CONDITIONS } from '../components/segments/FlowSegmentBuilder';

const RuleBuilder = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const transformRules = (segment) => {
    if (!segment.rules || segment.rules.length === 0) return null;

    if (segment.rules.length === 1) {
      return {
        type: 'simple',
        field: segment.rules[0].condition,
        comparator: segment.rules[0].comparator,
        value: Number(segment.rules[0].value)
      };
    }

    return {
      type: segment.operators[0].toLowerCase(),
      conditions: segment.rules.map(rule => ({
        type: 'simple',
        field: rule.condition,
        comparator: rule.comparator,
        value: Number(rule.value)
      }))
    };
  };

  const handleSave = async (segment) => {
    try {
      setLoading(true);
      setError(null);

      const transformedRules = transformRules(segment);
      
      const response = await fetch('http://localhost:5000/api/segments/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules: transformedRules }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate segment size');
      }

      const data = await response.json();
      
      const newSegment = {
        id: Date.now(),
        ...segment,
        audienceSize: data.totalCount,
        details: data.details,
        createdAt: new Date().toISOString(),
      };

      navigate('/campaigns/new', { state: { segment: newSegment } });
    } catch (err) {
      setError(err.message);
      console.error('Error calculating segment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (segment) => {
    try {
      setLoading(true);
      setError(null);

      const transformedRules = transformRules(segment);
      
      console.log('Sending rules to backend:', transformedRules); // Debug log

      const response = await fetch('http://localhost:5000/api/segments/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules: transformedRules }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate segment size');
      }

      const data = await response.json();
      console.log('Received data from backend:', data); // Debug log

      // Properly structure the preview data
      setPreviewData({
        ...segment,
        audienceSize: data.totalCount,
        details: {
          averageSpend: data.details?.averageSpend || 0,
          averageOrders: data.details?.averageOrders || 0,
          totalSpend: data.details?.totalSpend || 0,
          totalOrders: data.details?.totalOrders || 0
        }
      });
      
      setPreviewDialog(true);
    } catch (err) {
      setError(err.message);
      console.error('Error previewing segment:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRule = React.useCallback((rule) => {
    const condition = CONDITIONS.find((c) => c.value === rule.condition);
    return `${condition?.label || rule.condition} ${rule.comparator} ${rule.value}${
      condition?.unit ? ` ${condition.unit}` : ''
    }`;
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/segments')}
          sx={{ mr: 2 }}
        >
          Back to Segments
        </Button>
        <Typography variant="h4">Create Segment</Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper sx={{ p: 3 }}>
        <FlowSegmentBuilder
          onSave={handleSave}
          onPreview={handlePreview}
        />
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Audience Preview</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : previewData && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {previewData.name || 'Segment Preview'}
              </Typography>
              <Typography variant="h4" color="primary" align="center" gutterBottom>
                {previewData.audienceSize?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
                Matching Customers
              </Typography>
              
              {previewData.details && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Audience Metrics:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Average Spend
                      </Typography>
                      <Typography variant="h6">
                        ₹{previewData.details.averageSpend?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) || '0.00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Average Orders
                      </Typography>
                      <Typography variant="h6">
                        {previewData.details.averageOrders?.toLocaleString(undefined, {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1
                        }) || '0.0'}
                      </Typography>
                    </Grid>
                    {previewData.details.totalSpend && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Spend
                        </Typography>
                        <Typography variant="h6">
                          ₹{previewData.details.totalSpend.toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {previewData.details.totalOrders && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                        <Typography variant="h6">
                          {previewData.details.totalOrders.toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Segment Rules:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {previewData.rules.map((rule, index) => (
                    <React.Fragment key={index}>
                      <Chip 
                        size="small" 
                        label={formatRule(rule)}
                        sx={{ bgcolor: 'background.paper' }}
                      />
                      {index < previewData.operators.length && (
                        <Chip
                          size="small"
                          label={previewData.operators[index]}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPreviewDialog(false);
              navigate('/campaigns/new', { state: { segment: previewData } });
            }}
            disabled={loading}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

RuleBuilder.displayName = 'RuleBuilder';

export default RuleBuilder; 