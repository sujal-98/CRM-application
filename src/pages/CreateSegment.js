import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import RuleBuilder from './RuleBuilder';

const CreateSegment = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Segment
      </Typography>
      <Paper sx={{ p: 3 }}>
        <RuleBuilder />
      </Paper>
    </Box>
  );
};

export default CreateSegment; 