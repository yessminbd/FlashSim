import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Simulation de données utilisateur
  const [userData, setUserData] = useState({
    name: 'Mohamed Ali',
    email: 'mohamed@exemple.com',
    phone: '+216 55 123 456',
  });

  // Simulation d'historique de transactions
  const transactions = [
    { id: 'TX-9821', date: '10 Mai 2026', amount: '20.00 DT', operator: 'Ooredoo', status: 'Succès' },
    { id: 'TX-8743', date: '02 Mai 2026', amount: '5.00 DT', operator: 'Telecom', status: 'Succès' },
    { id: 'TX-7622', date: '15 Avr 2026', amount: '50.00 DT', operator: 'Orange', status: 'Échoué' },
  ];

  // Simulation de réclamations
  const complaints = [
    { id: 'REC-112', date: '16 Avr 2026', subject: 'Recharge non reçue', status: 'Résolu' },
    { id: 'REC-145', date: '11 Mai 2026', subject: 'Problème de paiement', status: 'En attente' },
  ];

  useEffect(() => {
    // Vérifier si l'utilisateur est bien un client (sécurité basique frontend)
    const role = localStorage.getItem('flashsim_role');
    if (role !== 'user') {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('Vos informations ont été mises à jour avec succès.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")) {
      alert('Votre compte a été supprimé.');
      localStorage.removeItem('flashsim_role');
      navigate('/');
    }
  };

  const handleNewComplaint = (e) => {
    e.preventDefault();
    alert('Votre réclamation a été envoyée. Notre équipe vous répondra sous 24h.');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Mon <span className="text-gradient">Espace Client</span>
        </h1>
        <p className="text-slate-500 font-medium">Gérez vos informations, suivez vos recharges et contactez le support.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Mes Informations
          </button>
          
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeTab === 'transactions' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Historique Achats
          </button>
          
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeTab === 'complaints' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Support & Réclamations
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card p-6 sm:p-10 border-none shadow-xl shadow-slate-200/50">
          
          {/* TAB 1 : PROFIL */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Paramètres du compte</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nom complet</label>
                    <input 
                      type="text" 
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Numéro de téléphone</label>
                    <input 
                      type="tel" 
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Adresse Email</label>
                  <input 
                    type="email" 
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button type="submit" className="btn-primary px-8 py-3">Enregistrer les modifications</button>
                </div>
              </form>

              <div className="mt-12 pt-8 border-t border-red-100">
                <h3 className="text-lg font-black text-red-600 mb-2">Zone de danger</h3>
                <p className="text-slate-500 text-sm mb-4">Une fois votre compte supprimé, il n'y a pas de retour en arrière possible. Soyez certain.</p>
                <button onClick={handleDeleteAccount} className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 : TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Historique des transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-4 pr-4">ID Transaction</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Opérateur</th>
                      <th className="py-4 px-4">Montant</th>
                      <th className="py-4 pl-4 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 pr-4 font-bold text-slate-800">{tx.id}</td>
                        <td className="py-4 px-4 text-slate-500 text-sm">{tx.date}</td>
                        <td className="py-4 px-4 font-bold text-slate-700">{tx.operator}</td>
                        <td className="py-4 px-4 font-black text-primary">{tx.amount}</td>
                        <td className="py-4 pl-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${tx.status === 'Succès' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3 : COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Réclamations & Support</h2>
              
              <div className="mb-10">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Mes tickets récents</h3>
                <div className="space-y-3">
                  {complaints.map(comp => (
                    <div key={comp.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-800">{comp.subject}</span>
                          <span className="text-xs text-slate-400 font-medium">({comp.id})</span>
                        </div>
                        <p className="text-xs text-slate-500">Ouvert le {comp.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${comp.status === 'Résolu' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {comp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <h3 className="font-black text-slate-800 mb-4">Nouvelle réclamation</h3>
                <form onSubmit={handleNewComplaint} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Sujet de la demande</label>
                    <select className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl font-bold text-slate-800 focus:border-primary outline-none">
                      <option>Problème de recharge non reçue</option>
                      <option>Erreur de paiement</option>
                      <option>Problème technique avec l'application</option>
                      <option>Autre demande</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Message détaillé</label>
                    <textarea 
                      required
                      rows="4" 
                      className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl text-slate-800 focus:border-primary outline-none resize-none"
                      placeholder="Décrivez votre problème avec le maximum de détails (ID transaction, date, etc.)"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full btn-primary py-3">Envoyer la réclamation</button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
