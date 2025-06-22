import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function Assignments() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Asset Assignments
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Assignment management functionality coming soon...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will allow you to assign assets to personnel, track assignments, and manage asset accountability.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Assignments; 