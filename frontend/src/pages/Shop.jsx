import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import api from '../services/api';

const Shop = () => {
  const { selectedRegionId, setSelectedRegionId } = useRegion();
  const [regions, setRegions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOperator, setActiveOperator] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const staticRegions = [
    { id: 1, name: 'Tunisie', flag: '🇹🇳', dial_code: '+216' },
    { id: 2, name: 'France', flag: '🇫🇷', dial_code: '+33' },
  ];
  const staticOperators = [
    { id: 1, name: 'Ooredoo', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Ooredoo_logo.svg', region: 1 },
    { id: 2, name: 'Orange', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg', region: 1 },
    { id: 3, name: 'Telecom', logo: 'https://upload.wikimedia.org/wikipedia/fr/4/4e/Tunisie_Telecom_2023.png', region: 1 },
    { id: 4, name: 'SFR', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/SFR_logo.svg', region: 2 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regionsRes, operatorsRes] = await Promise.all([
          api.get('/regions/'),
          api.get('/operators/')
        ]);
        const regionsData = regionsRes.data;
        const operatorsData = operatorsRes.data;
        setRegions(regionsData.length > 0 ? regionsData : staticRegions);
        setOperators(operatorsData.length > 0 ? operatorsData : staticOperators);
      } catch (error) {
        console.warn("Using static fallback data");
        setRegions(staticRegions);
        setOperators(staticOperators);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOperators = operators.filter(op => String(op.region) === String(selectedRegionId));
  const selectedRegionObj = regions.find(r => String(r.id) === String(selectedRegionId));
  const currency = (selectedRegionObj?.name?.toLowerCase().includes('tunis') || String(selectedRegionId) === '1') ? 'TND' : '€';

  const handleAddToCart = () => {
    addToCart({
      operatorId: activeOperator.id,
      operatorName: activeOperator.name,
      operatorLogo: activeOperator.logo_url || activeOperator.logo,
      amount,
      quantity,
      phone: 'Recharge Boutique',
      currency,
    });
    setActiveOperator(null);
    setQuantity(1);
  };

  return (
    <>
      <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
        {/* Header */}
        <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
              Boutique <span className="text-gradient">FlashSim</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base max-w-xl">
              Recharges pour <span className="text-primary font-black">{regions.find(r => String(r.id) === String(selectedRegionId))?.name || '...'}</span>. Sélectionnez un opérateur pour commencer.
            </p>
          </div>

          <button
            onClick={() => setIsSelecting(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-white border border-slate-100 rounded-2xl font-black text-xs text-slate-600 hover:text-primary hover:border-primary/50 transition-all shadow-sm group w-fit"
          >
            <span className="text-xl">{regions.find(r => String(r.id) === String(selectedRegionId))?.flag || '🌍'}</span>
            Changer région
            <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        {/* Operators Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 animate-fade-in">
            {filteredOperators.length > 0 ? (
              filteredOperators.map((op) => (
                <div
                  key={op.id}
                  onClick={() => { setActiveOperator(op); setAmount(5); setQuantity(1); }}
                  className="glass-card p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-2xl p-2 sm:p-4 flex items-center justify-center mb-3 sm:mb-4 shadow-sm border border-slate-50 group-hover:border-primary/20 transition-all">
                    <img src={op.logo_url || op.logo} alt={op.name} className="max-h-full max-w-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <h3 className="font-black text-slate-800 text-xs sm:text-sm tracking-tight text-center">{op.name}</h3>
                  <div className="mt-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 sm:py-20 text-center">
                <p className="text-slate-400 font-bold">Aucun opérateur disponible pour cette région.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Region Selection Modal */}
      {isSelecting && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsSelecting(false)} />
          <div className="glass-card w-full sm:max-w-md p-5 sm:p-8 relative z-10 animate-scale-in border-none shadow-2xl rounded-b-none sm:rounded-3xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Choisir une région</h2>
              <button onClick={() => setIsSelecting(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">✕</button>
            </div>

            <div className="relative mb-4 group">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/30 transition-all outline-none"
                style={{ fontSize: '16px' }}
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
              {regions
                .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.dial_code.includes(searchTerm))
                .map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedRegionId(String(r.id)); setIsSelecting(false); setSearchTerm(''); }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all
                    ${String(selectedRegionId) === String(r.id) ? 'bg-primary/5 border-primary' : 'bg-white border-slate-50 hover:border-primary/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.flag}</span>
                      <span className="font-black text-slate-800 text-sm">{r.name}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${String(selectedRegionId) === String(r.id) ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                      {r.dial_code}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Operator recharge modal */}
      {activeOperator && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setActiveOperator(null)} />
          <div className="glass-card w-full sm:max-w-2xl p-5 sm:p-10 relative z-10 animate-scale-in border-none shadow-2xl shadow-primary/20 rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl p-2 sm:p-3 flex items-center justify-center shadow-md flex-shrink-0">
                <img src={activeOperator.logo_url || activeOperator.logo} alt={activeOperator.name} className="max-h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{activeOperator.name}</h2>
                <p className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Configuration de recharge</p>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Amount */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choisir le montant</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[5, 10, 20, 50, 100].map(val => {
                    const isAvailable = true;
                    return (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        disabled={!isAvailable}
                        title={!isAvailable ? 'Rupture de stock' : ''}
                        className={`py-2.5 sm:py-3 rounded-xl font-black text-sm transition-all border relative
                          ${!isAvailable ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 
                          amount === val ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-primary/30'}`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span>{val} <span className="text-[10px] opacity-70">{currency}</span></span>
                          {!isAvailable && <span className="text-[8px] text-red-500 uppercase mt-0.5">Épuisé</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quantité</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl font-black text-slate-400 hover:text-primary hover:shadow-md transition-all"
                  >-</button>
                  <div className="flex-1 text-center font-black text-2xl text-slate-800">{quantity}</div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl font-black text-slate-400 hover:text-primary hover:shadow-md transition-all"
                  >+</button>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total à payer</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">{amount * quantity} <span className="text-base sm:text-lg">{currency}</span></p>
                </div>
                <button onClick={handleAddToCart} className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-sm font-black shadow-xl shadow-primary/20">
                  Ajouter au Panier
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveOperator(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-md group"
              aria-label="Fermer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Shop;
