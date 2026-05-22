import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import GuestDashboard from "./pages/GuestDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RoomsPage      from "./pages/RoomsPage";
import BookingPage    from "./pages/BookingPage";
import MyBookings     from "./pages/MyBookings";
import Layout         from "./components/Layout";
import "./App.css";

function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Root() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin")  return <Navigate to="/admin"     replace />;
  if (user.role === "staff")  return <Navigate to="/staff"     replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<Root />} />

      <Route path="/dashboard" element={<Guard roles={["guest"]}><Layout><GuestDashboard /></Layout></Guard>} />
      <Route path="/rooms"     element={<Guard><Layout><RoomsPage /></Layout></Guard>} />
      <Route path="/book/:roomId" element={<Guard roles={["guest"]}><Layout><BookingPage /></Layout></Guard>} />
      <Route path="/my-bookings"  element={<Guard roles={["guest"]}><Layout><MyBookings /></Layout></Guard>} />
      <Route path="/staff"    element={<Guard roles={["staff","admin"]}><Layout><StaffDashboard /></Layout></Guard>} />
      <Route path="/admin"    element={<Guard roles={["admin"]}><Layout><AdminDashboard /></Layout></Guard>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
