import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from './context/CartContext';
import Landing from './pages/Landing';
import RechargeFlow from './pages/RechargeFlow';
import RechargeForm from './pages/RechargeForm';
import AdminDashboard from './pages/AdminDashboard';
import AdminOperators from './pages/AdminOperators';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';

import Checkout from './pages/Checkout';
import ClientProfile from './pages/ClientProfile';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/checkout' || location.pathname === '/profile';
  const [userRole, setUserRole] = useState(() => localStorage.getItem('flashsim_role'));

  const handleSetRole = (role) => {
    setUserRole(role);
    if (role) localStorage.setItem('flashsim_role', role);
    else localStorage.removeItem('flashsim_role');
  };
  const [cartOpen, setCartOpen] = useState(false);
  const { cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (userRole === 'admin' && (location.pathname === '/' || location.pathname === '/start-recharge' || location.pathname === '/recharge')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [userRole, location.pathname, navigate]);

  const ProtectedAdminRoute = ({ children }) => {
    if (userRole !== 'admin') return <Navigate to="/login" replace />;
    return children;
  };

  const AdminSidebar = () => (
    <div className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-80px)] sticky top-20 hidden lg:flex flex-col p-6 space-y-2 animate-fade-in-left">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Administration</h3>
      <Link 
        to="/admin/dashboard" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === '/admin/dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2]"><path d="M4 6H11V13H4V6Z" /><path d="M14 6H21V10H14V6Z" /><path d="M14 13H21V21H14V13Z" /><path d="M4 16H11V21H4V16Z" /></svg>
        Dashboard
      </Link>
<Link 
        to="/admin/operateurs" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === '/admin/operateurs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
       >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2]"><path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V5C20 3.89543 19.1046 3 18 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21ZM9 7H15M9 11H15" /></svg>
        Gérer Recharges
       </Link>
      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={() => handleSetRole(null)} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.5]"><path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9M16 17L21 12L16 7M21 12H9" /></svg>
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans text-slate-800">
      <div className={isAuthRoute && location.pathname !== '/checkout' && location.pathname !== '/profile' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6'}>

        {/* ===== NAVBAR (hidden on auth pages except checkout and profile) ===== */}
        {(!isAuthRoute || location.pathname === '/checkout' || location.pathname === '/profile') && (
          <nav className="flex justify-between items-center py-4 sm:py-6 border-b border-slate-200 animate-fade-in relative z-50">

            {/* Logo */}
            <Link to={userRole === 'admin' ? '/admin/dashboard' : '/'} className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300 animate-glow-pulse">
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Flash<span className="text-gradient">Sim</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-8 ml-10">
              <Link to="/shop" className={`flex items-center gap-2 text-sm font-black transition-colors uppercase tracking-widest ${location.pathname === '/shop' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Boutique
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Cart Button */}
              {!isAdminRoute && userRole !== 'admin' && (
                <button 
                  onClick={() => setCartOpen(true)}
                  className="relative p-2.5 text-slate-500 hover:text-primary transition-all hover:bg-slate-50 rounded-xl group"
                  aria-label="Panier"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {cartItems.length > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 shadow-sm group-hover:scale-110 transition-transform border-2 border-white">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              )}

              {/* Profile Icon Button (Only for clients) */}
              {userRole === 'user' && (
                <Link 
                  to="/profile" 
                  className={`relative p-2.5 transition-all rounded-xl group ${location.pathname === '/profile' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}
                  aria-label="Mon Profil"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}

              {/* Auth Button */}
              {!userRole ? (
                <Link to="/login" className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-primary hover:text-white transition-all font-bold text-sm group ml-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.5]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15M10 17L15 12L10 7M15 12H3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="hidden sm:block">Connexion</span>
                </Link>
              ) : (
                <div className="flex items-center ml-2">
                  <button 
                    onClick={() => handleSetRole(null)} 
                    className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm group"
                    title="Déconnexion"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.5]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9M16 17L21 12L16 7M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="hidden lg:block">Déconnexion</span>
                  </button>
                </div>
              )}

            </div>
          </nav>
        )}

        {/* Layout container */}
        <div className={`flex ${isAdminRoute ? 'gap-8' : ''}`}>
          {isAdminRoute && <AdminSidebar />}
          
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/start-recharge" element={<RechargeForm />} />
              <Route path="/recharge" element={<RechargeFlow />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<ClientProfile />} />
              <Route path="/login" element={<Login onLogin={(role) => handleSetRole(role)} />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/operateurs"
                element={
                  <ProtectedAdminRoute>
                    <AdminOperators />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>

          </div>
        </div>

        {/* Cart Slide-over */}
        {cartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setCartOpen(false)}></div>
            <div className="w-full max-w-md bg-white h-full shadow-2xl relative z-10 flex flex-col animate-slide-in-right">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  Votre Panier
                </h2>
                <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <p className="text-slate-500 font-bold">Votre panier est vide.</p>
                    <button onClick={() => { setCartOpen(false); navigate('/shop'); }} className="mt-6 text-primary font-bold text-sm underline hover:text-primary-dark">
                      Commencer une recharge
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 p-2 shrink-0">
                              <img src={item.operatorLogo} alt={item.operatorName} className="max-h-full object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{item.operatorName}</p>
                              <p className="text-xs text-slate-400">Recharge de {item.amount} {item.currency || 'DT'}</p>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-100 text-slate-500 hover:text-primary hover:border-primary/30 transition-all font-bold">
                              -
                            </button>
                            <span className="w-8 text-center font-black text-sm text-slate-800">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-100 text-slate-500 hover:text-primary hover:border-primary/30 transition-all font-bold">
                              +
                            </button>
                          </div>
                          <p className="font-black text-primary">
                            {parseFloat(item.amount) * item.quantity} {item.currency || 'DT'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 font-bold">Total</span>
                    <span className="text-3xl font-black text-slate-900">{getCartTotal()} DT</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); navigate('/checkout'); }} className="w-full btn-primary py-4 text-base tracking-widest shadow-xl shadow-primary/20">
                    Valider la commande
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
