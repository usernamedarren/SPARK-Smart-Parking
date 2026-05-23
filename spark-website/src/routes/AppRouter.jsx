import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
// Jika Reset Password juga tidak dipakai lagi, kamu bisa menghapus baris di bawah ini nanti
import ResetPassword from '../pages/auth/ResetPassword'; 

// Main Pages
import Home from '../pages/dashboard/Home';
import Map from '../pages/map/Map';
import Prediction from '../pages/prediction/Prediction';
import View from '../pages/view/View';
import Profile from '../pages/profile/Profile';

// --- SISTEM SATPAM (PROTECTED ROUTE) ---
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isLoggedIn');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Rute Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} /> 
        </Route>

        {/* Rute Aplikasi Utama */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/view" element={<View />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}