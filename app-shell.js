(function(){
  var KEY = 'gs_analytics_events_v1';
  var GROWTH_KEY = 'gs_growth_records_v1';
  var USER_REGISTRY_KEY = 'gs_admin_users_v1';
  var LOGIN_MARK_KEY = 'gs_last_login_mark_v1';
  var ACTIVE_STUDENT_KEY = 'gs_active_student_v1';
  var CLOUD_CONFIG_KEY = 'gs_cloud_config_v1';
  var CLOUD_QUEUE_KEY = 'gs_cloud_queue_v1';
  var MAX_EVENTS = 1500;
  var MAX_GROWTH = 4000;
  var MAX_USERS = 3000;
  var MAX_QUEUE = 3000;

  // Google Analytics 4 — basic page tracking
  // Measurement ID: G-WMZVCJN0KB
  var GA_MEASUREMENT_ID = 'G-WMZVCJN0KB';

  function initGoogleAnalytics(){
    if (!GA_MEASUREMENT_ID || typeof document === 'undefined') return;
    if (document.querySelector('script[data-gs-ga=\"1\"]')) return;

    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    s.setAttribute('data-gs-ga', '1');
    document.head && document.head.appendChild(s);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initGoogleAnalytics();
    } else {
      document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
    }
  }

  function safeParse(raw){
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err){
      return [];
    }
  }

  function safeParseObject(raw, fallback){
    if (!raw) return fallback || {};
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      return fallback || {};
    } catch (_err){
      return fallback || {};
    }
  }

  function nowIso(){
    return new Date().toISOString();
  }

  function pad2(n){
    return Number(n) < 10 ? '0' + Number(n) : String(Number(n));
  }

  function dayKey(iso){
    var d = new Date(iso || Date.now());
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function normalizeEmail(value){
    return String(value || '').trim().toLowerCase();
  }

  function normalizeName(value){
    return String(value || '').trim();
  }

  function resolveUserKey(payload){
    var p = payload || {};
    if (p.accountId) return 'acct:' + String(p.accountId).trim();
    var email = normalizeEmail(p.email);
    if (email) return 'email:' + email;
    var name = normalizeName(p.name).toLowerCase();
    if (name) return 'name:' + name;
    return 'anon:' + Math.random().toString(36).slice(2, 10);
  }

  function readUsers(){
    return safeParse(localStorage.getItem(USER_REGISTRY_KEY))
      .filter(function(row){ return row && typeof row === 'object'; });
  }

  function writeUsers(rows){
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify((rows || []).slice(-MAX_USERS)));
  }

  function findUserIndex(rows, payload, userKey){
    var email = normalizeEmail(payload && payload.email);
    var accountId = payload && payload.accountId ? String(payload.accountId).trim() : '';
    for (var i = 0; i < rows.length; i += 1){
      var row = rows[i] || {};
      if (row.userKey && row.userKey === userKey) return i;
      if (email && row.emailNormalized === email) return i;
      if (accountId && row.accountId === accountId) return i;
    }
    return -1;
  }

  function hydrateUserRow(row, payload, userKey, now){
    var p = payload || {};
    var out = row && typeof row === 'object' ? row : {};
    out.userKey = out.userKey || userKey;
    out.accountId = p.accountId ? String(p.accountId).trim() : (out.accountId || '');
    out.email = p.email ? String(p.email).trim() : (out.email || '');
    out.emailNormalized = normalizeEmail(out.email);
    out.name = p.name ? normalizeName(p.name) : (out.name || '');
    out.role = p.role ? String(p.role).trim() : (out.role || 'teacher');
    out.mode = p.mode ? String(p.mode).trim() : (out.mode || 'account');
    out.plan = p.plan ? String(p.plan).trim() : (out.plan || 'trial');
    out.createdAt = out.createdAt || p.createdAt || now;
    out.updatedAt = now;
    out.lastSeenAt = now;
    out.loginCount = Number(out.loginCount || 0);
    out.classroomCount = Number(out.classroomCount || 0);
    out.classroomCreated = Boolean(out.classroomCreated);
    out.signupCount = Number(out.signupCount || 0);
    return out;
  }

  function mutateUser(payload, mutator){
    var rows = readUsers();
    var now = nowIso();
    var userKey = resolveUserKey(payload);
    var idx = findUserIndex(rows, payload, userKey);
    var row = hydrateUserRow(idx >= 0 ? rows[idx] : null, payload, userKey, now);
    if (typeof mutator === 'function') mutator(row, now);
    row.updatedAt = now;
    row.lastSeenAt = now;
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
    writeUsers(rows);
    return row;
  }

  function trackUserCreated(payload){
    var didCreate = false;
    var row = mutateUser(payload, function(rec, now){
      if (!rec.firstSignupAt){
        rec.firstSignupAt = now;
        rec.createdAt = now;
        didCreate = true;
      }
      rec.lastSignupAt = now;
      rec.signupCount += 1;
      if (!rec.lastLoginAt){
        rec.lastLoginAt = now;
        rec.loginCount = Math.max(1, rec.loginCount);
      }
    });

    if (!(payload && payload.suppressAnalytics) && didCreate && typeof track === 'function') {
      track('user_signup', {
        userKey: row.userKey,
        email: row.email || '',
        plan: row.plan || '',
        role: row.role || 'teacher'
      });
    }
    return row;
  }

  function trackLogin(payload){
    var didLogIn = false;
    var minGapMs = payload && Number(payload.minGapMs || 0) > 0 ? Number(payload.minGapMs) : 0;
    var nowMs = Date.now();

    var row = mutateUser(payload, function(rec, now){
      var lastMs = rec.lastLoginAt ? new Date(rec.lastLoginAt).getTime() : 0;
      if (!lastMs || nowMs - lastMs >= minGapMs){
        rec.lastLoginAt = now;
        rec.loginCount += 1;
        rec.lastLoginSource = payload && payload.source ? String(payload.source) : 'auth';
        didLogIn = true;
      }
    });

    if (!(payload && payload.suppressAnalytics) && didLogIn && typeof track === 'function') {
      track('user_login', {
        userKey: row.userKey,
        email: row.email || '',
        plan: row.plan || '',
        source: payload && payload.source ? String(payload.source) : 'auth'
      });
    }
    return row;
  }

  function trackClassroomCreated(payload){
    var row = mutateUser(payload, function(rec, now){
      rec.classroomCreated = true;
      rec.classroomCount += 1;
      rec.lastClassroomAt = now;
      rec.lastClassroomName = payload && payload.classroomName ? String(payload.classroomName) : (rec.lastClassroomName || '');
      rec.lastClassroomPack = payload && payload.pack ? String(payload.pack) : (rec.lastClassroomPack || '');
      rec.lastClassroomFormat = payload && payload.playFormat ? String(payload.playFormat) : (rec.lastClassroomFormat || '');
    });

    if (!(payload && payload.suppressAnalytics) && typeof track === 'function') {
      track('classroom_created', {
        userKey: row.userKey,
        email: row.email || '',
        pack: row.lastClassroomPack || '',
        playFormat: row.lastClassroomFormat || '',
        classroomName: row.lastClassroomName || ''
      });
    }
    return row;
  }

  function listAdminUsers(options){
    var opts = options || {};
    var includeGuests = Boolean(opts.includeGuests);
    var rows = readUsers().filter(function(row){
      if (!includeGuests && row.mode === 'guest') return false;
      if (!row.email && !row.accountId && !row.name) return false;
      return true;
    });
    rows.sort(function(a, b){
      var aMs = new Date(a.lastLoginAt || a.createdAt || 0).getTime();
      var bMs = new Date(b.lastLoginAt || b.createdAt || 0).getTime();
      return bMs - aMs;
    });
    return rows;
  }

  function getAdminSummary(){
    var rows = listAdminUsers({ includeGuests: false });
    var today = dayKey();
    var newUsersToday = rows.filter(function(row){
      return dayKey(row.createdAt) === today;
    }).length;
    var lastLoginAt = '';
    rows.forEach(function(row){
      if (!row.lastLoginAt) return;
      if (!lastLoginAt || new Date(row.lastLoginAt).getTime() > new Date(lastLoginAt).getTime()) {
        lastLoginAt = row.lastLoginAt;
      }
    });

    var classroomYes = rows.filter(function(row){ return Boolean(row.classroomCreated); }).length;
    return {
      totalUsers: rows.length,
      newUsersToday: newUsersToday,
      lastLoginAt: lastLoginAt || '',
      classroomCreatedYes: classroomYes,
      classroomCreatedNo: Math.max(0, rows.length - classroomYes)
    };
  }

  function exportUsersCsv(){
    var rows = listAdminUsers({ includeGuests: true });
    if (!rows.length) {
      return 'userKey,email,name,createdAt,lastLoginAt,classroomCreated,classroomCount,plan,mode\n';
    }
    var head = ['userKey', 'email', 'name', 'createdAt', 'lastLoginAt', 'classroomCreated', 'classroomCount', 'plan', 'mode'];
    var lines = rows.map(function(row){
      return head.map(function(key){
        var val = row[key] == null ? '' : String(row[key]);
        return '"' + val.replace(/"/g, '""') + '"';
      }).join(',');
    });
    return head.join(',') + '\n' + lines.join('\n');
  }

  function clearAdminUsers(){
    localStorage.removeItem(USER_REGISTRY_KEY);
    localStorage.removeItem(LOGIN_MARK_KEY);
  }

  function maybeTrackSessionLogin(){
    if (!window.GS_BILLING || !window.GS_BILLING.getAccount) return;
    var account = window.GS_BILLING.getAccount();
    if (!account || account.mode === 'guest') return;

    var payload = {
      accountId: account.id || '',
      email: account.email || '',
      name: account.name || '',
      role: account.role || 'teacher',
      plan: account.plan || 'trial',
      mode: account.mode || 'account',
      source: 'session_restore'
    };
    var userKey = resolveUserKey(payload);
    var mark = safeParseObject(localStorage.getItem(LOGIN_MARK_KEY), null);
    var nowMs = Date.now();
    if (mark && mark.userKey === userKey && Number(mark.ts || 0) > (nowMs - 6 * 60 * 60 * 1000)) return;

    trackLogin({
      accountId: payload.accountId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      plan: payload.plan,
      mode: payload.mode,
      source: payload.source,
      minGapMs: 30 * 60 * 1000,
      suppressAnalytics: true
    });
    localStorage.setItem(LOGIN_MARK_KEY, JSON.stringify({ userKey: userKey, ts: nowMs }));
  }

  function readEvents(){
    return safeParse(localStorage.getItem(KEY));
  }

  function writeEvents(events){
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  }

  function readGrowth(){
    return safeParse(localStorage.getItem(GROWTH_KEY));
  }

  function writeGrowth(rows){
    localStorage.setItem(GROWTH_KEY, JSON.stringify(rows.slice(-MAX_GROWTH)));
  }

  function readCloudConfig(){
    var cfg = safeParseObject(localStorage.getItem(CLOUD_CONFIG_KEY), { endpoint: '', apiKey: '' });
    return {
      endpoint: typeof cfg.endpoint === 'string' ? cfg.endpoint.trim() : '',
      apiKey: typeof cfg.apiKey === 'string' ? cfg.apiKey.trim() : ''
    };
  }

  function writeCloudConfig(cfg){
    var next = {
      endpoint: cfg && cfg.endpoint ? String(cfg.endpoint).trim() : '',
      apiKey: cfg && cfg.apiKey ? String(cfg.apiKey).trim() : ''
    };
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(next));
    return next;
  }

  function readQueue(){
    return safeParse(localStorage.getItem(CLOUD_QUEUE_KEY));
  }

  function writeQueue(rows){
    localStorage.setItem(CLOUD_QUEUE_KEY, JSON.stringify(rows.slice(-MAX_QUEUE)));
  }

  function enqueueCloud(kind, payload){
    var cfg = readCloudConfig();
    if (!cfg.endpoint) return;
    var queue = readQueue();
    queue.push({
      ts: new Date().toISOString(),
      kind: kind,
      payload: payload
    });
    writeQueue(queue);
  }

  function flushCloudQueue(){
    var cfg = readCloudConfig();
    if (!cfg.endpoint) return Promise.resolve(false);
    var queue = readQueue();
    if (!queue.length) return Promise.resolve(true);
    var body = JSON.stringify({
      source: 'grammar-spy-web',
      sentAt: new Date().toISOString(),
      queue: queue
    });
    var headers = { 'Content-Type': 'application/json' };
    if (cfg.apiKey) headers.Authorization = 'Bearer ' + cfg.apiKey;
    return fetch(cfg.endpoint, {
      method: 'POST',
      headers: headers,
      body: body
    }).then(function(res){
      if (!res.ok) throw new Error('cloud sync failed');
      writeQueue([]);
      return true;
    }).catch(function(){
      return false;
    });
  }

  function getStudentFromUrl(){
    try {
      var params = new URLSearchParams(location.search);
      var name = (params.get('student') || '').trim();
      return name;
    } catch (_err){
      return '';
    }
  }

  function getActiveStudent(){
    var fromUrl = getStudentFromUrl();
    if (fromUrl){
      localStorage.setItem(ACTIVE_STUDENT_KEY, fromUrl);
      return fromUrl;
    }
    var stored = (localStorage.getItem(ACTIVE_STUDENT_KEY) || '').trim();
    if (stored) return stored;
    return 'Class Aggregate';
  }

  function setActiveStudent(name){
    var clean = (name || '').trim();
    if (!clean) clean = 'Class Aggregate';
    localStorage.setItem(ACTIVE_STUDENT_KEY, clean);
  }

  function pushGrowthRecord(row){
    if (row.event !== 'mission_complete') return;
    var growth = readGrowth();
    var growthRow = {
      ts: row.ts,
      path: row.path,
      student: row.student || 'Class Aggregate',
      pack: row.pack || 'pack01',
      module: row.module || '',
      game: row.game || '',
      difficulty: row.difficulty || '',
      accuracy: Number(row.accuracy || 0),
      accuracyBand: row.accuracyBand || '',
      count: Number(row.count || row.rounds || row.missions || 0)
    };
    growth.push(growthRow);
    writeGrowth(growth);
    enqueueCloud('growth', growthRow);
  }

  function summarizeGrowth(filters){
    var opts = filters || {};
    var rows = readGrowth().filter(function(r){
      if (opts.student && r.student !== opts.student) return false;
      if (opts.pack && r.pack !== opts.pack) return false;
      return true;
    });
    var byGame = {};
    var byPack = {};
    rows.forEach(function(r){
      var gameKey = r.game || 'unknown';
      var packKey = r.pack || 'unknown';
      if (!byGame[gameKey]) byGame[gameKey] = { attempts: 0, totalAcc: 0 };
      if (!byPack[packKey]) byPack[packKey] = { attempts: 0, totalAcc: 0 };
      byGame[gameKey].attempts += 1;
      byGame[gameKey].totalAcc += Number(r.accuracy || 0);
      byPack[packKey].attempts += 1;
      byPack[packKey].totalAcc += Number(r.accuracy || 0);
    });
    Object.keys(byGame).forEach(function(k){
      byGame[k].avgAcc = Math.round(byGame[k].totalAcc / Math.max(1, byGame[k].attempts));
    });
    Object.keys(byPack).forEach(function(k){
      byPack[k].avgAcc = Math.round(byPack[k].totalAcc / Math.max(1, byPack[k].attempts));
    });
    return { total: rows.length, rows: rows, byGame: byGame, byPack: byPack };
  }

  function track(eventName, payload){
    var account = window.GS_BILLING && window.GS_BILLING.getAccount ? window.GS_BILLING.getAccount() : null;
    var row = {
      ts: new Date().toISOString(),
      event: eventName,
      path: location.pathname,
      student: getActiveStudent(),
      accountId: account && account.id ? account.id : 'anon',
      plan: account && account.plan ? account.plan : 'none'
    };
    if (payload && typeof payload === 'object'){
      Object.keys(payload).forEach(function(k){ row[k] = payload[k]; });
    }
    var events = readEvents();
    events.push(row);
    writeEvents(events);
    enqueueCloud('event', row);
    pushGrowthRecord(row);
  }

  function clear(){
    localStorage.removeItem(KEY);
  }

  function clearGrowth(){
    localStorage.removeItem(GROWTH_KEY);
  }

  function summarize(){
    var events = readEvents();
    var byEvent = {};
    events.forEach(function(e){
      byEvent[e.event] = (byEvent[e.event] || 0) + 1;
    });
    return {
      total: events.length,
      byEvent: byEvent,
      lastEvent: events.length ? events[events.length - 1] : null
    };
  }

  function exportJson(){
    return JSON.stringify(readEvents(), null, 2);
  }

  function exportCsv(){
    var events = readEvents();
    if (!events.length) return 'ts,event,path\n';
    var keys = Object.keys(events.reduce(function(acc, row){
      Object.keys(row).forEach(function(k){ acc[k] = true; });
      return acc;
    }, {}));
    var head = keys.join(',');
    var rows = events.map(function(row){
      return keys.map(function(k){
        var val = row[k] == null ? '' : String(row[k]);
        return '"' + val.replace(/"/g, '""') + '"';
      }).join(',');
    });
    return [head].concat(rows).join('\n');
  }

  window.GSAnalytics = {
    track: track,
    getEvents: readEvents,
    clear: clear,
    summarize: summarize,
    exportJson: exportJson,
    exportCsv: exportCsv
  };

  window.GSGrowth = {
    getRecords: readGrowth,
    summarize: summarizeGrowth,
    clear: clearGrowth,
    getActiveStudent: getActiveStudent,
    setActiveStudent: setActiveStudent
  };

  window.GSCloud = {
    configure: writeCloudConfig,
    getConfig: readCloudConfig,
    getQueue: readQueue,
    flush: flushCloudQueue
  };

  window.GSAdminMetrics = {
    trackUserCreated: trackUserCreated,
    trackLogin: trackLogin,
    trackClassroomCreated: trackClassroomCreated,
    getSummary: getAdminSummary,
    getUsers: listAdminUsers,
    exportCsv: exportUsersCsv,
    clear: clearAdminUsers
  };

  function gameSuggestionForWeakGame(game){
    var map = {
      'error-smash': 'rule-sprint',
      'past-sort': 'narrative-builder',
      'rule-sprint': 'signal-decoder',
      'signal-decoder': 'past-sort',
      'case-interview': 'announcement-rebuild',
      'announcement-rebuild': 'case-interview',
      'present-case-interview': 'present-announcement-rebuild',
      'present-announcement-rebuild': 'present-sort',
      'be-verb-case-interview': 'be-verb-announcement-rebuild',
      'be-verb-announcement-rebuild': 'be-verb-sort',
      'clue-trail': 'dialogue-repair',
      'dialogue-repair': 'rewrite-studio',
      'evidence-sort-board': 'mission-sequence-lab',
      'mission-sequence-lab': 'rewrite-studio',
      'rewrite-studio': 'clue-trail'
    };
    return map[game] || 'clue-trail';
  }

  function suggestionForAccuracy(acc){
    if (acc >= 90) return 'Assign Director level and transfer to open writing.';
    if (acc >= 75) return 'Keep Field Agent and target one weak pattern with 2 replay rounds.';
    if (acc >= 60) return 'Switch to Rookie Agent, reduce count, and enable explicit feedback.';
    return 'Run guided mini-lesson first, then short Rookie Agent replay with immediate correction.';
  }

  function packLabel(pack){
    var m = {
      pack01: 'Retell What Happened',
      pack02: 'Speak In The Moment',
      pack03: 'Sentence Confidence Missions',
      pack04: 'Link Ideas Clearly',
      pack05: 'Reference Smartly',
      pack06: 'Question Flow Missions'
    };
    return m[pack] || pack;
  }

  function ensureStudentPicker(){
    var isTeacherSurface =
      location.pathname.indexOf('teacher-mode') >= 0 ||
      location.pathname.indexOf('teacher-home') >= 0 ||
      location.pathname.indexOf('teacher-dashboard') >= 0 ||
      location.pathname.indexOf('teacher-mission-history') >= 0 ||
      location.pathname.indexOf('teacher-student-progress') >= 0;
    if (!isTeacherSurface) return;
    if (document.getElementById('gsStudentDock')) return;

    var dock = document.createElement('div');
    dock.id = 'gsStudentDock';
    dock.style.cssText = [
      'position:fixed',
      'right:14px',
      'bottom:14px',
      'z-index:170',
      'background:#ffffff',
      'border:1px solid #d9dee6',
      'border-radius:12px',
      'box-shadow:0 10px 20px rgba(11,16,32,.14)',
      'padding:10px',
      'display:grid',
      'gap:6px',
      'min-width:240px'
    ].join(';');
    dock.innerHTML =
      '<label style=\"font:700 11px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#4a5568\">Active Learner</label>' +
      '<input id=\"gsStudentInput\" type=\"text\" placeholder=\"Type student name\" style=\"border:1px solid #d9dee6;border-radius:8px;padding:8px 9px;font:600 13px Inter,Arial,sans-serif;color:#16223A\" />' +
      '<div style=\"font:600 11px Inter,Arial,sans-serif;color:#4a5568\">Saved to progress tracking and game reports.</div>';
    document.body.appendChild(dock);
    var input = document.getElementById('gsStudentInput');
    input.value = getActiveStudent();
    input.addEventListener('change', function(){
      setActiveStudent(input.value);
      input.value = getActiveStudent();
    });
    input.addEventListener('blur', function(){
      setActiveStudent(input.value);
      input.value = getActiveStudent();
    });
  }

  function attachMissionGrowthInsights(){
    var overlay = document.getElementById('overlay') || document.getElementById('ov');
    if (!overlay) return;
    var modal = overlay.querySelector('.modal');
    if (!modal) return;
    if (document.getElementById('growthDetailCard')) return;

    var card = document.createElement('div');
    card.id = 'growthDetailCard';
    card.style.cssText = 'border:1px solid #d9dee6;border-radius:10px;padding:10px;background:#f8fafc;display:grid;gap:6px';
    card.innerHTML =
      '<p style=\"margin:0;font:800 11px Inter,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#1f5f63\">Growth Insight</p>' +
      '<p id=\"growthLineA\" style=\"margin:0;color:#16223A;font:600 13px Inter,Arial,sans-serif\"></p>' +
      '<p id=\"growthLineB\" style=\"margin:0;color:#4a5568;font:600 13px Inter,Arial,sans-serif\"></p>' +
      '<p id=\"growthLineC\" style=\"margin:0;color:#4a5568;font:600 13px Inter,Arial,sans-serif\"></p>' +
      '<p id=\"growthLineD\" style=\"margin:0;color:#4a5568;font:600 13px Inter,Arial,sans-serif\"></p>';
    modal.insertBefore(card, modal.lastElementChild);

    function render(){
      var rows = readGrowth();
      if (!rows.length) return;
      var last = rows[rows.length - 1];
      var student = last.student || 'Class Aggregate';
      var summary = summarizeGrowth({ student: student, pack: last.pack });
      var weakGame = '';
      var weakAcc = 101;
      Object.keys(summary.byGame).forEach(function(g){
        var a = summary.byGame[g].avgAcc;
        if (a < weakAcc){
          weakAcc = a;
          weakGame = g;
        }
      });
      var acc = Number(last.accuracy || 0);
      var mastery = acc >= 85 ? 'Mastered' : acc >= 70 ? 'Developing' : 'Needs Support';
      document.getElementById('growthLineA').textContent =
        student + ' · ' + packLabel(last.pack) + ' · ' + mastery + ' (' + acc + '% this round)';
      document.getElementById('growthLineB').textContent =
        'Weakest area: ' + (weakGame || last.game || 'n/a') + (weakGame ? ' (' + weakAcc + '% avg)' : '');
      document.getElementById('growthLineC').textContent =
        'Teacher move: ' + suggestionForAccuracy(acc);
      document.getElementById('growthLineD').textContent =
        'Next game suggestion: ' + gameSuggestionForWeakGame(weakGame || last.game || '');
    }

    var ob = new MutationObserver(function(){
      if (overlay.classList.contains('show')) render();
    });
    ob.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }

  window.addEventListener('DOMContentLoaded', function(){
    getActiveStudent();
    flushCloudQueue();
    maybeTrackSessionLogin();
    track('page_view', { title: document.title });
    ensureStudentPicker();
    attachMissionGrowthInsights();
    var chatScript = document.createElement('script');
    chatScript.src = 'chat-widget.js';
    chatScript.async = true;
    document.body.appendChild(chatScript);

    document.addEventListener('click', function(ev){
      var target = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
      if (!target) return;
      var text = ((target.textContent || '').trim()).toLowerCase();
      var href = target.getAttribute('href') || '';
      var id = target.id || '';
      var isLaunch = text.indexOf('launch') >= 0 || id.indexOf('launch') === 0 || id === 'quickLaunch';
      if (isLaunch){
        track('launch_click', { label: text.slice(0, 80), href: href || '' });
      }
    }, true);
  });

  window.addEventListener('online', function(){
    flushCloudQueue();
  });

  setInterval(function(){
    flushCloudQueue();
  }, 30000);

  if (!('serviceWorker' in navigator)) return;

  // SW disabled until v1.0 freeze: remove active registrations and caches.
  window.addEventListener('load', function(){
    navigator.serviceWorker.getRegistrations()
      .then(function(regs){
        return Promise.all(regs.map(function(reg){ return reg.unregister(); }));
      })
      .catch(function(){});

    if ('caches' in window){
      caches.keys()
        .then(function(keys){
          return Promise.all(keys.map(function(key){ return caches.delete(key); }));
        })
        .catch(function(){});
    }
  });
})();
