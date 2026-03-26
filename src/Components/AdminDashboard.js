import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./AdminDashboard.css"

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

function AdminDashboard() {
    const [stats, setStats] = useState({
        courses: 0,
        trainers: 0,
        students: 0,
        registered: 0,
        pendingRegistrations: 0
    });
    const [pendingStudents, setPendingStudents] = useState([]);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const coursesRes = await api.get('/course/getall');
            const coursesCount = Array.isArray(coursesRes.data) ? coursesRes.data.length : 0;

            const trainersRes = await api.get('/trainers/getAll');
            const trainersCount = Array.isArray(trainersRes.data) ? trainersRes.data.length : 0;

            const studentsRes = await api.get('/student/getall');
            const studentsCount = Array.isArray(studentsRes.data) ? studentsRes.data.length : 0;

            const registeredRes = await api.get('/registered');
            const registeredData = registeredRes.data || [];
            const studentsData = studentsRes.data || [];
            
            // Calculate pending registrations
            const pending = registeredData.filter(reg => {
                return !studentsData.some(student => 
                    student.email && reg.email && 
                    student.email.toLowerCase() === reg.email.toLowerCase()
                );
            });

            setStats({
                courses: coursesCount,
                trainers: trainersCount,
                students: studentsCount,
                registered: registeredData.length,
                pendingRegistrations: pending.length
            });
            
            setPendingStudents(pending);
            setLoading(false);
        } catch (err) {
            console.error('Error loading stats:', err);
            setError(`Failed to load statistics. Status: ${err.response?.status}`);
            setLoading(false);
        }
    };

    const goToCourses = () => navigate('/courses');
    const goToTrainers = () => navigate('/trainers');
    const goToStudents = () => navigate('/students');
    const goToRegistered = () => navigate('/registered');
    
    const showPending = () => {
        setShowPendingModal(true);
    };

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading statistics...</div>;
    if (error) return <div style={{color: 'red', textAlign: 'center', padding: '50px'}}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
            </div>
            
            <div className="stats-container">
                <div className="stat-card" onClick={goToCourses} style={{cursor: 'pointer'}}>
                    <h3>Total Courses</h3>
                    <div className="number">{stats.courses}</div>
                </div>

                <div className="stat-card" onClick={goToTrainers} style={{cursor: 'pointer'}}>
                    <h3>Total Trainers</h3>
                    <div className="number">{stats.trainers}</div>
                </div>

                <div className="stat-card" onClick={goToStudents} style={{cursor: 'pointer'}}>
                    <h3>Total Students</h3>
                    <div className="number">{stats.students}</div>
                </div>

               

                <div className="stat-card" onClick={goToRegistered} style={{cursor: 'pointer'}}>
                    <h3>Total Registrations</h3>
                    <div className="number">{stats.registered}</div>
                </div>
            </div>
             {/* Pending Registrations Card - Shows pending students */}
                <div className="stat-card" onClick={showPending} style={{
                    cursor: 'pointer', 
                    background: stats.pendingRegistrations > 0 ? '#fff3cd' : '#d4edda'
                }}>
                    <h3>Pending Registrations</h3>
                    <div className="number" style={{
                        color: stats.pendingRegistrations > 0 ? '#856404' : '#fafffb'
                    }}>
                        {stats.pendingRegistrations}
                    </div>
                </div>

            {/* Pending Registrations Modal */}
            {showPendingModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '80%',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h3>Pending Registrations</h3>
                            <button 
                                onClick={() => setShowPendingModal(false)}
                                style={{
                                    padding: '5px 15px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>

                        {pendingStudents.length === 0 ? (
                            <p style={{textAlign: 'center', padding: '20px'}}>No pending registrations!</p>
                        ) : (
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead>
                                    <tr style={{background: '#f5f5f5'}}>
                                        <th style={{padding: '10px', border: '1px solid #ddd'}}>ID</th>
                                        <th style={{padding: '10px', border: '1px solid #ddd'}}>Name</th>
                                        <th style={{padding: '10px', border: '1px solid #ddd'}}>Email</th>
                                        <th style={{padding: '10px', border: '1px solid #ddd'}}>Phone</th>
                                        <th style={{padding: '10px', border: '1px solid #ddd'}}>Qualification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingStudents.map(reg => (
                                        <tr key={reg.id}>
                                            <td style={{padding: '10px', border: '1px solid #ddd'}}>{reg.id}</td>
                                            <td style={{padding: '10px', border: '1px solid #ddd'}}>{reg.studentName}</td>
                                            <td style={{padding: '10px', border: '1px solid #ddd'}}>{reg.email}</td>
                                            <td style={{padding: '10px', border: '1px solid #ddd'}}>{reg.phone || '-'}</td>
                                            <td style={{padding: '10px', border: '1px solid #ddd'}}>{reg.qualification || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;