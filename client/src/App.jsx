import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Assets from './components/assets/Assets';
import Bases from './components/bases/Bases';
import EquipmentTypes from './components/equipment/EquipmentTypes';
import Purchases from './components/purchases/Purchases';
import Transfers from './components/transfers/Transfers';
import Assignments from './components/assignments/Assignments';
import Expenditures from './components/expenditures/Expenditures';
import AuditLogs from './components/audit/AuditLogs';
import Layout from './components/layout/Layout';

// Military theme with dark colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e', // Dark blue
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#d32f2f', // Red
      light: '#ff6659',
      dark: '#9a0007',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a237e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="bases" element={<Bases />} />
              <Route path="equipment-types" element={<EquipmentTypes />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="transfers" element={<Transfers />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="expenditures" element={<Expenditures />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
