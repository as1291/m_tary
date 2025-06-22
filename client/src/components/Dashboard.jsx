import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  SwapHoriz as TransferIcon,
  Assignment as AssignmentIcon,
  AccountBalance as ExpenditureIcon,
  History as AuditIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [assets, bases, equipmentTypes, purchases, transfers, assignments, expenditures] = await Promise.all([
        axios.get('/assets'),
        axios.get('/bases'),
        axios.get('/equipmentTypes'),
        axios.get('/purchases'),
        axios.get('/transfers'),
        axios.get('/assignments'),
        axios.get('/expenditures'),
      ]);

      setStats({
        assets: assets.data.length,
        bases: bases.data.length,
        equipmentTypes: equipmentTypes.data.length,
        purchases: purchases.data.length,
        transfers: transfers.data.length,
        assignments: assignments.data.length,
        expenditures: expenditures.data.length,
      });
    } catch (error) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Assets',
      value: stats.assets || 0,
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1a237e',
    },
    {
      title: 'Military Bases',
      value: stats.bases || 0,
      icon: <LocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#534bae',
    },
    {
      title: 'Equipment Types',
      value: stats.equipmentTypes || 0,
      icon: <BuildIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#000051',
    },
    {
      title: 'Purchases',
      value: stats.purchases || 0,
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: '#d32f2f',
    },
    {
      title: 'Transfers',
      value: stats.transfers || 0,
      icon: <TransferIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: '#ff6659',
    },
    {
      title: 'Assignments',
      value: stats.assignments || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1a237e',
    },
    {
      title: 'Expenditures',
      value: stats.expenditures || 0,
      icon: <ExpenditureIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: '#9a0007',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard Overview
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label="Operational" 
                  color="success" 
                  size="small" 
                  sx={{ mr: 2 }}
                />
                <Typography variant="body2">
                  All systems are running normally
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label="Secure" 
                  color="primary" 
                  size="small" 
                  sx={{ mr: 2 }}
                />
                <Typography variant="body2">
                  Authentication and authorization active
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Last Updated:</strong> {new Date().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Database:</strong> Connected and synchronized
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                <InventoryIcon sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2">Add New Asset</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                <ShoppingCartIcon sx={{ fontSize: 30, color: 'secondary.main', mb: 1 }} />
                <Typography variant="body2">Create Purchase</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                <TransferIcon sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2">Transfer Asset</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                <AuditIcon sx={{ fontSize: 30, color: 'secondary.main', mb: 1 }} />
                <Typography variant="body2">View Audit Logs</Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard; 