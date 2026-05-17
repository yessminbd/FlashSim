import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [phonePrefix, setPhonePrefix] = useState('+216');
  const [regions, setRegions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedCurrency, setSelectedCurrency] = useState('DT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'error', onClose: null });

  useEffect(() => {
    if (cartItems.length === 0) navigate('/shop');
  }, [cartItems, navigate]);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const regsRes = await api.get('/regions/');
        setRegions(regsRes.data);
        if (regsRes.data.length > 0) setPhonePrefix(regsRes.data[0].dial_code);
      } catch (e) { console.error("Error fetching regions:", e); }

      const token = localStorage.getItem('flashsim_token');
      if (token) {
        try {
          const res = await api.get('/auth/user/');
          setFormData({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
        } catch (e) { console.error("Error pre-filling checkout:", e); }
      }
    };
    fetchInitData();
  }, []);

  const exchangeRates = {
    DT:  { rate: 1,    symbol: 'DT' },
    USD: { rate: 0.32, symbol: '$'  },
    EUR: { rate: 0.29, symbol: '€'  }
  };

  const baseTotalDT = getCartTotal();
  const finalTotal = (baseTotalDT * exchangeRates[selectedCurrency].rate).toFixed(2);

  const generatePassword = () => {
    return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-5).toUpperCase() + "!";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const currentToken = localStorage.getItem('flashsim_token');
      const fullPhone = `${phonePrefix} ${formData.phone}`;
      
      if (!currentToken) {
        const randomPassword = generatePassword();
        try {
          await api.post('/auth/register/', {
            email: formData.email,
            name: formData.name,
            phone: fullPhone,
            password: randomPassword,
            password2: randomPassword
          });
          localStorage.setItem('flashsim_email', formData.email);
          localStorage.setItem('flashsim_temp_pass', randomPassword);
        } catch (regErr) {
          // If user exists, ignore
        }
      }

      if (paymentMethod === 'card') {
        // Real Stripe Checkout Redirect
        // Convert TND/DT to EUR in background because Stripe doesn't support TND directly
        const currency = selectedCurrency === 'DT' ? 'eur' : selectedCurrency.toLowerCase();
        const rate = selectedCurrency === 'DT' ? exchangeRates.EUR.rate : exchangeRates[selectedCurrency].rate;

        const stripePayload = {
          items: cartItems.map(item => {
            const unitAmount = Math.round(parseFloat(item.amount) * rate * 100); // cents
            return {
              name: `${item.operatorName} ${item.amount} TND`,
              amount: unitAmount,
              quantity: item.quantity
            };
          }),
          currency: currency,
          success_url: `http://localhost:5173/profile?success=true`,
          cancel_url: `http://localhost:5173/checkout`
        };

        const res = await api.post('/payment/create-intent/', stripePayload);
        
        // Save pending cart in localStorage for callback confirmation
        const pendingCart = cartItems.map(item => ({
          operator_id: item.operatorId,
          amount: parseFloat(item.amount),
          phone: fullPhone,
          quantity: item.quantity
        }));
        localStorage.setItem('flashsim_pending_cart', JSON.stringify(pendingCart));

        // Clear cart immediately before redirecting to Stripe
        clearCart();
        localStorage.removeItem('flashsim_cart');

        window.location.href = res.data.url;
      } else {
        // Direct Checkout (Bypass Stripe)
        const payload = {
          cart_items: cartItems.map(item => ({
            operator_id: item.operatorId,
            amount: parseFloat(item.amount),
            phone: fullPhone,
            quantity: item.quantity
          }))
        };

        const res = await api.post('/payment/checkout-direct/', payload);
        
        const successTxs = res.data.transactions && res.data.transactions.length > 0;
        const hasErrors = res.data.errors && res.data.errors.length > 0;

        if (successTxs) {
          // Clear cart immediately
          clearCart();
          localStorage.removeItem('flashsim_cart');
        }

        if (hasErrors) {
          setIsProcessing(false);
          setModalContent({
            title: "Commande partielle",
            message: "Certains articles n'ont pas pu être traités :\n\n" + res.data.errors.join("\n"),
            type: 'warning',
            onClose: successTxs ? () => navigate('/profile?success=true') : null
          });
          setModalOpen(true);
        } else if (successTxs) {
          navigate('/profile?success=true');
        } else {
          setIsProcessing(false);
        }
      }

    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
      setModalContent({
        title: "Erreur de commande",
        message: error.response?.data?.error || "Une erreur est survenue lors de la commande.",
        type: 'error',
        onClose: null
      });
      setModalOpen(true);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <>
      <div className={`py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in ${isProcessing ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Finaliser <span className="text-gradient">la commande</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-12">
          {/* Left — Recipient Info */}
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="glass-card p-5 sm:p-8 border-none shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-5 flex items-center gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Destinataire des Recharges
              </h2>

              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nom du récepteur</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 sm:px-5 sm:py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                    placeholder="Nom complet" style={{ fontSize: '16px' }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Email</label>
                    <input
                      type="email" required value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                      placeholder="exemple@email.com" style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Téléphone</label>
                    <div className="flex gap-2">
                      <select 
                        value={phonePrefix} onChange={(e) => setPhonePrefix(e.target.value)}
                        className="w-24 bg-slate-50 border border-slate-200 px-2 py-3 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none text-center"
                      >
                        {regions.map(r => <option key={r.id} value={r.dial_code}>{r.flag} {r.dial_code}</option>)}
                      </select>
                      <input
                        type="tel" required value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                        placeholder="XX XXX XXX" style={{ fontSize: '16px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-amber-800 font-bold text-xs sm:text-sm leading-relaxed">
                  <strong className="block mb-0.5">Important : Vérifiez vos informations</strong>
                  Les codes seront envoyés au destinataire par SMS et Email immédiatement.
                </p>
              </div>
            </form>
          </div>

          {/* Right — Payment & Summary */}
          <div className="w-full lg:w-[400px] xl:w-[440px] space-y-4">

            {/* Currency */}
            <div className="glass-card p-4 sm:p-6 border-none shadow-md shadow-slate-200/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
                Devise de paiement
                <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[8px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Taux en direct
                </span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['DT', 'USD', 'EUR'].map(curr => (
                  <button
                    key={curr} type="button" onClick={() => setSelectedCurrency(curr)}
                    className={`py-2.5 rounded-xl font-black text-sm transition-all border ${selectedCurrency === curr ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="glass-card p-4 sm:p-6 border-none shadow-md shadow-slate-200/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Moyen de paiement</h3>
              <div className="relative">
                <select
                  value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  <option value="direct">⚡ Paiement Direct (Simulé & Instantané)</option>
                  <option value="card">💳 Carte Bancaire (Visa/Mastercard via Stripe)</option>
                  <option value="paypal">🅿️ PayPal</option>
                  <option value="bank">🏦 Virement Bancaire</option>
                  <option value="flouci">📱 Flouci</option>
                  <option value="d17">📱 D17 (La Poste)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="glass-card p-4 sm:p-6 border-none shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Résumé de la commande</h3>

              <div className="space-y-2.5 mb-4 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-600 truncate mr-4 text-xs sm:text-sm">{item.quantity}x {item.operatorName}</span>
                    <span className="font-black text-slate-900 whitespace-nowrap text-xs sm:text-sm">{(parseFloat(item.amount) * item.quantity).toFixed(2)} DT</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Sous-total</span>
                  <span className="font-black text-slate-800">{baseTotalDT.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Frais (0%)</span>
                  <span className="font-black text-emerald-500">Gratuit</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 pb-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total à payer</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-primary block leading-none mb-0.5">
                      {finalTotal} <span className="text-lg sm:text-xl">{exchangeRates[selectedCurrency].symbol}</span>
                    </span>
                    {selectedCurrency !== 'DT' && (
                      <span className="text-[10px] font-bold text-slate-400">≈ {baseTotalDT.toFixed(2)} DT</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit" form="checkout-form" disabled={isProcessing}
                className="w-full btn-primary py-4 sm:py-5 text-base font-black shadow-xl shadow-primary/30 disabled:opacity-70 gap-3"
              >
                Payer {finalTotal} {exchangeRates[selectedCurrency].symbol}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" />
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] relative z-10 animate-scale-in shadow-2xl flex flex-col items-center max-w-sm text-center">
            <div className="w-20 h-20 mb-6 relative">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Traitement en cours...</h3>
            <p className="text-sm font-medium text-slate-500">Génération de vos recharges en toute sécurité.</p>
          </div>
        </div>
      )}

      {/* Custom Notification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setModalOpen(false)} />
          <div className="glass-card w-full sm:max-w-md p-6 sm:p-8 relative z-[3010] animate-scale-in border-none shadow-2xl rounded-3xl text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4
              ${modalContent.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}
            >
              {modalContent.type === 'warning' ? '⚠️' : '✕'}
            </div>
            <h3 className="text-xl font-black text-slate-950 mb-2">{modalContent.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 whitespace-pre-line">{modalContent.message}</p>
            <button 
              onClick={() => {
                setModalOpen(false);
                if (modalContent.onClose) modalContent.onClose();
              }}
              className="btn-primary w-full py-3.5 text-sm font-black uppercase tracking-wider rounded-2xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
