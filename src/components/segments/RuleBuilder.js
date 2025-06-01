import React, { useState } from 'react';
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
  Grid,
  Chip,
  useTheme,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const OPERATORS = {
  AND: 'AND',
  OR: 'OR',
};

const CONDITIONS = [
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

const SortableRule = ({ rule, index, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const condition = CONDITIONS.find((c) => c.value === rule.condition);

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isDragging ? 3 : 1}
      sx={{
        p: 2,
        mb: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: (theme) => isDragging ? theme.palette.action.hover : 'background.paper',
      }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
        <DragIcon color="action" />
      </Box>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Condition</InputLabel>
        <Select
          value={rule.condition}
          onChange={(e) => onUpdate(rule.id, 'condition', e.target.value)}
          label="Condition"
        >
          {CONDITIONS.map((condition) => (
            <MenuItem key={condition.value} value={condition.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {condition.label}
                <Tooltip title={condition.description}>
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          value={rule.comparator}
          onChange={(e) => onUpdate(rule.id, 'comparator', e.target.value)}
          label="Operator"
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
        value={rule.value}
        onChange={(e) => onUpdate(rule.id, 'value', e.target.value)}
        sx={{ width: 150 }}
        InputProps={{
          endAdornment: (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {condition?.unit || ''}
            </Typography>
          ),
        }}
      />

      <IconButton size="small" onClick={() => onDelete(rule.id)} color="error">
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
};

const RuleBuilder = ({ onSave, onPreview }) => {
  const theme = useTheme();
  const [rules, setRules] = useState([]);
  const [operator, setOperator] = useState(OPERATORS.AND);
  const [segmentName, setSegmentName] = useState('');
  const [campaignDetails, setCampaignDetails] = useState({
    name: '',
    messageTemplate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: `rule-${Date.now()}`,
        condition: '',
        comparator: '',
        value: '',
      },
    ]);
  };

  const removeRule = (id) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const updateRule = (id, field, value) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setRules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!segmentName.trim() || !campaignDetails.name.trim() || !campaignDetails.messageTemplate.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // First save the segment
      const segment = {
        name: segmentName,
        operator,
        rules: rules.map(({ condition, comparator, value }) => ({
          condition,
          comparator,
          value: Number(value),
        })),
      };

      const response = await fetch('/api/segmentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(segment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save segment');
      }

      const savedSegment = await response.json();

      // Then create a campaign with this segment
      const campaign = {
        name: campaignDetails.name,
        segmentId: savedSegment.data._id,
        messageTemplate: campaignDetails.messageTemplate,
      };

      const campaignResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });

      if (!campaignResponse.ok) {
        throw new Error('Failed to create campaign');
      }

      const savedCampaign = await campaignResponse.json();

      // Start the campaign
      const startResponse = await fetch(`/api/campaigns/${savedCampaign.data._id}/start`, {
        method: 'POST',
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start campaign');
      }

      onSave(savedSegment);
    } catch (err) {
      setError(err.message);
      console.error('Error saving segment and creating campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (rules.length === 0) return;

    const segment = {
      operator,
      rules: rules.map(({ condition, comparator, value }) => ({
        condition,
        comparator,
        value: Number(value),
      })),
    };

    onPreview(segment);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Segment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Segment Name"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Campaign Details
          </Typography>
          <TextField
            fullWidth
            label="Campaign Name"
            value={campaignDetails.name}
            onChange={(e) => setCampaignDetails(prev => ({ ...prev, name: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Message Template"
            value={campaignDetails.messageTemplate}
            onChange={(e) => setCampaignDetails(prev => ({ ...prev, messageTemplate: e.target.value }))}
            required
            multiline
            rows={3}
            helperText="Use {{name}} to personalize the message. Example: 'Hi {{name}}, here's 10% off on your next order!'"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Operator</InputLabel>
            <Select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              label="Operator"
            >
              <MenuItem value={OPERATORS.AND}>AND</MenuItem>
              <MenuItem value={OPERATORS.OR}>OR</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">Rules</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addRule}
                variant="outlined"
                size="small"
              >
                Add Rule
              </Button>
            </Box>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rules.map((rule) => rule.id)}
                strategy={verticalListSortingStrategy}
              >
                {rules.map((rule, index) => (
                  <SortableRule
                    key={rule.id}
                    rule={rule}
                    index={index}
                    onUpdate={updateRule}
                    onDelete={removeRule}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || rules.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Save Segment & Create Campaign
          </Button>
          <Button
            variant="outlined"
            onClick={handlePreview}
            disabled={loading || rules.length === 0}
            sx={{ ml: 2 }}
          >
            Preview Audience
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RuleBuilder; 