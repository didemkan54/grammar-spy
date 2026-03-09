(function(){
  var ACCOUNT_KEY = 'gs_account_v1';
  var SESSION_KEY = 'gs_auth_session';
  var NEXT_KEY = 'gs_auth_next_v1';
  var CHECKOUT_KEY = 'gs_checkout_events_v1';
  var CONFIG_KEY = 'gs_billing_config_v1';
  var DEFAULT_TRIAL_DAYS = 14;
  var AUTH_DEBUG = true;
  var DEFAULT_STRIPE_LINKS = {
    single_teacher: 'https://buy.stripe.com/9B63cv9Vn7zgePJ8iR3gk01',
    single_teacher_monthly: 'https://buy.stripe.com/9B63cv9Vn7zgePJ8iR3gk01',
    single_teacher_yearly: 'https://buy.stripe.com/bJe7sL3wZaLs0YTcz73gk04',
    student_monthly: 'https://buy.stripe.com/28E5kD4B35r89vp42B3gk02',
    student_yearly: 'https://buy.stripe.com/5kQcN5aZr2eWdLF7eN3gk03',
    school_license: ''
  };

  function parse(raw, fallback){
    if (!raw) return fallback;
    try {
      var v = JSON.parse(raw);
      return v && typeof v === 'object' ? v : fallback;
    } catch (_err){
      return fallback;
    }
  }

  function logAuth(message, payload){
    if (!AUTH_DEBUG || typeof console === 'undefined' || typeof console.info !== 'function') return;
    if (typeof payload === 'undefined') {
      console.info('[GSAuth]', message);
      return;
    }
    console.info('[GSAuth]', message, payload);
  }

  function storageSet(key, value){
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function storageGet(key){
    try {
      return localStorage.getItem(key);
    } catch (_err) {
      return '';
    }
  }

  function storageRemove(key){
    try {
      localStorage.removeItem(key);
    } catch (_err) {}
  }

  function normalizeInternalTarget(target){
    var raw = String(target || '').trim();
    if (!raw) return '';
    var lower = raw.toLowerCase();
    if (lower.indexOf('http://') === 0 || lower.indexOf('https://') === 0 || lower.indexOf('//') === 0 || lower.indexOf('javascript:') === 0) return '';
    if (raw.charAt(0) !== '/') {
      raw = '/' + raw.replace(/^\.?\//, '');
    }
    return raw;
  }

  function storePostAuthDestination(target){
    var normalized = normalizeInternalTarget(target);
    if (!normalized) return '';
    storageSet(NEXT_KEY, normalized);
    return normalized;
  }

  function consumePostAuthDestination(){
    var next = normalizeInternalTarget(storageGet(NEXT_KEY));
    storageRemove(NEXT_KEY);
    return next;
  }

  function nowIso(){
    return new Date().toISOString();
  }

  function addDays(iso, days){
    var d = new Date(iso || Date.now());
    d.setDate(d.getDate() + Number(days || 0));
    return d.toISOString();
  }

  function loadAccount(){
    var a = parse(storageGet(ACCOUNT_KEY), null);
    if (!a) {
      // Backfill legacy session-only state so signed-in users stay authenticated.
      var session = loadSession();
      var rebuilt = buildAccountFromSession(session);
      if (rebuilt) {
        a = saveAccount(rebuilt);
      }
    }
    if (!a) return null;
    if ((a.plan === 'trial' || a.plan === 'guest') && Array.isArray(a.entitlements) && a.entitlements.length > 1) {
      a.entitlements = ['pack01'];
      saveAccount(a);
    }
    return a;
  }

  function saveAccount(account){
    storageSet(ACCOUNT_KEY, JSON.stringify(account));
    return account;
  }

  function clearAccount(){
    storageRemove(ACCOUNT_KEY);
  }

  function loadSession(){
    return parse(storageGet(SESSION_KEY), null);
  }

  function buildAccountFromSession(session){
    if (!session || typeof session !== 'object') return null;
    var stamp = nowIso();
    var role = String(session.role || '').trim().toLowerCase() === 'student' ? 'student' : 'teacher';
    var plan = String(session.plan || '').trim().toLowerCase();
    if (!plan) plan = 'trial';
    return {
      id: session.accountId || ('acct_' + Math.random().toString(36).slice(2, 10)),
      mode: session.mode || 'account',
      role: role,
      name: String(session.name || (role === 'student' ? 'Student' : 'Teacher')).trim() || (role === 'student' ? 'Student' : 'Teacher'),
      email: String(session.email || '').trim(),
      createdAt: session.createdAt || stamp,
      updatedAt: stamp,
      plan: plan,
      entitlements: plan === 'paid' || plan === 'school'
        ? ['pack01', 'pack02', 'pack03', 'pack04', 'pack05', 'pack06']
        : ['pack01'],
      trial: {
        startedAt: session.createdAt || stamp,
        endsAt: addDays(session.createdAt || stamp, 365),
        status: 'active'
      },
      billing: {
        status: plan === 'paid' || plan === 'school' ? 'active' : 'trialing',
        stripeCustomerId: '',
        lastCheckoutAt: ''
      }
    };
  }

  function restoreAccountFromSession(){
    var account = loadAccount();
    if (account) return account;
    var session = loadSession();
    if (!session) return null;
    var rebuilt = buildAccountFromSession(session);
    if (!rebuilt) return null;
    logAuth('Restoring account from session fallback', { accountId: rebuilt.id, role: rebuilt.role, plan: rebuilt.plan });
    return saveAccount(rebuilt);
  }

  function loadConfig(){
    var stored = parse(localStorage.getItem(CONFIG_KEY), {});
    var storedLinks = stored && stored.stripeLinks ? stored.stripeLinks : {};
    return {
      stripeLinks: {
        single_teacher: storedLinks.single_teacher || DEFAULT_STRIPE_LINKS.single_teacher,
        single_teacher_monthly: storedLinks.single_teacher_monthly || DEFAULT_STRIPE_LINKS.single_teacher_monthly,
        single_teacher_yearly: storedLinks.single_teacher_yearly || DEFAULT_STRIPE_LINKS.single_teacher_yearly,
        student_monthly: storedLinks.student_monthly || DEFAULT_STRIPE_LINKS.student_monthly,
        student_yearly: storedLinks.student_yearly || DEFAULT_STRIPE_LINKS.student_yearly,
        school_license: storedLinks.school_license || DEFAULT_STRIPE_LINKS.school_license
      }
    };
  }

  function setConfig(next){
    var cfg = loadConfig();
    var sl = next && next.stripeLinks || {};
    var merged = {
      stripeLinks: {
        single_teacher: sl.single_teacher || cfg.stripeLinks.single_teacher || '',
        single_teacher_monthly: sl.single_teacher_monthly || cfg.stripeLinks.single_teacher_monthly || '',
        single_teacher_yearly: sl.single_teacher_yearly || cfg.stripeLinks.single_teacher_yearly || '',
        student_monthly: sl.student_monthly || cfg.stripeLinks.student_monthly || '',
        student_yearly: sl.student_yearly || cfg.stripeLinks.student_yearly || '',
        school_license: sl.school_license || cfg.stripeLinks.school_license || ''
      }
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
    return merged;
  }

  function ensureAccount(){
    var account = loadAccount() || restoreAccountFromSession();
    if (!account) return null;
    if (!account.id) account.id = 'acct_' + Math.random().toString(36).slice(2, 10);
    if (!account.createdAt) account.createdAt = nowIso();
    if (!account.plan) account.plan = 'trial';
    if (!Array.isArray(account.entitlements)) account.entitlements = ['pack01'];
    if (isOwnerEmail(account.email) && account.plan !== 'paid') {
      account.plan = 'paid';
      account.entitlements = ['pack01', 'pack02', 'pack03', 'pack04', 'pack05', 'pack06'];
      if (account.billing) account.billing.status = 'active';
    }
    if ((account.plan === 'trial' || account.plan === 'guest') && account.entitlements.length > 1) {
      account.entitlements = ['pack01'];
    }
    if (!account.trial) {
      var start = account.createdAt || nowIso();
      account.trial = {
        startedAt: start,
        endsAt: addDays(start, 365),
        status: 'active'
      };
    }
    return saveAccount(account);
  }

  function toSession(account){
    if (!account) return null;
    return {
      mode: account.mode || 'account',
      role: account.role || 'teacher',
      name: account.name || 'Teacher',
      email: account.email || '',
      createdAt: account.createdAt,
      accountId: account.id,
      plan: account.plan || 'trial'
    };
  }

  function syncSessionFromAccount(account){
    if (!account) {
      storageRemove(SESSION_KEY);
      return;
    }
    storageSet(SESSION_KEY, JSON.stringify(toSession(account)));
  }

  function createAccount(name, email, role){
    var stamp = nowIso();
    var emailStr = String(email || '').trim();
    var owner = isOwnerEmail(emailStr);
    var account = {
      id: 'acct_' + Math.random().toString(36).slice(2, 10),
      mode: 'account',
      role: role || 'teacher',
      name: String(name || 'Teacher').trim() || 'Teacher',
      email: emailStr,
      createdAt: stamp,
      updatedAt: stamp,
      plan: owner ? 'paid' : 'trial',
      entitlements: owner ? ['pack01', 'pack02', 'pack03', 'pack04', 'pack05', 'pack06'] : ['pack01'],
      trial: {
        startedAt: stamp,
        endsAt: addDays(stamp, 365),
        status: 'active'
      },
      billing: {
        status: owner ? 'active' : 'trialing',
        stripeCustomerId: '',
        lastCheckoutAt: ''
      }
    };
    saveAccount(account);
    syncSessionFromAccount(account);
    return account;
  }

  function setGuestAccount(){
    var stamp = nowIso();
    var account = {
      id: 'guest_' + Math.random().toString(36).slice(2, 10),
      mode: 'guest',
      role: 'teacher',
      name: 'Guest Teacher',
      email: '',
      createdAt: stamp,
      updatedAt: stamp,
      plan: 'guest',
      entitlements: ['pack01', 'pack02', 'pack03', 'pack04', 'pack05', 'pack06'],
      trial: {
        startedAt: stamp,
        endsAt: addDays(stamp, 2),
        status: 'active'
      },
      billing: {
        status: 'guest',
        stripeCustomerId: '',
        lastCheckoutAt: ''
      }
    };
    saveAccount(account);
    syncSessionFromAccount(account);
    return account;
  }

  function getTrialState(account){
    var a = account || ensureAccount();
    if (!a || !a.trial) return { active: false, expired: true, daysLeft: 0, endsAt: '' };
    var ends = new Date(a.trial.endsAt || 0).getTime();
    var now = Date.now();
    var msLeft = ends - now;
    var daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));
    var expired = msLeft <= 0 || a.trial.status === 'expired';
    if (expired && a.trial.status !== 'expired') {
      a.trial.status = 'expired';
      a.billing.status = 'past_due';
      a.updatedAt = nowIso();
      saveAccount(a);
      syncSessionFromAccount(a);
    }
    return {
      active: !expired,
      expired: expired,
      daysLeft: daysLeft,
      endsAt: a.trial.endsAt
    };
  }

  function hasEntitlement(packId){
    var a = loadAccount();
    if (!a) return packId === 'pack01';
    if (a.plan === 'paid' || a.plan === 'school') return true;
    if (a.plan === 'trial' || a.plan === 'guest') return packId === 'pack01';
    var trial = getTrialState(a);
    if (!trial.active) return packId === 'pack01';
    if (Array.isArray(a.entitlements) && a.entitlements.indexOf(packId) >= 0) return true;
    return false;
  }

  function grantPaid(plan){
    var a = ensureAccount();
    if (!a) return null;
    a.plan = plan === 'school' ? 'school' : 'paid';
    a.billing.status = 'active';
    a.entitlements = ['pack01', 'pack02', 'pack03', 'pack04', 'pack05', 'pack06'];
    a.updatedAt = nowIso();
    saveAccount(a);
    syncSessionFromAccount(a);
    return a;
  }

  /** Owner emails — always get full access */
  var OWNER_EMAILS = [
    'gul.d.kan@mcpsmd.net'
  ];

  function isOwnerEmail(email) {
    if (!email) return false;
    return OWNER_EMAILS.indexOf(email.trim().toLowerCase()) >= 0;
  }

  /** Promo codes for teacher feedback - full access, no subscription */
  var PROMO_CODES = new Set([
    'FEEDBACK2025',
    'TEACHERBETA',
    'GSREVIEW',
    'GRAMMARSPY'
  ]);

  /** Teacher classroom codes — students enter these at home for full access */
  var TEACHER_CODES = {
    'KANCLASS': { teacher: 'Mrs. Kan', school: 'MCPS', access: 'full' },
    'SPYGRAMMAR': { teacher: 'Mrs. Kan', school: 'MCPS', access: 'full' },
    'KANPER4': { teacher: 'Mrs. Kan', school: 'MCPS', period: '4', access: 'full' }
  };

  function redeemPromoCode(code){
    if (!code || typeof code !== 'string') return false;
    var normalized = String(code).trim().toUpperCase();
    if (!PROMO_CODES.has(normalized) && !TEACHER_CODES[normalized]) return false;
    var a = ensureAccount();
    if (!a) return false;
    grantPaid('school');
    return true;
  }

  function loadCheckouts(){
    return parse(localStorage.getItem(CHECKOUT_KEY), []);
  }

  function saveCheckouts(rows){
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(rows.slice(-200)));
    return rows;
  }

  function beginCheckout(plan){
    var a = ensureAccount();
    if (!a) {
      var subscribeParam = (plan === 'single_teacher_monthly' || plan === 'single_teacher_yearly' || plan === 'student_monthly' || plan === 'student_yearly') ? '&subscribe=' + encodeURIComponent(plan) : '';
      location.href = '/auth.html?mode=create&next=' + encodeURIComponent('/pricing.html') + subscribeParam;
      return;
    }
    var cfg = loadConfig();
    var isStripePlan = plan === 'single_teacher_monthly' || plan === 'single_teacher_yearly' || plan === 'student_monthly' || plan === 'student_yearly';
    var link = plan === 'school_license' ? cfg.stripeLinks.school_license : (cfg.stripeLinks[plan] || (plan.indexOf('student') >= 0 ? cfg.stripeLinks.single_teacher : cfg.stripeLinks.single_teacher));
    var row = {
      ts: nowIso(),
      accountId: a.id,
      plan: plan,
      status: 'redirected'
    };
    var rows = loadCheckouts();
    rows.push(row);
    saveCheckouts(rows);
    a.billing.lastCheckoutAt = row.ts;
    a.updatedAt = row.ts;
    saveAccount(a);

    if (isStripePlan && window.GS_IAP && window.GS_IAP.isNative && window.GS_IAP.isNative() && window.GS_IAP.isConfigured && window.GS_IAP.isConfigured()) {
      window.GS_IAP.purchase(plan, function(){
        grantPaid('paid');
        location.href = '/pricing.html?checkout=success&plan=' + encodeURIComponent(plan);
      }, function(err){
        if (err && err.indexOf('cancelled') < 0 && err.indexOf('canceled') < 0) {
          location.href = '/pricing.html?checkout=unavailable&plan=' + encodeURIComponent(plan);
        }
      });
      return;
    }
    if (isStripePlan) {
      fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan, email: a.email || '' })
      })
        .then(function(r){ return r.json(); })
        .then(function(data){
          if (data && data.url) {
            location.href = data.url;
          } else {
            link = cfg.stripeLinks[plan] || cfg.stripeLinks.single_teacher;
            if (link) location.href = link;
            else { location.href = '/pricing.html?checkout=unavailable&plan=' + encodeURIComponent(plan); }
          }
        })
        .catch(function(){
          link = cfg.stripeLinks[plan] || cfg.stripeLinks.single_teacher;
          if (link) location.href = link;
          else { location.href = '/pricing.html?checkout=unavailable&plan=' + encodeURIComponent(plan); }
        });
      return;
    }

    if (link) {
      location.href = link;
      return;
    }

    var fallbackPlan = plan === 'school_license' ? 'school' : (plan === 'student_monthly' || plan === 'student_yearly' ? 'paid' : 'paid');
    grantPaid(fallbackPlan);
    location.href = '/pricing.html?checkout=success&plan=' + encodeURIComponent(plan);
  }

  function signOut(){
    logAuth('Signing out and clearing persisted auth state');
    clearAccount();
    storageRemove(SESSION_KEY);
    storageRemove(NEXT_KEY);
    if (window.GS_BIOMETRIC && window.GS_BIOMETRIC.deleteCredentials) {
      window.GS_BIOMETRIC.deleteCredentials();
    }
  }

  function restoreFromBiometric(account){
    if (!account || typeof account !== 'object') return;
    saveAccount(account);
    syncSessionFromAccount(account);
    logAuth('Restored account from biometric credentials', { accountId: account.id || '' });
  }

  var authReady = false;
  var authInitPromise = null;
  var authLoadingNode = null;

  function setAuthLoading(isLoading){
    if (!pageNeedsAuth(location.pathname || '')) return;
    if (isLoading) {
      if (authLoadingNode) return;
      authLoadingNode = document.createElement('div');
      authLoadingNode.id = 'gsAuthLoadingGate';
      authLoadingNode.setAttribute('role', 'status');
      authLoadingNode.setAttribute('aria-live', 'polite');
      authLoadingNode.textContent = 'Checking session...';
      authLoadingNode.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#f2f4f7;color:#16223a;font:700 14px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase';
      document.documentElement.setAttribute('data-gs-auth-loading', '1');
      if (document.body) {
        document.body.appendChild(authLoadingNode);
      } else {
        document.addEventListener('DOMContentLoaded', function(){
          if (authLoadingNode && !authLoadingNode.parentNode) document.body.appendChild(authLoadingNode);
        }, { once: true });
      }
      return;
    }
    document.documentElement.setAttribute('data-gs-auth-loading', '0');
    if (authLoadingNode && authLoadingNode.parentNode) authLoadingNode.parentNode.removeChild(authLoadingNode);
    authLoadingNode = null;
  }

  function initializeAuth(){
    if (authInitPromise) return authInitPromise;
    setAuthLoading(true);
    authInitPromise = Promise.resolve().then(function(){
      var account = ensureAccount();
      if (account) syncSessionFromAccount(account);
      authReady = true;
      logAuth('Auth initialization completed', { signedIn: Boolean(account), accountId: account && account.id ? account.id : '' });
      try {
        window.dispatchEvent(new CustomEvent('gs:auth-ready', {
          detail: {
            signedIn: Boolean(account),
            accountId: account && account.id ? account.id : '',
            role: account && account.role ? account.role : ''
          }
        }));
      } catch (_err) {}
      return account;
    }).catch(function(err){
      authReady = true;
      logAuth('Auth initialization failed', { message: err && err.message ? err.message : 'unknown_error' });
      return null;
    }).finally(function(){
      setAuthLoading(false);
    });
    return authInitPromise;
  }

  function buildAuthRedirect(path, search){
    var target = normalizeInternalTarget((path || '') + (search || ''));
    if (!target) target = '/';
    storePostAuthDestination(target);
    return '/auth.html?next=' + encodeURIComponent(target);
  }

  function redirectToAuth(path, search, reason){
    var href = buildAuthRedirect(path, search);
    logAuth('Redirecting to auth', { reason: reason || 'guard', target: href });
    location.href = href;
  }

  function pageNeedsAuth(pathname){
    var p = String(pathname || '').toLowerCase();
    return (
      p.indexOf('teacher-home') >= 0 ||
      p.indexOf('teacher-mode') >= 0 ||
      p.indexOf('teacher-student-progress') >= 0 ||
      p.indexOf('dashboard/teacher') >= 0 ||
      p.indexOf('classrooms') >= 0 ||
      p.indexOf('teacher-dashboard') >= 0 ||
      p.indexOf('/play/') >= 0 ||
      p.indexOf('missions/hub') >= 0
    );
  }

  function detectPackFromPath(pathname, search){
    var p = String(pathname || '').toLowerCase();
    var s = String(search || '').toLowerCase();
    var combined = p + (s ? '?' + s : '');
    var missionMatch = combined.match(/[?&]mission=([^&]+)/);
    if (missionMatch && missionMatch[1]) {
      var missionRaw = '';
      try {
        missionRaw = decodeURIComponent(missionMatch[1]);
      } catch (_err) {
        missionRaw = missionMatch[1];
      }
      var missionId = String(missionRaw || '').trim().toLowerCase().replace(/-/g, '_');
      // Mission 01 remains free; all other mission-catalog entries are paid.
      if (missionId === 'speak_in_the_moment') return 'pack01';
      if (missionId) return 'pack02';
    }
    var qMatch = combined.match(/[?&]pack=(pack0[1-6])/);
    if (qMatch && qMatch[1]) return qMatch[1];
    if (p.indexOf('pack06') >= 0) return 'pack06';
    if (p.indexOf('pack05') >= 0) return 'pack05';
    if (p.indexOf('pack04') >= 0) return 'pack04';
    if (p.indexOf('pack03') >= 0 || p.indexOf('be-verb-') >= 0) return 'pack03';
    if (p.indexOf('pack02') >= 0 || p.indexOf('present-') >= 0) return 'pack02';
    if (p.indexOf('teacher-mode') >= 0 || p.indexOf('error-smash') >= 0 || p.indexOf('past-sort') >= 0 || p.indexOf('rule-sprint') >= 0 || p.indexOf('signal-decoder') >= 0 || p.indexOf('case-interview') >= 0 || p.indexOf('announcement-rebuild') >= 0 || p.indexOf('narrative-builder') >= 0 || p.indexOf('word-drop') >= 0) return 'pack01';
    return '';
  }

  function pageNeedsEntitlement(pathname){
    var p = String(pathname || '').toLowerCase();
    return (
      p.indexOf('teacher-mode') >= 0 ||
      p.indexOf('pack02-home') >= 0 ||
      p.indexOf('pack03-home') >= 0 ||
      p.indexOf('pack04-home') >= 0 ||
      p.indexOf('pack05-home') >= 0 ||
      p.indexOf('pack06-home') >= 0 ||
      p.indexOf('present-') >= 0 ||
      p.indexOf('be-verb-') >= 0
    );
  }

  function blockMessage(packId){
    var label = {
      pack01: 'Retell What Happened',
      pack02: 'Speak In The Moment',
      pack03: 'Sentence Confidence Missions',
      pack04: 'Link Ideas Clearly',
      pack05: 'Reference Smartly',
      pack06: 'Question Flow Missions'
    }[packId] || 'this mission pack';
    return 'Your current trial/account does not include ' + label + '. Upgrade to unlock this mission set.';
  }

  function guardCurrentPageSync(){
    var path = location.pathname || '';
    var search = location.search || '';
    var pack = detectPackFromPath(path, search);
    var account = ensureAccount();

    if (!account) {
      if (pageNeedsAuth(path)) {
        redirectToAuth(path, search, 'protected_page');
        return;
      }
      if (pack && pack !== 'pack01') {
        redirectToAuth(path, search, 'locked_pack_requires_auth');
        return;
      }
      return;
    }
    if (!pack) pack = 'pack01';
    if (pageNeedsEntitlement(path) || (pack && pack !== 'pack01')) {
      if (!hasEntitlement(pack)) {
        localStorage.setItem('gs_last_denied_pack', pack);
        alert(blockMessage(pack));
        location.href = '/pricing.html?locked=' + encodeURIComponent(pack);
      }
    }
  }

  function guardCurrentPage(){
    return initializeAuth().then(function(){
      guardCurrentPageSync();
      return true;
    });
  }

  function applyEntitlementToLinks(){
    var nodes = document.querySelectorAll('a[href]');
    var account = ensureAccount();
    nodes.forEach(function(a){
      var href = a.getAttribute('href') || '';
      if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0) return;
      var hrefParts = href.split('?');
      var path = hrefParts[0];
      var query = hrefParts[1] || '';
      if (!account && pageNeedsAuth(path)) {
        a.dataset.originalHref = href;
        var nextAuthTarget = normalizeInternalTarget(path + (query ? '?' + query : '')) || '/';
        a.setAttribute('href', '/auth.html?next=' + encodeURIComponent(nextAuthTarget));
        a.title = 'Sign up or sign in to access this page';
        return;
      }
      var pack = detectPackFromPath(path, query);
      if (!pack) return;
      if (!account && pack !== 'pack01') {
        a.dataset.originalHref = href;
        var nextPackTarget = normalizeInternalTarget(path + (query ? '?' + query : '')) || '/';
        a.setAttribute('href', '/auth.html?next=' + encodeURIComponent(nextPackTarget));
        a.title = 'Sign up or sign in to access this mission set';
        return;
      }
      if (hasEntitlement(pack)) return;
      a.dataset.originalHref = href;
      a.setAttribute('href', '/pricing.html?locked=' + encodeURIComponent(pack));
      a.title = blockMessage(pack);
    });
  }

  function trialCompat(){
    var a = ensureAccount();
    var trial = getTrialState(a);
    var active = a ? (a.plan !== 'paid' && a.plan !== 'school' && trial.active) : false;

    function setActive(v){
      var account = ensureAccount();
      if (!account) return;
      if (!v) {
        account.trial.status = 'expired';
        account.updatedAt = nowIso();
        saveAccount(account);
        syncSessionFromAccount(account);
      }
      location.reload();
    }

    function applyLocks(selectors){
      if (!active) return;
      selectors.forEach(function(sel){
        var el = document.querySelector(sel);
        if (!el) return;
        if (el.tagName === 'A') el.setAttribute('href', '/pricing.html');
        el.style.opacity = '0.65';
        el.title = 'Available in paid plan';
      });
    }

    return {
      active: active,
      setActive: setActive,
      applyLocks: applyLocks,
      pricingUrl: '/pricing.html'
    };
  }

  function getStatus(){
    var a = ensureAccount();
    if (!a) return { signedIn: false, authReady: authReady, plan: 'none', entitlements: [], trial: getTrialState(null) };
    return {
      signedIn: true,
      authReady: authReady,
      account: a,
      plan: a.plan,
      entitlements: a.entitlements || [],
      trial: getTrialState(a)
    };
  }

  function maybeHandleCheckoutSuccess(){
    var params = new URLSearchParams(location.search);
    if (params.get('checkout') !== 'success') return;
    var plan = params.get('plan') === 'school_license' ? 'school' : 'paid';
    grantPaid(plan);
  }

  window.GS_BILLING = {
    getAccount: ensureAccount,
    createAccount: createAccount,
    setGuestAccount: setGuestAccount,
    signOut: signOut,
    restoreFromBiometric: restoreFromBiometric,
    redeemPromoCode: redeemPromoCode,
    getStatus: getStatus,
    hasEntitlement: hasEntitlement,
    grantPaid: grantPaid,
    beginCheckout: beginCheckout,
    initializeAuth: initializeAuth,
    isAuthReady: function(){ return authReady; },
    normalizeInternalTarget: normalizeInternalTarget,
    storePostAuthDestination: storePostAuthDestination,
    consumePostAuthDestination: consumePostAuthDestination,
    guardCurrentPage: guardCurrentPage,
    applyEntitlementToLinks: applyEntitlementToLinks,
    setConfig: setConfig,
    getConfig: loadConfig,
    getCheckoutEvents: loadCheckouts
  };

  window.GS_TRIAL = trialCompat();

  // Run guard after auth restoration to avoid false redirects.
  guardCurrentPage();
  function onReady(){
    initializeAuth().then(function(){
      maybeHandleCheckoutSuccess();
      applyEntitlementToLinks();
    });
    if (window.GS_IAP && window.GS_IAP.isNative && window.GS_IAP.isNative()) {
      var a = ensureAccount();
      window.GS_IAP.init(a ? (a.id || a.email || '') : '').then(function(ok){
        if (ok && window.GS_IAP.syncEntitlementToAccount) {
          window.GS_IAP.syncEntitlementToAccount(loadAccount, grantPaid);
        }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
