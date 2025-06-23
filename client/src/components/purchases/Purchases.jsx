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

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [formData, setFormData] = useState({
    base: '',
    equipmentType: '',
    quantity: '',
    unitCost: '',
    totalCost: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseOrderNumber: '',
    notes: '',
  });

  const { hasAnyRole } = useAuth();

  console.log("User roles:", /* your roles variable here */);
  console.log("Can add purchase:", hasAnyRole(['admin', 'logistics_officer']));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [purchasesRes, basesRes, equipmentTypesRes] = await Promise.all([
        axios.get('/purchases'),
        axios.get('/bases'),
        axios.get('/equipmentTypes')
      ]);
      
      setPurchases(purchasesRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(equipmentTypesRes.data);
      
    } catch (error) {
      setError('Failed to load data');
      console.error('Purchases error:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPurchase(null);
    setFormData({
      base: '',
      equipmentType: '',
      quantity: '',
      unitCost: '',
      totalCost: '',
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseOrderNumber: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      base: purchase.base?._id || '',
      equipmentType: purchase.equipmentType?._id || '',
      quantity: purchase.quantity || '',
      unitCost: purchase.unitCost || '',
      totalCost: purchase.totalCost || '',
      supplier: purchase.supplier || '',
      purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      purchaseOrderNumber: purchase.purchaseOrderNumber || '',
      notes: purchase.notes || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await axios.delete(`/purchases/${id}`);
        fetchData();
      } catch (error) {
        setError('Failed to delete purchase');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
        totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
      };

      // Calculate totalCost if unitCost and quantity are provided but totalCost is not
      if (submitData.unitCost && submitData.quantity && !submitData.totalCost) {
        submitData.totalCost = submitData.unitCost * submitData.quantity;
      }

      if (editingPurchase) {
        await axios.patch(`/purchases/${editingPurchase._id}`, submitData);
      } else {
        await axios.post('/purchases', submitData);
      }

      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save purchase');
    }
  };

  const formatCurrency = (value) => {
    return value ? `$${value.toLocaleString()}` : '';
  };

  const columns = [
    {
      field: 'purchaseDate',
      headerName: 'Purchase Date',
      width: 120,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : '';
      }
    },
    {
      field: 'base',
      headerName: 'Base',
      width: 150,
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
      field: 'unitCost',
      headerName: 'Unit Cost',
      width: 120,
      valueFormatter: (value) => formatCurrency(value)
    },
    {
      field: 'totalCost',
      headerName: 'Total Cost',
      width: 120,
      valueFormatter: (value) => formatCurrency(value)
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      width: 150
    },
    {
      field: 'purchaseOrderNumber',
      headerName: 'PO Number',
      width: 130
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
          Purchase Management
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
            Add Purchase
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={purchases}
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
          {editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <TextField
                  label="Unit Cost"
                  type="number"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Total Cost"
                  type="number"
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Purchase Date"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Purchase Order Number"
                  value={formData.purchaseOrderNumber}
                  onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPurchase ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Purchases;
