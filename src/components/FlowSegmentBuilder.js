import React, { useState } from 'react';
import { Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button, Chip, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { AddIcon, EditIcon, SaveIcon, DeleteIcon } from '../icons';

const FlowSegmentBuilder = ({ conditions, setConditions }) => {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { field: '', operator: '', value: '', values: [] }
    ]);
  };

  const handleEditCondition = (index) => {
    setEditingIndex(index);
  };

  const handleUpdateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    const condition = newConditions[index];

    if (field === 'operator') {
      condition.value = '';
      condition.values = [];
    }

    if (field === 'field') {
      condition.operator = '';
      condition.value = '';
      condition.values = [];
    }

    condition[field] = value;
    setConditions(newConditions);
  };

  const handleUpdateValues = (index, value) => {
    const newConditions = [...conditions];
    const condition = newConditions[index];
    
    if (condition.operator === 'between') {
      const values = value.split(',').map(v => v.trim());
      condition.values = values;
      condition.value = value;
    } else if (condition.operator === 'in') {
      const values = value.split(',').map(v => v.trim());
      condition.values = values;
      condition.value = value;
    } else {
      condition.value = value;
    }
    
    setConditions(newConditions);
  };

  const getOperatorsByField = (field) => {
    switch (field) {
      case 'age':
      case 'total_purchases':
      case 'days_since_last_order':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lessThan', label: 'Less Than' },
          { value: 'between', label: 'Between' }
        ];
      case 'name':
      case 'email':
      case 'phone':
      case 'location':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'in', label: 'In List' }
        ];
      default:
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' }
        ];
    }
  };

  const renderValueInput = (condition, index) => {
    const { field, operator, value } = condition;

    if (operator === 'between') {
      return (
        <TextField
          fullWidth
          label="Values (comma separated)"
          placeholder="min, max"
          value={value}
          onChange={(e) => handleUpdateValues(index, e.target.value)}
          disabled={editingIndex !== null && editingIndex !== index}
          helperText={field === 'days_since_last_order' ? 
            "Enter days (e.g., 30, 90 for between 30 and 90 days)" : 
            "Enter two values separated by comma (e.g., 20, 30)"}
        />
      );
    }

    if (operator === 'in') {
      return (
        <TextField
          fullWidth
          label="Values (comma separated)"
          placeholder="value1, value2, value3"
          value={value}
          onChange={(e) => handleUpdateValues(index, e.target.value)}
          disabled={editingIndex !== null && editingIndex !== index}
          helperText="Enter values separated by comma"
          multiline
          rows={2}
        />
      );
    }

    if (['age', 'total_purchases', 'days_since_last_order'].includes(field)) {
      return (
        <TextField
          fullWidth
          label={field === 'days_since_last_order' ? "Days" : "Value"}
          type="number"
          value={value}
          onChange={(e) => handleUpdateCondition(index, 'value', e.target.value)}
          disabled={editingIndex !== null && editingIndex !== index}
          helperText={field === 'days_since_last_order' ? "Enter number of days" : ""}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label="Value"
        value={value}
        onChange={(e) => handleUpdateCondition(index, 'value', e.target.value)}
        disabled={editingIndex !== null && editingIndex !== index}
      />
    );
  };

  const handleDeleteCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(conditions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setConditions(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ width: '100%' }}>
        <Droppable droppableId="conditions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {conditions.map((condition, index) => (
                <Draggable key={index} draggableId={`condition-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      elevation={snapshot.isDragging ? 6 : 7}
                      sx={{
                        p: 3,
                        mb: 3,
                        position: 'relative',
                        backgroundColor: editingIndex === index ? '#f8f9fa' : 'white',
                        '&:hover': {
                          boxShadow: 3
                        },
                        transition: 'box-shadow 0.2s, transform 0.2s',
                        transform: snapshot.isDragging ? 'scale(1.02)' : 'none'
                      }}
                    >
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={1}>
                          <Box {...provided.dragHandleProps} sx={{ cursor: 'move', color: 'grey.500' }}>
                            <DragIndicatorIcon />
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Field</InputLabel>
                            <Select
                              value={condition.field}
                              label="Field"
                              onChange={(e) => handleUpdateCondition(index, 'field', e.target.value)}
                              disabled={editingIndex !== null && editingIndex !== index}
                            >
                              <MenuItem value="name">Name</MenuItem>
                              <MenuItem value="email">Email</MenuItem>
                              <MenuItem value="phone">Phone</MenuItem>
                              <MenuItem value="age">Age</MenuItem>
                              <MenuItem value="location">Location</MenuItem>
                              <MenuItem value="days_since_last_order">Days Since Last Order</MenuItem>
                              <MenuItem 
                                value="total_purchases" 
                                sx={{ 
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white'
                                  }
                                }}
                              >
                                Total Purchases
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <FormControl 
                            fullWidth 
                            disabled={!condition.field || (editingIndex !== null && editingIndex !== index)}
                          >
                            <InputLabel>Operator</InputLabel>
                            <Select
                              value={condition.operator}
                              label="Operator"
                              onChange={(e) => handleUpdateCondition(index, 'operator', e.target.value)}
                            >
                              {getOperatorsByField(condition.field).map(op => (
                                <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          {renderValueInput(condition, index)}
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            {editingIndex === index ? (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setEditingIndex(null)}
                                startIcon={<SaveIcon />}
                              >
                                Save
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleEditCondition(index)}
                                startIcon={<EditIcon />}
                              >
                                Edit
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteCondition(index)}
                              startIcon={<DeleteIcon />}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Condition separator */}
                      {index < conditions.length - 1 && (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            my: 3,
                            position: 'relative'
                          }}
                        >
                          <Divider sx={{ width: '100%' }} />
                          <Chip 
                            label="AND" 
                            color="primary" 
                            size="small"
                            sx={{ 
                              position: 'absolute',
                              backgroundColor: 'white',
                              px: 1
                            }}
                          />
                        </Box>
                      )}
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCondition}
            startIcon={<AddIcon />}
            disabled={editingIndex !== null}
            sx={{ 
              color: 'white',
              '&:hover': {
                color: 'white'
              }
            }}
          >
            Add Condition
          </Button>
        </Box>
      </Box>
    </DragDropContext>
  );
};

export default FlowSegmentBuilder; 