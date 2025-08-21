import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EntityList from './pages/EntityList.jsx';
import EntityCreate from './pages/EntityCreate.jsx';

// Application routing configuration
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<EntityList />} />
        <Route path="/create" element={<EntityCreate />} />
      </Routes>
    </BrowserRouter>
  );
}
