import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function Assets() {
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    serialNumber: '',
    equipmentType: '',
    base: '',
    status: 'available',
    condition: 'good',
    metadata: '',
  });

  const { hasRole, hasAnyRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [assetsRes, basesRes, equipmentTypesRes] = await Promise.all([
        axios.get('/assets'),
        axios.get('/bases'),
        axios.get('/equipmentTypes')
      ]);
      
      setAssets(assetsRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(equipmentTypesRes.data);
      
    } catch (error) {
      setError('Failed to load data');
      console.error('Assets error:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAsset(null);
    setFormData({
      serialNumber: '',
      equipmentType: '',
      base: '',
      status: 'available',
      condition: 'good',
      metadata: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      serialNumber: asset.serialNumber || '',
      equipmentType: asset.equipmentType?._id || '',
      base: asset.base?._id || '',
      status: asset.status || 'available',
      condition: asset.condition || 'good',
      metadata: asset.metadata ? JSON.stringify(asset.metadata) : '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axios.delete(`/assets/${id}`);
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        setError('Failed to delete asset');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.serialNumber.trim()) {
        setError('Serial Number is required');
        return;
      }

      const submitData = { ...formData };
      
      // Parse metadata if it's a string
      if (submitData.metadata) {
        try {
          submitData.metadata = JSON.parse(submitData.metadata);
        } catch (e) {
          // If it's not valid JSON, keep it as string
          submitData.metadata = submitData.metadata;
        }
      } else {
        delete submitData.metadata;
      }

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      console.log('Submitting data:', submitData); // Debug log

      if (editingAsset) {
        await axios.patch(`/assets/${editingAsset._id}`, submitData);
      } else {
        await axios.post('/assets', submitData);
      }

      setOpenDialog(false);
      setError(''); // Clear any previous errors
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || error.response?.data?.detail || 'Failed to save asset');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'info';
      case 'expended': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { 
      field: 'serialNumber', 
      headerName: 'Serial Number', 
      width: 150 
    },
    {
      field: 'equipmentType',
      headerName: 'Equipment Type',
      width: 180,
      valueGetter: (value, row) => row.equipmentType?.name || 'N/A'
    },
    {
      field: 'base',
      headerName: 'Base',
      width: 150,
      valueGetter: (value, row) => row.base?.name || 'N/A'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'condition',
      headerName: 'Condition',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getConditionColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 130,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : '';
      }
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 130,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : '';
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          disabled={!hasAnyRole(['admin', 'logistics_officer'])}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row._id)}
          disabled={!hasAnyRole('admin')}
        />,
      ],
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Asset Management
        </Typography>
        {hasAnyRole(['admin', 'logistics_officer']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(45deg, #1a237e 30%, #534bae 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #000051 30%, #1a237e 90%)',
              },
            }}
          >
            Add Asset
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={assets}
        columns={columns}
        getRowId={(row) => row._id}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        checkboxSelection
        disableRowSelectionOnClick
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
        }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Serial Number"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Equipment Type</InputLabel>
                  <Select
                    value={formData.equipmentType}
                    onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                    label="Equipment Type"
                  >
                    {equipmentTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name} ({type.category})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Base</InputLabel>
                  <Select
                    value={formData.base}
                    onChange={(e) => setFormData({ ...formData, base: e.target.value })}
                    label="Base"
                  >
                    {bases.map((base) => (
                      <MenuItem key={base._id} value={base._id}>
                        {base.name} ({base.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="expended">Expended</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    label="Condition"
                  >
                    <MenuItem value="excellent">Excellent</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Metadata (JSON format)"
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder='{"key": "value", "notes": "Additional information"}'
                  helperText="Enter metadata in JSON format or as plain text"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Assets;
