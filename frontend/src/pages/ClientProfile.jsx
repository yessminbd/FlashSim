import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ClientProfile = () => {
  const navigate = useNavigate();
  
  // Read URL params to determine initial tab
  const params = new URLSearchParams(window.location.search);
  const initialTab = (params.get('success') === 'true' || params.get('session_id')) ? 'transactions' : 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [transactions, setTransactions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [claimSubject, setClaimSubject] = useState('Problème de recharge non reçue');
  const [claimMessage, setClaimMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    const role = localStorage.getItem('flashsim_role');
    if (role !== 'client') {
      navigate('/login');
    } else {
      const loadProfileData = async () => {
        try {
          // Verify payment if redirected from Stripe
          const params = new URLSearchParams(window.location.search);
          const sessionId = params.get('session_id');
          if (sessionId) {
            const pendingCart = JSON.parse(localStorage.getItem('flashsim_pending_cart') || '[]');
            if (pendingCart.length > 0) {
              await api.post('/payment/confirm/', { session_id: sessionId, cart_items: pendingCart });
              localStorage.removeItem('flashsim_pending_cart');
              // Clear cart in local storage
              localStorage.removeItem('flashsim_cart');
              // Clean URL
              window.history.replaceState({}, document.title, window.location.pathname);
              setAlertModal({
                show: true,
                title: "Paiement validé avec succès !",
                message: "Félicitations, votre commande a été traitée. Les codes de recharge ont été générés et sont disponibles dans votre historique ci-dessous.",
                type: 'success'
              });
            }
          }

          const userRes = await api.get('/auth/me/');
          setUserData(userRes.data);
          const txRes = await api.get('/transactions/');
          setTransactions(txRes.data);
          const claimRes = await api.get('/claims/');
          setClaims(claimRes.data);
          
          if (sessionId) setActiveTab('transactions'); // Switch to transactions to show codes
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      loadProfileData();
    }
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/me/', { name: userData.name, phone: userData.phone });
      setAlertModal({
        show: true,
        title: "Profil mis à jour",
        message: "Vos informations de profil ont été enregistrées avec succès !",
        type: 'success'
      });
    } catch (e) {
      setAlertModal({
        show: true,
        title: "Erreur",
        message: "Une erreur est survenue lors de la mise à jour de votre profil.",
        type: 'error'
      });
    }
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      show: true,
      title: "Supprimer définitivement ?",
      message: "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        try {
          await api.delete('/auth/delete-account/');
          setAlertModal({
            show: true,
            title: "Compte supprimé",
            message: "Votre compte a été supprimé avec succès.",
            type: 'success',
            onClose: () => {
              ['flashsim_role', 'flashsim_access', 'flashsim_refresh', 'flashsim_email'].forEach(k => localStorage.removeItem(k));
              navigate('/');
            }
          });
        } catch (e) {
          setAlertModal({
            show: true,
            title: "Erreur",
            message: "Erreur lors de la suppression de votre compte.",
            type: 'error'
          });
        }
      }
    });
  };

  const handleNewComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/claims/', { subject: claimSubject, message: claimMessage });
      setAlertModal({
        show: true,
        title: "Réclamation envoyée !",
        message: "Votre réclamation a été transmise avec succès au support client.",
        type: 'success'
      });
      const claimRes = await api.get('/claims/');
      setClaims(claimRes.data);
      setClaimMessage('');
    } catch (e) {
      setAlertModal({
        show: true,
        title: "Erreur d'envoi",
        message: "Une erreur est survenue lors de l'envoi de votre réclamation. Veuillez réessayer.",
        type: 'error'
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { id: 'transactions', label: 'Historique', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
    { id: 'complaints', label: 'Support', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    )},
  ];

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="mb-6 sm:mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
          Mon <span className="text-gradient">Espace Client</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base">Gérez vos informations, recharges et réclamations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-8">

        {/* Sidebar tabs */}
        <div className="w-full md:w-52 lg:w-64 flex-shrink-0">
          {/* Mobile: horizontal tabs */}
          <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all text-sm ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical tabs */}
          <div className="hidden md:flex flex-col space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 lg:px-5 py-3 lg:py-4 rounded-2xl font-bold transition-all flex items-center gap-3 text-sm ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {tab.icon}
                {tab.id === 'profile' ? 'Mes Informations' : tab.id === 'transactions' ? 'Historique Achats' : 'Support & Réclamations'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 glass-card p-5 sm:p-8 lg:p-10 border-none shadow-xl shadow-slate-200/50 min-h-[400px]">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-5 sm:mb-6">Paramètres du compte</h2>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nom complet</label>
                      <input
                        type="text" value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Téléphone</label>
                      <input
                        type="tel" value={userData.phone || ''}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Email</label>
                    <input
                      type="email" value={userData.email} readOnly
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button type="submit" className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3">Enregistrer</button>
                  </div>
                </form>
              )}

              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-red-100">
                <h3 className="text-base sm:text-lg font-black text-red-600 mb-2">Zone de danger</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-4">Une fois votre compte supprimé, il n'y a pas de retour en arrière.</p>
                <button onClick={handleDeleteAccount} className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all text-sm">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-5 sm:mb-6">Historique des transactions</h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <th className="py-3 pr-4">ID</th>
                        <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                        <th className="py-3 px-4">Opérateur</th>
                        <th className="py-3 px-4">Montant</th>
                        <th className="py-3 px-4">Code de Recharge</th>
                        <th className="py-3 pl-4 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4 font-bold text-slate-800 text-sm">#{tx.id}</td>
                          <td className="py-3 px-4 text-slate-500 text-xs hidden sm:table-cell">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="py-3 px-4 font-bold text-slate-700 text-sm">{tx.operator_name || tx.operator}</td>
                          <td className="py-3 px-4 font-black text-primary text-sm">{tx.amount} DT</td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600 text-sm">{tx.pin_code || '---'}</td>
                          <td className="py-3 pl-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {tx.status === 'success' ? 'Succès' : 'Échoué'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="font-bold">Aucune transaction pour le moment.</p>
                </div>
              )}
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'complaints' && (
            <div className="animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-5 sm:mb-6">Réclamations & Support</h2>

              {/* Existing claims */}
              {claims.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Mes tickets récents</h3>
                  <div className="space-y-2.5">
                    {claims.map(comp => (
                      <div key={comp.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-sm gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{comp.subject}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(comp.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {comp.status === 'resolved' ? 'Résolu' : 'En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New claim form */}
              <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <h3 className="font-black text-slate-800 mb-4 text-sm sm:text-base">Nouvelle réclamation</h3>
                <form onSubmit={handleNewComplaint} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Sujet</label>
                    <select
                      value={claimSubject} onChange={(e) => setClaimSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 focus:border-primary outline-none"
                      style={{ fontSize: '16px' }}
                    >
                      <option>Problème de recharge non reçue</option>
                      <option>Erreur de paiement</option>
                      <option>Problème technique avec l'application</option>
                      <option>Autre demande</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Message</label>
                    <textarea
                      required value={claimMessage} onChange={(e) => setClaimMessage(e.target.value)}
                      rows="4"
                      className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-800 focus:border-primary outline-none resize-none text-sm"
                      placeholder="Décrivez votre problème avec le maximum de détails..."
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary py-3 text-sm font-black">Envoyer la réclamation</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Custom Alert Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => {
            setAlertModal(prev => ({ ...prev, show: false }));
            if (alertModal.onClose) alertModal.onClose();
          }} />
          <div className="glass-card w-full sm:max-w-md p-8 relative z-10 animate-scale-in border-none shadow-2xl rounded-3xl text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${alertModal.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}>
              {alertModal.type === 'success' ? '✓' : '✕'}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{alertModal.title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 whitespace-pre-line">{alertModal.message}</p>
            <button onClick={() => {
              setAlertModal(prev => ({ ...prev, show: false }));
              if (alertModal.onClose) alertModal.onClose();
            }} className="w-full py-3.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-lg">
              Compris
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} />
          <div className="glass-card w-full sm:max-w-md p-8 relative z-10 animate-scale-in border-none shadow-2xl rounded-3xl text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 whitespace-pre-line">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} className="flex-1 py-3 font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
                Annuler
              </button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg shadow-red-200">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
