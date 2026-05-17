import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminOperators = () => {
  const [activeTab, setActiveTab] = useState('operators');
  const [regions, setRegions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Operator Modals
  const [showOpModal, setShowOpModal] = useState(false);
  const [editingOp, setEditingOp] = useState(null);
  const [newOp, setNewOp] = useState({ name: '', region: '', logo_url: '' });

  // Region Modals
  const [showRegModal, setShowRegModal] = useState(false);
  const [editingReg, setEditingReg] = useState(null);
  const [newReg, setNewReg] = useState({ code: '', name: '', dial_code: '', flag: '🌍' });

  // Card Modals
  const [rechargeCards, setRechargeCards] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardData, setCardData] = useState({ operator: '', region: '', amount: '', pin: '', serial_number: '', expiry: '' });

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'error' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regionsRes, operatorsRes, cardsRes] = await Promise.all([
        api.get('/regions/'),
        api.get('/operators/'),
        api.get('/cards/')
      ]);
      setRegions(regionsRes.data);
      setOperators(operatorsRes.data);
      setRechargeCards(cardsRes.data);
      if (regionsRes.data.length > 0 && !newOp.region) {
        setNewOp(prev => ({ ...prev, region: regionsRes.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const askConfirm = (title, message, action) => {
    setConfirmModal({ show: true, title, message, onConfirm: action });
  };

  // --- OPERATORS LOGIC ---
  const handleOpenOpModal = (op = null) => {
    if (op) {
      setEditingOp(op);
      setNewOp({ name: op.name, region: op.region, logo_url: op.logo_url || '' });
    } else {
      setEditingOp(null);
      setNewOp({ name: '', region: regions[0]?.id || '', logo_url: '' });
    }
    setShowOpModal(true);
  };

  const handleSubmitOp = async (e) => {
    e.preventDefault();
    try {
      if (editingOp) {
        await api.patch(`/operators/${editingOp.id}/`, newOp);
      } else {
        await api.post('/operators/', newOp);
      }
      fetchData();
      setShowOpModal(false);
    } catch (error) { console.error("Error saving operator:", error); }
  };

  const handleDeleteOp = async (id) => {
    askConfirm(
      "Supprimer l'opérateur",
      "Êtes-vous sûr de vouloir supprimer cet opérateur ? Cette action est irréversible.",
      async () => {
        try {
          await api.delete(`/operators/${id}/`);
          fetchData();
          setConfirmModal({ show: false });
        } catch (error) { console.error("Error deleting operator:", error); }
      }
    );
  };

  // --- REGIONS LOGIC ---
  const handleOpenRegModal = (reg = null) => {
    if (reg) {
      setEditingReg(reg);
      setNewReg({ code: reg.code, name: reg.name, dial_code: reg.dial_code, flag: reg.flag || '🌍' });
    } else {
      setEditingReg(null);
      setNewReg({ code: '', name: '', dial_code: '', flag: '🌍' });
    }
    setShowRegModal(true);
  };

  const handleSubmitReg = async (e) => {
    e.preventDefault();
    try {
      if (editingReg) {
        await api.patch(`/regions/${editingReg.id}/`, newReg);
      } else {
        await api.post('/regions/', newReg);
      }
      fetchData();
      setShowRegModal(false);
    } catch (error) { console.error("Error saving region:", error); }
  };

  const handleDeleteReg = async (id) => {
    askConfirm(
      "Supprimer la région",
      "La suppression d'une région supprimera également tous les opérateurs et cartes associés. Continuer ?",
      async () => {
        try {
          await api.delete(`/regions/${id}/`);
          fetchData();
          setConfirmModal({ show: false });
        } catch (error) { console.error("Error deleting region:", error); }
      }
    );
  };

  const getCurrencyByRegion = (regionName) => {
    if (!regionName) return 'DT';
    const name = regionName.toLowerCase();
    if (name.includes('france') || name.includes('fr') || name.includes('europe')) return '€';
    return 'DT';
  };

  // --- CARDS LOGIC ---
  const handleOpenCardModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setCardData({ 
        operator: card.operator, 
        region: card.region || '', 
        amount: card.amount, 
        pin: card.pin_code || card.pin, 
        serial_number: card.serial_number || '',
        expiry: card.expiry || '' 
      });
    } else {
      setEditingCard(null);
      setCardData({ operator: '', region: regions[0]?.id || '', amount: '', pin: '', serial_number: '', expiry: '' });
    }
    setShowScanModal(true);
  };

  const handleSubmitCard = async (e) => {
    e.preventDefault();
    if (!cardData.operator) {
      setAlertModal({
        show: true,
        title: "Opérateur requis",
        message: "Veuillez sélectionner un opérateur pour cette carte.",
        type: 'error'
      });
      return;
    }
    if (!cardData.pin || String(cardData.pin).trim() === "") {
      setAlertModal({
        show: true,
        title: "Code PIN vide",
        message: "Le code PIN est obligatoire et ne peut pas être vide.",
        type: 'error'
      });
      return;
    }
    if (!cardData.amount || parseFloat(cardData.amount) <= 0) {
      setAlertModal({
        show: true,
        title: "Montant invalide",
        message: "Veuillez saisir un montant supérieur à 0.",
        type: 'error'
      });
      return;
    }

    try {
      const payload = {
        operator: parseInt(cardData.operator),
        pin_code: String(cardData.pin).trim(),
        serial_number: cardData.serial_number ? String(cardData.serial_number).trim() : 'SN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: parseFloat(cardData.amount),
        is_used: false
      };

      if (editingCard) {
        await api.patch(`/cards/${editingCard.id}/`, payload);
      } else {
        await api.post('/cards/', payload);
      }
      fetchData();
      setShowScanModal(false);
    } catch (error) { 
      console.error("Error saving card:", error); 
      let errMsg = "Erreur lors de l'enregistrement de la carte. Veuillez vérifier les informations.";
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.pin_code) errMsg = `Code PIN: ${data.pin_code.join(', ')}`;
        else if (data.serial_number) errMsg = `Numéro de série: ${data.serial_number.join(', ')}`;
        else if (data.non_field_errors) errMsg = data.non_field_errors.join(', ');
      }
      setAlertModal({
        show: true,
        title: "Erreur de validation",
        message: errMsg,
        type: 'error'
      });
    }
  };

  if (loading && regions.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Chargement...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'operators', label: 'Opérateurs' },
    { id: 'regions', label: 'Régions' },
    { id: 'cards', label: 'Recharges' },
  ];

  return (
    <>
      <div className="max-w-5xl mx-auto animate-fade-in py-6 sm:py-10 px-0">
        {/* Tabs */}
        <div className="flex bg-slate-100/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200 w-full mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex-1 px-3 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-primary shadow-lg shadow-primary/5 scale-105' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Operators Tab */}
        {activeTab === 'operators' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 px-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-800">Gestion des Opérateurs</h2>
              <button onClick={() => handleOpenOpModal()} className="btn-primary w-10 h-10 sm:w-12 sm:h-12 shadow-indigo-100 p-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <div className="glass-card overflow-hidden border-t-4 border-t-primary">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">ID</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Nom</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider hidden sm:table-cell">Région</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operators.map((op) => (
                      <tr key={op.id} className="border-b border-slate-50 hover:bg-white transition-colors">
                        <td className="py-4 px-4 sm:px-6 text-slate-400 font-mono text-sm">#{op.id}</td>
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 flex-shrink-0 overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                {op.logo_url ? (
                                  <img 
                                    src={op.logo_url} 
                                    alt={op.name} 
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 font-black text-xl uppercase ${op.logo_url ? 'hidden' : ''}`}>
                                  {op.name?.[0]}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm">{op.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                          <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg text-xs">
                            {regions.find(r => r.id === op.region)?.name || `#${op.region}`}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenOpModal(op)} className="text-primary hover:text-primary-dark font-bold px-2 py-2 transition-colors text-xs sm:text-sm">Modifier</button>
                            <button onClick={() => handleDeleteOp(op.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-2 transition-colors text-xs sm:text-sm">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 px-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-800">Gestion des Régions</h2>
              <button onClick={() => handleOpenRegModal()} className="btn-primary w-10 h-10 sm:w-12 sm:h-12 shadow-indigo-100 p-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <div className="glass-card overflow-hidden border-t-4 border-t-teal-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Code</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Nom</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider hidden sm:table-cell">Préfixe</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-white transition-colors">
                        <td className="py-4 px-4 sm:px-6 text-teal-600 font-mono font-bold uppercase text-sm">{r.code}</td>
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 flex-shrink-0 text-sm">
                              {r.flag || '🌍'}
                            </div>
                            <span className="text-sm">{r.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-500 text-sm hidden sm:table-cell">{r.dial_code}</td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenRegModal(r)} className="text-teal-600 hover:text-teal-800 font-bold px-2 py-2 transition-colors text-xs sm:text-sm">Modifier</button>
                            <button onClick={() => handleDeleteReg(r.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-2 transition-colors text-xs sm:text-sm">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 px-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-800">Gestion des Cartes</h2>
              <button onClick={() => handleOpenCardModal()} className="btn-primary w-10 h-10 sm:w-12 sm:h-12 shadow-indigo-100 p-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="glass-card overflow-hidden border-t-4 border-t-indigo-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Opérateur</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Code PIN</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider hidden md:table-cell">Montant</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider">Statut</th>
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-700 uppercase text-xs tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rechargeCards.map((card) => (
                      <tr key={card.id} className="border-b border-slate-50 hover:bg-white transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">{card.operator_name || card.operator}</span>
                            <span className="text-xs text-slate-500">{card.operator_region}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-mono font-bold text-indigo-600 text-sm">
                          {card.pin_code || card.pin}
                        </td>
                        <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                          <p className="font-black text-slate-900 text-sm">{card.amount} {getCurrencyByRegion(card.operator_region)}</p>
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${(!card.is_used) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {(!card.is_used) ? 'Disponible' : 'Utilisée'}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button onClick={() => handleOpenCardModal(card)} className="text-indigo-600 hover:text-indigo-800 font-bold px-2 py-2 transition-colors text-xs sm:text-sm">Modifier</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmModal({ ...confirmModal, show: false })} />
          <div className="glass-card w-full max-w-sm p-8 relative z-10 animate-scale-in border-none shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 text-center text-sm font-medium mb-8">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 py-3 font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">Annuler</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg shadow-red-200">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Modal */}
      {showOpModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={() => setShowOpModal(false)} />
          <div className="glass-card w-full sm:max-w-md p-6 sm:p-10 relative z-10 animate-scale-in border-none shadow-2xl rounded-b-none sm:rounded-[2.5rem]">
            <button onClick={() => setShowOpModal(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{editingOp ? 'Modifier' : 'Ajouter'} un <span className="text-gradient">Opérateur</span></h2>
              <p className="text-slate-500 font-medium text-sm">{editingOp ? 'Mettez à jour les informations du partenaire.' : 'Configurez un nouveau partenaire réseau.'}</p>
            </div>
            <form onSubmit={handleSubmitOp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nom de l'opérateur</label>
                <input type="text" value={newOp.name} onChange={(e) => setNewOp({ ...newOp, name: e.target.value })} className="input-dark" placeholder="Ex: Ooredoo" style={{ fontSize: '16px' }} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Région associée</label>
                <div className="relative">
                  <select value={newOp.region} onChange={(e) => setNewOp({ ...newOp, region: e.target.value })} className="select-dark pr-10" required>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.flag} {r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">URL du Logo</label>
                <input type="url" value={newOp.logo_url} onChange={(e) => setNewOp({ ...newOp, logo_url: e.target.value })} placeholder="https://..." className="input-dark" style={{ fontSize: '16px' }} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowOpModal(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Annuler</button>
                <button type="submit" className="btn-primary flex-[2] py-4 shadow-xl shadow-primary/20">{editingOp ? 'Mettre à jour' : 'Créer l\'opérateur'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Region Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={() => setShowRegModal(false)} />
          <div className="glass-card w-full sm:max-w-md p-6 sm:p-10 relative z-10 animate-scale-in border-none shadow-2xl rounded-b-none sm:rounded-[2.5rem]">
            <button onClick={() => setShowRegModal(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{editingReg ? 'Modifier' : 'Ajouter'} une <span className="text-gradient">Région</span></h2>
              <p className="text-slate-500 font-medium text-sm">Définissez les paramètres de la zone.</p>
            </div>
            <form onSubmit={handleSubmitReg} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Code (TN, FR)</label>
                  <input type="text" value={newReg.code} onChange={(e) => setNewReg({ ...newReg, code: e.target.value.toUpperCase() })} className="input-dark" placeholder="TN" style={{ fontSize: '16px' }} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Drapeau (Emoji)</label>
                  <input type="text" value={newReg.flag} onChange={(e) => setNewReg({ ...newReg, flag: e.target.value })} className="input-dark" placeholder="🇹🇳" style={{ fontSize: '16px' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nom Complet</label>
                  <input type="text" value={newReg.name} onChange={(e) => setNewReg({ ...newReg, name: e.target.value })} className="input-dark" placeholder="Tunisie" style={{ fontSize: '16px' }} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Préfixe</label>
                  <input type="text" value={newReg.dial_code} onChange={(e) => setNewReg({ ...newReg, dial_code: e.target.value })} className="input-dark" placeholder="+216" style={{ fontSize: '16px' }} required />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Annuler</button>
                <button type="submit" className="btn-primary flex-[2] py-4 shadow-xl shadow-teal-500/20">{editingReg ? 'Mettre à jour' : 'Ajouter la zone'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={() => setShowScanModal(false)} />
          <div className="glass-card w-full sm:max-w-lg p-6 sm:p-10 relative z-10 animate-scale-in border-none shadow-2xl rounded-b-none sm:rounded-[2.5rem]">
            <button onClick={() => setShowScanModal(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{editingCard ? 'Modifier' : 'Ajouter'} des <span className="text-gradient">Cartes</span></h2>
              <p className="text-slate-500 font-medium text-sm">Gérez les codes de recharge disponibles.</p>
            </div>
            <form onSubmit={handleSubmitCard} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Région</label>
                  <select className="select-dark" value={cardData.region} onChange={(e) => setCardData({...cardData, region: e.target.value})}>
                    <option value="">Sélectionner</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.flag} {r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Opérateur</label>
                  <select className="select-dark" value={cardData.operator} onChange={(e) => setCardData({...cardData, operator: e.target.value})}>
                    <option value="">Sélectionner</option>
                    {operators.filter(op => !cardData.region || String(op.region) === String(cardData.region)).map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Code PIN</label>
                  <input type="text" className="input-dark" placeholder="PIN" value={cardData.pin} onChange={(e) => setCardData({...cardData, pin: e.target.value})} style={{ fontSize: '16px' }} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Numéro de Série</label>
                  <input type="text" className="input-dark" placeholder="SN..." value={cardData.serial_number} onChange={(e) => setCardData({...cardData, serial_number: e.target.value})} style={{ fontSize: '16px' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Montant</label>
                  <input type="number" className="input-dark" placeholder="Ex: 10" value={cardData.amount} onChange={(e) => setCardData({...cardData, amount: e.target.value})} style={{ fontSize: '16px' }} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Expiration</label>
                  <input type="date" className="input-dark" value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value})} style={{ fontSize: '16px' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowScanModal(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Annuler</button>
                <button type="submit" className="btn-primary flex-[2] py-4 shadow-xl shadow-indigo-500/20">{editingCard ? 'Sauvegarder' : 'Ajouter la carte'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert / Error Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setAlertModal({ ...alertModal, show: false })} />
          <div className="glass-card w-full sm:max-w-md p-8 relative z-10 animate-scale-in border-none shadow-2xl rounded-3xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ✕
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{alertModal.title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 whitespace-pre-line">{alertModal.message}</p>
            <button onClick={() => setAlertModal({ ...alertModal, show: false })} className="w-full py-3.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-lg">
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOperators;
