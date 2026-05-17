import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Landing = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [opsRes, regsRes] = await Promise.all([
          api.get('/operators/'),
          api.get('/regions/')
        ]);
        setOperators(opsRes.data);
        setRegions(regsRes.data);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="relative min-h-[80vh] overflow-hidden">
      {/* Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-orb absolute -top-40 -left-40 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="animate-float-slow absolute -bottom-40 -right-40 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="flex flex-col items-center justify-center text-center pt-10 sm:pt-16 pb-12 sm:pb-20 space-y-8 sm:space-y-12">

          <div className="animate-fade-in space-y-4 sm:space-y-6 max-w-4xl w-full">
            <div className="space-y-2">
               <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-[0.92] tracking-tight text-slate-900 animate-stagger-1">
                Recharge <span className="text-gradient animate-text-shine">ultra-rapide</span>
              </h1>
              <p className="text-3xl sm:text-5xl lg:text-7xl font-black leading-[0.92] tracking-tight text-slate-400 animate-stagger-3">
                de votre carte SIM.
              </p>
            </div>

            <p className="text-slate-500 text-base sm:text-xl font-medium max-w-2xl mx-auto animate-fade-in-delayed leading-relaxed px-4">
              La solution la plus simple pour recharger vos opérateurs préférés en quelques secondes.
              Instantané et disponible partout.
            </p>
          </div>

          <div className="animate-fade-in-delayed flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md px-4">
            <button
              onClick={() => navigate('/recharge')}
              className="btn-primary w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-black gap-3 shadow-2xl shadow-primary/30 text-white"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" />
              </svg>
              Commencer une Recharge
            </button>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
              {[
                { label: 'Pays', value: regions.length.toString() },
                { label: 'Opérateurs', value: operators.length.toString() },
                { label: 'Dispo', value: '100%' },
              ].map((s) => (
                <div key={s.label} className="stat-card px-5 sm:px-8 py-3 sm:py-4">
                  <span className="text-2xl sm:text-3xl font-black text-gradient">{s.value}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operators Section */}
        <section className="animate-fade-in-delayed pb-12 sm:pb-20">
          <div className="flex flex-col items-center mb-6 sm:mb-10">
            <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Opérateurs Partenaires</h2>
            <div className="w-12 h-1 bg-primary/20 rounded-full" />
          </div>

          <div className="relative group">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 sm:pb-8 pt-2 px-2 no-scrollbar scroll-smooth">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-slate-100 rounded-[2rem] animate-pulse" />
                ))
              ) : operators.length > 0 ? (
                operators.map((op) => (
                  <div
                    key={op.id}
                    className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 glass-card p-4 sm:p-6 flex items-center justify-center cursor-pointer group/card"
                    onClick={() => navigate('/recharge')}
                  >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      {op.logo_url ? (
                        <img
                          src={op.logo_url}
                          alt={op.name}
                          className="max-h-full max-w-full object-contain transition-all duration-500 group-hover/card:scale-110"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 font-black text-2xl uppercase ${op.logo_url ? 'hidden' : ''}`}>
                        {op.name?.[0]}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm font-medium py-8 text-center w-full">Aucun opérateur disponible pour le moment.</p>
              )}
            </div>

            {/* Gradient fade on scroll edges (desktop) */}
            <div className="hidden sm:block absolute left-0 top-0 bottom-8 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="hidden sm:block absolute right-0 top-0 bottom-8 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </section>

        {/* Footer strip */}
        <div className="border-t border-slate-100 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
          <span className="font-medium">© 2026 FlashSim. Tous droits réservés.</span>
          <div className="flex gap-4 sm:gap-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Système Opérationnel
            </span>
            <span>Support 24/7</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;
