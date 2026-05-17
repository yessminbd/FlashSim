import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [transactions, setTransactions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminReply, setAdminReply] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, claimRes] = await Promise.all([
          api.get('/transactions/'),
          api.get('/claims/')
        ]);
        setTransactions(txRes.data);
        setClaims(claimRes.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleResolveClaim = async (id) => {
    try {
      await api.patch(`/claims/${id}/`, { status: 'resolved' });
      const claimRes = await api.get('/claims/');
      setClaims(claimRes.data);
    } catch (e) { console.error(e); }
  };

  const handleReplyClaim = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/claims/${selectedClaim.id}/`, { admin_reply: adminReply, status: 'resolved' });
      const claimRes = await api.get('/claims/');
      setClaims(claimRes.data);
      setSelectedClaim(null);
      setAdminReply('');
    } catch (e) { console.error(e); }
  };

  const successfulTransactions = transactions.filter(tx => tx.status === 'success');
  const revenue = successfulTransactions.reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);
  const rechargesCount = successfulTransactions.length;

  const stats = [
    { label: "Recharges Réussies", value: rechargesCount.toString(), growth: 'Total', icon: '⚡' },
    { label: "Chiffre d'affaires", value: `${revenue.toFixed(2)} DT`, growth: 'Total', icon: '💰' },
    { label: 'Réclamations', value: claims.length.toString(), growth: 'Total', icon: '📋' },
    { label: 'Transactions', value: transactions.length.toString(), growth: 'Total', icon: '📊' },
  ];

  return (
    <>
      <div className="animate-fade-in space-y-6 sm:space-y-8 mt-4 sm:mt-8">
        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl w-fit border border-slate-200">
          {[
            { id: 'stats', label: 'Stats' },
            { id: 'history', label: 'Transactions' },
            { id: 'claims', label: 'Réclamations' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                ? 'bg-white text-primary shadow-lg shadow-primary/10 scale-105'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((s, i) => (
                <div key={i} className="glass-card p-5 sm:p-7 hover:-translate-y-1 sm:hover:-translate-y-2 animate-stagger-1" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-xl">
                      {s.icon}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${s.growth.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'}`}>
                      {s.growth}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'history' && (
            <div className="glass-card overflow-hidden border-none shadow-xl shadow-slate-200/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[540px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-500 uppercase tracking-widest">ID</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Utilisateur</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Opérateur</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Montant</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Date</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(6)].map((_, j) => (
                            <td key={j} className="px-4 sm:px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                          ))}
                        </tr>
                      ))
                    ) : transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-900 text-sm">#{tx.id}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-slate-600 hidden sm:table-cell">{tx.user_email}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <p className="text-sm font-bold text-slate-900">{tx.operator_name}</p>
                            <p className="text-xs text-slate-500">{tx.phone_number}</p>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 font-black text-primary text-sm">{tx.amount} DT</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-slate-500 hidden md:table-cell">{new Date(tx.created_at).toLocaleString('fr-FR')}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {tx.status === 'success' ? 'Succès' : 'Échec'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm">Aucune transaction trouvée.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <div className="grid gap-4 sm:gap-6">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="glass-card p-5 sm:p-6 border-none animate-pulse h-32" />
                ))
              ) : claims.length > 0 ? (
                claims.map((claim) => (
                  <div key={claim.id} className="glass-card p-5 sm:p-6 border-none shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 uppercase border border-slate-200 flex-shrink-0 text-sm">
                          {claim.user_email?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-black text-slate-900">{claim.subject}</p>
                          <p className="text-xs text-slate-400 font-medium">{claim.user_email} • {new Date(claim.created_at).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${claim.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {claim.status === 'open' ? 'En attente' : 'Résolu'}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl text-sm text-slate-700 italic border border-slate-100">
                      "{claim.message}"
                    </div>
                    {claim.admin_reply && (
                      <div className="mt-4 p-3 sm:p-4 bg-primary/5 rounded-2xl text-sm text-primary font-medium border border-primary/10">
                        <span className="font-black text-[10px] uppercase block mb-1">Ma réponse :</span>
                        "{claim.admin_reply}"
                      </div>
                    )}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button onClick={() => { setSelectedClaim(claim); setAdminReply(claim.admin_reply || ''); }} className="px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                        {claim.admin_reply ? 'Modifier réponse' : 'Répondre'}
                      </button>
                      {claim.status === 'open' && (
                        <button onClick={() => handleResolveClaim(claim.id)} className="px-3 sm:px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">Marquer comme résolu</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">Aucune réclamation trouvée.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal outside transform container to prevent stacking context issues */}
      {selectedClaim && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={() => setSelectedClaim(null)} />
          <div className="glass-card w-full sm:max-w-lg p-6 sm:p-10 relative z-10 animate-scale-in border-none shadow-2xl rounded-b-none sm:rounded-[2.5rem]">
            <button onClick={() => setSelectedClaim(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 mb-1">Répondre à <span className="text-gradient">la réclamation</span></h2>
              <p className="text-slate-500 text-sm font-medium">Sujet: {selectedClaim.subject}</p>
            </div>
            <form onSubmit={handleReplyClaim} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 italic border border-slate-100 mb-4">
                "{selectedClaim.message}"
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Votre réponse</label>
                <textarea 
                  required value={adminReply} onChange={(e) => setAdminReply(e.target.value)}
                  className="input-dark min-h-[120px] py-4 resize-none" 
                  placeholder="Écrivez votre message ici..."
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedClaim(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Annuler</button>
                <button type="submit" className="btn-primary flex-[2] py-4 shadow-xl shadow-primary/20">Envoyer et Résoudre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;