import React, { useEffect, useState } from 'react';

import "./CourseAdmin.css"

function CoursesAdmin() {
    const [courses, setCourses] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [newCourse, setNewCourse] = useState({ courseName: '', duration: '', image: null });
    const [editImage, setEditImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [editPreview, setEditPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm,setSearchTerm]=useState('');
    
    // API configuration
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        console.log('Token:',token ? 'Present':'MISSING');
        console.log('Token Value:',token);
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = () => {
        setLoading(true);
        setError(null);
        
        console.log('Loading courses...');
        
        fetch('http://localhost:8080/api/course/getall', {
            headers: getAuthHeader()
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Courses data:', data);
            setCourses(data || []);
            setLoading(false);
        })
        .catch(err => {
            console.error('Error loading courses:', err);
            setError('Failed to load courses: ' + err.message);
            setLoading(false);
        });
    };
     // Filter courses based on search term
    const filteredCourses = courses.filter(course => {
        const search = searchTerm.toLowerCase();
        return (
           (course.courseName || ' ').toString().toLowerCase().includes(search) ||
            (course.duration || ' ').toString().toLowerCase().includes(search) ||
            (course.image || ' ') .toString().toLowerCase().includes(search)
        );
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreviewImage(URL.createObjectURL(file));
        setNewCourse({ ...newCourse, image: file });
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditPreview(URL.createObjectURL(file));
        setEditImage(file);
    };

    const handleAdd = () => {
        if (!newCourse.courseName || !newCourse.duration) {
            alert('Please fill in all fields');
            return;
        }

        const formData = new FormData();
        formData.append('courseName', newCourse.courseName);
        formData.append('duration', newCourse.duration);
        if (newCourse.image) {
            formData.append('image', newCourse.image);
        }

        fetch('http://localhost:8080/api/course/saveWithImage', {
            method: 'POST',
            headers: {
                ...getAuthHeader()
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add course');
            return response.json();
        })
        .then(() => {
            alert('Course added successfully');
            setShowAddForm(false);
            setNewCourse({ courseName: '', duration: '', image: null });
            setPreviewImage(null);
            loadCourses();
        })
        .catch(err => {
            console.error('Error adding course:', err);
            alert('Failed to add course: ' + err.message);
        });
    };

    const handleEditClick = (course) => {
        setEditing({ ...course });
        setEditImage(null);
        setEditPreview(null);
        setShowEditForm(true);
    };

    const handleUpdate = () => {
        if (!editing.courseName || !editing.duration) {
            alert('Please fill in all fields');
            return;
        }

        const formData = new FormData();
        formData.append('courseName', editing.courseName);
        formData.append('duration', editing.duration);
        if (editImage) {
            formData.append('image', editImage);
        }

        fetch(`http://localhost:8080/api/course/updateWithImage/${editing.courseId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader()
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update course');
            return response.json();
        })
        .then(() => {
            alert('Course updated successfully');
            setShowEditForm(false);
            setEditing(null);
            setEditImage(null);
            setEditPreview(null);
            loadCourses();
        })
        .catch(err => {
            console.error('Error updating course:', err);
            alert('Failed to update course: ' + err.message);
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            fetch(`http://localhost:8080/api/course/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete course');
                alert('Course deleted successfully');
                loadCourses();
            })
            .catch(err => {
                console.error('Error deleting course:', err);
                alert('Failed to delete course: ' + err.message);
            });
        }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading courses...</div>;
    
    return (
        <div>
            <div className="page-header">
                <h2>Manage Courses</h2>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    + Add Course
                </button>
            </div>
             {/* Search Bar */}
            <div style={{marginBottom: '20px'}}>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '10px',
                        width: '100%',
                        maxWidth: '400px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '14px'
                    }}
                />
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
                    <button 
                        onClick={loadCourses}
                        style={{
                            marginLeft: '15px',
                            padding: '5px 15px',
                            background: 'white',
                            color: '#f44336',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Add Course Form */}
            {showAddForm && (
                <div className="form-container">
                    <h3>Add New Course</h3>
                    <div className="form-group">
                        <label>Course Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        {previewImage && (
                            <img src={previewImage} alt="Preview" style={{width: '100px', marginTop: '10px'}} />
                        )}
                    </div>
                    <div className="form-group">
                        <label>Course Name *</label>
                        <input 
                            type="text" 
                            placeholder="Enter course name"
                            value={newCourse.courseName}
                            onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Duration (hours) *</label>
                        <input 
                            type="number" 
                            placeholder="Enter duration"
                            value={newCourse.duration}
                            onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-success" onClick={handleAdd}>Save</button>
                        <button className="btn btn-secondary" onClick={() => {
                            setShowAddForm(false);
                            setNewCourse({ courseName: '', duration: '', image: null });
                            setPreviewImage(null);
                        }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Edit Course Form */}
            {showEditForm && editing && (
                <div className="form-container">
                    <h3>Edit Course</h3>
                    <div className="form-group">
                        <label>Course Image</label>
                        <input type="file" accept="image/*" onChange={handleEditImageChange} />
                        <img 
                            src={editPreview || (editing.imageUrl ? `http://localhost:8080${editing.imageUrl}` : '/default-course.jpg')} 
                            alt="Preview" 
                            style={{width: '100px', marginTop: '10px'}} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Course Name *</label>
                        <input 
                            type="text" 
                            value={editing.courseName}
                            onChange={(e) => setEditing({ ...editing, courseName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Duration (hours) *</label>
                        <input 
                            type="number" 
                            value={editing.duration}
                            onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-success" onClick={handleUpdate}>Update</button>
                        <button className="btn btn-secondary" onClick={() => {
                            setShowEditForm(false);
                            setEditing(null);
                            setEditImage(null);
                            setEditPreview(null);
                        }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Courses Table */}
            <div className="table-container">
                {courses.length === 0 ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>No courses found. Add a new course!</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Course Name</th>
                                <th>Duration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.courseId}>
                                    <td>{course.courseId}</td>
                                    <td>
                                        <img 
                                            src={course.imageUrl ? `http://localhost:8080${course.imageUrl}` : '/default-course.jpg'}
                                            alt={course.courseName}
                                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                        />
                                    </td>
                                    <td>{course.courseName}</td>
                                    <td>{course.duration} hrs</td>
                                    <td>
                                        <button className="btn btn-warning" onClick={() => handleEditClick(course)}>Edit</button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(course.courseId)}>Delete</button>
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

export default CoursesAdmin;