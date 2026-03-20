import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await signup(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 text-center mb-8">
          Join UrPotential
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm mb-2 ml-1">Email</label>
            <input 
              type="email" required
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-slate-500 transition-all shadow-inner"
              placeholder="you@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2 ml-1">Password</label>
            <input 
              type="password" required
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-slate-500 transition-all shadow-inner"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
