import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Tickets } from './pages/Tickets';
import { TicketDetalle } from './pages/TicketDetalle';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navbar />
                <Routes>
                  <Route path="/tickets" element={<Tickets />} />
                  <Route path="/tickets/:id" element={<TicketDetalle />} />
                  <Route path="/dashboard" element={<ProtectedRoute requiredRole={['admin']}><Dashboard /></ProtectedRoute>} />
                  <Route path="/usuarios" element={<ProtectedRoute requiredRole={['admin']}><Usuarios /></ProtectedRoute>} />
                  <Route path="/" element={<Navigate to="/tickets" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
