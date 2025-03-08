import React, { useState } from 'react';
import axios from 'axios';
import { redirect, useNavigate } from 'react-router-dom';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5276/api/User/login', {
                mail: email,
                password: password,
                nom: '',
                prenom: ''
            });
    
            if (response.status === 200) {
                console.log('Login successful');
                sessionStorage.setItem('userId', response.data.id); // Store the userId in sessionStorage
                console.log(response.data.id);
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
                <FontAwesomeIcon icon={faEnvelope} className="icon" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
            </div>
            <div className="input-group">
                <FontAwesomeIcon icon={faLock} className="icon" />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-button">Login</button>
        </form>
    );
}

export default Login; 