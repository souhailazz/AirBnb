import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const Signup = () => {
    const [formData, setFormData] = useState({ nom: '', prenom: '', mail: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://backend-production-886a.up.railway.app/api/User/signup', formData);
            if (response.status === 200) {
                alert('User registered successfully!');
                // Optionally, redirect to login page or clear the form
                setFormData({ nom: '', prenom: '', mail: '', password: '' });
            }
        } catch (error) {
            console.error('Signup failed:', error.response?.data || error.message);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-group">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                    type="text"
                    name="nom"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>
            <div className="input-group">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                    type="text"
                    name="prenom"
                    placeholder="Prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>
            <div className="input-group">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                    type="email"
                    name="mail"
                    placeholder="Email"
                    value={formData.mail}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>
            <div className="input-group">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="signup-button">Sign Up</button>
        </form>
    );
};

export default Signup;