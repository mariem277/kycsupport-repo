import React, { useState } from 'react';
import { Button, Table, Input, Alert } from 'reactstrap';
import axios from 'axios';

const TestDataGenerator = () => {
  const [count, setCount] = useState(10);
  const [users, setUsers] = useState([]);
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
      setError('Impossible de générer les données de test.');
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

  const renderDocument = user => {
    if (!user.documentImageBase64) {
      return <span style={{ color: 'gray' }}>Aucun document</span>;
    }
    return (
      <a href={`data:image/png;base64,${user.documentImageBase64}`} target="_blank" rel="noopener noreferrer" title="Voir le document">
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
          onError={e => {
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null; // évite une boucle infinie
            img.replaceWith(document.createTextNode('Document non valide'));
          }}
        />
      </a>
    );
  };

  return (
    <div>
      <h2>📊 Test Data Generator</h2>

      {error && <Alert color="danger">{error}</Alert>}

      <div className="d-flex align-items-center mb-3">
        <Input
          type="number"
          value={count}
          min="1"
          max="100"
          onChange={e => setCount(parseInt(e.target.value, 10))}
          style={{ width: '100px', marginRight: '10px' }}
        />
        <Button color="primary" onClick={generateData} disabled={loading}>
          {loading ? '⏳ Génération...' : 'Generate'}
        </Button>
        {users.length > 0 && (
          <Button color="secondary" onClick={downloadJson} className="ms-2">
            💾 Download Json
          </Button>
        )}
      </div>

      {users.length > 0 ? (
        <Table striped responsive>
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
                <td>{renderDocument(user)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        !loading && <p>Aucune donnée générée pour le moment.</p>
      )}
    </div>
  );
};

export default TestDataGenerator;
