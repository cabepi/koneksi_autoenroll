import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from './hooks/useAuth.js';
import MainLayout from './layouts/MainLayout.js';
import LandingPage from './pages/LandingPage.js';
import Register from './pages/Register.js';
import DoctorStep1 from './pages/DoctorStep1.js';
import DoctorStep2 from './pages/DoctorStep2.js';
import DoctorStep3 from './pages/DoctorStep3.js';
import DoctorStep4 from './pages/DoctorStep4.js';
import EnrollmentSuccess from './pages/EnrollmentSuccess.js';
import Dashboard from './pages/backoffice_pages/Dashboard.js';
import BackofficeEnrollmentStatus from './pages/backoffice_pages/BackofficeEnrollmentStatus.js';
import CentroEnConstruccion from './pages/CentroEnConstruccion.js';
import { EnrollmentStatus } from './pages/EnrollmentStatus.js';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* Public Routes with Main Header */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/doctor-step-1" element={<DoctorStep1 />} />
                <Route path="/register/doctor-step-2" element={<DoctorStep2 />} />
                <Route path="/register/doctor-step-3" element={<DoctorStep3 />} />
                <Route path="/register/doctor-step-4" element={<DoctorStep4 />} />
                <Route path="/register/enrollment-success" element={<EnrollmentSuccess />} />
                <Route path="/register/centro-construccion" element={<CentroEnConstruccion />} />

                {/* Tracking Route */}
                <Route path="/doctor-enrollment-status/:id" element={<EnrollmentStatus />} />
            </Route>

            {/* Protected Routes (No MainLayout wrapper, so no public Header) */}
            <Route path="/backoffice/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/backoffice/enrollment-status/:id" element={
                <ProtectedRoute>
                    <BackofficeEnrollmentStatus />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
