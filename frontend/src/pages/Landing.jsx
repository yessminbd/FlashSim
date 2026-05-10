import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/operators/');
        const data = await res.json();
        setOperators(data);
      } catch (e) {
        console.error("Failed to fetch operators:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, []);

  return (
    <main className="relative min-h-[80vh] overflow-hidden">
      {/* Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-orb absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="animate-float-slow absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', animationDelay: '3s' }} />
      </div>

      <div className="flex flex-col items-center justify-center text-center pt-12 pb-20 space-y-12">
        
        <div className="animate-fade-in space-y-6 max-w-4xl px-4">
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tight text-slate-900 animate-stagger-1">
              Recharge <span className="text-gradient animate-text-shine">ultra-rapide</span>
            </h1>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight text-slate-400 animate-stagger-3">
              de votre carte SIM.
            </h1>
          </div>

          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto animate-fade-in-delayed leading-relaxed">
            La solution la plus simple pour recharger vos opérateurs préférés en quelques secondes. 
            Instantané et disponible partout.
          </p>
        </div>

        <div className="animate-fade-in-delayed flex flex-col items-center gap-6">
          <button 
            onClick={() => navigate('/start-recharge')}
            className="btn-primary px-10 py-5 text-lg font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-105 transition-all duration-300 text-white"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" />
            </svg>
            Commencer une Recharge
          </button>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { label: 'Pays', value: '12+' },
              { label: 'Opérateurs', value: '40+' },
              { label: 'Dispo', value: '99.9%' },
            ].map((s) => (
              <div key={s.label} className="stat-card px-8 py-4">
                <span className="text-3xl font-black text-gradient">{s.value}</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operators Section */}
      <section className="animate-fade-in-delayed mt-10 mb-20 px-4">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Opérateurs Partenaires</h2>
          <div className="w-12 h-1 bg-primary/20 rounded-full" />
        </div>
        
        <div className="relative group">
          <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-4 no-scrollbar scroll-smooth">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 h-32 bg-slate-100 rounded-[2rem] animate-pulse" />
              ))
            ) : (
              operators.map((op, i) => (
                <div 
                  key={op.id} 
                  className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 glass-card p-6 flex items-center justify-center group/card hover:-translate-y-2 cursor-pointer"
                  onClick={() => navigate('/start-recharge')}
                >
                  <img 
                    src={op.logo} 
                    alt={op.name} 
                    className="max-h-full max-w-full object-contain filter grayscale group-hover/card:grayscale-0 transition-all duration-500 group-hover/card:scale-110" 
                  />
                </div>
              ))
            )}
          </div>
          
          {/* Gradient shadows for scroll */}
          <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 pb-8">
        <span className="font-medium">© 2026 FlashSim. Tous droits réservés.</span>
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Système Opérationnel
          </span>
          <span>Support 24/7</span>
        </div>
      </div>
    </main>
  );
};

export default Landing;


