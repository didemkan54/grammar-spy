(function(){
  const map = {
    header: 'components/header.html',
    footer: 'components/footer.html',
    sidebar: 'components/sidebar.html'
  };

  var headerFallback = '<nav aria-label="Primary navigation" style="margin:0 0 16px;padding:12px 40px 14px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;border-bottom:1px solid #d9dee6;background:#ffffff">' +
    '<a href="index.html" style="text-decoration:none;color:#16223a;display:inline-flex;align-items:center;background:transparent"><img src="assets/brand/logo-primary.svg" alt="Grammar Spy™" style="height:88px;width:auto;display:block;background:transparent;border:none"></a>' +
    '<span style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' +
    '<a href="index.html" data-i18n="nav_home" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Home</a>' +
    '<a href="packs.html" data-i18n="nav_missions" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Missions</a>' +
    '<a href="missions.html" style="text-decoration:none;color:#0f5c5c;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Mission Library</a>' +
    '<a href="progression.html" style="text-decoration:none;color:#0f5c5c;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Training Path</a>' +
    '<a href="profile.html" style="text-decoration:none;color:#0f5c5c;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Profile</a>' +
    '<a href="insights.html" data-i18n="nav_blog" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Blog</a>' +
    '<a href="pricing.html" data-i18n="nav_pricing" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Pricing</a>' +
    '<span id="gsLangSwitcher" style="display:inline-flex;align-items:center;margin-left:8px;padding-left:12px;border-left:1px solid #d9dee6">' +
    '<select id="gsLangSelect" aria-label="Language" style="border:1px solid #d9dee6;border-radius:8px;padding:6px 10px;font:700 12px Inter,Arial,sans-serif;color:#4a5568;background:#fff;cursor:pointer;text-transform:uppercase;letter-spacing:.04em">' +
    '<option value="en">🇺🇸 English</option><option value="es">🇪🇸 Español</option><option value="fr">🇫🇷 Français</option>' +
    '<option value="am">🇪🇹 አማርኛ</option><option value="tr">🇹🇷 Türkçe</option><option value="ar">🇸🇦 العربية</option>' +
    '<option value="hi">🇮🇳 हिन्दी</option><option value="ur">🇵🇰 اردو</option><option value="ps">🇦🇫 پښتو</option>' +
    '<option value="vi">🇻🇳 Tiếng Việt</option><option value="zh">🇨🇳 中文</option><option value="ko">🇰🇷 한국어</option>' +
    '<option value="so">🇸🇴 Soomaali</option><option value="ti">🇪🇷 ትግርኛ</option><option value="pt">🇧🇷 Português</option>' +
    '</select></span>' +
    '</span>' +
    '<span style="display:inline-flex;gap:6px"><a href="auth.html?mode=create" data-i18n="nav_createAccount" style="text-decoration:none;border:1px solid #194f53;border-radius:999px;padding:6px 12px;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:#1f5f63">Create account</a><a href="auth.html?mode=signin" data-i18n="nav_signIn" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;border:1px solid #d9dee6;border-radius:999px;padding:6px 12px">Sign In</a></span>' +
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
    try {
      var session = JSON.parse(localStorage.getItem('gs_auth_session'));
      if (!session || !session.name) return;
      var navs = document.querySelectorAll('nav[aria-label="Primary navigation"]');
      navs.forEach(function(nav) {
        var authSpans = nav.querySelectorAll('span');
        var last = authSpans[authSpans.length - 1];
        if (!last || !last.querySelector('a[href*="auth.html"]')) return;
        var name = session.name.length > 15 ? session.name.slice(0, 15) + '…' : session.name;
        last.innerHTML =
          '<a href="profile.html" style="text-decoration:none;border:1px solid #194f53;border-radius:999px;padding:6px 12px;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:#1f5f63">' + name + '</a>' +
          '<a href="#" onclick="localStorage.removeItem(\'gs_auth_session\');localStorage.removeItem(\'gs_account_v1\');location.reload();return false;" style="text-decoration:none;color:#4a5568;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;border:1px solid #d9dee6;border-radius:999px;padding:6px 12px">Sign Out</a>';
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
})();
