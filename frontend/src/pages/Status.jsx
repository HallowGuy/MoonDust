import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography, List, ListItem, Badge } from '@mui/material';

export default function Status() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">Database</Typography>
          <Badge
            color={data.database.status === 'ok' ? 'success' : 'error'}
            badgeContent={data.database.status}
            sx={{ ml: 2 }}
          >
            <span />
          </Badge>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h5">Backend</Typography>
          <Badge
            color={data.backend.status === 'ok' ? 'success' : 'error'}
            badgeContent={data.backend.status}
            sx={{ ml: 2 }}
          >
            <span />
          </Badge>
          <List>
            {Object.entries(data.backend.endpoints).map(([ep, status]) => (
              <ListItem key={ep}>
                <Typography>{`${ep}: ${status}`}</Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
