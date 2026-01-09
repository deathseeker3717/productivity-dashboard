/**
 * Auth.jsx - Authentication Entry Point
 * 
 * Handles Login and Sign-Up views with a premium, minimal aesthetic.
 */

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Icons } from '../App';
import './Auth.css';

function Auth() {
    const { login } = useUser();
    const [view, setView] = useState('login'); // 'login' or 'signup'
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            // Basic validation
            if (view === 'signup' && formData.password !== formData.confirmPassword) {
                alert("Passwords don't match");
                setIsLoading(false);
                return;
            }

            // Create user object
            const user = {
                name: formData.name || 'User',
                email: formData.email,
                avatar: null
            };

            login(user);
            setIsLoading(false);
        }, 1500);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleView = () => {
        setView(prev => prev === 'login' ? 'signup' : 'login');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                        </svg>
                    </div>
                    <h1 className="auth-title">
                        {view === 'login' ? 'Welcome back' : 'Create an account'}
                    </h1>
                    <p className="auth-subtitle">
                        {view === 'login'
                            ? 'Enter your credentials to access your workspace.'
                            : 'Join Taskly to track habits, goals, and productivity.'}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {view === 'signup' && (
                        <div className="form-group animate-slideInLeft">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g. Alex Sterling"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {view === 'signup' && (
                        <div className="form-group animate-slideInRight">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="forgot-password">
                            <a href="#" className="forgot-password-link">Forgot password?</a>
                        </div>
                    )}

                    <button type="submit" className={`auth-button ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? <div className="spinner" /> : (view === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-footer">
                    {view === 'login' ? (
                        <p>
                            Don't have an account?
                            <button onClick={toggleView} className="auth-link">Sign up</button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?
                            <button onClick={toggleView} className="auth-link">Log in</button>
                        </p>
                    )}
                </div>

                <p className="legal-text">
                    By clicking continue, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

export default Auth;
