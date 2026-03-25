import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
// firebaseConfig imported from firebase-applet-config.json
import {
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { User } from '../types';

interface AuthProps {
  onAuthenticated: (user: User) => void;
}

// firebaseConfig imported from firebase-applet-config.json


const app = !getApps().length ? initializeApp(require('../../firebase-applet-config.json')) : getApp();
const auth = getAuth(app);

export const Auth = ({ onAuthenticated }: AuthProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function transformFirebaseUser(user: FirebaseUser): User {
    return {
      uid: user.uid,
      email: user.email || 'unknown@example.com',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      progress: 0,
    };
  }

  const goDashboard = (firebaseUser: FirebaseUser) => {
    const typedUser = transformFirebaseUser(firebaseUser);
    onAuthenticated(typedUser);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        goDashboard(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const clear = () => {
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clear();

    if (!validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim().length > 0) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
        goDashboard(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        goDashboard(userCredential.user);
      }
    } catch (e: any) {
      const message = typeof e?.message === 'string' ? e.message : 'Login failed.';
      setError(message.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/, '').trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMode('login');
      setEmail('');
      setPassword('');
      setConfirm('');
      setName('');
      setError('');
    } catch (e) {
      console.error('Logout Error', e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', borderRadius: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', background: '#fff', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>{mode === 'login' ? 'Enter your details to access your account.' : 'Join us today! It only takes a minute.'}</p>
        </div>

        <div style={{ minHeight: '1.25rem', marginBottom: '1rem', color: '#EF4444', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>{error || ''}</div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#111827' }}>Full Name</label>
              <input style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #E5E7EB', borderRadius: '0.75rem', fontSize: '1rem', background: '#F9FAFB' }} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#111827' }}>Email</label>
            <input type="email" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #E5E7EB', borderRadius: '0.75rem', fontSize: '1rem', background: '#F9FAFB' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#111827' }}>Password</label>
            <input type="password" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #E5E7EB', borderRadius: '0.75rem', fontSize: '1rem', background: '#F9FAFB' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#111827' }}>Confirm Password</label>
              <input type="password" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #E5E7EB', borderRadius: '0.75rem', fontSize: '1rem', background: '#F9FAFB' }} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
          )}

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.875rem', background: isLoading ? '#6B7280' : '#4F46E5', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6B7280' }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{ color: '#4F46E5', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>Authentication state: </span>
          <strong style={{ color: '#065F46' }}>Active</strong>
        </div>

        <button onClick={handleLogout} style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

