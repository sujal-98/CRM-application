import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  useTheme,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { selectUser } from '../../store/slices/authSlice';
import api from '../../services/api';

export const CONDITIONS = [
  {
    value: 'total_spend',
    label: 'Total Spend',
    type: 'number',
    unit: 'INR',
    description: 'Total amount spent by the customer'
  },
  {
    value: 'visits',
    label: 'Number of Visits',
    type: 'number',
    description: 'Total number of visits'
  },
  {
    value: 'total_orders',
    label: 'Total Orders',
    type: 'number',
    description: 'Total number of orders placed'
  },
  {
    value: 'avg_order_value',
    label: 'Average Order Value',
    type: 'number',
    unit: 'INR',
    description: 'Average amount spent per order'
  },
  {
    value: 'last_order_date',
    label: 'Days Since Last Order',
    type: 'number',
    unit: 'days',
    description: 'Days since last order was placed'
  }
];

export const COMPARATORS = [
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '≥' },
  { value: 'lte', label: '≤' },
  { value: 'eq', label: '=' }
];

export const OPERATORS = ['AND', 'OR'];

const FlowSegmentBuilder = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector(selectUser);

  const [segmentName, setSegmentName] = useState('');
  const [conditions, setConditions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [newCondition, setNewCondition] = useState({
    condition: '',
    comparator: '',
    value: '',
  });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [audienceCount, setAudienceCount] = useState(0);
  const [audience, setAudience] = useState([]);
  const [audienceDetails, setAudienceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [hasPreviewedSegment, setHasPreviewedSegment] = useState(false);

  const handleAddCondition = () => {
    if (!newCondition.condition || !newCondition.comparator || !newCondition.value) {
      return;
    }

    setConditions([...conditions, { ...newCondition, id: Date.now() }]);
    if (conditions.length > 0) {
      setOperators([...operators, 'AND']);
    }
    setNewCondition({ condition: '', comparator: '', value: '' });
    setHasPreviewedSegment(false);
  };

  const handleDeleteCondition = (index) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);

    const newOperators = [...operators];
    if (index > 0) {
      newOperators.splice(index - 1, 1);
    }
    setOperators(newOperators);
    setHasPreviewedSegment(false);
  };

  const handleOperatorChange = (index, value) => {
    const newOperators = [...operators];
    newOperators[index] = value;
    setOperators(newOperators);
    setHasPreviewedSegment(false);
  };

  const generateConditionString = () => {
    return conditions.map((condition, index) => {
      const conditionObj = CONDITIONS.find(c => c.value === condition.condition);
      const str = `${conditionObj?.label} ${condition.comparator} ${condition.value}${conditionObj?.unit ? ` ${conditionObj.unit}` : ''}`;
      if (index < operators.length) {
        return str + ` ${operators[index]} `;
      }
      return str;
    }).join('');
  };

  const convertToSegmentationRules = () => {
    if (conditions.length === 0) return null;

    // For single condition
    if (conditions.length === 1) {
      return {
        rules: {
          type: 'simple',
          field: conditions[0].condition,
          comparator: conditions[0].comparator,
          value: Number(conditions[0].value)
        }
      };
    }

    // For multiple conditions
    const buildRules = () => {
      let currentRule = {
        type: operators[0].toLowerCase(),
        conditions: [
          {
            type: 'simple',
            field: conditions[0].condition,
            comparator: conditions[0].comparator,
            value: Number(conditions[0].value)
          },
          {
            type: 'simple',
            field: conditions[1].condition,
            comparator: conditions[1].comparator,
            value: Number(conditions[1].value)
          }
        ]
      };

      // Add remaining conditions
      for (let i = 2; i < conditions.length; i++) {
        const operator = operators[i - 1].toLowerCase();
        
        if (operator === currentRule.type) {
          currentRule.conditions.push({
            type: 'simple',
            field: conditions[i].condition,
            comparator: conditions[i].comparator,
            value: Number(conditions[i].value)
          });
      } else {
          currentRule = {
            type: operator,
            conditions: [
              currentRule,
              {
                type: 'simple',
                field: conditions[i].condition,
                comparator: conditions[i].comparator,
                value: Number(conditions[i].value)
              }
            ]
          };
        }
      }

      return currentRule;
    };

    return { rules: buildRules() };
  };

  const handlePreview = async () => {
    try {
      if (conditions.length === 0) {
        enqueueSnackbar('No conditions defined', { variant: 'error' });
        return;
      }

      const convertedRules = convertToSegmentationRules();
      console.log('Sending preview request with rules:', convertedRules);

      setLoading(true);
      const response = await api.post('/api/segmentation/count', {
        rules: convertedRules.rules,
        options: {} 
      });

      console.log('Preview response:', response.data);

      if (response.data.status === 'success') {
        const responseData = response.data.data || {};
        
        // Ensure unique customers by _id
        const uniqueCustomers = Array.from(
          new Map(
            (responseData.audience || []).map(customer => [customer._id, customer])
          ).values()
        );
        
        const totalCount = uniqueCustomers.length;
        const details = responseData.details || {};
        
        // Handle the case where no customers match
        if (totalCount === 0) {
          enqueueSnackbar('No customers match these criteria', { variant: 'info' });
          setAudienceCount(0);
          setAudienceDetails({
        averageSpend: 0,
            averageOrders: 0,
            totalSpend: 0
          });
          setAudience([]);
        } else {
          // Store the unique customer objects and total count
          setAudience(uniqueCustomers);
          setAudienceCount(totalCount);
          setAudienceDetails({
            averageSpend: details.averageSpend || 0,
            averageOrders: details.averageOrders || 0,
            totalSpend: details.totalSpend || 0
          });
          
          enqueueSnackbar(`Found ${totalCount.toLocaleString()} unique matching customers`, { 
            variant: 'success' 
          });
        }
        
        setHasPreviewedSegment(true);
        setPreviewModalOpen(true);
      } else {
        throw new Error(response.data.message || 'Failed to preview segment');
      }
    } catch (error) {
      console.error('Error previewing segment:', error);
      enqueueSnackbar(error.message || 'Failed to preview segment', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfirm = async () => {
    try {
      if (!segmentName.trim()) {
        enqueueSnackbar('Please enter a segment name', { variant: 'warning' });
        return;
      }

      if (conditions.length === 0) {
        enqueueSnackbar('Please add at least one condition', { variant: 'warning' });
        return;
      }

      if (!hasPreviewedSegment) {
        enqueueSnackbar('Please preview the segment before saving', { variant: 'warning' });
        setSaveDialogOpen(false);
        return;
      }

      // Check if we have customer IDs
      if (!audience.length || !audience[0]?._id) {
        enqueueSnackbar('Customer data is incomplete. Please preview again.', { variant: 'error' });
        setSaveDialogOpen(false);
        return;
      }

      setLoading(true);

      const customerIds = audience.map(customer => customer._id);
      console.log('Saving segment with customer IDs:', customerIds);

      const payload = {
        name: segmentName.trim(),
        rules: convertToSegmentationRules().rules,
        conditionString: generateConditionString(),
        customerIds: customerIds,
        audienceSize: audienceCount,
        createdBy: user.email,
        details: {
          averageSpend: audienceDetails?.averageSpend || 0,
          averageOrders: audienceDetails?.averageOrders || 0,
          totalSpend: audienceDetails?.totalSpend || 0
        }
      };

      const response = await axios.post('http://localhost:4000/api/segments/save', payload);

      if (response.data.status === 'success') {
        enqueueSnackbar('Segment saved successfully!', { 
          variant: 'success',
          autoHideDuration: 3000
        });
        
        // Reset form and states
        setSegmentName('');
        setConditions([]);
        setOperators([]);
        setAudienceCount(0);
        setAudience([]);
        setAudienceDetails(null);
        setPreviewModalOpen(false);
        setSaveDialogOpen(false);
        setHasPreviewedSegment(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to save segment', { 
        variant: 'error',
        autoHideDuration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!segmentName.trim()) {
      enqueueSnackbar('Please enter a segment name', { variant: 'warning' });
      return;
    }

    if (conditions.length === 0) {
      enqueueSnackbar('Please add at least one condition', { variant: 'warning' });
      return;
    }

    if (!hasPreviewedSegment) {
      enqueueSnackbar('Please preview the segment before saving', { variant: 'warning' });
      return;
    }

    setSaveDialogOpen(true);
  };

  return (
    <>
    <Box sx={{ 
        p: 4,
        backgroundColor: alpha(theme.palette.background.default, 0.7),
        borderRadius: theme.shape.borderRadius * 2,
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: theme.shape.borderRadius * 2,
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
            backdropFilter: 'blur(10px)',
          }}
        >
      {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
                mb: 3
              }}
            >
                Segment Builder
              </Typography>
            <TextField
              fullWidth
              label="Segment Name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                }
              }}
            />
          </Box>

      {/* Condition String Preview */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4, 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography 
              variant="subtitle1" 
              gutterBottom
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600 
              }}
            >
          Segment Logic Preview
        </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              {generateConditionString() || 'Add conditions to see the segment logic preview.'}
        </Typography>
          </Paper>

          {/* Existing Conditions */}
          {conditions.map((condition, index) => (
            <Box key={condition.id} sx={{ mb: 3 }}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    {index > 0 && (
                      <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Operator</InputLabel>
                          <Select
                            value={operators[index - 1]}
                            onChange={(e) => handleOperatorChange(index - 1, e.target.value)}
                            label="Operator"
                            sx={{
                              borderRadius: 1.5,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiSelect-select': {
                                fontWeight: 600,
                              }
                            }}
                          >
                            {OPERATORS.map(op => (
                              <MenuItem key={op} value={op}>
                                <Typography sx={{ fontWeight: 600 }}>
                                  {op}
                                </Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={index > 0 ? 8 : 10}>
                      <Box sx={{ 
            display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.background.default, 0.5)
                      }}>
                        <Chip 
                          label={CONDITIONS.find(c => c.value === condition.condition)?.label}
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip 
                          label={condition.comparator}
                          variant="outlined"
                          size="small"
                        />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {condition.value}
                          {CONDITIONS.find(c => c.value === condition.condition)?.unit && (
                            <Typography 
                              component="span" 
                              sx={{ 
                                ml: 0.5,
                                color: theme.palette.text.secondary,
                                fontSize: '0.875rem'
                              }}
                            >
                              {CONDITIONS.find(c => c.value === condition.condition)?.unit}
            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton 
                        onClick={() => handleDeleteCondition(index)} 
                        color="error"
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          ))}

          {/* Add New Condition */}
          <Paper 
                  sx={{
              p: 4, 
              mb: 4,
                    borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
                mb: 3
              }}
            >
              Add New Condition
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={newCondition.condition}
                    onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value })}
                    label="Condition"
                    sx={{ borderRadius: 2 }}
                >
                  {CONDITIONS.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                        <Box>
                          <Typography variant="body1">
                            {condition.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {condition.description}
                          </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={newCondition.comparator}
                    onChange={(e) => setNewCondition({ ...newCondition, comparator: e.target.value })}
                  label="Operator"
                    sx={{ borderRadius: 2 }}
                >
                  {COMPARATORS.map((comp) => (
                    <MenuItem key={comp.value} value={comp.value}>
                        <Typography sx={{ fontWeight: 600 }}>
                        {comp.label}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Value"
                type="number"
                value={newCondition.value}
                  onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                sx={{
                    borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Button
                  variant="contained"
                  startIcon={<AddIcon />}
              onClick={handleAddCondition}
              disabled={!newCondition.condition || !newCondition.comparator || !newCondition.value}
              sx={{ 
                mt: 3,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                }
              }}
                >
                  Add Condition
            </Button>
          </Paper>

          {/* Actions */}
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
                    variant="outlined"
              startIcon={<PreviewIcon />}
                    onClick={handlePreview}
              disabled={conditions.length === 0}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                borderWidth: 2,
              }}
                  >
                    Preview
            </Button>
            <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
              disabled={conditions.length === 0 || !segmentName.trim()}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1,
                background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                }
              }}
                  >
                    Save Segment
            </Button>
                </Stack>
        </Paper>

        {/* Preview Modal */}
        <Dialog 
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 2
          }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
              Segment Preview
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                color="primary" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {audienceCount > 0 ? audienceCount.toLocaleString() : 'No'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 4
                }}
              >
                {audienceCount === 1 ? 'Matching Customer' : 'Matching Customers'}
              </Typography>
              
              {audienceDetails && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Average Spend
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          ₹{audienceDetails.averageSpend?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Average Orders
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          {audienceDetails.averageOrders?.toLocaleString(undefined, {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                          })}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Customers
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          {audienceCount.toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Spend
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          ₹{(audienceDetails.totalSpend || audienceDetails.averageSpend * audienceCount)?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Segment Rules Preview */}
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.text.secondary }}>
                  Applied Rules:
                </Typography>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography variant="body1">
                    {generateConditionString()}
                  </Typography>
                </Paper>
    </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button 
              onClick={() => setPreviewModalOpen(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                borderWidth: 2,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Save Confirmation Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            Save Segment
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Are you sure you want to save this segment?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Segment Name: <strong>{segmentName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Conditions: <strong>{conditions.length}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Matching Customers: <strong>{audienceCount.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logic: <strong>{generateConditionString()}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            variant="outlined"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfirm}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
              }
            }}
          >
            {loading ? 'Saving...' : 'Confirm Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FlowSegmentBuilder;