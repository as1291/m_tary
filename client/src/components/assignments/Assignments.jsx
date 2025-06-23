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
  Assignment as AssignIcon,
  AssignmentReturn as ReturnIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    asset: '',
    assignedTo: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    actualReturnDate: '',
    status: 'active',
    notes: '',
  });

  const { hasAnyRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [assignmentsRes, assetsRes] = await Promise.all([
        axios.get('/assignments'),
        axios.get('/assets')
      ]);
      
      setAssignments(assignmentsRes.data);
      setAssets(assetsRes.data);
      
      console.log("Assignments fetched:", assignmentsRes.data);
    } catch (error) {
      setError('Failed to load data');
      console.error('Assignments error:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAssignment(null);
    setFormData({
      asset: '',
      assignedTo: '',
      assignmentDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
      actualReturnDate: '',
      status: 'active',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      asset: assignment.asset?._id || '',
      assignedTo: assignment.assignedTo || '',
      assignmentDate: assignment.assignmentDate ? new Date(assignment.assignmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedReturnDate: assignment.expectedReturnDate ? new Date(assignment.expectedReturnDate).toISOString().split('T')[0] : '',
      actualReturnDate: assignment.actualReturnDate ? new Date(assignment.actualReturnDate).toISOString().split('T')[0] : '',
      status: assignment.status || 'active',
      notes: assignment.notes || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/assignments/${id}`);
        fetchData();
      } catch (error) {
        setError('Failed to delete assignment');
      }
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.patch(`/assignments/${id}`, {
        status: 'returned',
        actualReturnDate: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      setError('Failed to mark assignment as returned');
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData };
      
      // Remove empty date fields
      if (!submitData.expectedReturnDate) delete submitData.expectedReturnDate;
      if (!submitData.actualReturnDate) delete submitData.actualReturnDate;

      if (editingAssignment) {
        await axios.patch(`/assignments/${editingAssignment._id}`, submitData);
      } else {
        await axios.post('/assignments', submitData);
      }

      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'returned': return 'info';
      case 'lost': return 'error';
      case 'damaged': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      field: 'asset',
      headerName: 'Asset',
      width: 200,
      valueGetter: (value, row) => {
        if (row.asset?.serialNumber) {
          return `${row.asset.serialNumber} (${row.asset.equipmentType?.name || 'N/A'})`;
        }
        return row.asset?.name || 'N/A';
      }
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150
    },
    {
      field: 'assignmentDate',
      headerName: 'Assignment Date',
      width: 130,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : '';
      }
    },
    {
      field: 'expectedReturnDate',
      headerName: 'Expected Return',
      width: 130,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : 'N/A';
      }
    },
    {
      field: 'actualReturnDate',
      headerName: 'Actual Return',
      width: 130,
      valueFormatter: (value) => {
        return value ? new Date(value).toLocaleDateString() : 'N/A';
      }
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
      field: 'assignedBy',
      headerName: 'Assigned By',
      width: 130,
      valueGetter: (value, row) => row.assignedBy?.username || 'N/A'
    },
    {
      field: 'base',
      headerName: 'Base',
      width: 120,
      valueGetter: (value, row) => row.base?.name || 'N/A'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
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

        // Return action for active assignments
        if (params.row.status === 'active' && hasAnyRole(['admin', 'logistics_officer'])) {
          actions.push(
            <GridActionsCellItem
              icon={<ReturnIcon />}
              label="Mark Returned"
              onClick={() => handleReturn(params.row._id)}
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
          Asset Assignments
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
            Create Assignment
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={assignments}
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
          {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
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
                        {asset.serialNumber ? 
                          `${asset.serialNumber} - ${asset.equipmentType?.name || 'Unknown'}` :
                          `${asset.name || 'Unnamed Asset'}`
                        }
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Assigned To"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  fullWidth
                  required
                  placeholder="Enter person's name or ID"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Assignment Date"
                  type="date"
                  value={formData.assignmentDate}
                  onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Expected Return Date"
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              {editingAssignment && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Actual Return Date"
                      type="date"
                      value={formData.actualReturnDate}
                      onChange={(e) => setFormData({ ...formData, actualReturnDate: e.target.value })}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="returned">Returned</MenuItem>
                        <MenuItem value="lost">Lost</MenuItem>
                        <MenuItem value="damaged">Damaged</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Additional notes about the assignment..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAssignment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Assignments;
