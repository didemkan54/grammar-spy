(function(){
  const map = {
    header: '/components/header.html',
    footer: '/components/footer.html',
    sidebar: '/components/sidebar.html'
  };

  function ensureTopNavStyles(){
    try {
      if (document.getElementById('gsTopNavStyles')) return;
      var st = document.createElement('style');
      st.id = 'gsTopNavStyles';
      st.textContent =
        'nav[aria-label=\"Primary navigation\"] .gs-pill{white-space:nowrap}\\n' +
        'nav[aria-label=\"Primary navigation\"] .gs-link-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}\\n' +
        '@media (max-width:720px){\\n' +
        '  nav[aria-label=\"Primary navigation\"]{padding-left:14px!important;padding-right:14px!important}\\n' +
        '  nav[aria-label=\"Primary navigation\"] .gs-link-row{flex-basis:100%;order:3}\\n' +
        '}\\n' +
        '@media (max-width:520px){\\n' +
        '  nav[aria-label=\"Primary navigation\"]{gap:10px!important}\\n' +
        '  nav[aria-label=\"Primary navigation\"] .gs-logo{height:46px!important}\\n' +
        '  nav[aria-label=\"Primary navigation\"] .gs-pill{padding:6px 10px!important;font-size:11px!important}\\n' +
        '  nav[aria-label=\"Primary navigation\"] .gs-select{padding:6px 8px!important;font-size:11px!important}\\n' +
        '}\\n';
      (document.head || document.documentElement).appendChild(st);
    } catch(_e) {}
  }

  var navLinkStyle = 'text-decoration:none;color:#324357;font:700 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;display:inline-flex;align-items:center;padding:7px 11px;border:1px solid transparent;border-radius:999px;background:transparent';
  var dropdownLinkStyle = 'display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:#24303f;font:700 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap';
  var menuSummaryStyle = 'cursor:pointer;border:1px solid #d9dee6;border-radius:999px;padding:7px 12px;background:#fff;color:#4a5568;font:700 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;display:inline-flex;align-items:center;gap:6px;list-style:none';
  var menuPanelStyle = 'position:absolute;right:0;top:calc(100% + 8px);display:block;min-width:190px;background:#fff;border:1px solid #d9dee6;border-radius:12px;padding:8px;box-shadow:0 10px 26px rgba(11,16,32,.14);z-index:30';

  var headerFallback = '<nav aria-label="Primary navigation" style="margin:0 0 14px;padding:10px 24px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid #d9dee6;background:#ffffff">' +
    '<a href="/" style="text-decoration:none;color:#16223a;display:inline-flex;align-items:center;background:transparent"><img class="gs-logo" src="/assets/brand/logo-primary.svg" alt="Grammar Spy™" style="height:56px;width:auto;display:block;background:transparent;border:none"></a>' +
    '<span class="gs-link-row" style="display:flex;flex:1 1 420px;min-width:240px;gap:4px;align-items:center;flex-wrap:wrap;justify-content:flex-start">' +
    '<a class="gs-pill" href="/" data-i18n="nav_home" style="' + navLinkStyle + '">Home</a>' +
    '<a class="gs-pill" href="/missions/" data-i18n="nav_missions" style="' + navLinkStyle + '">Missions</a>' +
    '<details id="gsTeacherMenu" style="position:relative">' +
    '<summary class="gs-pill" style="cursor:pointer;border:1px solid transparent;border-radius:999px;padding:7px 11px;background:transparent;color:#324357;font:700 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;display:inline-flex;align-items:center;gap:6px;list-style:none">Teacher &#9662;</summary>' +
    '<span style="position:absolute;right:0;top:calc(100% + 8px);display:block;min-width:220px;background:#fff;border:1px solid #d9dee6;border-radius:12px;padding:8px;box-shadow:0 10px 26px rgba(11,16,32,.14);z-index:30">' +
    '<a data-start-mission-link href="/teacher-mode?pack=pack01" style="display:block;padding:10px 10px;border-radius:8px;text-decoration:none;color:#ffffff;background:#1f5f63;border:1px solid #17484b;font:800 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap">&#128640; Start Mission Now</a>' +
    '<a data-start-mission-link data-start-mission-format="whole_class" href="/teacher-mode?pack=pack01&play_format=whole_class" style="display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:#204256;font:700 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;margin-top:6px;background:#eef5fb;border:1px solid #d4e0ec">Whole Class Mode</a>' +
    '<a data-start-mission-link data-start-mission-format="teams" href="/teacher-mode?pack=pack01&play_format=teams" style="display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:#204256;font:700 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;margin-top:6px;background:#eef5fb;border:1px solid #d4e0ec">Teams Mode</a>' +
    '<a data-start-mission-link data-start-mission-format="individuals" href="/teacher-mode?pack=pack01&play_format=individuals" style="display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:#204256;font:700 12px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;margin-top:6px;background:#eef5fb;border:1px solid #d4e0ec">Individuals Mode</a>' +
    '<a href="/teacher-home" data-i18n="nav_teacher" style="' + dropdownLinkStyle + ';margin-top:6px">Teacher Dashboard</a>' +
    '<a href="/classrooms" style="' + dropdownLinkStyle + '">Classrooms</a>' +
    '<a href="/teacher-student-progress" style="' + dropdownLinkStyle + '">Student Progress</a>' +
    '</span>' +
    '</details>' +
    '<a class="gs-pill" href="/pricing" data-i18n="nav_pricing" style="' + navLinkStyle + '">Pricing</a>' +
    '<a class="gs-pill" href="/grammar-teaching-ideas/" style="' + navLinkStyle + '">Teaching Ideas</a>' +
    '<details id="gsMoreMenu" style="position:relative">' +
    '<summary class="gs-pill" style="' + menuSummaryStyle + '">More &#9662;</summary>' +
    '<span style="' + menuPanelStyle + '">' +
    '<a href="/progression" style="' + dropdownLinkStyle + '">Training Path</a>' +
    '<a href="/teacher-dashboard" style="' + dropdownLinkStyle + '">Admin</a>' +
    '<a href="/community" style="' + dropdownLinkStyle + '">Community</a>' +
    '<a href="/blog" data-i18n="nav_blog" style="' + dropdownLinkStyle + '">Blog</a>' +
    '</span>' +
    '</details>' +
    '</span>' +
    '<span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end" data-sound-toggle-slot>' +
    '<span id="gsLangSwitcher" style="display:inline-flex;align-items:center">' +
    '<select class="gs-select" id="gsLangSelect" aria-label="Language" onchange="if(window.GS_I18N)GS_I18N.setLang(this.value)" style="border:1px solid #d9dee6;border-radius:8px;padding:6px 10px;font:700 12px Inter,Segoe UI,Arial,sans-serif;color:#4a5568;background:#fff;cursor:pointer;text-transform:none;letter-spacing:.01em">' +
    '<option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>' +
    '<option value="am">አማርኛ</option><option value="tr">Türkçe</option><option value="ar">العربية</option>' +
    '<option value="hi">हिन्दी</option><option value="ur">اردو</option><option value="ps">پښتو</option>' +
    '<option value="vi">Tiếng Việt</option><option value="zh">中文</option><option value="ko">한국어</option>' +
    '<option value="so">Soomaali</option><option value="ti">ትግርኛ</option><option value="pt">Português</option>' +
    '</select></span>' +
    '<details id="gsAccountMenu" style="position:relative">' +
    '<summary class="gs-pill" id="gsAccountLabel" style="' + menuSummaryStyle + '">Account &#9662;</summary>' +
    '<span id="gsAccountPanel" style="' + menuPanelStyle + '">' +
    '<a href="/auth?mode=signin" data-i18n="nav_signIn" style="' + dropdownLinkStyle + '">Sign In</a>' +
    '<a href="/auth?mode=create" data-i18n="nav_createAccount" style="' + dropdownLinkStyle + '">Create account</a>' +
    '</span>' +
    '</details>' +
    '</span>' +
    '</nav>';

  var footerFallback = '<footer class="site-footer" style="margin:24px 0 0;padding:24px 40px;border-top:1px solid #d9dee6;background:#f8fafc;color:#4a5568;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:13px;">' +
    '<div style="display:grid;grid-template-columns:1fr auto;gap:24px;align-items:start;"><div>' +
    '<a href="/" style="color:#16223a;text-decoration:none;font-weight:700;font-size:14px;">Grammar Spy™</a>' +
    '<p style="margin:6px 0 0;color:#5c6677;font-size:12px;line-height:1.4;max-width:32ch;">Mission-based grammar training for ELD and ELA classrooms.</p></div>' +
    '<nav aria-label="Footer links" style="display:flex;flex-wrap:wrap;gap:16px 24px;">' +
    '<a href="/about" style="color:#1f5f63;text-decoration:none;font-weight:600;">About Us</a>' +
    '<a href="/support" style="color:#1f5f63;text-decoration:none;font-weight:600;">Support</a>' +
    '<a href="/refund" style="color:#1f5f63;text-decoration:none;font-weight:600;">Refund Policy</a>' +
    '<a href="/pricing" style="color:#1f5f63;text-decoration:none;font-weight:600;">Pricing</a>' +
    '<a href="/privacy" style="color:#1f5f63;text-decoration:none;font-weight:600;">Privacy</a>' +
    '<a href="/terms" style="color:#1f5f63;text-decoration:none;font-weight:600;">Terms</a></nav></div>' +
    '<p style="margin:14px 0 0;padding-top:12px;border-top:1px solid #e4e8ef;font-size:11px;color:#7a8698;">© Grammar Spy™. All rights reserved.</p></footer>';

  function includeOne(el){
    const key = el.getAttribute('data-include');
    const path = map[key];
    if (!path) return Promise.resolve();
    return fetch(path, { cache: 'no-store' })
      .then(function(res){
        if (!res.ok) throw new Error('include failed: ' + path);
        return res.text();
      })
      .then(function(html){
        el.innerHTML = html;
      })
      .catch(function(err){
        console.warn('[layout-loader]', err.message);
        if (key === 'header') el.innerHTML = headerFallback;
        if (key === 'footer') el.innerHTML = footerFallback;
      });
  }

  function run(){
    ensureTopNavStyles();
    const nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    Promise.all(nodes.map(includeOne)).then(function(){
      var main = document.querySelector('main');
      if (main && !main.id) main.id = 'main';
      document.dispatchEvent(new CustomEvent('layout:ready'));
    });
  }

  function ensureSoundSystemScript() {
    try {
      if (document.querySelector('script[data-gs-sound-system="1"]')) return;
      var script = document.createElement('script');
      script.src = '/core/sound-manager.js';
      script.defer = true;
      script.setAttribute('data-gs-sound-system', '1');
      (document.head || document.documentElement).appendChild(script);
    } catch (_err) {}
  }

  function mountSoundToggleWhenReady() {
    var retryCount = 0;
    var maxRetries = 12;
    var attempt = function() {
      if (!document.querySelector('nav[aria-label="Primary navigation"], .home-nav .nav-inner')) return;
      if (!window.GSSound) {
        retryCount += 1;
        if (retryCount <= maxRetries) {
          window.setTimeout(attempt, 120);
        }
        return;
      }
      if (window.__GS_SOUND_TOGGLE_LOADING__) return;
      window.__GS_SOUND_TOGGLE_LOADING__ = true;
      import('/student/components/SoundToggle.js')
        .then(function(mod) {
          if (mod && typeof mod.mountGlobalSoundToggle === 'function') {
            mod.mountGlobalSoundToggle();
          }
        })
        .catch(function() {})
        .finally(function() {
          window.__GS_SOUND_TOGGLE_LOADING__ = false;
        });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attempt, { once: true });
    } else {
      attempt();
    }
    document.addEventListener('layout:ready', attempt);
  }

  function ensureProgressStoreLoaded() {
    try {
      if (window.__GS_PROGRESS_LOADING__) return;
      window.__GS_PROGRESS_LOADING__ = true;
      import('/core/progressStore.js')
        .catch(function(){})
        .finally(function(){
          window.__GS_PROGRESS_LOADING__ = false;
        });
    } catch(_err){}
  }

  function updateAuthButtons() {
    var session = getSessionLike();

    var navs = document.querySelectorAll('nav[aria-label="Primary navigation"]');
    navs.forEach(function(nav) {
      var label = nav.querySelector('#gsAccountLabel');
      var panel = nav.querySelector('#gsAccountPanel');
      if (!label || !panel) return;

      if (!session || !session.name) {
        label.textContent = 'Account ▼';
        panel.innerHTML =
          '<a href="/auth?mode=signin" data-i18n="nav_signIn" style="' + dropdownLinkStyle + '">Sign In</a>' +
          '<a href="/auth?mode=create" data-i18n="nav_createAccount" style="' + dropdownLinkStyle + '">Create account</a>';
        return;
      }

      var safeName = session.name;
      if (/[!@#$%^&*(){}[\]|\\<>\/~`+=]/.test(safeName) || safeName.length > 40) safeName = 'My Account';
      var shortName = safeName.length > 14 ? safeName.slice(0, 14) + '…' : safeName;
      label.textContent = shortName + ' ▼';
      panel.innerHTML =
        '<a href="/profile" style="' + dropdownLinkStyle + '">Profile</a>' +
        '<a href="#" data-i18n="nav_signOut" onclick="localStorage.removeItem(\'gs_auth_session\');localStorage.removeItem(\'gs_account_v1\');localStorage.removeItem(\'gs_student_classroom\');localStorage.removeItem(\'gs_use_context_v3\');localStorage.removeItem(\'gs_active_student_v1\');localStorage.removeItem(\'gs_credentials\');location.href=\'/\';return false;" style="' + dropdownLinkStyle + '">Sign Out</a>';
    });
    try {
      if (window.GS_I18N && typeof window.GS_I18N.apply === 'function') window.GS_I18N.apply();
    } catch (e2) {}
  }

  function getSessionLike(){
    var session = null;
    try {
      session = JSON.parse(localStorage.getItem('gs_auth_session'));
    } catch (e) {}
    if (session && typeof session === 'object') return session;
    try {
      var account = JSON.parse(localStorage.getItem('gs_account_v1'));
      if (account && typeof account === 'object') {
        return {
          name: account.name || 'Teacher',
          email: account.email || '',
          accountId: account.id || ''
        };
      }
    } catch (_err) {}
    return null;
  }

  function missionLaunchTargetForFormat(format){
    var normalized = String(format || '').toLowerCase();
    var launchTarget = '/teacher-mode?pack=pack01';
    if (normalized === 'teams' || normalized === 'whole_class' || normalized === 'individuals') {
      launchTarget += '&play_format=' + encodeURIComponent(normalized);
    }
    return launchTarget;
  }

  function resolveMissionLaunchHref(session, format){
    var launchTarget = missionLaunchTargetForFormat(format);
    if (session && typeof session === 'object' && session.name) return launchTarget;
    return '/auth?next=' + encodeURIComponent(launchTarget);
  }

  function updateMissionLaunchLinks(){
    var session = getSessionLike();
    var nodes = document.querySelectorAll('[data-start-mission-link]');
    nodes.forEach(function(node){
      if (!node || !node.setAttribute) return;
      var format = node.getAttribute('data-start-mission-format') || '';
      var href = resolveMissionLaunchHref(session, format);
      node.setAttribute('href', href);
    });
  }

  function applyRoleVisibility() {
    // Keep teacher links visible even after a student-mode session.
  }

  function loadAnimations() {
    if (document.querySelector('script[src="/gs-animations.js"]')) return;
    var s = document.createElement('script');
    s.src = '/gs-animations.js';
    document.body.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      ensureSoundSystemScript();
      ensureProgressStoreLoaded();
      run();
      loadAnimations();
      updateMissionLaunchLinks();
      updateAuthButtons();
      mountSoundToggleWhenReady();
    });
  } else {
    ensureSoundSystemScript();
    ensureProgressStoreLoaded();
    run();
    loadAnimations();
    updateMissionLaunchLinks();
    updateAuthButtons();
    mountSoundToggleWhenReady();
  }
  document.addEventListener('layout:ready', updateMissionLaunchLinks);
  document.addEventListener('layout:ready', updateAuthButtons);
  document.addEventListener('layout:ready', applyRoleVisibility);
})();
