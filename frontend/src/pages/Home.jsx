import React from 'react';
import { AppBar, Toolbar, Typography, Container, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';

// Home page displaying a simple dashboard entry point
export default function Home() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            MoonDust Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Button variant="contained" component={Link} to="/list">
              Voir les entités
            </Button>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
