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

function Expenditures() {
  const [expenditures, setExpenditures] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpenditure, setEditingExpenditure] = useState(null);
  const [formData, setFormData] = useState({
    asset: '',
    base: '',
    equipmentType: '',
    quantity: '',
    expenditureDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  const { hasRole, hasAnyRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expendituresRes, assetsRes, basesRes, equipmentTypesRes] = await Promise.all([
        axios.get('/expenditures'),
        axios.get('/assets'),
        axios.get('/bases'),
        axios.get('/equipmentTypes')
      ]);
      
      setExpenditures(expendituresRes.data);
      setAssets(assetsRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(equipmentTypesRes.data);
      
    } catch (error) {
      setError('Failed to load data');
      console.error('Expenditures error:', error);
      setExpenditures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingExpenditure(null);
    setFormData({
      asset: '',
      base: '',
      equipmentType: '',
      quantity: '',
      expenditureDate: new Date().toISOString().split('T')[0],
      reason: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (expenditure) => {
    setEditingExpenditure(expenditure);
    setFormData({
      asset: expenditure.asset?._id || '',
      base: expenditure.base?._id || '',
      equipmentType: expenditure.equipmentType?._id || '',
      quantity: expenditure.quantity || '',
      expenditureDate: expenditure.expenditureDate ? new Date(expenditure.expenditureDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reason: expenditure.reason || '',
      notes: expenditure.notes || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expenditure?')) {
      try {
        await axios.delete(`/expenditures/${id}`);
        fetchData();
      } catch (error) {
        setError('Failed to delete expenditure');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      // Validate required fields
      if (!submitData.asset || !submitData.base || !submitData.equipmentType || 
          !submitData.quantity || !submitData.expenditureDate || !submitData.reason) {
        setError('Please fill in all required fields');
        return;
      }

      if (editingExpenditure) {
        await axios.patch(`/expenditures/${editingExpenditure._id}`, submitData);
      } else {
        await axios.post('/expenditures', submitData);
      }

      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save expenditure');
    }
  };

  const getReasonColor = (reason) => {
    switch (reason.toLowerCase()) {
      case 'maintenance': return 'warning';
      case 'training': return 'info';
      case 'operation': return 'success';
      case 'damage': return 'error';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      field: 'expenditureDate',
      headerName: 'Date',
      width: 120,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : '';
      }
    },
    {
      field: 'asset',
      headerName: 'Asset',
      width: 150,
      valueGetter: (value, row) => row.asset?.serialNumber || 'N/A'
    },
    {
      field: 'base',
      headerName: 'Base',
      width: 130,
      valueGetter: (value, row) => row.base?.name || 'N/A'
    },
    {
      field: 'equipmentType',
      headerName: 'Equipment Type',
      width: 180,
      valueGetter: (value, row) => row.equipmentType?.name || 'N/A'
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100,
      type: 'number'
    },
    {
      field: 'reason',
      headerName: 'Reason',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getReasonColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'authorizedBy',
      headerName: 'Authorized By',
      width: 150,
      valueGetter: (value, row) => row.authorizedBy?.username || 'N/A'
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
          Expenditure Management
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
            Add Expenditure
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={expenditures}
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
          {editingExpenditure ? 'Edit Expenditure' : 'Add New Expenditure'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Asset</InputLabel>
                  <Select
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    label="Asset"
                  >
                    {assets.map((asset) => (
                      <MenuItem key={asset._id} value={asset._id}>
                        {asset.serialNumber} - {asset.equipmentType?.name || 'Unknown'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
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
                <FormControl fullWidth required>
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
                <TextField
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Expenditure Date"
                  type="date"
                  value={formData.expenditureDate}
                  onChange={(e) => setFormData({ ...formData, expenditureDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Reason</InputLabel>
                  <Select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    label="Reason"
                  >
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="training">Training</MenuItem>
                    <MenuItem value="operation">Operation</MenuItem>
                    <MenuItem value="damage">Damage</MenuItem>
                    <MenuItem value="lost">Lost</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Additional notes about the expenditure..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingExpenditure ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Expenditures;
