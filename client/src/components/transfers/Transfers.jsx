import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function Transfers() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Asset Transfers
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Transfer management functionality coming soon...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will allow you to track asset transfers between bases, manage transfer requests, and maintain transfer history.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Transfers; 