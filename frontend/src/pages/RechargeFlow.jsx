import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

// Data will be fetched from backend

const RechargeFlow = () => {
  const location = useLocation();
  const [regions, setRegions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [step, setStep] = useState('region');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(null);
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'error' });
  const [operatorSearch, setOperatorSearch] = useState('');

  const handlePhoneChange = (val) => {
    if (/[a-zA-Z]/.test(val)) {
      setModalContent({
        title: "Chiffres uniquement",
        message: "Le numéro de téléphone ne peut pas contenir de lettres ou de caractères textuels.",
        type: "error"
      });
      setModalOpen(true);
      setPhoneNumber(val.replace(/[^0-9+]/g, ''));
    } else {
      setPhoneNumber(val);
    }
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) {
      setModalContent({
        title: "Numéro manquant",
        message: "Veuillez saisir votre numéro de téléphone avant de continuer.",
        type: "error"
      });
      setModalOpen(true);
      return;
    }

    const rawPhone = phoneNumber.replace(/\s/g, '');
    if (!/^\+?\d+$/.test(rawPhone)) {
      setModalContent({
        title: "Numéro invalide",
        message: "Le numéro de téléphone ne doit contenir que des chiffres. Les lettres et caractères spéciaux ne sont pas autorisés.",
        type: "error"
      });
      setModalOpen(true);
      return;
    }

    if (rawPhone.length < 6 || rawPhone.length > 15) {
      setModalContent({
        title: "Longueur invalide",
        message: "Veuillez saisir un numéro de téléphone valide (entre 6 et 15 chiffres).",
        type: "error"
      });
      setModalOpen(true);
      return;
    }

    setStep('amount');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regionsRes, operatorsRes] = await Promise.all([
          api.get('/regions/'),
          api.get('/operators/')
        ]);
        const regionsData = regionsRes.data;
        const operatorsData = operatorsRes.data;
        setRegions(regionsData);
        setOperators(operatorsData);

        // Handle initial state from Landing page
        if (location.state) {
          const { regionId, operatorId, phone } = location.state;
          if (regionId) setSelectedRegion(parseInt(regionId));
          if (operatorId) {
            const op = operatorsData.find(o => o.id === parseInt(operatorId));
            setSelectedOperator(op);
          }
          if (phone) setPhoneNumber(phone);
          if (regionId && operatorId && phone) {
            setStep('amount');
          }
        }
      } catch (error) {
        console.error("Error fetching recharge data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.state]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Convert DT/TND to EUR in background because Stripe doesn't support TND directly
      const stripePayload = {
        items: [{
          name: `Recharge ${selectedOperator?.name} ${amount} TND`,
          amount: Math.round(parseFloat(amount) * 0.29 * 100), // cents (converted from TND to EUR at 0.29 rate)
          quantity: 1
        }],
        currency: 'eur',
        success_url: `http://localhost:5173/profile?success=true`,
        cancel_url: `http://localhost:5173/recharge`
      };

      const res = await api.post('/payment/create-intent/', stripePayload);

      // Save pending cart in localStorage for callback confirmation
      const pendingCart = [{
        operator_id: selectedOperator.id,
        amount: parseFloat(amount),
        phone: phoneNumber,
        quantity: 1
      }];
      localStorage.setItem('flashsim_pending_cart', JSON.stringify(pendingCart));

      window.location.href = res.data.url;
    } catch (error) {
      console.error("Payment error:", error);
      setModalContent({
        title: "Erreur Réseau / Serveur",
        message: error.response?.data?.error || "Erreur lors de la redirection vers Stripe. Vérifiez le backend.",
        type: 'error'
      });
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredOperators = operators.filter(op => 
    op.region === selectedRegion &&
    op.name.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  return (
    <div className="py-4 sm:py-6 max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-12 items-start">
        
        {/* LEFT/TOP COLUMN: STEPS */}
        {step !== 'pin' && (
          <div className="w-full lg:sticky lg:top-20 animate-fade-in-left">
            <div className="glass-card p-4 lg:p-6 border-none shadow-xl shadow-primary/5">
              <div className="mb-4 hidden lg:block">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Progression</h2>
                <div className="w-8 h-0.5 bg-primary/20 rounded-full" />
              </div>

              <div className="flex flex-row lg:flex-col justify-between lg:justify-start lg:space-y-6 relative">
                {/* Vertical Line (Desktop only) */}
                <div className="hidden lg:block absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 -z-10">
                  <div 
                    className="absolute top-0 left-0 w-full bg-primary transition-all duration-700 ease-out" 
                    style={{ height: step === 'region' ? '0%' : step === 'operator' ? '25%' : step === 'phone' ? '50%' : step === 'amount' ? '75%' : '100%' }}
                  />
                </div>

                {[
                  { id: 'region', label: 'Région', icon: '🌍' },
                  { id: 'operator', label: 'Opérateur', icon: '📶' },
                  { id: 'phone', label: 'Numéro', icon: '📱' },
                  { id: 'amount', label: 'Montant', icon: '💰' },
                  { id: 'payment', label: 'Paiement', icon: '💳' },
                ].map((s, idx) => {
                  const stepOrder = ['region', 'operator', 'phone', 'amount', 'payment'];
                  const isActive = step === s.id;
                  const isCompleted = stepOrder.indexOf(step) > idx;
                  
                  return (
                    <div key={s.id} className={`flex flex-col lg:flex-row items-center gap-2 lg:gap-4 transition-all duration-500 ${isActive ? 'scale-105' : 'opacity-40'}`}>
                      <div className={`relative z-10 w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center text-sm lg:text-base transition-all duration-500 border shadow-sm flex-shrink-0
                        ${isActive ? 'bg-primary text-white border-white' : 
                          isCompleted ? 'bg-emerald-500 text-white border-white' : 'bg-white text-slate-300 border-slate-50'}`}
                      >
                        {isCompleted ? '✓' : s.icon}
                      </div>
                      <span className={`text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-center lg:text-left ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT/BOTTOM COLUMN: RECHARGE CONTENT */}
        <div className="w-full min-h-[400px] flex flex-col items-center">
          
          {step === 'region' && (
            <section className="animate-fade-in w-full text-center lg:text-left">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-4xl font-black mb-2 text-slate-900 tracking-tight leading-tight">Où recharger ?</h2>
                <p className="text-slate-500 text-xs lg:text-sm font-medium">Choisissez le pays de destination.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 lg:gap-4">
                {regions.map((r, i) => (
                  <div 
                    key={r.id} 
                    onClick={() => { setSelectedRegion(r.id); setStep('operator'); }}
                    className="glass-card p-4 lg:p-8 cursor-pointer group hover:-translate-y-1 animate-stagger-1 text-center"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="text-4xl lg:text-5xl mb-3 group-hover:scale-110 transition-transform duration-500 inline-block">{r.flag}</div>
                    <h3 className="text-base lg:text-xl font-black text-slate-800">{r.name}</h3>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full mt-2">
                      <span className="text-primary font-black text-[8px] lg:text-[10px] uppercase tracking-widest">{r.dial_code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === 'operator' && (
            <section className="animate-fade-in w-full text-center lg:text-left">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-4xl font-black mb-2 text-slate-900 tracking-tight leading-tight">Quel opérateur ?</h2>
                <p className="text-slate-500 text-xs lg:text-sm font-medium">Réseaux disponibles en {regions.find(r => r.id === selectedRegion)?.name}.</p>
              </div>

              {/* Premium Search Input */}
              <div className="mb-6 max-w-md mx-auto lg:mx-0">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={operatorSearch}
                    onChange={(e) => setOperatorSearch(e.target.value)}
                    placeholder="Rechercher un opérateur..."
                    className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                    style={{ fontSize: '15px' }}
                  />
                  {operatorSearch && (
                    <button 
                      onClick={() => setOperatorSearch('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 font-black"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {filteredOperators.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
                  {filteredOperators.map((op, i) => (
                    <div 
                      key={op.id} 
                      className="glass-card p-3 lg:p-5 cursor-pointer flex flex-col items-center justify-center hover:-translate-y-1 group animate-stagger-1"
                      style={{ animationDelay: `${i * 0.1}s` }}
                      onClick={() => { setSelectedOperator(op); setStep('phone'); }}
                    >
                      <div className="bg-white p-3 rounded-xl mb-3 w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center border border-slate-50 shadow-sm">
                        <img src={op.logo} alt={op.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-black text-[10px] lg:text-sm text-slate-800">{op.name}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center max-w-md mx-auto lg:mx-0">
                  <p className="text-slate-400 font-bold text-sm">Aucun opérateur ne correspond à "{operatorSearch}".</p>
                </div>
              )}
              <button onClick={() => setStep('region')} className="mt-6 lg:mt-8 px-4 py-2 rounded-lg text-slate-400 hover:text-primary font-black flex items-center gap-2 mx-auto lg:mx-0 uppercase tracking-widest text-[9px]">
                ← Retour
              </button>
            </section>
          )}

          {step === 'phone' && (
            <section className="animate-fade-in w-full max-w-lg">
              <div className="mb-6 lg:mb-8 text-center">
                <h2 className="text-2xl lg:text-4xl font-black mb-2 text-slate-900 tracking-tight leading-tight">Quel numéro ?</h2>
                <p className="text-slate-500 text-xs lg:text-sm font-medium">Entrez le numéro {selectedOperator?.name} à recharger.</p>
              </div>
              
              <div className="glass-card p-6 lg:p-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                    <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm overflow-hidden">
                      {selectedOperator?.logo_url ? (
                        <img 
                          src={selectedOperator.logo_url} 
                          alt="logo" 
                          className="max-h-full object-contain" 
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-slate-300 font-black text-sm uppercase ${selectedOperator?.logo_url ? 'hidden' : ''}`}>
                        {selectedOperator?.name?.[0]}
                      </div>
                    </div>
                    <span className="font-black text-slate-800 text-sm uppercase tracking-widest">{selectedOperator?.name}</span>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary text-base pointer-events-none pr-3 border-r border-slate-200">
                      {regions.find(r => r.id === selectedRegion)?.dial_code || '+···'}
                    </div>
                    <input
                      type="tel"
                      placeholder="00 00 00 00"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="input-dark w-full pl-24 pr-5 py-4 text-xl font-black tracking-widest"
                      autoFocus
                      required
                    />
                  </div>

                  <button 
                    onClick={handlePhoneSubmit}
                    className="btn-primary w-full py-4 text-base font-black flex items-center justify-center gap-3 disabled:opacity-50"
                    disabled={!phoneNumber}
                  >
                    <span>Continuer</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <button onClick={() => setStep('operator')} className="mt-6 lg:mt-8 px-4 py-2 rounded-lg text-slate-400 hover:text-primary font-black flex items-center gap-2 mx-auto lg:mx-0 uppercase tracking-widest text-[9px]">
                ← Retour
              </button>
            </section>
          )}

          {step === 'amount' && (
            <section className="animate-fade-in w-full text-center lg:text-left">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-4xl font-black mb-2 text-slate-900 tracking-tight leading-tight">Quel montant ?</h2>
                <p className="text-slate-500 text-xs lg:text-sm font-medium">Recharge pour {phoneNumber}.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                {[5, 10, 20, 50].map((val, i) => {
                  const isAvailable = true;
                  return (
                    <button 
                      key={val} 
                      onClick={() => { setAmount(val); setStep('payment'); }}
                      className={`glass-card p-4 lg:p-6 border border-transparent hover:border-primary/50 group animate-stagger-1 text-center ${!isAvailable ? 'opacity-40 cursor-not-allowed bg-slate-100 hover:border-transparent' : ''}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                      disabled={!isAvailable}
                      title={!isAvailable ? 'Rupture de stock pour ce montant' : ''}
                    >
                      <span className={`block text-2xl lg:text-3xl font-black mb-1 ${!isAvailable ? 'text-slate-400' : 'text-primary'}`}>{val}</span>
                      <span className="text-slate-400 font-black uppercase tracking-widest text-[8px] lg:text-[10px]">{selectedRegion === 1 ? 'DT' : 'EUR'}</span>
                      {!isAvailable && <span className="block text-[8px] text-red-500 font-bold mt-1 uppercase tracking-wider">Épuisé</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep('phone')} className="mt-6 lg:mt-8 px-4 py-2 rounded-lg text-slate-400 hover:text-primary font-black flex items-center gap-2 mx-auto lg:mx-0 uppercase tracking-widest text-[9px]">
                ← Retour
              </button>
            </section>
          )}

          {step === 'payment' && (
            <section className="animate-fade-in w-full">
              <div className="max-w-xl mx-auto lg:mx-0">
                <div className="mb-6 text-center lg:text-left">
                  <h2 className="text-2xl lg:text-4xl font-black mb-2 text-slate-900 tracking-tight leading-tight">Vérification</h2>
                  <p className="text-slate-500 text-xs lg:text-sm font-medium">Dernier coup d'œil.</p>
                </div>

                <div className="glass-card p-4 lg:p-8 shadow-xl shadow-primary/5">
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex flex-row items-center justify-between gap-4 p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm">
                          <img src={selectedOperator?.logo} alt="logo" className="max-h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Opérateur</p>
                          <p className="text-sm lg:text-lg font-black text-slate-800">{selectedOperator?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Numéro</p>
                        <p className="text-sm lg:text-lg font-black text-slate-800">{phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                      <span className="text-slate-500 font-bold text-sm lg:text-base">Total</span>
                      <div className="text-right">
                        <span className="text-2xl lg:text-3xl font-black text-primary">{amount}</span>
                        <span className="text-xs lg:text-sm font-black text-primary ml-1 uppercase">{selectedRegion === 1 ? 'DT' : 'EUR'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-black rounded-lg text-[10px] lg:text-xs">
                        💳 Carte
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-100 text-slate-600 font-black rounded-lg text-[10px] lg:text-xs">
                        📱 Wallet
                      </button>
                    </div>

                    <button 
                      onClick={handlePayment} 
                      disabled={loading} 
                      className="btn-primary w-full py-4 text-sm lg:text-lg font-black flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <div className="w-4 h-4 lg:w-5 lg:h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Payer maintenant</span>
                      )}
                    </button>
                  </div>
                </div>

                <button onClick={() => setStep('amount')} className="mt-6 lg:mt-8 px-4 py-2 rounded-lg text-slate-400 hover:text-primary font-black flex items-center gap-2 mx-auto lg:mx-0 uppercase tracking-widest text-[9px]">
                  ← Modifier
                </button>
              </div>
            </section>
          )}

          {step === 'pin' && (
            <section className="animate-fade-in w-full flex items-center justify-center">
              <div className="glass-card p-6 lg:p-12 text-center max-w-md w-full border-none shadow-xl shadow-emerald-500/10">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-3xl lg:text-4xl mx-auto mb-4 shadow-lg animate-scale-in">
                  ✓
                </div>
                <h2 className="text-2xl lg:text-3xl font-black mb-3 text-slate-900 tracking-tight">Réussi !</h2>
                <p className="text-slate-500 text-[10px] lg:text-sm font-medium mb-6">Votre code de recharge :</p>
                <div className="bg-white p-4 lg:p-6 rounded-xl font-mono text-xl lg:text-3xl font-black tracking-widest text-slate-800 border-2 border-dashed border-emerald-100 mb-8 shadow-inner">
                  {pinCode}
                </div>
                <Link to="/" className="btn-primary inline-flex py-3 px-10 text-sm lg:text-lg">ACCUEIL</Link>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Custom Notification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setModalOpen(false)} />
          <div className="glass-card w-full sm:max-w-md p-6 sm:p-8 relative z-[3010] animate-scale-in border-none shadow-2xl rounded-3xl text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 bg-rose-500/10 text-rose-500`}
            >
              ✕
            </div>
            <h3 className="text-xl font-black text-slate-950 mb-2">{modalContent.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 whitespace-pre-line">{modalContent.message}</p>
            <button 
              onClick={() => setModalOpen(false)}
              className="btn-primary w-full py-3.5 text-sm font-black uppercase tracking-wider rounded-2xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargeFlow;
