import React, { useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [transactions, setTransactions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, claimRes] = await Promise.all([
          fetch('http://localhost:8000/api/transactions/'),
          fetch('http://localhost:8000/api/claims/')
        ]);
        const txData = await txRes.json();
        const claimData = await claimRes.json();
        setTransactions(txData);
        setClaims(claimData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Recharges (24h)', value: '142', growth: '+12%', color: 'primary' },
    { label: 'Chiffre d\'affaires', value: '3,240 DT', growth: '+8.5%', color: 'emerald' },
    { label: 'Réclamations', value: '3', growth: '-2', color: 'orange' },
    { label: 'Utilisateurs actifs', value: '850', growth: '+54', color: 'blue' },
  ];

  return (
    <div className="animate-fade-in space-y-8 mt-8">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl w-fit border border-slate-200">
        {[
          { id: 'stats', label: 'Statistiques' },
          { id: 'history', label: 'Transactions' },
          { id: 'claims', label: 'Réclamations' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                ? 'bg-white text-primary shadow-lg shadow-primary/10 scale-105'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="pt-12 min-h-[500px]">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-7 hover:-translate-y-2 animate-stagger-1" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-primary" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                    </svg>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${s.growth.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'}`}>
                    {s.growth}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-black text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card overflow-hidden border-none shadow-xl shadow-slate-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Utilisateur</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Opérateur / Mobile</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Montant</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">{tx.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{tx.user_email}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{tx.operator_name}</p>
                        <p className="text-xs text-slate-500">{tx.phone_number}</p>
                      </td>
                      <td className="px-6 py-4 font-black text-primary text-sm">{tx.amount}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.status === 'success' ? 'Succès' : 'Échec'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && !loading && (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">Aucune transaction trouvée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="grid gap-6">
            {claims.map((claim) => (
              <div key={claim.id} className="glass-card p-6 border-none shadow-xl shadow-slate-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 uppercase border border-slate-200">
                      {claim.user_email[0]}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{claim.subject}</p>
                      <p className="text-xs text-slate-400 font-medium">{claim.user_email} • {new Date(claim.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${claim.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {claim.status === 'open' ? 'En attente' : 'Résolu'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-700 italic border border-slate-100">
                  "{claim.message}"
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                    Répondre
                  </button>
                  {claim.status === 'open' && (
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
                      Marquer comme résolu
                    </button>
                  )}
                </div>
              </div>
            ))}
            {claims.length === 0 && !loading && (
              <div className="text-center py-10 text-slate-500">Aucune réclamation trouvée.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;