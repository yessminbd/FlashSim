import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const steps = [
  { num: '01', text: 'Créez votre compte gratuitement' },
  { num: '02', text: 'Choisissez votre région & opérateur' },
  { num: '03', text: 'Rechargez en quelques secondes' },
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    navigate('/login');
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ===== LEFT PANEL (hidden on small screens) ===== */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] flex-shrink-0 p-10 xl:p-12 relative overflow-hidden"
        style={{ background: '#f8f9fc', borderRight: '1px solid #e2e8f0' }}>

        {/* Animated orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute w-96 h-96 rounded-full opacity-15 animate-orb"
            style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', top: '-100px', right: '-100px' }} />
          <div className="absolute w-72 h-72 rounded-full opacity-15 animate-float-slow"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', bottom: '-60px', left: '-40px' }} />
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px)',
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
            <div className="badge-gold text-xs w-fit">Inscription gratuite</div>
            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 leading-tight">
              Commencez en<br />
              <span className="text-gradient">3 étapes simples.</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Rejoignez des milliers d'utilisateurs qui rechargent leur SIM facilement.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-700 font-medium">
          © 2026 FlashSim · Inscription 100% gratuite
        </div>
      </div>

      {/* ===== RIGHT PANEL (FORM) ===== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative min-h-screen lg:min-h-0"
        style={{ background: '#ffffff' }}>

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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Créer un compte</h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Rejoignez FlashSim gratuitement.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl text-sm font-bold text-red-600 flex items-center gap-3"
              style={{ background: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
              <span></span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom complet</label>
              <input type="text" value={formData.name} onChange={set('name')}
                className="input-dark w-full" placeholder="Foulen Ben Foulen" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
              <input type="email" value={formData.email} onChange={set('email')}
                className="input-dark w-full" placeholder="foulen@example.com" required />
            </div>

            {/* Password fields: side by side on sm+, stacked on xs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mot de passe</label>
                <input type="password" value={formData.password} onChange={set('password')}
                  className="input-dark w-full" placeholder="••••••••" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirmer</label>
                <input type="password" value={formData.confirmPassword} onChange={set('confirmPassword')}
                  className="input-dark w-full" placeholder="••••••••" required />
              </div>
            </div>

            {/* Password strength */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: formData.password.length >= i * 2
                          ? (formData.password.length >= 8 ? '#6366f1' : '#f59e0b')
                          : 'rgba(0,0,0,0.06)'
                      }} />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  {formData.password.length < 4 ? 'Trop court' : formData.password.length < 8 ? 'Moyen' : 'Bon mot de passe'}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              En créant un compte, vous acceptez nos{' '}
              <a href="#" className="text-primary hover:text-primary-dark font-bold">CGU</a>{' '}
              et notre{' '}
              <a href="#" className="text-primary hover:text-primary-dark font-bold">Politique de confidentialité</a>.
            </p>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 text-sm sm:text-base font-black text-white flex items-center justify-center gap-3 mt-2">
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : 'Créer mon compte'}
            </button>

            <p className="text-center text-sm text-slate-600 font-medium pt-2">
              Déjà membre ?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">
                Se connecter →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
