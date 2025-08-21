import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import CreateEntity from './pages/CreateEntity.jsx';
import EntityList from './pages/EntityList.jsx';

export default function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MoonDust
          </Typography>
          <Button color="inherit" component={Link} to="/create">Create</Button>
          <Button color="inherit" component={Link} to="/list">List</Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<CreateEntity />} />
        <Route path="/create" element={<CreateEntity />} />
        <Route path="/list" element={<EntityList />} />
      </Routes>
    </Router>
  );
}
