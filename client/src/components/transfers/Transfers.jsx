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
  CheckCircle as ApproveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [formData, setFormData] = useState({
    fromBase: '',
    toBase: '',
    equipmentType: '',
    quantity: '',
    transferDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
  });

  const { hasAnyRole, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [transfersRes, basesRes, equipmentTypesRes] = await Promise.all([
        axios.get('/transfers'),
        axios.get('/bases'),
        axios.get('/equipmentTypes')
      ]);
      
      setTransfers(transfersRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(equipmentTypesRes.data);
      
    } catch (error) {
      setError('Failed to load data');
      console.error('Transfers error:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTransfer(null);
    setFormData({
      fromBase: '',
      toBase: '',
      equipmentType: '',
      quantity: '',
      transferDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (transfer) => {
    setEditingTransfer(transfer);
    setFormData({
      fromBase: transfer.fromBase?._id || '',
      toBase: transfer.toBase?._id || '',
      equipmentType: transfer.equipmentType?._id || '',
      quantity: transfer.quantity || '',
      transferDate: transfer.transferDate ? new Date(transfer.transferDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: transfer.status || 'pending',
      notes: transfer.notes || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await axios.delete(`/transfers/${id}`);
        fetchData();
      } catch (error) {
        setError('Failed to delete transfer');
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'completed' && hasAnyRole(['admin', 'logistics_officer'])) {
        updateData.approvedBy = user.uid;
      }
      
      await axios.patch(`/transfers/${id}`, updateData);
      fetchData();
    } catch (error) {
      setError('Failed to update transfer status');
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      // Validate that fromBase and toBase are different
      if (submitData.fromBase === submitData.toBase) {
        setError('From Base and To Base must be different');
        return;
      }

      if (editingTransfer) {
        await axios.patch(`/transfers/${editingTransfer._id}`, submitData);
      } else {
        await axios.post('/transfers', submitData);
      }

      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save transfer');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_transit': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      field: 'transferDate',
      headerName: 'Transfer Date',
      width: 120,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : '';
      }
    },
    {
      field: 'fromBase',
      headerName: 'From Base',
      width: 150,
      valueGetter: (value, row) => row.fromBase?.name || 'N/A'
    },
    {
      field: 'toBase',
      headerName: 'To Base',
      width: 150,
      valueGetter: (value, row) => row.toBase?.name || 'N/A'
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
      field: 'initiatedBy',
      headerName: 'Initiated By',
      width: 130,
      valueGetter: (value, row) => row.initiatedBy?.username || 'N/A'
    },
    {
      field: 'approvedBy',
      headerName: 'Approved By',
      width: 130,
      valueGetter: (value, row) => row.approvedBy?.username || 'N/A'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      getActions: (params) => {
        const actions = [];
        
        // Edit action for admin and logistics_officer
        if (hasAnyRole(['admin', 'logistics_officer'])) {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => handleEdit(params.row)}
            />
          );
        }

        // Status update actions based on current status
        if (params.row.status === 'pending' && hasAnyRole(['admin', 'logistics_officer'])) {
          actions.push(
            <GridActionsCellItem
              icon={<ApproveIcon />}
              label="Mark In Transit"
              onClick={() => handleStatusUpdate(params.row._id, 'in_transit')}
            />
          );
        }

        if (params.row.status === 'in_transit' && hasAnyRole(['admin', 'logistics_officer'])) {
          actions.push(
            <GridActionsCellItem
              icon={<ApproveIcon />}
              label="Complete"
              onClick={() => handleStatusUpdate(params.row._id, 'completed')}
            />
          );
        }

        if (['pending', 'in_transit'].includes(params.row.status) && hasAnyRole(['admin', 'logistics_officer'])) {
          actions.push(
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={() => handleStatusUpdate(params.row._id, 'cancelled')}
            />
          );
        }

        // Delete action for admin only
        if (hasAnyRole('admin')) {
          actions.push(
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDelete(params.row._id)}
            />
          );
        }

        return actions;
      },
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
          Asset Transfers
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
            Create Transfer
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={transfers}
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
          {editingTransfer ? 'Edit Transfer' : 'Create New Transfer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>From Base</InputLabel>
                  <Select
                    value={formData.fromBase}
                    onChange={(e) => setFormData({ ...formData, fromBase: e.target.value })}
                    label="From Base"
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
                  <InputLabel>To Base</InputLabel>
                  <Select
                    value={formData.toBase}
                    onChange={(e) => setFormData({ ...formData, toBase: e.target.value })}
                    label="To Base"
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
                  label="Transfer Date"
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              {editingTransfer && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_transit">In Transit</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Additional notes about the transfer..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTransfer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Transfers;
