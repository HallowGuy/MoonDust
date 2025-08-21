import React, { useEffect, useState } from 'react';
import { Container, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';

// Display entities using MUI's DataGrid component
export default function EntityList() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch('/api/entity')
      .then((res) => res.json())
      .then(setRows)
      .catch(() => {});
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nom', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Créé le',
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Button variant="contained" component={Link} to="/create" sx={{ mb: 2 }}>
        Créer une entité
      </Button>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10]} />
      </div>
    </Container>
  );
}
