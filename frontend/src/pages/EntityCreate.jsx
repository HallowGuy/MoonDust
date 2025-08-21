import React, { useState } from 'react';
import { Container, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Form page used to create a new entity
export default function EntityCreate() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error('Request failed');
      }
      navigate('/list');
    } catch {
      setError('Erreur lors de la création de l\'entité');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" variant="contained">
          Valider
        </Button>
      </Box>
    </Container>
  );
}
