import React, { useEffect, useState } from 'react';
import "./RegisteredAdmin.css";

function RegisteredAdmin() {
    const [registered, setRegistered] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTrainerId, setSelectedTrainerId] = useState(1);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found! User not logged in.');
            return {};
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        loadData();
        loadTrainers();
    }, []);

    const loadData = () => {
        setLoading(true);
        setError(null);
        const headers = getAuthHeader();
        
        if (Object.keys(headers).length === 0) {
            setError('You are not logged in. Please login first.');
            setLoading(false);
            return;
        }
        
        Promise.all([
            fetch('http://localhost:8080/api/registered', { headers }),
            fetch('http://localhost:8080/api/student/getall', { headers }),
            fetch('http://localhost:8080/api/course/getall', { headers })
        ])
        .then(([registeredRes, studentsRes, coursesRes]) => {
            if (!registeredRes.ok) throw new Error('Failed to load registered');
            if (!studentsRes.ok) throw new Error('Failed to load students');
            if (!coursesRes.ok) throw new Error('Failed to load courses');
            
            return Promise.all([
                registeredRes.json(),
                studentsRes.json(),
                coursesRes.json()
            ]);
        })
        .then(([registeredData, studentsData, coursesData]) => {
            setRegistered(registeredData || []);
            setStudents(studentsData || []);
            setCourses(coursesData || []);
            setLoading(false);
        })
        .catch(err => {
            console.error('Error loading data:', err);
            setError('Failed to load data: ' + err.message);
            setLoading(false);
        });
    };

    const loadTrainers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/trainers', {
                headers: getAuthHeader()
            });
            const data = await response.json();
            setTrainers(data);
        } catch (err) {
            console.error('Error loading trainers:', err);
        }
    };

    const isAlreadyApproved = (reg) => {
        return students.some(student => 
            student.email && reg.email && student.email.toLowerCase() === reg.email.toLowerCase()
        );
    };

    const handleApprove = (reg) => {
        if (window.confirm(`Approve registration for ${reg.studentName}?`)) {
            const headers = getAuthHeader();
            if (Object.keys(headers).length === 0) {
                alert('You are not logged in. Please login first.');
                return;
            }

            const trainerId = selectedTrainerId || 1;

            // ✅ Use the new approve endpoint (doesn't delete from registered)
            fetch(`http://localhost:8080/api/student/approve/${reg.id}/${trainerId}`, {
                method: 'POST',
                headers: headers
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to approve');
                return response.json();
            })
            .then((student) => {
                console.log('Student approved:', student);
                alert(`${reg.studentName} approved successfully!`);
                loadData(); // Reload to show updated status
            })
            .catch(err => {
                console.error('Error approving registration:', err);
                alert('Failed to approve: ' + err.message);
            });
        }
    };

    const handleEditClick = (reg) => {
        setEditing({
            ...reg,
            courseId: reg.courseId || ''
        });
        setShowEditForm(true);
    };

    const handleUpdate = () => {
        const headers = getAuthHeader();
        if (Object.keys(headers).length === 0) {
            alert('You are not logged in. Please login first.');
            return;
        }

        const regData = {
            studentName: editing.studentName,
            email: editing.email,
            phone: editing.phone,
            qualification: editing.qualification,
            courseId: editing.courseId ? parseInt(editing.courseId) : null
        };

        fetch(`http://localhost:8080/api/registered/${editing.id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(regData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update');
            return response.json();
        })
        .then(() => {
            alert('Updated successfully');
            setShowEditForm(false);
            setEditing(null);
            loadData();
        })
        .catch(err => {
            console.error('Error updating:', err);
            alert('Failed to update: ' + err.message);
        });
    };

    const handleDelete = (id) => {
        const headers = getAuthHeader();
        if (Object.keys(headers).length === 0) {
            alert('You are not logged in. Please login first.');
            return;
        }

        if (window.confirm('Delete this registration?')) {
            fetch(`http://localhost:8080/api/registered/${id}`, {
                method: 'DELETE',
                headers: headers
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete');
                loadData();
            })
            .catch(err => {
                console.error('Error deleting:', err);
                alert('Failed to delete: ' + err.message);
            });
        }
    };

    const getCourseName = (courseId) => {
        if (!courseId) return 'Not Assigned';
        const course = courses.find(c => c.courseId === courseId);
        return course ? course.courseName : `Course ${courseId}`;
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    
    return (
        <div className="registered-admin-page">
            <div className="page-header">
                <h2>Manage Registered Students</h2>
            </div>

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                    <button onClick={loadData}>Retry</button>
                </div>
            )}

            {/* Trainer Selection */}
            {/* <div className="trainer-selection">
                <label>Select Trainer for Approval:</label>
                <select value={selectedTrainerId} onChange={(e) => setSelectedTrainerId(parseInt(e.target.value))}>
                    {trainers.map(trainer => (
                        <option key={trainer.trainerId} value={trainer.trainerId}>
                            {trainer.trainerName}
                        </option>
                    ))}
                </select>
            </div> */}

            {showEditForm && editing && (
                <div className="form-container">
                    <h3>Edit Registration</h3>
                    <div className="form-group">
                        <label>Student Name *</label>
                        <input type="text" value={editing.studentName} onChange={(e) => setEditing({ ...editing, studentName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Qualification</label>
                        <input type="text" value={editing.qualification || ''} onChange={(e) => setEditing({ ...editing, qualification: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Course</label>
                        <select value={editing.courseId} onChange={(e) => setEditing({ ...editing, courseId: e.target.value })}>
                            <option value="">-- Select Course --</option>
                            {courses.map(course => (
                                <option key={course.courseId} value={course.courseId}>{course.courseName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-success" onClick={handleUpdate}>Update</button>
                        <button className="btn btn-secondary" onClick={() => { setShowEditForm(false); setEditing(null); }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="table-container">
                {registered.length === 0 ? (
                    <div className="empty-state">
                        <p>No pending registrations found!</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Qualification</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registered.map(reg => {
                                const approved = isAlreadyApproved(reg);
                                return (
                                    <tr key={reg.id}>
                                        <td>{reg.id}</td>
                                        <td>{reg.studentName}</td>
                                        <td>{reg.email}</td>
                                        <td>{reg.phone || '-'}</td>
                                        <td>{reg.qualification || '-'}</td>
                                        <td>{getCourseName(reg.courseId)}</td>
                                        <td>
                                            {approved ? (
                                                <span className="status approved">✅ Approved</span>
                                            ) : (
                                                <span className="status pending">⏳ Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            {!approved && (
                                                <button className="btn btn-success" onClick={() => handleApprove(reg)}>Approve</button>
                                            )}
                                            {!approved && (
                                                <button className="btn btn-warning" onClick={() => handleEditClick(reg)}>Edit</button>
                                            )}
                                            <button className="btn btn-danger" onClick={() => handleDelete(reg.id)}>Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default RegisteredAdmin;