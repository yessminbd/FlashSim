import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const features = [
  { icon: '', title: 'Recharge instantanée', desc: 'Créditez votre SIM en quelques secondes, 24h/24.' },
  { icon: '', title: 'Multi-régions', desc: 'Tunisie, France, Algérie et plus encore.' },
  { icon: '', title: 'Paiement sécurisé', desc: 'Chiffrement SSL et authentification renforcée.' },
];

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login/', { email, password });
      const { access, refresh, user } = res.data;
      localStorage.setItem('flashsim_access', access);
      localStorage.setItem('flashsim_refresh', refresh);
      localStorage.setItem('flashsim_email', user.email);
      onLogin(user.role);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ===== LEFT PANEL (hidden on small screens) ===== */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] flex-shrink-0 p-10 xl:p-12 relative overflow-hidden"
        style={{ background: '#f8f9fc', borderRight: '1px solid #e2e8f0' }}>

        {/* Animated orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute w-80 h-80 rounded-full opacity-20 animate-orb"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', top: '-80px', left: '-80px' }} />
          <div className="absolute w-60 h-60 rounded-full opacity-15 animate-float-slow"
            style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', bottom: '-60px', right: '-60px' }} />
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-glow-pulse"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-900">Flash<span className="text-gradient">Sim</span></span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="badge-gold text-xs w-fit">Plateforme de recharge</div>
            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 leading-tight">
              Rechargez votre SIM<br />
              <span className="text-gradient">où que vous soyez.</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Des millions de recharges effectuées. Rejoignez la plateforme de confiance.
            </p>
          </div>


        </div>

        <div className="relative z-10 text-xs text-slate-700 font-medium">
          © 2026 FlashSim · Tous droits réservés
        </div>
      </div>

      {/* ===== RIGHT PANEL (FORM) ===== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative min-h-screen lg:min-h-0"
        style={{ background: '#ffffff' }}>

        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />

        <div className="w-full max-w-md relative z-10 animate-fade-in">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-12 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" />
              </svg>
            </div>
            <span className="text-xl font-black text-slate-900">Flash<span className="text-gradient">Sim</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 animate-stagger-1">Bon retour</h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base animate-stagger-2">Connectez-vous pour accéder à votre espace.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl text-sm font-bold text-red-600 flex items-center gap-3"
              style={{ background: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
              <span></span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 animate-stagger-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-dark w-full" placeholder="votre@email.com" required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mot de passe</label>
                <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">Oublié ?</a>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-dark w-full" placeholder="••••••••" required />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 text-sm sm:text-base font-black text-white flex items-center justify-center gap-3 mt-2">
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                  </svg>
                  Se connecter
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-600 font-medium pt-2">
              Pas encore membre ?{' '}
              <Link to="/register" className="text-primary font-bold hover:text-primary-dark transition-colors">
                Créer un compte →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
