import axios from "axios";
import { data } from "react-router-dom";

const api = axios.create({
    baseURL: "http://localhost:8080/api/admin",  // Admin-specific base URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const getCourses = () => api.get('/courses');
export const addCourses = (data) => api.post('/courses', data);
export const updateCourses = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourses = (id) => api.delete(`/courses/${id}`);
// Add similar for trainers, students, registered
export const getTrainers =()=>api.get('/trainers');
export const addTrainers = (data) => api.post('/trainers',data);
export const updateTrainers =(id,data)=>api.put(`/trainers/${id}`,data);
export const deleteTrainers = (id)=>api.delete(`/trainers/${id}`);

export const getStudents=()=>api.get('/students');
export const addStudents = (data) => api.post('/students',data);
export const updateStudents =(id,data)=>api.put(`/students/${id}`,data);
export const deleteStudents= (id)=>api.delete(`/students/${id}`);

export const getRegisteredStudents =()=>api.get("/registered");
export const registereStudent =(data)=>api.post("/registered",data);
export const updateRegisteredStudent =(id,data)=>api.put(`/update/${id}`,data);
export const deleteRegistered=(id)=>api.delete(`/${id}`);
