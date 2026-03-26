import React, { useEffect, useState } from 'react';
import "./TrainerAdmin.css"
function TrainersAdmin() {
    const [trainers, setTrainers] = useState([]);
    const [courses,setCourses] = useState([]);
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [newTrainer, setNewTrainer] = useState({
        trainerName: '',
        email: '',
        phone: '',
        yearofExperience: '',
        courseId:''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        console.log('Token:',token ? token.length:0);
        console.log('Token starts with:',token? token.substring(0,10):'No TOKEN');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        loadTrainers();
        loadCourses();
    }, []);

    const loadTrainers = () => {
        setLoading(true);
        setError(null);
        
        fetch('http://localhost:8080/api/trainers/getAll', {
            headers: getAuthHeader()
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to load trainers');
            return response.json();
        })
        .then(data => {
            // console.log('Trainers loaded:', data);
             console.log('=== TRAINERS DATA FROM BACKEND ===');
            console.log('Full data:', JSON.stringify(data, null, 2));
            console.log('First trainer keys:', Object.keys(data[0] || {}));
            
            // Check what field names exist
            if (data.length > 0) {
                console.log('First trainer:', data[0]);
                console.log('yearofExperience:', data[0].yearofExperience);
                console.log('experience:', data[0].experience);
                console.log('getYearofExperience:', data[0].getYearofExperience);
            }
            setTrainers(data || []);
            setLoading(false);
        })
        .catch(err => {
            console.error('Error loading trainers:', err);
            setError('Failed to load trainers: ' + err.message);
            setLoading(false);
        });
    };

    const loadCourses = () => {
        fetch('http://localhost:8080/api/course/getall',{
            headers:getAuthHeader()
        })
        .then(response => response.json())
        .then(data => {
            console.log('Course loaded:',data);
            setCourses(data || []);
        })
        .catch(err => console.error('Error loading courses:',err));
    };

    const filteredTrainers = trainers.filter(t => {
        const search = searchTerm.toLowerCase();
        return(
              (t.trainerName || '').toString().toLowerCase().includes(search) ||
               (t.email || '').toString().toLowerCase().includes(search) ||
               (t.phone || '').toString().toLowerCase().includes(search) ||
               (t.course?.courseName || '').toString().toLowerCase().includes(search)
        );
    });


    const handleAdd = () => {
        if (!newTrainer.trainerName || !newTrainer.email) {
            alert('Please fill in required fields (Name and Email)');
            return;
        }
        const trainerData = {
            trainerName: newTrainer.trainerName,
            email:newTrainer.email,
            phone:newTrainer.phone,
            yearofExperience:newTrainer.yearofExperience ? parseInt(newTrainer.yearofExperience): null,
            course:newTrainer.courseId ? {courseId:newTrainer.courseId } : null
        };

        fetch('http://localhost:8080/api/trainers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(newTrainer)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add trainer');
            return response.json();
        })
        .then(() => {
            alert('Trainer added successfully');
            setShowAddForm(false);
            setNewTrainer({ trainerName: '', email: '', phone: '',  yearofExperience: '',courseId:'' });
            loadTrainers();
        })
        .catch(err => {
            console.error('Error adding trainer:', err);
            alert('Failed to add trainer: ' + err.message);
        });
    };

    const handleEditClick = (trainer) => {
        console.log('Editing trainer:',trainer);
        setEditing({
             ...trainer, 
             yearofExperience:trainer.yearofExperience || trainer.experience || trainer.getYearofExperience || '',
             courseId:trainer.course ? trainer.course.courseId : ''
            });
        setShowEditForm(true);
    };

    const handleUpdate = () => {
        if (!editing.trainerName || !editing.email) {
            alert('Please fill in required fields (Name and Email)');
            return;
        }
        const trainerData = {
            trainerName: editing.trainerName,
            email: editing.email,
            phone: editing.phone,
            yearofExperience: editing.yearofExperience ? parseInt(editing.yearofExperience): null,
            course: editing.courseId ? { courseId: editing.courseId } : null
        };

        fetch(`http://localhost:8080/api/trainers/${editing.trainerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(editing)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update trainer');
            return response.json();
        })
        .then(() => {
            alert('Trainer updated successfully');
            setShowEditForm(false);
            setEditing(null);
            loadTrainers();
        })
        .catch(err => {
            console.error('Error updating trainer:', err);
            alert('Failed to update trainer: ' + err.message);
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this trainer?')) {
            fetch(`http://localhost:8080/api/trainers/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete trainer');
                alert('Trainer deleted successfully');
                loadTrainers();
            })
            .catch(err => {
                console.error('Error deleting trainer:', err);
                alert('Failed to delete trainer: ' + err.message);
            });
        }
    };

    const getExperience = (trainer)=>{
        return trainer.yearofExperience || trainer.experience || trainer.getYearofExperience || null;
    };

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading trainers...</div>;
    
    return (
        <div>
            <div className="page-header">
                <h2>Manage Trainers</h2>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    + Add Trainer
                </button>
            </div>
             <div style={{marginBottom: '20px'}}>
                <input type="text" placeholder="Search trainers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{padding: '10px', width: '100%', maxWidth: '400px', border: '1px solid #ddd', borderRadius: '5px'}} />
            </div>

            {error && (
                <div style={{
                    color: 'white',
                    background: '#f44336',
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '5px'
                }}>
                    <strong>Error:</strong> {error}
                    <button onClick={loadTrainers} style={{marginLeft: '15px', padding: '5px 15px', background: 'white', color: '#f44336', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>
                        Retry
                    </button>
                </div>
            )}

            {/* Add Trainer Form */}
            {showAddForm && (
                <div className="form-container">
                    <h3>Add New Trainer</h3>
                    <div className="form-group">
                        <label>Trainer Name *</label>
                        <input type="text" value={newTrainer.trainerName} onChange={(e) => setNewTrainer({ ...newTrainer, trainerName: e.target.value })} placeholder="Enter trainer name" required />
                    </div>
                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={newTrainer.email} onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })} placeholder="Enter email" required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={newTrainer.phone} onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })} placeholder="Enter phone number" />
                    </div>
                    {/* <div className="form-group">
                        <label>Specialization</label>
                        <input type="text" value={newTrainer.specialization} onChange={(e) => setNewTrainer({ ...newTrainer, specialization: e.target.value })} placeholder="Enter specialization" />
                    </div> */}
                    <div className="form-group">
                        <label>Experience (years)</label>
                        <input type="number" value={newTrainer.yearofExperience} onChange={(e) => setNewTrainer({ ...newTrainer, yearofExperience: e.target.value })} placeholder="Enter experience" />
                    </div>
                    <div className="form-group">
                        <label>Allocated Course</label>
                        <select value={newTrainer.courseId} onChange={(e) => setNewTrainer({ ...newTrainer, courseId: e.target.value })}>
                            <option value="">-- Select Course --</option>
                            {courses.map(course => (
                                <option key={course.courseId} value={course.courseId}>{course.courseName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-success" onClick={handleAdd}>Save</button>
                        <button className="btn btn-secondary" onClick={() => { setShowAddForm(false); setNewTrainer({ trainerName: '', email: '', phone: '', yearofExperience: '',courseId:'' }); }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Edit Trainer Form */}
            {showEditForm && editing && (
                <div className="form-container">
                    <h3>Edit Trainer</h3>
                    <div className="form-group">
                        <label>Trainer Name *</label>
                        <input type="text" value={editing.trainerName} onChange={(e) => setEditing({ ...editing, trainerName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                    </div>
                    {/* <div className="form-group">
                        <label>Specialization</label>
                        <input type="text" value={editing.specialization || ''} onChange={(e) => setEditing({ ...editing, specialization: e.target.value })} />
                    </div> */}
                    <div className="form-group">
                        <label>Experience (years)</label>
                        <input type="number" value={editing.yearofExperience || ''} onChange={(e) => setEditing({ ...editing, yearofExperience: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Allocated Course</label>
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

            {/* Trainers Table */}
            <div className="table-container">
                {filteredTrainers.length === 0 ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>No trainers found. Add a new trainer!</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Experience</th>
                                <th>Allocated Course</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrainers.map(trainer => (
                                <tr key={trainer.trainerId}>
                                    <td>{trainer.trainerId}</td>
                                    <td>{trainer.trainerName}</td>
                                    <td>{trainer.email}</td>
                                    <td>{trainer.phone || '-'}</td>
                                    <td>{trainer.yearofExperience ? `${trainer.yearofExperience} years` : '-'}</td>
                                    <td>{trainer.course ? trainer.course.courseName : 'Not Assigned'}</td>
                                    <td>
                                        <button className="btn btn-warning" onClick={() => handleEditClick(trainer)}>Edit</button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(trainer.trainerId)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default TrainersAdmin;