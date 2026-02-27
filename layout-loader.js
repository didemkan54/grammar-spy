(function(){
  const map = {
    header: 'components/header.html',
    footer: 'components/footer.html',
    sidebar: 'components/sidebar.html'
  };

  var navLinkStyle = 'text-decoration:none;color:#4a5568;font:700 12px Inter,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;display:inline-flex;align-items:center;padding:7px 12px;border:1px solid #d9dee6;border-radius:999px;background:#f8fafc';
  var dropdownLinkStyle = 'display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:#24303f;font:700 12px Inter,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap';
  var menuSummaryStyle = 'cursor:pointer;border:1px solid #d9dee6;border-radius:999px;padding:7px 12px;background:#f8fafc;color:#4a5568;font:700 12px Inter,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;display:inline-flex;align-items:center;gap:6px;list-style:none';
  var menuPanelStyle = 'position:absolute;right:0;top:calc(100% + 8px);display:block;min-width:180px;background:#fff;border:1px solid #d9dee6;border-radius:12px;padding:8px;box-shadow:0 10px 26px rgba(11,16,32,.14);z-index:30';

  var headerFallback = '<nav aria-label="Primary navigation" style="margin:0 0 16px;padding:10px 24px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid #d9dee6;background:#ffffff">' +
    '<a href="index.html" style="text-decoration:none;color:#16223a;display:inline-flex;align-items:center;background:transparent"><img src="assets/brand/logo-primary.svg" alt="Grammar Spy™" style="height:56px;width:auto;display:block;background:transparent;border:none"></a>' +
    '<span style="display:flex;flex:1 1 420px;min-width:240px;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-start">' +
    '<a href="index.html" data-i18n="nav_home" style="' + navLinkStyle + '">Home</a>' +
    '<details id="gsMissionMenu" style="position:relative">' +
    '<summary style="' + menuSummaryStyle + '" data-i18n="nav_missions">Missions &#9662;</summary>' +
    '<span style="' + menuPanelStyle + '">' +
    '<a href="packs.html" style="' + dropdownLinkStyle + '">Missions</a>' +
    '<a href="progression.html" style="' + dropdownLinkStyle + '">Training Path</a>' +
    '<a href="clues.html" style="' + dropdownLinkStyle + '">CLUES</a>' +
    '</span>' +
    '</details>' +
    '<a href="teacher-home.html" data-i18n="nav_teacher" style="' + navLinkStyle + '">Teacher</a>' +
    '<a href="pricing.html" data-i18n="nav_pricing" style="' + navLinkStyle + '">Pricing</a>' +
    '<details id="gsResourcesMenu" style="position:relative">' +
    '<summary style="' + menuSummaryStyle + '">Resources &#9662;</summary>' +
    '<span style="' + menuPanelStyle + '">' +
    '<a href="community.html" style="' + dropdownLinkStyle + '">Community</a>' +
    '<a href="insights.html" data-i18n="nav_blog" style="' + dropdownLinkStyle + '">Blog</a>' +
    '</span>' +
    '</details>' +
    '</span>' +
    '<span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end">' +
    '<span id="gsLangSwitcher" style="display:inline-flex;align-items:center">' +
    '<select id="gsLangSelect" aria-label="Language" onchange="if(window.GS_I18N)GS_I18N.setLang(this.value)" style="border:1px solid #d9dee6;border-radius:8px;padding:6px 10px;font:700 12px Inter,Arial,sans-serif;color:#4a5568;background:#fff;cursor:pointer;text-transform:uppercase;letter-spacing:.04em">' +
    '<option value="en">🇺🇸 English</option><option value="es">🇪🇸 Español</option><option value="fr">🇫🇷 Français</option>' +
    '<option value="am">🇪🇹 አማርኛ</option><option value="tr">🇹🇷 Türkçe</option><option value="ar">🇸🇦 العربية</option>' +
    '<option value="hi">🇮🇳 हिन्दी</option><option value="ur">🇵🇰 اردو</option><option value="ps">🇦🇫 پښتو</option>' +
    '<option value="vi">🇻🇳 Tiếng Việt</option><option value="zh">🇨🇳 中文</option><option value="ko">🇰🇷 한국어</option>' +
    '<option value="so">🇸🇴 Soomaali</option><option value="ti">🇪🇷 ትግርኛ</option><option value="pt">🇧🇷 Português</option>' +
    '</select></span>' +
    '<details id="gsAccountMenu" style="position:relative">' +
    '<summary id="gsAccountLabel" style="' + menuSummaryStyle + '">Account &#9662;</summary>' +
    '<span id="gsAccountPanel" style="' + menuPanelStyle + '">' +
    '<a href="auth.html?mode=signin" data-i18n="nav_signIn" style="' + dropdownLinkStyle + '">Sign In</a>' +
    '<a href="auth.html?mode=create" data-i18n="nav_createAccount" style="' + dropdownLinkStyle + '">Create account</a>' +
    '</span>' +
    '</details>' +
    '</span>' +
    '</nav>';

  var footerFallback = '<footer class="site-footer" style="margin:24px 0 0;padding:24px 40px;border-top:1px solid #d9dee6;background:#f8fafc;color:#4a5568;font-family:Inter,Arial,sans-serif;font-size:13px;">' +
    '<div style="display:grid;grid-template-columns:1fr auto;gap:24px;align-items:start;"><div>' +
    '<a href="index.html" style="color:#16223a;text-decoration:none;font-weight:700;font-size:14px;">Grammar Spy™</a>' +
    '<p style="margin:6px 0 0;color:#5c6677;font-size:12px;line-height:1.4;max-width:32ch;">Mission-based grammar training for ELD and ELA classrooms.</p></div>' +
    '<nav aria-label="Footer links" style="display:flex;flex-wrap:wrap;gap:16px 24px;">' +
    '<a href="about.html" style="color:#1f5f63;text-decoration:none;font-weight:600;">About Us</a>' +
    '<a href="support.html" style="color:#1f5f63;text-decoration:none;font-weight:600;">Support</a>' +
    '<a href="refund.html" style="color:#1f5f63;text-decoration:none;font-weight:600;">Refund Policy</a>' +
    '<a href="pricing.html" style="color:#1f5f63;text-decoration:none;font-weight:600;">Pricing</a>' +
    '<a href="privacy.html" style="color:#1f5f63;text-decoration:none;font-weight:600;">Privacy</a>' +
    '<a href="terms.html" style="color:#1f5f63;text-decoration:none;font-weight:600;">Terms</a></nav></div>' +
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
    const nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    Promise.all(nodes.map(includeOne)).then(function(){
      var main = document.querySelector('main');
      if (main && !main.id) main.id = 'main';
      document.dispatchEvent(new CustomEvent('layout:ready'));
    });
  }

  function updateAuthButtons() {
    var session = null;
    try {
      session = JSON.parse(localStorage.getItem('gs_auth_session'));
    } catch (e) {}

    var navs = document.querySelectorAll('nav[aria-label="Primary navigation"]');
    navs.forEach(function(nav) {
      var label = nav.querySelector('#gsAccountLabel');
      var panel = nav.querySelector('#gsAccountPanel');
      if (!label || !panel) return;

      if (!session || !session.name) {
        label.textContent = 'Account ▼';
        panel.innerHTML =
          '<a href="auth.html?mode=signin" data-i18n="nav_signIn" style="' + dropdownLinkStyle + '">Sign In</a>' +
          '<a href="auth.html?mode=create" data-i18n="nav_createAccount" style="' + dropdownLinkStyle + '">Create account</a>';
        return;
      }

      var safeName = session.name;
      if (/[!@#$%^&*(){}[\]|\\<>\/~`+=]/.test(safeName) || safeName.length > 40) safeName = 'My Account';
      var shortName = safeName.length > 14 ? safeName.slice(0, 14) + '…' : safeName;
      label.textContent = shortName + ' ▼';
      panel.innerHTML =
        '<a href="profile.html" style="' + dropdownLinkStyle + '">Profile</a>' +
        '<a href="#" data-i18n="nav_signOut" onclick="localStorage.removeItem(\'gs_auth_session\');localStorage.removeItem(\'gs_account_v1\');localStorage.removeItem(\'gs_student_classroom\');localStorage.removeItem(\'gs_use_context_v3\');localStorage.removeItem(\'gs_active_student_v1\');localStorage.removeItem(\'gs_credentials\');location.href=\'index.html\';return false;" style="' + dropdownLinkStyle + '">Sign Out</a>';
    });
    try {
      if (window.GS_I18N && typeof window.GS_I18N.apply === 'function') window.GS_I18N.apply();
    } catch (e2) {}
  }

  function applyRoleVisibility() {
    try {
      var ctx = localStorage.getItem('gs_use_context_v3');
      var studentClassroom = localStorage.getItem('gs_student_classroom');
      var isStudent = ctx === 'individual' || studentClassroom;
      if (!isStudent) return;
      var navLinks = document.querySelectorAll('nav[aria-label="Primary navigation"] a');
      navLinks.forEach(function(a) {
        var href = (a.getAttribute('href') || '').toLowerCase();
        if (href.indexOf('teacher-home') >= 0 || href.indexOf('teacher-mode') >= 0) {
          a.style.display = 'none';
        }
      });
    } catch(e) {}
  }

  function loadAnimations() {
    if (document.querySelector('script[src="gs-animations.js"]')) return;
    var s = document.createElement('script');
    s.src = 'gs-animations.js';
    document.body.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ run(); loadAnimations(); updateAuthButtons(); });
  } else {
    run();
    loadAnimations();
    updateAuthButtons();
  }
  document.addEventListener('layout:ready', updateAuthButtons);
  document.addEventListener('layout:ready', applyRoleVisibility);
})();
