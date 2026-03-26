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

// function App() {
//   return (
//         <AuthProvider>
//             <BrowserRouter>
//                 <div className="admin-container">
//                     <aside className="sidebar">
//                         <h2>Admin Panel</h2>
//                         <nav>
//                             <Link to="/">Dashboard</Link>
//                             <Link to="/courses">Courses</Link>
//                             <Link to="/trainers">Trainers</Link>
//                             <Link to="/students">Students</Link>
//                             <Link to="/registered">Registered</Link>
//                         </nav>
//                     </aside>
//                     <main className="main-content">
//                         <Routes>
//                             <Route path="/" element={<AdminDashboard />} />
//                             <Route path="/courses" element={<CoursesAdmin />} />
//                             <Route path="/trainers" element={<TrainersAdmin />} />
//                             <Route path="/students" element={<StudentsAdmin />} />
//                             <Route path="/registered" element={<RegisteredAdmin />} />
//                         </Routes>
//                     </main>
//                 </div>
//             </BrowserRouter>
//         </AuthProvider>
//   );
// }

// export default App;
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            
                            <AdminDashboard/>
                        </>
                    </ProtectedRoute>
                } />
                <Route path="/courses" element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <CoursesAdmin />
                        </>
                    </ProtectedRoute>
                } />
                <Route path="/trainers" element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <TrainersAdmin />
                        </>
                    </ProtectedRoute>
                } />
                <Route path="/students" element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <StudentsAdmin />
                        </>
                    </ProtectedRoute>
                } />
                <Route path="/registered" element={
                    <ProtectedRoute>
                        <>
                            <Navbar />
                            <RegisteredAdmin />
                        </>
                    </ProtectedRoute>
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