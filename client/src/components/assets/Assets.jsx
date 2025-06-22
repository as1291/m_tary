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
  IconButton,
  Tooltip,
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
    name: '',
    description: '',
    equipmentType: '',
    base: '',
    status: 'active',
    purchaseDate: '',
    purchasePrice: '',
  });
  const { hasAnyRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching assets data...');
      
      // Try to fetch assets first
      try {
        const assetsRes = await axios.get('/assets');
        console.log('Assets response:', assetsRes.data);
        setAssets(assetsRes.data);
      } catch (assetsError) {
        console.error('Assets fetch error:', assetsError);
        setError(`Failed to load assets: ${assetsError.message}`);
        setAssets([]);
      }

      // Try to fetch bases
      try {
        const basesRes = await axios.get('/bases');
        console.log('Bases response:', basesRes.data);
        setBases(basesRes.data);
      } catch (basesError) {
        console.error('Bases fetch error:', basesError);
        setBases([]);
      }

      // Try to fetch equipment types
      try {
        const equipmentTypesRes = await axios.get('/equipmentTypes');
        console.log('Equipment types response:', equipmentTypesRes.data);
        setEquipmentTypes(equipmentTypesRes.data);
      } catch (equipmentTypesError) {
        console.error('Equipment types fetch error:', equipmentTypesError);
        setEquipmentTypes([]);
      }

    } catch (error) {
      console.error('General fetch error:', error);
      setError('Failed to load data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAsset(null);
    setFormData({
      serialNumber: '',
      name: '',
      description: '',
      equipmentType: '',
      base: '',
      status: 'active',
      purchaseDate: '',
      purchasePrice: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      serialNumber: asset.serialNumber || '',
      name: asset.name || '',
      description: asset.description || '',
      equipmentType: asset.equipmentType?._id || '',
      base: asset.base?._id || '',
      status: asset.status || 'active',
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: asset.purchasePrice || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axios.delete(`/assets/${id}`);
        fetchData();
      } catch (error) {
        setError('Failed to delete asset');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingAsset) {
        await axios.patch(`/assets/${editingAsset._id}`, formData);
      } else {
        await axios.post('/assets', formData);
      }
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save asset');
    }
  };

  const columns = [
    { field: 'serialNumber', headerName: 'Serial Number', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 250 },
    { 
      field: 'equipmentType', 
      headerName: 'Equipment Type', 
      width: 150,
      valueGetter: ({ row }) => row?.equipmentType?.name ?? 'N/A'
      // valueGetter: (params) => (params.row.equipmentType && params.row.equipmentType.name) ? params.row.equipmentType.name : 'N/A'
    },
    { 
      field: 'base', 
      headerName: 'Base', 
      width: 150,
      valueGetter: ({ row }) => row?.base?.name ?? 'N/A'
      // valueGetter: (params) => (params.row.base && params.row.base.name) ? params.row.base.name : 'N/A'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === 'active' ? 'success.main' : 'error.main',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
          }}
        >
          {params.value}
        </Box>
      )
    },
    { 
      field: 'purchaseDate', 
      headerName: 'Purchase Date', 
      width: 130,
      valueGetter: ({ row }) => row?.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : 'N/A'
      // valueGetter: (params) => params.row.purchaseDate ? new Date(params.row.purchaseDate).toLocaleDateString() : 'N/A'
    },
    { 
      field: 'purchasePrice', 
      headerName: 'Purchase Price', 
      width: 130,
      valueGetter: ({ row }) => row?.purchasePrice ? `$${row.purchasePrice}` : 'N/A'
      // valueGetter: (params) => params.row.purchasePrice ? `$${params.row.purchasePrice}` : 'N/A'
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
          disabled={!hasAnyRole(['admin'])}
        />,
      ],
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={assets}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          components={{
            Toolbar: GridToolbar,
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
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              label="Serial Number"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Equipment Type</InputLabel>
              <Select
                value={formData.equipmentType}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                label="Equipment Type"
              >
                {equipmentTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Purchase Price"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              fullWidth
            />
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