import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Input';

export const AccessoLogin: React.FC = () => {
  const {
    depots,
    carriers,
    registerCarrier,
    setCurrentRole,
    setCurrentUser,
    setCurrentCarrierId,
    setSelectedDepotId,
    users,
    simulatedEmails,
    confirmUserEmail,
    setUserPassword,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'admin' | 'guardiola' | 'vettore' | 'preposto'>('guardiola');
  
  const [selectedPlantId, setSelectedPlantId] = useState(depots[0]?.id || '');

  useEffect(() => {
    if (depots.length > 0 && !selectedPlantId) {
      setSelectedPlantId(depots[0].id);
    }
  }, [depots, selectedPlantId]);

  // Stati Vettore
  const [selectedCarrierId, setSelectedCarrierId] = useState(carriers.filter(c => c.status === 'APPROVATO')[0]?.id || '');

  useEffect(() => {
    const approved = carriers.filter(c => c.status === 'APPROVATO');
    if (approved.length > 0 && !selectedCarrierId) {
      setSelectedCarrierId(approved[0].id);
    }
  }, [carriers, selectedCarrierId]);
  const [showRegForm, setShowRegForm] = useState(false);

  // Form di Registrazione Vettore
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVat, setRegVat] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSetupError, setPasswordSetupError] = useState('');

  useEffect(() => {
    if (!users || users.length === 0) return;
    if (activeTab === 'guardiola') {
      const found = users.find(u => u.role === 'GUARDIA_CANCELLO');
      if (found) {
        setSelectedUserId(found.id);
        if (found.depotId) setSelectedPlantId(found.depotId);
      }
    } else if (activeTab === 'preposto') {
      const found = users.find(u => u.role === 'PREPOSTO' || u.role === 'OPERATORE_YARD');
      if (found) {
        setSelectedUserId(found.id);
        if (found.depotId) setSelectedPlantId(found.depotId);
      }
    } else if (activeTab === 'admin') {
      const found = users.find(u => u.role === 'ADMIN');
      if (found) setSelectedUserId(found.id);
    }
  }, [activeTab, users]);

  const handleLogin = () => {
    setLoginError('');
    if (activeTab === 'vettore') {
      if (!selectedCarrierId) {
        alert('Seleziona un vettore abilitato per accedere.');
        return;
      }
      setCurrentRole('VETTORE');
      setCurrentCarrierId(selectedCarrierId);
      const carrierName = carriers.find(c => c.id === selectedCarrierId)?.name || 'Vettore';
      setCurrentUser({
        id: `usr-carrier-${selectedCarrierId}`,
        name: carrierName,
        username: `carrier.${selectedCarrierId}`,
        email: carriers.find(c => c.id === selectedCarrierId)?.email || 'carrier@info.it',
        role: 'OPERATORE_YARD',
        depotIds: [],
        status: 'ACTIVE'
      });
      return;
    }

    const userObj = users.find(u => u.id === selectedUserId);
    if (!userObj) {
      setLoginError('Seleziona un utente valido.');
      return;
    }

    if (userObj.status === 'PENDING_CONFIRMATION') {
      setLoginError("L'utenza è in attesa di conferma e-mail. Clicca su 'Conferma Registrazione' nel simulatore e-mail a destra/alto per procedere.");
      return;
    }

    if (userObj.status === 'FIRST_ACCESS') {
      setShowPasswordSetup(true);
      setPasswordSetupError('');
      setNewPassword('');
      setConfirmNewPassword('');
      return;
    }

    if (userObj.status === 'ACTIVE') {
      if (!loginPassword) {
        setLoginError('Inserisci la password di accesso.');
        return;
      }
      if (loginPassword !== userObj.password) {
        setLoginError("Password errata. Per le utenze predefinite, la password è 'Password123!'. Per le nuove utenze, inserisci la password creata al primo accesso.");
        return;
      }
    }

    // Success login!
    if (activeTab === 'admin') {
      setCurrentRole('ADMIN');
      setCurrentUser(userObj);
    } else if (activeTab === 'guardiola') {
      setCurrentRole('GUARDIA');
      setSelectedDepotId(userObj.depotIds && userObj.depotIds.length > 0 ? userObj.depotIds[0] : selectedPlantId);
      setCurrentUser(userObj);
    } else if (activeTab === 'preposto') {
      setCurrentRole('PREPOSTO');
      setSelectedDepotId(userObj.depotIds && userObj.depotIds.length > 0 ? userObj.depotIds[0] : selectedPlantId);
      setCurrentUser(userObj);
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSetupError('');
    if (!newPassword || !confirmNewPassword) {
      setPasswordSetupError('Compila tutti i campi.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordSetupError('Le password non coincidono.');
      return;
    }

    const userObj = users.find(u => u.id === selectedUserId);
    if (!userObj) {
      setPasswordSetupError('Utente non trovato.');
      return;
    }

    const res = await setUserPassword(userObj.id, newPassword);
    if (!res.success) {
      setPasswordSetupError(res.error || 'Errore di validazione requisiti.');
      return;
    }

    setShowPasswordSetup(false);
    
    // Login automatico
    if (userObj.role === 'ADMIN') {
      setCurrentRole('ADMIN');
      setCurrentUser({ ...userObj, password: newPassword, status: 'ACTIVE' });
    } else if (userObj.role === 'GUARDIA_CANCELLO') {
      setCurrentRole('GUARDIA');
      setSelectedDepotId(userObj.depotIds[0] || selectedPlantId);
      setCurrentUser({ ...userObj, password: newPassword, status: 'ACTIVE' });
    } else if (userObj.role === 'PREPOSTO') {
      setCurrentRole('PREPOSTO');
      setSelectedDepotId(userObj.depotIds[0] || selectedPlantId);
      setCurrentUser({ ...userObj, password: newPassword, status: 'ACTIVE' });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regVat) {
      setRegError('Tutti i campi obbligatori (*) devono essere compilati.');
      return;
    }
    registerCarrier(regName, regEmail, regVat, regPlate);
    setRegSuccess(true);
    setRegError('');
    setRegName('');
    setRegEmail('');
    setRegVat('');
    setRegPlate('');
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative bg-cover bg-center"
      style={{ 
        backgroundImage: `url('/login-bg.png')` 
      }}
    >
      {/* Overlay scuro + sfocatura per leggibilità premium */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Brand logo in alto */}
      <div className="relative z-10 flex items-center gap-3 mb-8 select-none">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#003a75] to-[#0062b8] flex items-center justify-center text-white font-black text-lg shadow-md border border-white/20">
          L1
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-white tracking-tight uppercase leading-none">
            Logistica Uno
          </h1>
          <span className="text-[10px] font-mono text-gray-300 tracking-widest uppercase mt-1 block">
            YARD & DOCK MANAGEMENT SYSTEM
          </span>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {showPasswordSetup ? (
          /* SCHEDA IMPOSTAZIONE PASSWORD PRIMO ACCESSO */
          <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-[#11BCEC]/5 transition-all duration-300">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10 font-mono">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                [ CONFIGURAZIONE PRIMO ACCESSO ]
              </h3>
            </div>
            
            <form onSubmit={handleSetupPassword} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Ciao <strong className="text-white">{users.find(u => u.id === selectedUserId)?.name}</strong>! Imposta una nuova password sicura per il tuo account.
              </p>

              {passwordSetupError && (
                <div className="p-3 text-xs border border-rose-500/25 bg-rose-950/40 text-rose-400 rounded-lg">
                  {passwordSetupError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Nuova Password *</label>
                <input
                  type="password"
                  placeholder="Inserisci nuova password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 text-white rounded-lg border border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Conferma Password *</label>
                <input
                  type="password"
                  placeholder="Reinserisci nuova password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 text-white rounded-lg border border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>

              {/* Checklist Requisiti di Complessità */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-2 text-[10px] font-mono">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px] mb-1">// Requisiti Password:</span>
                <div className="flex items-center gap-2">
                  <span className={newPassword.length >= 8 ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                    {newPassword.length >= 8 ? "✓" : "✗"}
                  </span>
                  <span className={newPassword.length >= 8 ? "text-slate-300" : "text-slate-500"}>Almeno 8 caratteri</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={/[A-Z]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                    {/[A-Z]/.test(newPassword) ? "✓" : "✗"}
                  </span>
                  <span className={/[A-Z]/.test(newPassword) ? "text-slate-300" : "text-slate-500"}>Almeno 1 lettera Maiuscola</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={/[0-9]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                    {/[0-9]/.test(newPassword) ? "✓" : "✗"}
                  </span>
                  <span className={/[0-9]/.test(newPassword) ? "text-slate-300" : "text-slate-500"}>Almeno 1 cifra / numero</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "✓" : "✗"}
                  </span>
                  <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-slate-300" : "text-slate-500"}>Almeno 1 carattere speciale (es. !, @, #, $, %)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 !bg-slate-800 hover:!bg-slate-700 !text-slate-200 !border-white/20"
                  onClick={() => {
                    setShowPasswordSetup(false);
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setPasswordSetupError('');
                  }}
                >
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  variant="warning"
                  className="flex-1 !text-slate-950 font-extrabold hover:!text-white"
                >
                  Salva e Accedi
                </Button>
              </div>
            </form>
          </div>
        ) : !showRegForm ? (
          <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-[#11BCEC]/5 transition-all duration-300 hover:border-white/15">
            {/* Titolo */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10 font-mono">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#11BCEC] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#11BCEC] animate-pulse"></span>
                [ AUTENTICAZIONE PORTALE ]
              </h3>
            </div>

            {/* Tabs per tipologia d'accesso */}
            <div className="flex p-1 bg-slate-900/90 rounded-xl border border-white/5 mb-6 font-mono text-[10px] overflow-x-auto whitespace-nowrap gap-1">
              <button
                onClick={() => { setActiveTab('guardiola'); setLoginError(''); setLoginPassword(''); }}
                className={`flex-1 py-2.5 px-3 font-bold uppercase transition-all rounded-lg cursor-pointer text-center border ${
                  activeTab === 'guardiola'
                    ? 'bg-slate-800 text-[#11BCEC] border-[#11BCEC]/30 shadow-md shadow-[#11BCEC]/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                🎥 Guardiola
              </button>
              <button
                onClick={() => { setActiveTab('preposto'); setLoginError(''); setLoginPassword(''); }}
                className={`flex-1 py-2.5 px-3 font-bold uppercase transition-all rounded-lg cursor-pointer text-center border ${
                  activeTab === 'preposto'
                    ? 'bg-slate-800 text-[#11BCEC] border-[#11BCEC]/30 shadow-md shadow-[#11BCEC]/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                📋 Preposto
              </button>
              <button
                onClick={() => { setActiveTab('vettore'); setLoginError(''); setLoginPassword(''); }}
                className={`flex-1 py-2.5 px-3 font-bold uppercase transition-all rounded-lg cursor-pointer text-center border ${
                  activeTab === 'vettore'
                    ? 'bg-slate-800 text-[#11BCEC] border-[#11BCEC]/30 shadow-md shadow-[#11BCEC]/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                🚛 Vettore
              </button>
              <button
                onClick={() => { setActiveTab('admin'); setLoginError(''); setLoginPassword(''); }}
                className={`flex-1 py-2.5 px-3 font-bold uppercase transition-all rounded-lg cursor-pointer text-center border ${
                  activeTab === 'admin'
                    ? 'bg-slate-800 text-[#11BCEC] border-[#11BCEC]/30 shadow-md shadow-[#11BCEC]/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                ⚙️ Admin
              </button>
            </div>

            {/* CONTENUTO TAB: GUARDIOLA */}
            {activeTab === 'guardiola' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Seleziona la tua utenza operatore Guardiola registrata nel database per monitorare il piazzale ed effettuare i check-in dei camion.
                </p>
                <Select
                  label="Seleziona Operatore Reale *"
                  className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                  options={users.filter(u => u.role === 'GUARDIA_CANCELLO').map(u => ({ 
                    value: u.id, 
                    label: `${u.name} (Presidio: ${u.depotIds ? u.depotIds.map(id => depots.find(d => d.id === id)?.name || id).join(', ') : (depots.find(d => d.id === u.depotId)?.name || 'Tutti')})` 
                  }))}
                  value={users.find(u => u.id === selectedUserId)?.name || ''}
                  onChange={(e) => {
                    const found = users.find(u => u.name === e.target.value || u.id === e.target.value);
                    if (found) {
                      setSelectedUserId(found.id);
                      setLoginError('');
                      setLoginPassword('');
                      if (found.depotIds && found.depotIds.length > 0) setSelectedPlantId(found.depotIds[0]);
                    }
                  }}
                />

                {users.find(u => u.id === selectedUserId)?.status === 'PENDING_CONFIRMATION' && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-lg border border-rose-500/20 leading-relaxed font-sans">
                    ⚠️ Utenza in attesa di conferma e-mail. Clicca su <strong>"Conferma Registrazione"</strong> nel simulatore e-mail in alto a destra per procedere.
                  </div>
                )}

                {users.find(u => u.id === selectedUserId)?.status === 'FIRST_ACCESS' && (
                  <div className="p-3 text-xs text-amber-400 bg-amber-950/40 rounded-lg border border-amber-500/20 leading-relaxed font-sans animate-pulse">
                    ℹ️ Primo accesso rilevato. Verrà richiesto di configurare una nuova password di sicurezza.
                  </div>
                )}

                {users.find(u => u.id === selectedUserId)?.status === 'ACTIVE' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Password di Accesso *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900/90 text-white rounded-lg border border-white/20 focus:border-[#11BCEC] focus:ring-1 focus:ring-[#11BCEC] focus:outline-none placeholder-slate-600 transition-colors font-mono"
                      required
                    />
                  </div>
                )}

                {loginError && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-lg border border-rose-500/20 font-sans">
                    {loginError}
                  </div>
                )}

                <Button 
                  onClick={handleLogin} 
                  disabled={users.find(u => u.id === selectedUserId)?.status === 'PENDING_CONFIRMATION'}
                  className="w-full mt-2 !text-slate-950 font-extrabold hover:!text-white"
                >
                  {users.find(u => u.id === selectedUserId)?.status === 'FIRST_ACCESS' ? 'Configura Password ➔' : 'Accedi come Guardiola'}
                </Button>
              </div>
            )}

            {/* CONTENUTO TAB: PREPOSTO */}
            {activeTab === 'preposto' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Seleziona la tua utenza operatore Preposto registrata nel database per compilare le check-list di conformità ed autorizzare le baie.
                </p>
                <Select
                  label="Seleziona Operatore Reale *"
                  className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                  options={users.filter(u => u.role === 'PREPOSTO' || u.role === 'OPERATORE_YARD').map(u => ({ 
                    value: u.id, 
                    label: `${u.name} (Presidio: ${u.depotIds ? u.depotIds.map(id => depots.find(d => d.id === id)?.name || id).join(', ') : (depots.find(d => d.id === u.depotId)?.name || 'Tutti')})` 
                  }))}
                  value={users.find(u => u.id === selectedUserId)?.name || ''}
                  onChange={(e) => {
                    const found = users.find(u => u.name === e.target.value || u.id === e.target.value);
                    if (found) {
                      setSelectedUserId(found.id);
                      setLoginError('');
                      setLoginPassword('');
                      if (found.depotIds && found.depotIds.length > 0) setSelectedPlantId(found.depotIds[0]);
                    }
                  }}
                />

                {users.find(u => u.id === selectedUserId)?.status === 'PENDING_CONFIRMATION' && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-lg border border-rose-500/20 leading-relaxed font-sans">
                    ⚠️ Utenza in attesa di conferma e-mail. Clicca su <strong>"Conferma Registrazione"</strong> nel simulatore e-mail in alto a destra per procedere.
                  </div>
                )}

                {users.find(u => u.id === selectedUserId)?.status === 'FIRST_ACCESS' && (
                  <div className="p-3 text-xs text-amber-400 bg-amber-950/40 rounded-lg border border-amber-500/20 leading-relaxed font-sans animate-pulse">
                    ℹ️ Primo accesso rilevato. Verrà richiesto di configurare una nuova password di sicurezza.
                  </div>
                )}

                {users.find(u => u.id === selectedUserId)?.status === 'ACTIVE' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Password di Accesso *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900/90 text-white rounded-lg border border-white/20 focus:border-[#11BCEC] focus:ring-1 focus:ring-[#11BCEC] focus:outline-none placeholder-slate-600 transition-colors font-mono"
                      required
                    />
                  </div>
                )}

                {loginError && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-lg border border-rose-500/20 font-sans">
                    {loginError}
                  </div>
                )}

                <Button 
                  onClick={handleLogin} 
                  disabled={users.find(u => u.id === selectedUserId)?.status === 'PENDING_CONFIRMATION'}
                  className="w-full mt-2 !text-slate-950 font-extrabold hover:!text-white"
                >
                  {users.find(u => u.id === selectedUserId)?.status === 'FIRST_ACCESS' ? 'Configura Password ➔' : 'Accedi come Preposto'}
                </Button>
              </div>
            )}

            {/* CONTENUTO TAB: VETTORE */}
            {activeTab === 'vettore' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Accedi per pianificare i tuoi slot di carico/scarico merci presso i Plant di Logistica Uno.
                </p>

                {carriers.filter(c => c.status === 'APPROVATO').length === 0 ? (
                  <div className="p-3 text-xs text-amber-400 bg-amber-950/40 rounded-lg border border-amber-500/20">
                    Nessun vettore abilitato nel sistema. Registrati o contatta l'amministratore.
                  </div>
                ) : (
                  <Select
                    label="Seleziona il tuo Vettore"
                    className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                    options={carriers.filter(c => c.status === 'APPROVATO').map((c) => ({ value: c.id, label: c.name }))}
                    value={carrierIdToLabel(selectedCarrierId)}
                    onChange={(e) => {
                      const opt = carriers.find(c => c.name === e.target.value || c.id === e.target.value);
                      if (opt) {
                        setSelectedCarrierId(opt.id);
                        setLoginError('');
                      }
                    }}
                  />
                )}

                {loginError && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-lg border border-rose-500/20">
                    {loginError}
                  </div>
                )}

                <Button onClick={handleLogin} disabled={!selectedCarrierId} className="w-full mt-2 !text-slate-950 font-extrabold hover:!text-white">
                  Accedi all'Area Riservata
                </Button>

                <div className="pt-4 border-t border-white/10 text-center">
                  <button
                    onClick={() => {
                      setShowRegForm(true);
                      setRegSuccess(false);
                    }}
                    className="text-xs font-bold text-[#11BCEC] hover:text-white uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Registra Nuovo Vettore ➔
                  </button>
                </div>
              </div>
            )}

            {/* CONTENUTO TAB: ADMIN */}
            {activeTab === 'admin' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Console di amministrazione di sistema per la configurazione dei Plant, dei moduli magazzino, abilitazione utenze e approvazione dei vettori.
                </p>
                <Select
                  label="Seleziona Utenza Admin *"
                  className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                  options={users.filter(u => u.role === 'ADMIN').map(u => ({ value: u.id, label: u.name }))}
                  value={users.find(u => u.id === selectedUserId)?.name || ''}
                  onChange={(e) => {
                    const found = users.find(u => u.name === e.target.value || u.id === e.target.value);
                    if (found) {
                      setSelectedUserId(found.id);
                      setLoginError('');
                      setLoginPassword('');
                    }
                  }}
                />

                {users.find(u => u.id === selectedUserId)?.status === 'PENDING_CONFIRMATION' && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-lg border border-rose-500/20 leading-relaxed font-sans">
                    ⚠️ Utenza in attesa di conferma e-mail. Clicca su <strong>"Conferma Registrazione"</strong> nel simulatore e-mail in alto a destra per procedere.
                  </div>
                )}

                {users.find(u => u.id === selectedUserId)?.status === 'FIRST_ACCESS' && (
                  <div className="p-3 text-xs text-amber-400 bg-amber-950/40 rounded-lg border border-amber-500/20 leading-relaxed font-sans animate-pulse">
                    ℹ️ Primo accesso rilevato. Verrà richiesto di configurare una nuova password di sicurezza.
                  </div>
                )}

                {users.find(u => u.id === selectedUserId)?.status === 'ACTIVE' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Password di Accesso *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900/90 text-white rounded-lg border border-white/20 focus:border-[#11BCEC] focus:ring-1 focus:ring-[#11BCEC] focus:outline-none placeholder-slate-600 transition-colors font-mono"
                      required
                    />
                  </div>
                )}

                {loginError && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-lg border border-rose-500/20 font-sans">
                    {loginError}
                  </div>
                )}

                <Button 
                  onClick={handleLogin} 
                  disabled={users.find(u => u.id === selectedUserId)?.status === 'PENDING_CONFIRMATION'}
                  className="w-full mt-2 !text-slate-950 font-extrabold hover:!text-white" 
                  variant="warning"
                >
                  {users.find(u => u.id === selectedUserId)?.status === 'FIRST_ACCESS' ? 'Configura Password ➔' : 'Accedi come Amministratore'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* SCHEDA REGISTRAZIONE VETTORE */
          <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-[#11BCEC]/5 transition-all duration-300 hover:border-white/15">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10 font-mono">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#11BCEC] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#11BCEC] animate-pulse"></span>
                [ REGISTRAZIONE NUOVO VETTORE ]
              </h3>
            </div>
            {regSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 border border-emerald-500/25 bg-emerald-950/40 text-emerald-400 font-sans text-xs rounded-xl space-y-1">
                  <div className="font-bold text-[13px]">Richiesta Inviata!</div>
                  <p>L'anagrafica è stata registrata con successo in stato di attesa. Un operatore di Logistica Uno verificherà i dati e approverà l'accesso.</p>
                </div>
                <Button onClick={() => setShowRegForm(false)} className="w-full !text-slate-950 font-extrabold hover:!text-white">
                  Torna al Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <p className="text-xs text-slate-300 font-sans mb-4">
                  Compila i dati aziendali per richiedere l'abilitazione al portale prenotazione baie.
                </p>

                {regError && (
                  <div className="p-3 text-xs border border-red-500/25 bg-red-950/40 text-red-400 rounded-lg">
                    {regError}
                  </div>
                )}

                <Input
                  label="Ragione Sociale Vettore *"
                  placeholder="es. Trasporti Veloci Spa"
                  className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />

                <Input
                  label="Partita IVA / VAT Number *"
                  placeholder="es. IT01234567890"
                  className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                  value={regVat}
                  onChange={(e) => setRegVat(e.target.value)}
                  required
                />

                <Input
                  label="Email di Contatto *"
                  type="email"
                  placeholder="es. logistica@azienda.it"
                  className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />

                <Input
                  label="Targa Trattore Stradale (Opzionale)"
                  placeholder="es. AA123BB"
                  className="!bg-slate-900 !border-white/20 !text-white focus:!border-[#11BCEC] focus:!ring-[#11BCEC]"
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value)}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 !bg-slate-800 hover:!bg-slate-700 !text-slate-200 !border-white/20"
                    onClick={() => setShowRegForm(false)}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" className="flex-1 !text-slate-950 font-extrabold hover:!text-white">
                    Invia Richiesta
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      
      {/* Credenziali di test in calce */}
      {!showRegForm && (
        <div className="w-full max-w-md mt-6 p-4 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-md text-slate-300 space-y-3 font-mono text-[9px] shadow-lg animate-fade-in relative z-10">
          <span className="block text-white font-bold text-center border-b border-white/10 pb-2 uppercase tracking-wider">// Credenziali di Test Reali (Postgres)</span>
          <div className="space-y-2">
            <div>
              <span className="text-[#11BCEC] font-bold">⚙️ ADMIN:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Alessandro Neri (<span className="text-slate-400">Ruolo: ADMIN</span>)</li>
              </ul>
            </div>
            <div>
              <span className="text-[#11BCEC] font-bold">🎥 GUARDIOLA:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Fabio Gialli (<span className="text-slate-400">Milano Logistics Plant</span>)</li>
                <li>Sara Rossi (<span className="text-slate-400">Bari Logistics Plant</span>)</li>
              </ul>
            </div>
            <div>
              <span className="text-[#11BCEC] font-bold">📋 PREPOSTO:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Filippo Marroni (<span className="text-slate-400">Milano Logistics Plant</span>)</li>
                <li>Roberto Verdi (<span className="text-slate-400">Roma Logistics Plant</span>)</li>
              </ul>
            </div>
            <div>
              <span className="text-[#11BCEC] font-bold">🚛 VETTORI:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Logistica Uno Europe / Freccia Rossa Trasporti</li>
              </ul>
            </div>
          </div>
          <p className="text-[8px] text-slate-500 text-center italic border-t border-white/5 pt-2">
            Usa i menu a tendina sopra per selezionare queste anagrafiche reali caricate dal database. Le modifiche effettuate nel pannello Admin si rifletteranno qui all'istante.
          </p>
        </div>
      )}
      {/* SIMULATORE E-MAIL FLOATING */}
      {simulatedEmails && simulatedEmails.length > 0 && (
        <div className="fixed top-4 right-4 z-50 w-80 bg-slate-950/90 backdrop-blur-xl border border-[#11BCEC]/30 rounded-2xl p-4 shadow-2xl font-mono text-[10px] animate-fade-in space-y-3">
          <div className="flex justify-between items-center border-b border-[#11BCEC]/25 pb-2">
            <span className="text-[#11BCEC] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-[#11BCEC] rounded-full"></span>
              [ SMTP SIMULATOR ]
            </span>
            <span className="text-[8px] text-slate-500">Notifiche: {simulatedEmails.length}</span>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {simulatedEmails.map((email) => (
              <div key={email.userId} className="p-2.5 rounded-lg bg-slate-900 border border-white/5 space-y-2">
                <div className="text-[9px] text-slate-400 space-y-0.5">
                  <div><strong className="text-slate-200">Dest:</strong> {email.userName} ({email.userEmail})</div>
                  <div><strong className="text-slate-200">Ogg:</strong> Conferma Attivazione Account Yard</div>
                </div>
                <p className="text-[9px] text-slate-300 leading-normal bg-slate-950 p-2 rounded border border-white/5">
                  Gentile {email.userName}, per completare l'attivazione della tua utenza interna, clicca sul link di conferma qui sotto.
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => confirmUserEmail(email.userId)}
                    className="px-2 py-1 rounded bg-[#11BCEC] hover:bg-[#11BCEC]/85 text-slate-950 font-bold cursor-pointer text-[9px] uppercase tracking-wider transition-colors"
                  >
                    Conferma Registrazione ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );

  function carrierIdToLabel(id: string) {
    const c = carriers.find(x => x.id === id);
    return c ? c.name : id;
  }
};
