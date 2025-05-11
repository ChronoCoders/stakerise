import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Web3Provider } from './contexts/Web3Context';

function App() {
  return (
    <Web3Provider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user/*" element={<UserDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Web3Provider>
  );
}

export default App;