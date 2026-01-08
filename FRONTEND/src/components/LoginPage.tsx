import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, Key } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'VERIFY';

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [view, setView] = useState<AuthView>('LOGIN');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const resetForm = () => {
        setError('');
        setSuccessMsg('');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            login(data);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, confirmPassword, secret }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // If Admin created via secret, auto-login
            if (data.isVerified && data.status === 'active') {
                login(data);
                onLoginSuccess();
            } else {
                // Otherwise go to Verify
                setSuccessMsg("Registration successful! Check console/email for code.");
                setView('VERIFY');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            setSuccessMsg("Email Verified! Waiting for Admin Approval.");
            setTimeout(() => {
                setView('LOGIN');
                resetForm();
                setError('');
                setSuccessMsg("Account Pending Admin Approval. Please check back later.");
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {view === 'LOGIN' && 'Welcome Back'}
                        {view === 'REGISTER' && 'Create Account'}
                        {view === 'VERIFY' && 'Verify Email'}
                    </h2>
                    <p className="text-gray-400">
                        {view === 'LOGIN' && 'Enter your credentials to continue'}
                        {view === 'REGISTER' && 'Sign up to access the tracker'}
                        {view === 'VERIFY' && `Code sent to ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                        {successMsg}
                    </div>
                )}

                {view === 'LOGIN' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="name@company.com" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="••••••••" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50">
                            {loading ? 'Please wait...' : 'Sign In'}
                        </button>
                    </form>
                )}

                {view === 'REGISTER' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="John Doe" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="name@company.com" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="••••••••" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="••••••••" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Admin Secret</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" value={secret} onChange={(e) => setSecret(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Optional" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50">
                            {loading ? 'Please wait...' : 'Create Account'}
                        </button>
                    </form>
                )}

                {view === 'VERIFY' && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Verification Code</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors text-center text-xl tracking-widest"
                                    placeholder="123456" maxLength={6} required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50">
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        {view === 'LOGIN' ? "Don't have an account? " :
                            view === 'REGISTER' ? "Already have an account? " :
                                "Back to "
                        }
                        <button onClick={() => {
                            if (view === 'LOGIN') setView('REGISTER');
                            else setView('LOGIN'); // Back to login from register or verify
                            resetForm();
                        }}
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                            {view === 'LOGIN' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
