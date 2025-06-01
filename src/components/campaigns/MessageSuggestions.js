import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

const MessageSuggestions = ({ audience, purpose, onSelectMessage }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/campaigns/suggest-message', {
        audience,
        purpose
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      setError('Failed to get message suggestions');
      console.error('Suggestion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (message) => {
    onSelectMessage(message);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Button
          variant="contained"
          startIcon={<AutoFixHighIcon />}
          onClick={getSuggestions}
          disabled={loading || !audience || !purpose}
        >
          Generate Suggestions
        </Button>
        {loading && <CircularProgress size={24} />}
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {suggestions.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">Suggested Messages:</Typography>
          {suggestions.map((suggestion, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>{suggestion}</Typography>
                  <Button
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopyMessage(suggestion)}
                    size="small"
                  >
                    Use This
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MessageSuggestions; 