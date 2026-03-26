import React from 'react';
import { BrowserRouter, Routes, Route ,useNavigate } from 'react-router-dom';

import AdminDashboard from './Components/AdminDashboard';
import CoursesAdmin from './Components/CoursesAdmin';
import TrainersAdmin from './Components/TrainersAdmin';
import StudentsAdmin from './Components/StudentsAdmin';
import RegisteredAdmin from './Components/RegisteredAdmin';
import AdminLogin from './Pages/AdminLogin';
import Navbar from './Components/Navbar';
import './admin.css';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/" element={
                    // <ProtectedRoute>
                        <>
                            <Navbar />
                            
                            <AdminDashboard/>
                        </>
                    // </ProtectedRoute>
                } />
                <Route path="/courses" element={
                    // <ProtectedRoute>
                        <>
                            <Navbar />
                            <CoursesAdmin />
                        </>
                    // </ProtectedRoute>
                } />
                <Route path="/trainers" element={
                    // <ProtectedRoute>
                        <>
                            <Navbar />
                            <TrainersAdmin />
                        </>
                    // </ProtectedRoute>
                } />
                <Route path="/students" element={
                    // <ProtectedRoute>
                        <>
                            <Navbar />
                            <StudentsAdmin />
                        </>
                    // </ProtectedRoute>
                } />
                <Route path="/registered" element={
                    // <ProtectedRoute>
                        <>
                            <Navbar />
                            <RegisteredAdmin />
                        </>
                    // </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}
function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login');
        return null;
    }
    
    return children;
}

export default App;