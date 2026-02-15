import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    async function handleSignup(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters');
            setLoading(false);
            return;
        }

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username: username.trim() },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-logo">
                        <h1>VERA<span>Chat</span></h1>
                    </div>
                    <div className="auth-success">
                        <div className="success-icon">✓</div>
                        <h2>Account Created!</h2>
                        <p>Please check your email to confirm your account, then sign in.</p>
                        <Link to="/login" className="btn btn-primary">Go to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>VERA<span>Chat</span></h1>
                    <p className="auth-tagline">Join the community today</p>
                </div>
                <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="signup-username">Username</label>
                        <input
                            id="signup-username"
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signup-email">Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
