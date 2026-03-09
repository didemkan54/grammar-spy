(function(){
  const SESSION_KEY = 'gs_auth_session';
  const ACCOUNT_KEY = 'gs_account_v1';
  const NEXT_KEY = 'gs_auth_next_v1';
  const AUTH_DEBUG = true;

  const authState = {
    currentUser: null,
    isAuthenticated: false,
    authReady: false
  };
  let restorePromise = null;

  function logAuth(message, payload){
    if (!AUTH_DEBUG || typeof console === 'undefined' || typeof console.info !== 'function') return;
    if (typeof payload === 'undefined') {
      console.info('[GSAuth]', message);
      return;
    }
    console.info('[GSAuth]', message, payload);
  }

  function readJson(key){
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_err) {
      return null;
    }
  }

  function writeSession(v){
    if (!v) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(v));
    } catch (_err) {}
  }

  function clearSession(){
    try { localStorage.removeItem(SESSION_KEY); } catch (_err) {}
  }

  function setAuthReadyFlag(value){
    try {
      document.documentElement.setAttribute('data-gs-auth-ready', value ? '1' : '0');
    } catch (_err) {}
  }

  function toSession(account){
    if (!account) return null;
    return {
      mode: account.mode || 'account',
      role: account.role || 'teacher',
      name: account.name || 'Teacher',
      email: account.email || '',
      createdAt: account.createdAt || new Date().toISOString(),
      accountId: account.id || '',
      plan: account.plan || 'trial'
    };
  }

  function readSessionFallback(){
    const directSession = readJson(SESSION_KEY);
    if (directSession) return directSession;
    const account = readJson(ACCOUNT_KEY);
    if (!account) return null;
    const session = toSession(account);
    if (session) writeSession(session);
    return session;
  }

  function syncAuthState(session, isReady){
    authState.currentUser = session || null;
    authState.isAuthenticated = Boolean(session);
    authState.authReady = Boolean(isReady);
    setAuthReadyFlag(authState.authReady);
  }

  function emitAuthChange(reason){
    try {
      window.dispatchEvent(new CustomEvent('gs:auth-state-changed', {
        detail: {
          reason: reason || '',
          authReady: authState.authReady,
          isAuthenticated: authState.isAuthenticated,
          currentUser: authState.currentUser
        }
      }));
    } catch (_err) {}
  }

  function restoreSession(){
    if (authState.authReady) return Promise.resolve(authState);
    if (restorePromise) return restorePromise;
    setAuthReadyFlag(false);
    restorePromise = Promise.resolve()
      .then(function(){
        const billing = window.GS_BILLING;
        if (billing && typeof billing.initializeAuth === 'function') {
          return billing.initializeAuth().then(function(){
            if (!billing.getAccount) return null;
            return billing.getAccount();
          });
        }
        return null;
      })
      .catch(function(){
        return null;
      })
      .then(function(account){
        const session = account ? toSession(account) : readSessionFallback();
        if (session) writeSession(session);
        if (!session) clearSession();
        syncAuthState(session, true);
        logAuth('Session restored', { authenticated: authState.isAuthenticated, accountId: session && session.accountId ? session.accountId : '' });
        emitAuthChange('restore');
        return authState;
      });
    return restorePromise;
  }

  function getSession(){
    if (authState.currentUser) return authState.currentUser;
    const fallback = readSessionFallback();
    if (fallback) {
      syncAuthState(fallback, authState.authReady);
    }
    return fallback;
  }

  function setAccount(name, email, role){
    const billing = window.GS_BILLING;
    let session = null;
    if (billing && billing.createAccount){
      const account = billing.createAccount(name, email, role || 'teacher');
      session = toSession(account);
      writeSession(session);
    } else {
      session = {
        mode: 'account',
        role: role || 'teacher',
        name: String(name || 'Teacher').trim() || 'Teacher',
        email: String(email || '').trim(),
        createdAt: new Date().toISOString(),
        plan: 'trial'
      };
      writeSession(session);
    }
    syncAuthState(session, true);
    logAuth('Login/signup success', { role: session.role || 'teacher', accountId: session.accountId || '' });
    emitAuthChange('setAccount');
    return session;
  }

  function setGuest(){
    const billing = window.GS_BILLING;
    let session = null;
    if (billing && billing.setGuestAccount){
      const account = billing.setGuestAccount();
      session = toSession(account);
      writeSession(session);
    } else {
      session = {
        mode: 'guest',
        role: 'teacher',
        name: 'Guest Teacher',
        createdAt: new Date().toISOString(),
        plan: 'guest'
      };
      writeSession(session);
    }
    syncAuthState(session, true);
    emitAuthChange('setGuest');
    return session;
  }

  function signOut(){
    const billing = window.GS_BILLING;
    if (billing && billing.signOut){
      billing.signOut();
    } else {
      try { localStorage.removeItem(ACCOUNT_KEY); } catch (_err) {}
      try { localStorage.removeItem(NEXT_KEY); } catch (_err) {}
    }
    clearSession();
    syncAuthState(null, true);
    logAuth('Sign out complete');
    emitAuthChange('signOut');
  }

  function statusLabel(session){
    if (!session) return '';
    const plan = (session.plan || '').toLowerCase();
    const planLabel = plan === 'paid' ? 'All missions' : plan === 'school' ? 'School' : plan === 'guest' ? 'Mission 01 only' : 'Mission 01 free';
    if (session.mode === 'account') return session.name + ' · ' + planLabel;
    return 'Guest · ' + planLabel;
  }

  function applyHeaderAuth(){
    restoreSession().then(function(){
      const session = authState.currentUser;
      const signedOut = document.getElementById('authSignedOut');
      const signedIn = document.getElementById('authSignedIn');
      const label = document.getElementById('authSessionLabel');
      const signOutBtn = document.getElementById('authSignOut');

      if (!signedOut || !signedIn || !label || !signOutBtn) return;

      if (session){
        signedOut.style.display = 'none';
        signedIn.style.display = 'inline-flex';
        label.textContent = statusLabel(session);
        signOutBtn.onclick = function(){
          signOut();
          location.href = '/index.html?choose=1';
        };
      } else {
        signedOut.style.display = 'inline-flex';
        signedIn.style.display = 'none';
        label.textContent = '';
      }
    });
  }

  function isAuthenticated(){
    return authState.isAuthenticated;
  }

  function isReady(){
    return authState.authReady;
  }

  window.GS_AUTH = {
    currentUser: function(){ return authState.currentUser; },
    isAuthenticated: isAuthenticated,
    isReady: isReady,
    authReady: isReady,
    restoreSession: restoreSession,
    getSession: getSession,
    login: setAccount,
    signup: setAccount,
    logout: signOut,
    setAccount: setAccount,
    setGuest: setGuest,
    signOut: signOut,
    applyHeaderAuth: applyHeaderAuth
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      restoreSession().then(applyHeaderAuth);
    });
  } else {
    restoreSession().then(applyHeaderAuth);
  }
  document.addEventListener('layout:ready', applyHeaderAuth);
  window.addEventListener('gs:auth-ready', function(){
    restorePromise = null;
    restoreSession().then(applyHeaderAuth);
  });
})();
