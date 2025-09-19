import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Input,
  Alert,
  Box,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import axios from 'axios';

const TestDataGenerator = () => {
  const [count, setCount] = useState(10);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Handle "Test" button click
  const handleTestClick = async (user: any) => {
    setLoadingStates(prev => ({ ...prev, [user.id]: true }));
    try {
      const response = await axios.post('/api/v1/verify-user', user);
      const updatedUser = response.data;

      // Replace the updated user in the table
      setUsers(prevUsers => prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    } catch (err) {
      console.error(`Error verifying user ${user.id}`, err);
      setError(`Failed to verify user ${user.fullName}.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [user.id]: false }));
    }
  };

  // Generate test users from backend
  const generateData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/v1/test-data?count=${count}`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error generating test data', err);
      setError('Failed to generate test data.');
    } finally {
      setLoading(false);
    }
  };

  // Download JSON
  const downloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(users, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'test-data.json';
    link.click();
  };

  // Small helper to colorize status
  const renderStatus = (status: string) => {
    let color: 'default' | 'success' | 'error' | 'warning' = 'default';
    if (status === 'VERIFIED') color = 'success';
    else if (status === 'REJECTED') color = 'error';
    else if (status === 'PENDING') color = 'warning';
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📊 Test Data Generator
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Input
          type="number"
          value={count}
          inputProps={{ min: 1, max: 100 }}
          onChange={e => setCount(parseInt(e.target.value, 10))}
          sx={{ width: 100 }}
        />
        <Button variant="contained" color="primary" onClick={generateData} disabled={loading}>
          {loading ? '⏳ Generating...' : 'Generate'}
        </Button>

        {users.length > 0 && (
          <Button variant="contained" color="secondary" onClick={downloadJson}>
            💾 Download JSON
          </Button>
        )}
      </Box>

      {users.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>ID Number</TableCell>
                <TableCell>KYC Status</TableCell>
                <TableCell>Document</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.dateOfBirth}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.idNumber}</TableCell>
                  <TableCell>{renderStatus(user.kycStatus)}</TableCell>
                  <TableCell>
                    {user.documentImageBase64 ? (
                      <a href={`data:image/png;base64,${user.documentImageBase64}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`data:image/png;base64,${user.documentImageBase64}`}
                          alt="Document"
                          style={{
                            width: '100px',
                            height: '70px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                          }}
                        />
                      </a>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No document
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleTestClick(user)}
                      disabled={loadingStates[user.id]}
                    >
                      {loadingStates[user.id] ? 'Testing...' : 'Test'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        !loading && <Typography>No test data generated yet.</Typography>
      )}
    </Box>
  );
};

export default TestDataGenerator;
