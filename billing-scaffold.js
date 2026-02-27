(function(){
  var ACCOUNT_KEY = 'gs_account_v1';
  var CHECKOUT_KEY = 'gs_checkout_events_v1';
  var CONFIG_KEY = 'gs_billing_config_v1';
  var DEFAULT_TRIAL_DAYS = 14;
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

  function nowIso(){
    return new Date().toISOString();
  }

  function addDays(iso, days){
    var d = new Date(iso || Date.now());
    d.setDate(d.getDate() + Number(days || 0));
    return d.toISOString();
  }

  function loadAccount(){
    var a = parse(localStorage.getItem(ACCOUNT_KEY), null);
    if (!a) return null;
    if ((a.plan === 'trial' || a.plan === 'guest') && Array.isArray(a.entitlements) && a.entitlements.length > 1) {
      a.entitlements = ['pack01'];
      saveAccount(a);
    }
    return a;
  }

  function saveAccount(account){
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    return account;
  }

  function clearAccount(){
    localStorage.removeItem(ACCOUNT_KEY);
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
    var account = loadAccount();
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
      name: account.name || 'Teacher',
      email: account.email || '',
      createdAt: account.createdAt,
      accountId: account.id,
      plan: account.plan || 'trial'
    };
  }

  function syncSessionFromAccount(account){
    if (!account) {
      localStorage.removeItem('gs_auth_session');
      return;
    }
    localStorage.setItem('gs_auth_session', JSON.stringify(toSession(account)));
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
      location.href = 'auth.html?mode=create&next=' + encodeURIComponent('pricing.html') + subscribeParam;
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
        location.href = 'pricing.html?checkout=success&plan=' + encodeURIComponent(plan);
      }, function(err){
        if (err && err.indexOf('cancelled') < 0 && err.indexOf('canceled') < 0) {
          location.href = 'pricing.html?checkout=unavailable&plan=' + encodeURIComponent(plan);
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
            else { location.href = 'pricing.html?checkout=unavailable&plan=' + encodeURIComponent(plan); }
          }
        })
        .catch(function(){
          link = cfg.stripeLinks[plan] || cfg.stripeLinks.single_teacher;
          if (link) location.href = link;
          else { location.href = 'pricing.html?checkout=unavailable&plan=' + encodeURIComponent(plan); }
        });
      return;
    }

    if (link) {
      location.href = link;
      return;
    }

    var fallbackPlan = plan === 'school_license' ? 'school' : (plan === 'student_monthly' || plan === 'student_yearly' ? 'paid' : 'paid');
    grantPaid(fallbackPlan);
    location.href = 'pricing.html?checkout=success&plan=' + encodeURIComponent(plan);
  }

  function signOut(){
    clearAccount();
    localStorage.removeItem('gs_auth_session');
    if (window.GS_BIOMETRIC && window.GS_BIOMETRIC.deleteCredentials) {
      window.GS_BIOMETRIC.deleteCredentials();
    }
  }

  function restoreFromBiometric(account){
    if (!account || typeof account !== 'object') return;
    saveAccount(account);
    syncSessionFromAccount(account);
  }

  function pageNeedsAuth(pathname){
    var p = String(pathname || '').toLowerCase();
    return (
      p.indexOf('teacher-home') >= 0 ||
      p.indexOf('teacher-mode') >= 0 ||
      p.indexOf('teacher-student-progress') >= 0
    );
  }

  function detectPackFromPath(pathname, search){
    var p = String(pathname || '').toLowerCase();
    var s = String(search || '').toLowerCase();
    var combined = p + (s ? '?' + s : '');
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

  function guardCurrentPage(){
    var path = location.pathname || '';
    var search = location.search || '';
    var pack = detectPackFromPath(path, search);
    var account = loadAccount();

    if (!account) {
      if (pageNeedsAuth(path)) {
        location.href = 'auth.html?next=' + encodeURIComponent(path + search);
        return;
      }
      if (pack && pack !== 'pack01') {
        location.href = 'auth.html?next=' + encodeURIComponent(path + search);
        return;
      }
      return;
    }
    if (!pack) pack = 'pack01';
    if (pageNeedsEntitlement(path) || (pack && pack !== 'pack01')) {
      if (!hasEntitlement(pack)) {
        localStorage.setItem('gs_last_denied_pack', pack);
        alert(blockMessage(pack));
        location.href = 'pricing.html?locked=' + encodeURIComponent(pack);
      }
    }
  }

  function applyEntitlementToLinks(){
    var nodes = document.querySelectorAll('a[href]');
    var account = loadAccount();
    nodes.forEach(function(a){
      var href = a.getAttribute('href') || '';
      if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0) return;
      var hrefParts = href.split('?');
      var path = hrefParts[0];
      var query = hrefParts[1] || '';
      if (!account && pageNeedsAuth(path)) {
        a.dataset.originalHref = href;
        a.setAttribute('href', 'auth.html?next=' + encodeURIComponent(path + (query ? '?' + query : '')));
        a.title = 'Sign up or sign in to access this page';
        return;
      }
      var pack = detectPackFromPath(path, query);
      if (!pack) return;
      if (!account && pack !== 'pack01') {
        a.dataset.originalHref = href;
        a.setAttribute('href', 'auth.html?next=' + encodeURIComponent(path + (query ? '?' + query : '')));
        a.title = 'Sign up or sign in to access this mission set';
        return;
      }
      if (hasEntitlement(pack)) return;
      a.dataset.originalHref = href;
      a.setAttribute('href', 'pricing.html?locked=' + encodeURIComponent(pack));
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
        if (el.tagName === 'A') el.setAttribute('href', 'pricing.html');
        el.style.opacity = '0.65';
        el.title = 'Available in paid plan';
      });
    }

    return {
      active: active,
      setActive: setActive,
      applyLocks: applyLocks,
      pricingUrl: 'pricing.html'
    };
  }

  function getStatus(){
    var a = ensureAccount();
    if (!a) return { signedIn: false, plan: 'none', entitlements: [], trial: getTrialState(null) };
    return {
      signedIn: true,
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
    guardCurrentPage: guardCurrentPage,
    applyEntitlementToLinks: applyEntitlementToLinks,
    setConfig: setConfig,
    getConfig: loadConfig,
    getCheckoutEvents: loadCheckouts
  };

  window.GS_TRIAL = trialCompat();

  // Run guard immediately so locked packs never render
  guardCurrentPage();
  function onReady(){
    maybeHandleCheckoutSuccess();
    applyEntitlementToLinks();
    if (window.GS_IAP && window.GS_IAP.isNative && window.GS_IAP.isNative()) {
      var a = loadAccount();
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
