(function(){
  var KEY = 'gs_analytics_events_v1';
  var GROWTH_KEY = 'gs_growth_records_v1';
  var ACTIVE_STUDENT_KEY = 'gs_active_student_v1';
  var CLOUD_CONFIG_KEY = 'gs_cloud_config_v1';
  var CLOUD_QUEUE_KEY = 'gs_cloud_queue_v1';
  var MAX_EVENTS = 1500;
  var MAX_GROWTH = 4000;
  var MAX_QUEUE = 3000;

  // Google Analytics 4 — basic page tracking
  // Measurement ID: G-GJ5NBQN83P
  var GA_MEASUREMENT_ID = 'G-GJ5NBQN83P';

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
    var cfg = safeParse(localStorage.getItem(CLOUD_CONFIG_KEY));
    if (!cfg || Array.isArray(cfg)) return { endpoint: '', apiKey: '' };
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
