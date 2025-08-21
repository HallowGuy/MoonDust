import React, { useState } from 'react';
import { Container, TextField, Button, Box } from '@mui/material';

export default function CreateEntity() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      const res = await fetch('/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error('Request failed');
      }
      setName('');
    } catch (err) {
      setError('Error creating entity');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error}
        />
        <Button type="submit" variant="contained">Create</Button>
      </Box>
    </Container>
  );
}
