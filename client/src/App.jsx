import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CreatePaste from './pages/CreatePaste';
import ViewPaste from './pages/ViewPaste';
import NotFound from './pages/NotFound';

const containerStyle = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: '2rem',
};

function App() {
  return (
    <Router>
      <Header />
      <main style={containerStyle}>
        <Routes>
          <Route path="/" element={<CreatePaste />} />
          <Route path="/p/:id" element={<ViewPaste />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
