import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import MainLayout from './layouts/MainLayout.js';
import LandingPage from './pages/LandingPage.js';
import Register from './pages/Register.js';
import DoctorStep1 from './pages/DoctorStep1.js';
import DoctorStep2 from './pages/DoctorStep2.js';
import DoctorStep3 from './pages/DoctorStep3.js';
import DoctorStep4 from './pages/DoctorStep4.js';
import EnrollmentSuccess from './pages/EnrollmentSuccess.js';
import Dashboard from './pages/Dashboard.js';
import CentroEnConstruccion from './pages/CentroEnConstruccion.js';
import { EnrollmentStatus } from './pages/EnrollmentStatus.js';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    return children;
};

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Public Routes with Main Header */}
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

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
            </Route>
            <Route path="*" element={<div className="text-center mt-10">404 - Not Found</div>} />
        </Routes>
    );
}

export default App;
