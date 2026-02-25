(function(){
  const KEY = 'gs_auth_session';

  function read(){
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      if (!v || typeof v !== 'object') return null;
      return v;
    } catch {
      return null;
    }
  }

  function write(v){
    localStorage.setItem(KEY, JSON.stringify(v));
  }

  function clear(){
    localStorage.removeItem(KEY);
  }

  function toSession(account){
    if (!account) return null;
    return {
      mode: account.mode || 'account',
      name: account.name || 'Teacher',
      email: account.email || '',
      createdAt: account.createdAt || new Date().toISOString(),
      accountId: account.id || '',
      plan: account.plan || 'trial'
    };
  }

  function getSession(){
    const billing = window.GS_BILLING;
    if (billing && billing.getAccount){
      const account = billing.getAccount();
      if (account) {
        const session = toSession(account);
        write(session);
        return session;
      }
    }
    return read();
  }

  function setAccount(name, email){
    const billing = window.GS_BILLING;
    if (billing && billing.createAccount){
      const account = billing.createAccount(name, email, 'teacher');
      const session = toSession(account);
      write(session);
      return session;
    }

    const session = {
      mode: 'account',
      name: String(name || 'Teacher').trim() || 'Teacher',
      email: String(email || '').trim(),
      createdAt: new Date().toISOString(),
      plan: 'trial'
    };
    write(session);
    return session;
  }

  function setGuest(){
    const billing = window.GS_BILLING;
    if (billing && billing.setGuestAccount){
      const account = billing.setGuestAccount();
      const session = toSession(account);
      write(session);
      return session;
    }

    const session = {
      mode: 'guest',
      name: 'Guest Teacher',
      createdAt: new Date().toISOString(),
      plan: 'guest'
    };
    write(session);
    return session;
  }

  function signOut(){
    const billing = window.GS_BILLING;
    if (billing && billing.signOut){
      billing.signOut();
    }
    clear();
  }

  function statusLabel(session){
    if (!session) return '';
    const plan = (session.plan || '').toLowerCase();
    const planLabel = plan === 'paid' ? 'All missions' : plan === 'school' ? 'School' : plan === 'guest' ? 'Mission 01 only' : 'Mission 01 free';
    if (session.mode === 'account') return session.name + ' · ' + planLabel;
    return 'Guest · ' + planLabel;
  }

  function applyHeaderAuth(){
    const session = getSession();
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
        location.href = 'index.html?choose=1';
      };
    } else {
      signedOut.style.display = 'inline-flex';
      signedIn.style.display = 'none';
      label.textContent = '';
    }
  }

  window.GS_AUTH = {
    getSession,
    setAccount,
    setGuest,
    signOut,
    applyHeaderAuth
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHeaderAuth);
  } else {
    applyHeaderAuth();
  }
  document.addEventListener('layout:ready', applyHeaderAuth);
})();
