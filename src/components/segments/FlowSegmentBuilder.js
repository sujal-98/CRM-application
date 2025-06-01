import * as React from 'react';
import {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useSelector } from 'react-redux';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  Handle,
  Position,
  getBezierPath,
  EdgeText,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  Tooltip,
  Grid,
  Divider,
  alpha,
  Fade,
  Zoom,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  DragIndicator as DragIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  AccountTree as TreeIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../store/slices/authSlice';

export const CONDITIONS = [
  {
    value: 'spend',
    label: 'Total Spend',
    type: 'number',
    unit: 'INR',
    description: 'Total amount spent by the customer',
  },
  {
    value: 'visits',
    label: 'Number of Visits',
    type: 'number',
    description: 'Total number of times the customer has visited',
  },
  {
    value: 'last_order_date',
    label: 'Days Since Last Active',
    type: 'number',
    unit: 'days',
    description: 'Number of days since the customer last interacted',
  },
  {
    value: 'avg_order_value',
    label: 'Average Order Value',
    type: 'number',
    unit: 'INR',
    description: 'Average amount spent per order',
  },
  {
    value: 'total_orders',
    label: 'Total Orders',
    type: 'number',
    description: 'Total number of orders placed',
  },
];

const COMPARATORS = [
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'eq', label: '=' },
  { value: 'gte', label: '≥' },
  { value: 'lte', label: '≤' },
];

const OPERATORS = {
  AND: 'AND',
  OR: 'OR',
};

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
}));

const ConditionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.8)})`,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 20px 0 ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.12)}`,
    borderColor: alpha(theme.palette.primary.main, 0.4),
  },
}));

const OperatorChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 700,
  fontSize: '0.9rem',
  padding: theme.spacing(0.5, 1),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: 'scale(1.05)',
  },
}));

const ModernButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.6)}`,
      transform: 'translateY(-1px)',
    },
  }),
  ...(variant === 'outlined' && {
    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    color: theme.palette.primary.main,
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.05),
      border: `1px solid ${theme.palette.primary.main}`,
      transform: 'translateY(-1px)',
    },
  }),
}));

const ConditionNode = ({ data, selected, isConnectable }) => {
  const theme = useTheme();
  const condition = CONDITIONS.find((c) => c.value === data.condition);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(data.value);
  const [editedComparator, setEditedComparator] = useState(data.comparator);

  const handleSave = () => {
    data.onUpdate(data.id, {
      ...data,
      value: editedValue,
      comparator: editedComparator,
    });
    setIsEditing(false);
  };

  return (
    <Box 
      sx={{ 
        width: 350,
        minHeight: 100,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable}
        style={{ 
          background: theme.palette.secondary.main,
          width: 8,
          height: 8,
          border: `2px solid ${theme.palette.background.paper}`,
          boxShadow: `0 2px 4px 0 ${alpha(theme.palette.common.black, 0.2)}`,
          top: -4,
        }} 
      />
      <ConditionCard elevation={selected ? 4 : 2}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                Condition
              </Typography>
              <Tooltip title={condition?.description}>
                <InfoIcon fontSize="small" color="primary" />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => setIsEditing(!isEditing)}
                sx={{ 
                  color: theme.palette.primary.main,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => data.onDelete(data.id)}
                sx={{ 
                  color: theme.palette.error.main,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ my: 1.5, borderColor: alpha(theme.palette.divider, 0.1) }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {isEditing ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minWidth: 100 }}>
                    {condition?.label}:
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={editedComparator}
                      onChange={(e) => setEditedComparator(e.target.value)}
                      size="small"
                      sx={{
                        height: 32,
                        '& .MuiSelect-select': {
                          py: 0.5,
                        },
                      }}
                    >
                      {COMPARATORS.map((comp) => (
                        <MenuItem key={comp.value} value={comp.value}>
                          {comp.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    type="number"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    sx={{
                      width: 80,
                      '& .MuiInputBase-input': {
                        py: 0.5,
                      },
                    }}
                    InputProps={{
                      endAdornment: condition?.unit && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          {condition.unit}
                        </Typography>
                      ),
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleSave}
                    sx={{ 
                      color: theme.palette.success.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                      },
                    }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {condition?.label}:
                </Typography>
                <Chip
                  label={data.comparator}
                  size="small"
                  color="primary"
                  sx={{ 
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.light, 0.3)})`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {data.value}
                  {condition?.unit && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      {condition.unit}
                    </Typography>
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </ConditionCard>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable}
        style={{ 
          background: theme.palette.secondary.main,
          width: 8,
          height: 8,
          border: `2px solid ${theme.palette.background.paper}`,
          boxShadow: `0 2px 4px 0 ${alpha(theme.palette.common.black, 0.2)}`,
          bottom: -4,
        }} 
      />
    </Box>
  );
};

