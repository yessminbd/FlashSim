import { useState, useEffect } from 'react';

const AdminOperators = () => {
  const [activeTab, setActiveTab] = useState('operators');
  const [regions, setRegions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showOpModal, setShowOpModal] = useState(false);
  const [newOp, setNewOp] = useState({ name: '', region: '', logo: '' });

  const [showRegModal, setShowRegModal] = useState(false);
  const [newReg, setNewReg] = useState({ code: '', name: '', dial_code: '' });

  // Recharges tab states
  const [rechargeCards, setRechargeCards] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cardData, setCardData] = useState({ operator: '', region: '', amount: '', pin: '', expiry: '', failureCode: '' });

  const API_BASE = 'http://localhost:8000/api';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regionsRes, operatorsRes, cardsRes] = await Promise.all([
        fetch(`${API_BASE}/regions/`),
        fetch(`${API_BASE}/operators/`),
        fetch(`${API_BASE}/cards/`)
      ]);
      const regionsData = await regionsRes.json();
      const operatorsData = await operatorsRes.json();
      const cardsData = await cardsRes.json();
      setRegions(regionsData);
      setOperators(operatorsData);
      setRechargeCards(cardsData);
      if (regionsData.length > 0 && !newOp.region) {
        setNewOp(prev => ({ ...prev, region: regionsData[0].id }));
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Operators
  const handleAddOp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/operators/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOp)
      });
      if (res.ok) {
        fetchData();
        setShowOpModal(false);
        setNewOp({ name: '', region: regions[0]?.id || '', logo: '' });
      }
    } catch (error) {
      console.error("Error adding operator:", error);
    }
  };

  const handleDeleteOp = async (id) => {
    if (!window.confirm("Supprimer cet opérateur ?")) return;
    try {
      const res = await fetch(`${API_BASE}/operators/${id}/`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting operator:", error);
    }
  };

  // Handlers for Regions
  const handleAddReg = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/regions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReg)
      });
      if (res.ok) {
        fetchData();
        setShowRegModal(false);
        setNewReg({ code: '', name: '', dial_code: '' });
      }
    } catch (error) {
      console.error("Error adding region:", error);
    }
  };

  const handleDeleteReg = async (id) => {
    if (!window.confirm("Supprimer cette région ? (Supprime aussi ses opérateurs)")) return;
    try {
      const res = await fetch(`${API_BASE}/regions/${id}/`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting region:", error);
    }
  };

  if (loading && regions.length === 0) return <div className="p-20 text-center font-bold text-primary animate-pulse">Chargement du Dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
        </div>
      </div>

        <div className="flex bg-slate-100/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button
            className={`flex-1 md:flex-none px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'operators' ? 'bg-white text-primary shadow-lg shadow-primary/5 scale-105' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('operators')}
          >
            Opérateurs
          </button>
          <button
            className={`flex-1 md:flex-none px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'regions' ? 'bg-white text-primary shadow-lg shadow-primary/5 scale-105' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('regions')}
          >
            Régions
          </button>
          <button
            className={`flex-1 md:flex-none px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'cards' ? 'bg-white text-primary shadow-lg shadow-primary/5 scale-105' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('cards')}
          >
            Recharges
          </button>
        </div>

      {activeTab === 'operators' && (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-10">
            <button onClick={() => setShowOpModal(true)} className="btn-primary w-12 h-12 flex items-center justify-center shadow-indigo-100">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="glass-card overflow-x-auto border-t-4 border-t-primary">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">ID</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Nom</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Région</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((op, i) => (
                  <tr key={op.id} className="border-b border-slate-50 hover:bg-white transition-colors">
                    <td className="py-5 px-6 text-slate-400 font-mono text-sm">#{op.id}</td>
                    <td className="py-5 px-6 font-bold text-slate-800 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2  17 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                      {op.name}
                    </td>
                    <td className="py-5 px-6">
                      <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs">
                        {regions.find(r => r.id === op.region)?.name || `Region #${op.region}`}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button onClick={() => handleDeleteOp(op.id)} className="text-red-500 hover:text-red-700 font-bold px-4 py-2 transition-colors text-sm">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'regions' && (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-10">
            <button onClick={() => setShowRegModal(true)} className="btn-primary w-12 h-12 flex items-center justify-center shadow-indigo-100">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="glass-card overflow-x-auto border-t-4 border-t-teal-500">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Code</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Nom</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Préfixe</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r, i) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-white transition-colors">
                    <td className="py-5 px-6 text-teal-600 font-mono font-bold uppercase">{r.code}</td>
                    <td className="py-5 px-6 font-bold text-slate-800 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                      {r.name}
                    </td>
                    <td className="py-5 px-6 font-bold text-slate-500">{r.dial_code}</td>
                    <td className="py-5 px-6 text-right">
                      <button onClick={() => handleDeleteReg(r.id)} className="text-red-500 hover:text-red-700 font-bold px-4 py-2 transition-colors text-sm">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-10 px-2">
            <h2 className="text-xl font-black text-slate-800">Gestion des Cartes</h2>
            <button onClick={() => {
              setShowScanModal(true);
              setCardData({ operator: '', region: '', amount: '', pin: '', expiry: '', failureCode: '' });
            }} className="btn-primary w-12 h-12 flex items-center justify-center shadow-indigo-100">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="glass-card overflow-x-auto border-t-4 border-t-indigo-500">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Opérateur</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Code PIN</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Montant / Expiration</th>
                  <th className="py-5 px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody>
{rechargeCards.map((card) => (
                   <tr key={card.id} className="border-b border-slate-50 hover:bg-white transition-colors">
                     <td className="py-5 px-6">
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-800">{card.operator}</span>
                         <span className="text-xs text-slate-500">{card.region}</span>
                       </div>
                     </td>
                     <td className="py-5 px-6 font-mono font-bold text-indigo-600">
                       {card.pin}
                       {card.failureCode && <p className="text-[9px] text-red-500 mt-1 font-bold">Erreur: {card.failureCode}</p>}
                     </td>
                     <td className="py-5 px-6">
                       <p className="font-black text-slate-900">{card.amount}</p>
                       <p className="text-[10px] text-slate-400 font-bold">Expire: {card.expiry}</p>
                     </td>
                     <td className="py-5 px-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${card.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                         {card.status === 'available' ? 'Disponible' : 'Utilisée'}
                       </span>
                     </td>
                   </tr>
                 ))}
</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals - positioned outside container to cover full screen */}
      {showOpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
            <h2 className="text-2xl font-black mb-6 text-slate-800">Ajouter un Opérateur</h2>
            <form onSubmit={handleAddOp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Nom</label>
                <input type="text" value={newOp.name} onChange={(e) => setNewOp({ ...newOp, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">URL du Logo (optionnel)</label>
                <input type="url" value={newOp.logo} onChange={(e) => setNewOp({ ...newOp, logo: e.target.value })} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Région</label>
                <select value={newOp.region} onChange={(e) => setNewOp({ ...newOp, region: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" required>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowOpModal(false)} className="flex-1 py-3 font-semibold text-slate-600 bg-slate-100 rounded-xl">Annuler</button>
                <button type="submit" className="btn-primary flex-1 py-3">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
            <h2 className="text-2xl font-black mb-6 text-slate-800">Ajouter une Région</h2>
            <form onSubmit={handleAddReg} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Code (ex: TN, FR)</label>
                <input type="text" value={newReg.code} onChange={(e) => setNewReg({ ...newReg, code: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Nom Complet</label>
                <input type="text" value={newReg.name} onChange={(e) => setNewReg({ ...newReg, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Préfixe (ex: +216)</label>
                <input type="text" value={newReg.dial_code} onChange={(e) => setNewReg({ ...newReg, dial_code: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" placeholder="+..." required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 py-3 font-semibold text-slate-600 bg-slate-100 rounded-xl">Annuler</button>
<button type="submit" className="btn-primary flex-1 py-3">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOperators;

