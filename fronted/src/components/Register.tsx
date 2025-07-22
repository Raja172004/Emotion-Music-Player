import React, { useState } from 'react';
import { registerUser } from '../services/api';

const Register = ({ onRegister, onToggle }: { onRegister: (user: any) => void, onToggle: () => void }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await registerUser({ username, password, email });
      if (result.id) {
        onRegister(result);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex flex-col items-center mb-4">
          <span className="inline-block bg-amber-400 p-4 rounded-full mb-3 shadow">
            <svg className="w-14 h-14 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12A4 4 0 1 1 8 12a4 4 0 0 1 8 0ZM12 14v2m0 4h.01" /></svg>
          </span>
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Sign up to get started with your music journey.</p>
        </div>
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Username</label>
          <input className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white placeholder-gray-400 transition-all duration-200" type="text" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Email</label>
          <input className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white placeholder-gray-400 transition-all duration-200" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Password</label>
          <input className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white placeholder-gray-400 transition-all duration-200" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
        </div>
        {error && <div className="text-amber-500 text-center bg-amber-100 border border-amber-200 rounded-full p-2 font-medium animate-pulse mt-4">{error}</div>}
        <button className="w-full bg-indigo-700 text-amber-400 font-bold py-2.5 rounded-full shadow hover:scale-105 hover:shadow-xl transition-all duration-200 text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-6" type="submit" disabled={loading}>{loading ? <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Registering...</span> : 'Register'}</button>
        <div className="flex justify-center mt-6">
          <button type="button" onClick={onToggle} className="px-6 py-2 rounded-full font-semibold border border-indigo-700 bg-white text-indigo-700 hover:border-amber-400 hover:text-amber-400 transition focus:outline-none focus:ring-2 focus:ring-amber-200">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register; 