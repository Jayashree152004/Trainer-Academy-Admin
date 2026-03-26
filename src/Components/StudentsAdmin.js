import React, { useEffect, useState } from 'react';
import "./StudentAdmin.css"
function StudentsAdmin() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newStudent, setNewStudent] = useState({
        studentName: '',
        email: '',
        phone: '',
        qualification: '',
        courseId: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

useEffect(() => {
    loadStudents();
    loadCourses();
}, []);

const loadStudents = () => {
    setLoading(true);
    setError(null);
    
    fetch('http://localhost:8080/api/student/getall', {
        headers: getAuthHeader()
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to load students');
        return response.json();
    })
    .then(data => {
        setStudents(data || []);
        setLoading(false);
    })
    .catch(err => {
        console.error('Error loading students:', err);
        setError('Failed to load students: ' + err.message);
        setLoading(false);
    });
};

const loadCourses = () => {
    fetch('http://localhost:8080/api/course/getall', {
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => setCourses(data || []))
    .catch(err => console.error('Error loading courses:', err));
};

// Filter students based on search term
const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    return (
       ( student.studentName || '').toString().toLowerCase().includes(search) ||
        (student.email || '').toString().toLowerCase().includes(search) ||
        (student.phone || '').toString().toLowerCase().includes(search) ||
        (student.qualification || '').toString().toLowerCase().includes(search) ||
        (student.course?.courseName || '').toString().toLowerCase().includes(search)
    );
});

const handleAdd = () => {
    if (!newStudent.studentName || !newStudent.email) {
        alert('Please fill in required fields');
        return;
    }
    fetch('http://localhost:8080/api/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
            studentName: newStudent.studentName,
            email: newStudent.email,
            phone: newStudent.phone,
            qualification: newStudent.qualification,
            course: newStudent.courseId ? { courseId: parseInt(newStudent.courseId) } : null
        })
    })
    .then(res => { if (!res.ok) throw new Error('Failed to add'); return res.json(); })
    .then(() => {
        alert('Student added successfully');
        setShowAddForm(false);
        setNewStudent({ studentName: '', email: '', phone: '', qualification: '', courseId: '' });
        loadStudents();
    })
    .catch(err => { console.error(err); alert('Failed to add student'); });
};

const handleEditClick = (student) => {
    setEditing({ ...student, courseId: student.course?.courseId || '' });
    setShowEditForm(true);
};

const handleUpdate = () => {
    fetch(`http://localhost:8080/api/student/update/${editing.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
            studentName: editing.studentName,
            email: editing.email,
            phone: editing.phone,
            qualification: editing.qualification,
            course: editing.courseId ? { courseId: parseInt(editing.courseId) } : null
        })
    })
    .then(res => { if (!res.ok) throw new Error('Failed to update'); return res.json(); })
    .then(() => {
        alert('Student updated successfully');
        setShowEditForm(false);
        setEditing(null);
        loadStudents();
    })
    .catch(err => { console.error(err); alert('Failed to update student'); });
};

const handleDelete = (id) => {
    if (window.confirm('Delete this student?')) {
        fetch(`http://localhost:8080/api/student/${id}`, { method: 'DELETE', headers: getAuthHeader() })
        .then(res => { if (!res.ok) throw new Error('Failed'); alert('Deleted'); loadStudents(); })
        .catch(err => { console.error(err); alert('Failed to delete'); });
    }
};

if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading...</div>;

return (
    <div>
        <div className="page-header">
            <h2>Manage Students</h2>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>+ Add Student</button>
        </div>

        <div style={{marginBottom: '20px'}}>
            <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{padding: '10px', width: '100%', maxWidth: '400px', border: '1px solid #ddd', borderRadius: '5px'}} />
        </div>

        {showAddForm && (
            <div className="form-container">
                <h3>Add Student</h3>
                <div className="form-group"><label>Name *</label><input type="text" value={newStudent.studentName} onChange={(e) => setNewStudent({...newStudent, studentName: e.target.value})} /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} /></div>
                <div className="form-group"><label>Phone</label><input type="text" value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} /></div>
                <div className="form-group"><label>Qualification</label><input type="text" value={newStudent.qualification} onChange={(e) => setNewStudent({...newStudent, qualification: e.target.value})} /></div>
                <div className="form-group"><label>Course</label><select value={newStudent.courseId} onChange={(e) => setNewStudent({...newStudent, courseId: e.target.value})}><option value="">Select</option>{courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}</select></div>
                <div className="form-actions"><button className="btn btn-success" onClick={handleAdd}>Save</button><button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button></div>
            </div>
        )}

        {showEditForm && editing && (
            <div className="form-container">
                <h3>Edit Student</h3>
                <div className="form-group"><label>Name *</label><input type="text" value={editing.studentName} onChange={(e) => setEditing({...editing, studentName: e.target.value})} /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={editing.email} onChange={(e) => setEditing({...editing, email: e.target.value})} /></div>
                <div className="form-group"><label>Phone</label><input type="text" value={editing.phone || ''} onChange={(e) => setEditing({...editing, phone: e.target.value})} /></div>
                <div className="form-group"><label>Qualification</label><input type="text" value={editing.qualification || ''} onChange={(e) => setEditing({...editing, qualification: e.target.value})} /></div>
                <div className="form-group"><label>Course</label><select value={editing.courseId} onChange={(e) => setEditing({...editing, courseId: e.target.value})}><option value="">Select</option>{courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}</select></div>
                <div className="form-actions"><button className="btn btn-success" onClick={handleUpdate}>Update</button><button className="btn btn-secondary" onClick={() => setShowEditForm(false)}>Cancel</button></div>
            </div>
        )}

        <div className="table-container">
            <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Qualification</th><th>Course</th><th>Actions</th></tr></thead>
                <tbody>
                    {filteredStudents.map(s => (
                        <tr key={s.studentId}>
                            <td>{s.studentId}</td><td>{s.studentName}</td><td>{s.email}</td><td>{s.phone || '-'}</td><td>{s.qualification || '-'}</td><td>{s.course?.courseName || 'Not Assigned'}</td>
                            <td><button className="btn btn-warning" onClick={() => handleEditClick(s)}>Edit</button> <button className="btn btn-danger" onClick={() => handleDelete(s.studentId)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

}  
export default StudentsAdmin;