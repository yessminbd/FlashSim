import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const navigate = useNavigate();

  // Redirection si le panier est vide
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedCurrency, setSelectedCurrency] = useState('DT');
  const [isProcessing, setIsProcessing] = useState(false);

  // Taux de change simulés (Banque Centrale)
  const exchangeRates = {
    DT: { rate: 1, symbol: 'DT' },
    USD: { rate: 0.32, symbol: '$' },
    EUR: { rate: 0.29, symbol: '€' }
  };

  const baseTotalDT = getCartTotal(); // On assume que le total de base calculé est en DT
  const finalTotal = (baseTotalDT * exchangeRates[selectedCurrency].rate).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert('Simulation : Redirection vers le portail de paiement sécurisé...');
    }, 1500);
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in relative z-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Finaliser <span className="text-gradient">la commande</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column: Recipient Info */}
        <div className="flex-1 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="glass-card p-6 sm:p-10 border-none shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Destinataire des Recharges
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nom du récepteur</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="Nom complet du récepteur"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Email de réception</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                    placeholder="exemple@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Numéro de téléphone</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                    placeholder="XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
              <svg className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-amber-800 font-bold text-sm leading-relaxed">
                <strong className="block mb-1">Important : Vérifiez vos informations</strong>
                Les codes/tickets de recharge seront envoyés immédiatement au destinataire par <span className="underline">SMS</span> et par <span className="underline">Email</span>. Toute erreur de saisie ne pourra pas être remboursée.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Payment & Order Summary */}
        <div className="w-full lg:w-[450px] space-y-6">
          
          {/* Currency Selection (Real time simulation) */}
          <div className="glass-card p-6 border-none shadow-md shadow-slate-200/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
              Devise de paiement
              <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[8px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Taux en direct (BCT)
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {['DT', 'USD', 'EUR'].map(curr => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`py-3 rounded-xl font-black text-sm transition-all border
                    ${selectedCurrency === curr ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6 border-none shadow-md shadow-slate-200/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Moyen de paiement</h3>
            <div className="relative group">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="card">💳 Carte Bancaire (Visa/Mastercard)</option>
                <option value="paypal">🅿️ PayPal</option>
                <option value="bank">🏦 Compte Bancaire (Virement)</option>
                <option value="flouci">📱 Flouci</option>
                <option value="d17">📱 D17 (La Poste)</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass-card p-6 border-none shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Résumé de la commande</h3>
            
            <div className="space-y-4 mb-6 max-h-[150px] overflow-y-auto pr-2 no-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600 truncate mr-4">{item.quantity}x {item.operatorName}</span>
                  <span className="font-black text-slate-900 whitespace-nowrap">{(parseFloat(item.amount) * item.quantity).toFixed(2)} DT</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500">Sous-total (Base)</span>
                <span className="font-black text-slate-800">{baseTotalDT.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500">Frais de service (0%)</span>
                <span className="font-black text-emerald-500">Gratuit</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 pb-6">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total à payer</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-primary block leading-none mb-1">
                    {finalTotal} <span className="text-xl">{exchangeRates[selectedCurrency].symbol}</span>
                  </span>
                  {selectedCurrency !== 'DT' && (
                    <span className="text-[10px] font-bold text-slate-400">
                      ≈ {baseTotalDT.toFixed(2)} DT
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full btn-primary py-5 text-lg font-black shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Payer {finalTotal} {exchangeRates[selectedCurrency].symbol}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
