import React, { useEffect, useState } from 'react';
import { Container, List, ListItem, Card, CardContent, Typography } from '@mui/material';

export default function EntityList() {
  const [entities, setEntities] = useState([]);

  useEffect(() => {
    fetch('/api/entity')
      .then((res) => res.json())
      .then(setEntities)
      .catch(() => {});
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <List>
        {entities.map((e) => (
          <ListItem key={e.id}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6">{e.name}</Typography>
                <Typography color="text.secondary">
                  {new Date(e.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
