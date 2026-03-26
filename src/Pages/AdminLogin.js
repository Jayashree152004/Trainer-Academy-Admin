import{ useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
 import './Login.css';

function AdminLogin() { 
    const [username, setUsername] = useState('JayashreeBalaraman'); 
    const [password, setPassword] = useState('Jaya@15'); 
    const [error, setError] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting login with:', username);

    try {
        const response = await fetch('http://localhost:8080/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const data = JSON.parse(await response.text());
            console.log('Login success! Data:', data);
            
            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username || username);
            // FIX: Store actual role from response
            localStorage.setItem('role', data.role || 'ADMIN');
            
            alert('Login successful!');
            navigate('/');
        } else {
            const text = await response.text();
            console.log('Login failed:', text);
            setError(text || 'Invalid credentials');
        }
    } catch (err) {
        console.error('Login error:', err);
        setError('Error: ' + err.message);
    } finally {
        setLoading(false);
    }
};

return (
    <div className="login-container">
        <div className="login-box">
            <h2>Admin Login</h2>
            <p className="subtitle">Enter your admin credentials</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    </div>
);
}

export default AdminLogin;



