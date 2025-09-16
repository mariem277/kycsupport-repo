import React, { useState } from 'react';
import { Table, Input, Alert, Box } from '@mui/material';
import Button from '@mui/material/Button';
import axios from 'axios';

const TestDataGenerator = () => {
  const [count, setCount] = useState(10);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const downloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(users, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'test-data.json';
    link.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <h2>📊 Test Data Generator</h2>

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
          <Button variant="contained" color="primary" onClick={downloadJson}>
            💾 Download JSON
          </Button>
        )}
      </Box>

      {/* Table rendering here */}
      {users.length > 0 ? (
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Date of Birth</th>
              <th>Email</th>
              <th>Phone</th>
              <th>ID Number</th>
              <th>KYC Status</th>
              <th>Document</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.dateOfBirth}</td>
                <td>{user.address}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.idNumber}</td>
                <td>{user.kycStatus}</td>
                <td>
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
                    <span style={{ color: 'gray' }}>No document</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        !loading && <p>No test data generated yet.</p>
      )}
    </Box>
  );
};

export default TestDataGenerator;
