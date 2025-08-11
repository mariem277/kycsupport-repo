import React, { useState } from 'react';
import { Button, Table, Input } from 'reactstrap';
import axios from 'axios';

const TestDataGenerator = () => {
  const [count, setCount] = useState(10);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/test-data?count=${count}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error generating test data', error);
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
    <div>
      <h2>Générateur de Données de Test</h2>
      <div className="d-flex align-items-center mb-3">
        <Input
          type="number"
          value={count}
          onChange={e => setCount(parseInt(e.target.value, 10))}
          style={{ width: '100px', marginRight: '10px' }}
        />
        <Button color="primary" onClick={generateData} disabled={loading}>
          {loading ? 'Génération...' : 'Générer'}
        </Button>
        {users.length > 0 && (
          <Button color="secondary" onClick={downloadJson} className="ms-2">
            Télécharger JSON
          </Button>
        )}
      </div>

      {users.length > 0 && (
        <Table striped>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom Complet</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Statut KYC</th>
              <th>Document</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.address}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.kycStatus}</td>
                <td>
                  <a href={`data:image/png;base64,${user.documentImageBase64}`} target="_blank" rel="noopener noreferrer">
                    Voir
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default TestDataGenerator;