const OperatorNode = ({ data, selected }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        width: 100,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: theme.palette.secondary.main,
          width: 8,
          height: 8,
          border: `2px solid ${theme.palette.background.paper}`,
          boxShadow: `0 2px 4px 0 ${alpha(theme.palette.common.black, 0.2)}`,
          top: -4,
        }} 
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <OperatorChip
          label={data.label}
          onClick={() => data.onToggle(data.id)}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        />
        <IconButton
          size="small"
          onClick={() => data.onDelete(data.id)}
          sx={{ 
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
              transform: 'scale(1.1)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 12,
            },
          }}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ 
          background: theme.palette.secondary.main,
          width: 8,
          height: 8,
          border: `2px solid ${theme.palette.background.paper}`,
          boxShadow: `0 2px 4px 0 ${alpha(theme.palette.common.black, 0.2)}`,
          bottom: -4,
        }} 
      />
    </Box>
  );
};

const nodeTypes = {
  condition: ConditionNode,
  operator: OperatorNode,
};

const FlowSegmentBuilder = ({ onSave, onPreview }) => {
  const theme = useTheme();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [segmentName, setSegmentName] = useState('');
  const [newCondition, setNewCondition] = useState({
    condition: '',
    comparator: '',
    value: '',
  });
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [audienceCount, setAudienceCount] = useState(0);
  const [audience, setAudience] = useState([]);
  const [audienceDetails, setAudienceDetails] = useState(null);
  const [conditionStringPreview, setConditionStringPreview] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const user = useSelector(selectUser);


  useEffect(() => {
    setConditionStringPreview(generateConditionString(nodes));
    // eslint-disable-next-line
  }, [nodes]);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => {
      const remainingNodes = nds.filter((node) => node.id !== nodeId);
      // Recalculate positions for remaining nodes
      return remainingNodes.map((node, index) => ({
        ...node,
        position: {
          x: 200,
          y: index * 160,
        },
      }));
    });
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const updateNode = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const toggleOperator = useCallback((nodeId) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: node.data.label === 'AND' ? 'OR' : 'AND',
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addConditionNode = () => {
    if (!newCondition.condition || !newCondition.comparator || !newCondition.value) return;

    const newNodeId = `condition-${Date.now()}`;
    const yPosition = nodes.length * 160;

    // Create condition node
    const conditionNode = {
      id: newNodeId,
      type: 'condition',
      position: { x: 200, y: yPosition },
      data: { 
        ...newCondition,
        id: newNodeId,
        onDelete: deleteNode,
        onUpdate: updateNode,
      },
      draggable: false,
      selectable: true,
    };

    // Create operator node if this isn't the first condition
    let operatorNode = null;
    let newEdges = [];

    if (nodes.length > 0) {
      const operatorId = `operator-${Date.now()}`;
      operatorNode = {
        id: operatorId,
        type: 'operator',
        position: { x: 200, y: yPosition - 80 },
        data: { 
          label: 'AND',
          id: operatorId,
          onDelete: deleteNode,
          onToggle: toggleOperator,
        },
        draggable: false,
        selectable: true,
      };

      // Connect previous node to operator
      const prevNode = nodes[nodes.length - 1];
      newEdges.push({
        id: `edge-${prevNode.id}-${operatorId}`,
        source: prevNode.id,
        target: operatorId,
        type: 'straight',
        style: { 
          strokeWidth: 2,
          stroke: theme.palette.primary.main,
        },
      });

      // Connect operator to new condition
      newEdges.push({
        id: `edge-${operatorId}-${newNodeId}`,
        source: operatorId,
        target: newNodeId,
        type: 'straight',
        style: { 
          strokeWidth: 2,
          stroke: theme.palette.primary.main,
        },
      });
    }

    // Update nodes and edges
    const newNodes = operatorNode 
      ? [...nodes, operatorNode, conditionNode]
      : [...nodes, conditionNode];

    setNodes(newNodes);
    setEdges((eds) => [...eds, ...newEdges]);
    setNewCondition({ condition: '', comparator: '', value: '' });

    // Fit view after adding node
    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.2 });
    }, 100);
  };

  // Utility to generate a human-readable string for the segment logic
  const generateConditionString = (nodes) => {
    const conditionNodes = nodes.filter((node) => node.type === 'condition');
    const operatorNodes = nodes.filter((node) => node.type === 'operator');
    if (conditionNodes.length === 0) return '';
    if (conditionNodes.length === 1) {
      const node = conditionNodes[0];
      const condition = CONDITIONS.find((c) => c.value === node.data.condition);
      return `${condition?.label || node.data.condition} ${node.data.comparator} ${node.data.value}${condition?.unit ? ` ${condition.unit}` : ''}`;
    }
    let str = '';
    for (let i = 0; i < conditionNodes.length; i++) {
      const node = conditionNodes[i];
      const condition = CONDITIONS.find((c) => c.value === node.data.condition);
      str += `${condition?.label || node.data.condition} ${node.data.comparator} ${node.data.value}${condition?.unit ? ` ${condition.unit}` : ''}`;
      if (i < operatorNodes.length) {
        str += ` ${operatorNodes[i].data.label} `;
      }
    }
    return str;
  };

  const handlePreview = async () => {
    try {
      // Validate nodes before conversion
      if (!nodes || nodes.length === 0) {
        enqueueSnackbar('No conditions defined', { variant: 'error' });
        return;
      }

      // Convert flow conditions to segmentation rules
      let convertedRules;
      try {
        const conversionResult = convertFlowToSegmentationRules(nodes);
        convertedRules = conversionResult.rules;
      } catch (conversionError) {
        console.error('Rule Conversion Error:', conversionError);
        enqueueSnackbar(`Rule Conversion Error: ${conversionError.message}`, { variant: 'error' });
        return;
      }

      console.log('Converted Rules for Preview:', JSON.stringify(convertedRules, null, 2));

      // Call segmentation count endpoint
      const response = await axios.post('/api/segmentation/count', { 
        rules: convertedRules, 
        options: {} 
      });
      
      console.log('Full Segmentation Count Response:', response.data);

      if (!response.data || !response.data.data) {
        throw new Error('Invalid server response');
      }

      const responseData = response.data.data;
      
      // Update states with the response data
      setAudienceCount(responseData.totalCount || 0);
      setAudienceDetails({
        averageSpend: responseData.details?.averageSpend || 0,
        averageOrders: responseData.details?.averageOrders || 0
      });
      setAudience(responseData.audience || []); // Store the full audience data

      setPreviewModalOpen(true);
      enqueueSnackbar(`Found ${responseData.totalCount.toLocaleString()} matching customers`, { 
        variant: 'info' 
      });

    } catch (error) {
      console.error('Preview error:', error);
      enqueueSnackbar(error.message || 'Failed to preview segment', { variant: 'error' });
    }
  };

  const handleSave = async () => {
    if (!segmentName.trim() || nodes.length === 0) return;

    try {
      setLoading(true);
      
      // Check if we have preview data
      if (!audienceCount || !audience.length) {
        enqueueSnackbar('Please preview the segment first', { variant: 'warning' });
        return;
      }

      const payload = {
        name: segmentName,
        rules: convertFlowToSegmentationRules(nodes).rules,
        conditionString: conditionStringPreview,
        customerIds: audience.map(customer => customer._id),
        audienceSize: audienceCount,
        createdBy: user.email
      };

      console.log('Saving segment with payload:', payload);

      const response = await axios.post('http://localhost:4000/api/segments/save', payload);

      if (response.data.status === 'success') {
        enqueueSnackbar('Segment saved successfully!', { variant: 'success' });
        
        // Reset all states
        setSegmentName('');
        setNodes([]);
        setEdges([]);
        setAudienceCount(0);
        setAudience([]);
        setAudienceDetails(null);
        setPreviewModalOpen(false);
      } else {
        throw new Error(response.data.message || 'Failed to save segment');
      }
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar(error.message || 'Failed to save segment', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Disable default ReactFlow interactions
  const onNodeDrag = useCallback(() => false, []);
  const onNodesDelete = useCallback(() => false, []);

  // Utility function to convert flow conditions to segmentation rules
  const convertFlowToSegmentationRules = (nodes) => {
    // Validate input
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      console.error('No nodes provided for rule conversion');
      throw new Error('No conditions to convert');
    }

    // Collect condition and operator nodes
    const conditionNodes = nodes.filter((node) => node.type === 'condition');
    const operatorNodes = nodes.filter((node) => node.type === 'operator');

    // Helper functions for mapping
    const getFieldMapping = (condition) => {
      const fieldMap = {
        'spend': 'total_spend',
        'visits': 'visits',
        'total_orders': 'total_orders',
        'avg_order_value': 'avg_order_value'
      };
      return fieldMap[condition] || condition;
    };

    const getComparatorMapping = (comparator) => {
      const comparatorMap = {
        'gt': 'gt',
        'lt': 'lt',
        'gte': 'gte',
        'lte': 'lte',
        'eq': 'eq'
      };
      return comparatorMap[comparator] || comparator;
    };

    // Create simple condition
    const createSimpleCondition = (node) => {
      if (!node.data) {
        throw new Error('Invalid node structure');
      }
      const { condition, comparator, value } = node.data;
      return {
        type: 'simple',
        field: getFieldMapping(condition),
        comparator: getComparatorMapping(comparator),
        value: Number(value)
      };
    };

    // If only one condition, create a simple condition
    if (conditionNodes.length === 1) {
      const simpleCondition = createSimpleCondition(conditionNodes[0]);
      return { rules: simpleCondition };
    }

    // Left-associative grouping for mixed operators
    const buildLeftAssociativeRules = () => {
      const conditions = conditionNodes.map(createSimpleCondition);
      const operators = operatorNodes.map(op => op.data.label.toLowerCase());
      if (conditions.length < 2) return conditions[0];
      let group = {
        type: operators[0],
        conditions: [conditions[0], conditions[1]]
      };
      for (let i = 1; i < operators.length; i++) {
        group = {
          type: operators[i],
          conditions: [group, conditions[i + 1]]
        };
      }
      return group;
    };

    const convertedRules = buildLeftAssociativeRules();
    return { rules: convertedRules };
  };

  // Preview Modal Component
  const PreviewModal = ({ open, onClose }) => {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Segment Preview</DialogTitle>
        <DialogContent>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            p={2}
          >
            <Typography variant="h4" color="primary" gutterBottom>
              {audienceCount.toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Matching Customers
            </Typography>
            
            {audienceDetails && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                width: '100%'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Average Spend
                    </Typography>
                    <Typography variant="h6">
                      ₹{audienceDetails.averageSpend?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Average Orders
                    </Typography>
                    <Typography variant="h6">
                      {audienceDetails.averageOrders?.toFixed(1) || '0.0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Customers
                    </Typography>
                    <Typography variant="h6">
                      {audienceCount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Spend
                    </Typography>
                    <Typography variant="h6">
                      ₹{(audienceDetails.averageSpend * audienceCount)?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 100px)', 
      display: 'flex', 
      flexDirection: 'column',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.paper, 0.9)})`,
      p: 2,
      gap: 2,
    }}>
      {/* Header */}
      <GlassPaper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TreeIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                Segment Builder
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Segment Name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              variant="outlined"
              placeholder="e.g., High Value Customers"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                },
              }}
            />
          </Grid>
        </Grid>
      </GlassPaper>

      {/* Condition String Preview */}
      <GlassPaper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
          Segment Logic Preview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {conditionStringPreview || 'Add conditions to see the segment logic preview.'}
        </Typography>
      </GlassPaper>

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Condition Builder Panel */}
        <Grid item xs={12} md={4}>
          <GlassPaper sx={{ 
            p: 3, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
              Add New Condition
            </Typography>
            
            <Stack spacing={2} sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Select Condition</InputLabel>
                <Select
                  value={newCondition.condition}
                  onChange={(e) =>
                    setNewCondition((prev) => ({
                      ...prev,
                      condition: e.target.value,
                    }))
                  }
                  label="Select Condition"
                  sx={{
                    borderRadius: 2,
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {CONDITIONS.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {condition.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {condition.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={newCondition.comparator}
                  onChange={(e) =>
                    setNewCondition((prev) => ({
                      ...prev,
                      comparator: e.target.value,
                    }))
                  }
                  label="Operator"
                  sx={{
                    borderRadius: 2,
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {COMPARATORS.map((comp) => (
                    <MenuItem key={comp.value} value={comp.value}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {comp.label}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Value"
                type="number"
                value={newCondition.value}
                onChange={(e) =>
                  setNewCondition((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                InputProps={{
                  endAdornment: (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {CONDITIONS.find((c) => c.value === newCondition.condition)?.unit || ''}
                    </Typography>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                  },
                }}
              />

              <Box sx={{ mt: 'auto', pt: 2 ,color:'white'}}>
                <ModernButton
                  variant="contained"
                  onClick={addConditionNode}
                  disabled={!newCondition.condition || !newCondition.comparator || !newCondition.value}
                  startIcon={<AddIcon />}
                  fullWidth
                  size="large"
                >
                  Add Condition
                </ModernButton>
              </Box>
            </Stack>
          </GlassPaper>
        </Grid>

        {/* Flow Visualization */}
        <Grid item xs={12} md={8}>
          <GlassPaper
            ref={reactFlowWrapper}
            sx={{
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onInit={onInit}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.3}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              style={{ background: 'transparent' }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              selectNodesOnDrag={false}
              onNodeDrag={onNodeDrag}
              onNodesDelete={onNodesDelete}
              preventScrolling={false}
            >
              <Background 
                color={alpha(theme.palette.primary.main, 0.1)}
                gap={24}
                size={1}
                style={{ opacity: 0.3 }}
              />
              <Controls 
                showInteractive={false}
                style={{ 
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  boxShadow: `0 4px 20px 0 ${alpha(theme.palette.common.black, 0.1)}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              />
              <Panel position="bottom-right">
                <Stack direction="row" spacing={1}>
                  <ModernButton
                    variant="outlined"
                    startIcon={<PlayIcon />}
                    onClick={handlePreview}
                    disabled={nodes.length === 0}
                  >
                    Preview
                  </ModernButton>
                  <ModernButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={nodes.length === 0 || !segmentName.trim()}
                  >
                    Save Segment
                  </ModernButton>
                </Stack>
              </Panel>
              {nodes.length === 0 && (
                <Panel position="center">
                  <Typography variant="subtitle1" color="text.secondary">
                    Start adding conditions to build your segment
                  </Typography>
                </Panel>
              )}
            </ReactFlow>
          </GlassPaper>
        </Grid>
      </Grid>

      {previewModalOpen && (
        <PreviewModal
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </Box>
  );
};

export default FlowSegmentBuilder;