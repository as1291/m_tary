import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function AuditLog() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    tableName: '',
    action: '',
    user: '',
    startDate: '',
    endDate: '',
  });

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/auditLogs?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
      
    } catch (error) {
      setError('Failed to load audit logs');
      console.error('Audit logs error:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchAuditLogs();
  };

  const clearFilters = () => {
    setFilters({
      tableName: '',
      action: '',
      user: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => fetchAuditLogs(), 100);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const formatJsonData = (data) => {
    if (!data) return 'N/A';
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const renderValuesDiff = (oldValues, newValues) => {
    if (!oldValues && !newValues) return 'No data';
    
    return (
      <Box>
        {oldValues && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" color="error">
                Old Values
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre style={{ 
                fontSize: '12px', 
                backgroundColor: '#f5f5f5', 
                padding: '8px', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {formatJsonData(oldValues)}
              </pre>
            </AccordionDetails>
          </Accordion>
        )}
        {newValues && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" color="success.main">
                New Values
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre style={{ 
                fontSize: '12px', 
                backgroundColor: '#f5f5f5', 
                padding: '8px', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {formatJsonData(newValues)}
              </pre>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    );
  };

  const columns = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 180,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleString() : '';
      }
    },
    {
      field: 'tableName',
      headerName: 'Table',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getActionColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'recordId',
      headerName: 'Record ID',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value ? params.value.toString().slice(-8) : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'user',
      headerName: 'User',
      width: 150,
      valueGetter: (value, row) => row.user?.username || 'System'
    },
    {
      field: 'ipAddress',
      headerName: 'IP Address',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'changes',
      headerName: 'Changes',
      width: 400,
      renderCell: (params) => {
        return renderValuesDiff(params.row.oldValues, params.row.newValues);
      }
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Check if user has permission to view audit logs
  if (!hasRole('admin')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. Only administrators can view audit logs.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Audit Logs
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Table</InputLabel>
                <Select
                  value={filters.tableName}
                  onChange={(e) => handleFilterChange('tableName', e.target.value)}
                  label="Table"
                >
                  <MenuItem value="">All Tables</MenuItem>
                  <MenuItem value="assets">Assets</MenuItem>
                  <MenuItem value="bases">Bases</MenuItem>
                  <MenuItem value="purchases">Purchases</MenuItem>
                  <MenuItem value="transfers">Transfers</MenuItem>
                  <MenuItem value="assignments">Assignments</MenuItem>
                  <MenuItem value="expenditures">Expenditures</MenuItem>
                  <MenuItem value="equipmentTypes">Equipment Types</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  label="Action"
                >
                  <MenuItem value="">All Actions</MenuItem>
                  <MenuItem value="INSERT">Insert</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="End Date"
                type="date"
                size="small"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" gap={1}>
                <button
                  onClick={applyFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{auditLogs.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {new Set(auditLogs.map(log => log.user?.username || 'System')).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ComputerIcon color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {new Set(auditLogs.map(log => log.tableName)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tables Modified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ExpandMoreIcon color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {auditLogs.filter(log => log.action === 'DELETE').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deletions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataGrid
        rows={auditLogs}
        columns={columns}
        getRowId={(row) => row._id}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        slots={{
          toolbar: GridToolbar,
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          },
        }}
        getRowHeight={() => 'auto'}
      />
    </Box>
  );
}

export default AuditLog;
