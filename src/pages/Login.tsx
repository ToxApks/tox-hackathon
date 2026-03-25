import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/Card';
import { GraduationCap, Github } from 'lucide-react';
import { signInWithEmail, registerWithEmail, signInWithGitHub } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { motion } from 'framer-motion';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/dashboard');
    });
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-10 text-center shadow-xl border-none">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white w-10 h-10" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">EduMentor AI</h1>
          <p className="text-gray-500 mt-3 mb-10 text-lg">Your personal AI-powered academic companion.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 space-y-4 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Or continue with</p>
            <button
              onClick={async () => {
                try {
                  await signInWithGitHub();
                } catch (error) {
                  console.error('GitHub sign in error:', error);
                  setError('Failed to sign in with GitHub. Please check the console for details.');
                }
              }}
              className="w-full h-12 flex items-center justify-center gap-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all"
            >
              <Github className="w-5 h-5" />
              <span>Sign in with GitHub</span>
            </button>
          </div>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="mt-4 text-indigo-600 hover:underline text-sm"
          >
            {isRegister ? 'Already have an account? Login' : 'Need to register? Sign up'}
          </button>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-500 font-medium">Trusted by 10,000+ engineering students</p>
          <div className="flex justify-center gap-4 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Mock logos */}
            <div className="w-8 h-8 bg-gray-400 rounded-full" />
            <div className="w-8 h-8 bg-gray-400 rounded-full" />
            <div className="w-8 h-8 bg-gray-400 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
