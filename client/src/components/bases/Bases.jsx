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

function Bases() {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBase, setEditingBase] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    commander: '',
  });

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Only fetch bases - remove the users fetch completely
      const basesRes = await axios.get('/bases');
      setBases(basesRes.data);
      
    } catch (error) {
      setError('Failed to load bases');
      console.error('Bases error:', error);
      setBases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBase(null);
    setFormData({
      name: '',
      code: '',
      location: '',
      commander: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (base) => {
    setEditingBase(base);
    setFormData({
      name: base.name || '',
      code: base.code || '',
      location: base.location || '',
      commander: base.commander || '', // Just use the commander string directly
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this base?')) {
      try {
        await axios.delete(`/bases/${id}`);
        fetchData();
      } catch (error) {
        setError('Failed to delete base');
      }
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     const submitData = { ...formData };

  //     if (editingBase) {
  //       await axios.patch(`/bases/${editingBase._id}`, submitData);
  //     } else {
  //       await axios.post('/bases', submitData);
  //     }

  //     setOpenDialog(false);
  //     fetchData();
  //   } catch (error) {
  //     setError(error.response?.data?.message || 'Failed to save base');
  //   }
  // };

  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  const handleSubmit = async () => {
    try {
      const submitData = { ...formData };
      
      // Only include commander if it's a valid ObjectId or remove it entirely
      if (submitData.commander) {
        if (!isValidObjectId(submitData.commander)) {
          delete submitData.commander; // Remove invalid ObjectId
        }
      } else {
        delete submitData.commander; // Remove empty commander
      }
  
      if (editingBase) {
        await axios.patch(`/bases/${editingBase._id}`, submitData);
      } else {
        await axios.post('/bases', submitData);
      }
  
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || 'Failed to save base');
    }
  };
  
  

  const columns = [
    { field: 'name', headerName: 'Base Name', width: 200 },
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'location', headerName: 'Location', width: 250 },
    {
      field: 'commander',
      headerName: 'Commander',
      width: 200,
      valueGetter: (value, row) => {
        // Correct way: return the specific field value or fallback
        return row.commander || 'Unassigned';
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
          disabled={!hasRole('admin')}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row._id)}
          disabled={!hasRole('admin')}
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
          Base Management
        </Typography>
        {hasRole('admin') && (
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
            Add Base
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={bases}
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBase ? 'Edit Base' : 'Add New Base'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Base Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="Commander"
              value={formData.commander}
              onChange={(e) => setFormData({ ...formData, commander: e.target.value })}
              fullWidth
              placeholder="Enter commander name"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBase ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Bases;
