/**
 * Auth.jsx - Supabase Authentication
 * 
 * Supports:
 * - Email/Password login & signup
 * - Google OAuth login
 * 
 * Supabase controls everything. No mock login, no localStorage auth.
 */

import React, { useState } from 'react';
import { supabase } from '../supabase';
import './Auth.css';

// Google Icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

function Auth() {
    const [view, setView] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) alert(error.message);
        setIsLoading(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) alert(error.message);
        else alert('Check your email for confirmation link!');

        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            alert(error.message);
            setIsGoogleLoading(false);
        }
        // On success, user will be redirected to Google, then back to app
        // onAuthStateChange in UserContext will handle the login
    };

    const toggleView = () => {
        setView(prev => prev === 'login' ? 'signup' : 'login');
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
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

                {/* Google OAuth Button */}
                <button
                    type="button"
                    className={`google-btn ${isGoogleLoading ? 'loading' : ''}`}
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                >
                    {isGoogleLoading ? (
                        <div className="spinner" />
                    ) : (
                        <>
                            <GoogleIcon />
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                {/* Divider */}
                <div className="auth-divider">
                    <span>or</span>
                </div>

                <form className="auth-form" onSubmit={view === 'login' ? handleLogin : handleSignup}>
                    {view === 'signup' && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {view === 'signup' && (
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="forgot-password">
                            <a href="#" className="forgot-password-link">Forgot password?</a>
                        </div>
                    )}

                    <button type="submit" className={`auth-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
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
