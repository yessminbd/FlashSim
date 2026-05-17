import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import api from '../services/api';

const RechargeForm = () => {
  const navigate = useNavigate();
  const { selectedRegionId, setSelectedRegionId } = useRegion();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/regions/');
        const data = res.data;
        setRegions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedRegion = regions.find(r => String(r.id) === String(selectedRegionId));

  const handleStart = (e) => {
    e.preventDefault();
    if (selectedRegionId) {
      navigate('/recharge', { state: { regionId: selectedRegionId } });
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-16 items-start">

        {/* LEFT COLUMN — explanation (desktop only) */}
        <div className="order-2 lg:order-1 animate-fade-in-left space-y-6 hidden lg:block">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Votre recharge en <span className="text-gradient">quelques clics.</span>
            </h2>
            <p className="text-slate-500 text-base font-medium">Rapide, sans frais cachés et instantané.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { num: '01', title: 'Identification', desc: 'Entrez votre numéro et pays.', icon: '📱' },
              { num: '02', title: 'Opérateur', desc: 'Choisissez votre réseau.', icon: '📶' },
              { num: '03', title: 'Montant', desc: 'Sélectionnez le forfait.', icon: '💰' },
              { num: '04', title: 'Validation', desc: 'Recevez votre code.', icon: '💳' },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{s.num}</span>
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">{s.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — form */}
        <div className="order-1 lg:order-2 animate-fade-in relative">
          <div className="absolute inset-0 rounded-[2.5rem] opacity-20 blur-3xl -z-10 animate-glow-pulse"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />

          <div className="glass-card p-6 sm:p-10 border-none shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/20">
                <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-current text-white">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Commencer</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Recharge instantanée 24/7</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleStart} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-[10px]">1</span>
                    Région
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedRegionId}
                      onChange={(e) => setSelectedRegionId(e.target.value)}
                      className="select-dark w-full appearance-none pr-10 pl-4 sm:pl-6 py-3 sm:py-4 text-base font-bold group-hover:border-primary/50 transition-all shadow-sm"
                    >
                      <option value="" disabled hidden>Sélectionner région</option>
                      {regions.map(r => (
                        <option key={r.id} value={String(r.id)}>
                          {r.flag} {r.name} — {r.dial_code}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!selectedRegionId}
                    className="btn-primary w-full py-4 sm:py-5 text-sm sm:text-base font-black gap-3 disabled:opacity-30 shadow-2xl shadow-primary/20 group active:scale-95"
                  >
                    <span>Continuer vers les opérateurs</span>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Mobile steps */}
          <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
            {[
              { num: '01', title: 'Pays', icon: '📱' },
              { num: '02', title: 'Opérateur', icon: '📶' },
              { num: '03', title: 'Montant', icon: '💰' },
              { num: '04', title: 'Code', icon: '💳' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-white/50 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest block">{s.num}</span>
                  <span className="text-xs font-black text-slate-700">{s.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeForm;
