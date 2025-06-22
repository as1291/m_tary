import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function Purchases() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Purchase Management
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Purchase management functionality coming soon...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will allow you to manage equipment purchases, track budgets, and maintain procurement records.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Purchases; 