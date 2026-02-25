(function () {
  /* ── Grammar Spy site-wide animations ── */

  var css = [
    /* Scroll-reveal: elements start hidden, appear on scroll */
    '.gs-reveal{opacity:0;transform:translateY(28px);transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1)}',
    '.gs-reveal.gs-visible{opacity:1;transform:translateY(0)}',
    '.gs-reveal-left{opacity:0;transform:translateX(-32px);transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1)}',
    '.gs-reveal-left.gs-visible{opacity:1;transform:translateX(0)}',
    '.gs-reveal-right{opacity:0;transform:translateX(32px);transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1)}',
    '.gs-reveal-right.gs-visible{opacity:1;transform:translateX(0)}',
    '.gs-reveal-scale{opacity:0;transform:scale(.92);transition:opacity .5s ease,transform .5s ease}',
    '.gs-reveal-scale.gs-visible{opacity:1;transform:scale(1)}',

    /* Stagger children */
    '.gs-stagger>.gs-reveal:nth-child(1),.gs-stagger>.gs-reveal-scale:nth-child(1){transition-delay:.05s}',
    '.gs-stagger>.gs-reveal:nth-child(2),.gs-stagger>.gs-reveal-scale:nth-child(2){transition-delay:.12s}',
    '.gs-stagger>.gs-reveal:nth-child(3),.gs-stagger>.gs-reveal-scale:nth-child(3){transition-delay:.19s}',
    '.gs-stagger>.gs-reveal:nth-child(4),.gs-stagger>.gs-reveal-scale:nth-child(4){transition-delay:.26s}',
    '.gs-stagger>.gs-reveal:nth-child(5),.gs-stagger>.gs-reveal-scale:nth-child(5){transition-delay:.33s}',
    '.gs-stagger>.gs-reveal:nth-child(6),.gs-stagger>.gs-reveal-scale:nth-child(6){transition-delay:.40s}',

    /* Hero entrance */
    '@keyframes gs-hero-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
    '.hero,.hero-shell{animation:gs-hero-in .7s cubic-bezier(.22,1,.36,1) both}',

    /* Button hover lift */
    '.btn-primary,.btn.primary,a.btn-primary{transition:transform .18s ease,filter .18s ease,box-shadow .18s ease}',
    '.btn-primary:hover,.btn.primary:hover,a.btn-primary:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(31,95,99,.25)}',
    '.btn-primary:active,.btn.primary:active,a.btn-primary:active{transform:translateY(0);box-shadow:none}',

    /* Nav link subtle underline slide */
    'nav a,header a{position:relative}',

    /* Card hover lift */
    '.pack-card,article,.pricing-card,.card{transition:transform .22s ease,box-shadow .22s ease}',
    '.pack-card:hover,article:hover:not([role]),.pricing-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(11,16,32,.12)}',

    /* Pack thumbnail zoom on hover */
    '.pack-thumb-link img{transition:transform .35s ease}',
    '.pack-thumb-link:hover img{transform:scale(1.04)}',

    /* Feedback flash animations */
    '@keyframes gs-pulse-ok{0%{background:rgba(31,95,99,.12)}50%{background:rgba(31,95,99,.22)}100%{background:rgba(31,95,99,.12)}}',
    '@keyframes gs-pulse-bad{0%{background:rgba(180,40,40,.08)}50%{background:rgba(180,40,40,.18)}100%{background:rgba(180,40,40,.08)}}',
    '@keyframes gs-shake{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-4px)}30%,60%,90%{transform:translateX(4px)}}',
    '@keyframes gs-pop{0%{transform:scale(1)}40%{transform:scale(1.15)}100%{transform:scale(1)}}',
    '#feedback .ok{animation:gs-pulse-ok .5s ease}',
    '#feedback .bad{animation:gs-shake .4s ease,gs-pulse-bad .5s ease}',

    /* Score pop */
    '@keyframes gs-score-pop{0%{transform:scale(1)}50%{transform:scale(1.2);color:#c9a227}100%{transform:scale(1)}}',
    '.score-pop{animation:gs-score-pop .35s ease}',

    /* Streak fire glow */
    '@keyframes gs-glow{0%,100%{text-shadow:0 0 4px rgba(201,162,39,.3)}50%{text-shadow:0 0 12px rgba(201,162,39,.6)}}',
    '.streak-glow{animation:gs-glow 1s ease infinite}',

    /* Mission report slide-in */
    '@keyframes gs-slide-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}',
    '#reportOverlay.show{animation:gs-slide-up .4s cubic-bezier(.22,1,.36,1) both}',

    /* Floating badge pulse */
    '@keyframes gs-badge-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}',

    /* Smooth page load */
    '@keyframes gs-page-in{from{opacity:0}to{opacity:1}}',
    'body{animation:gs-page-in .35s ease both}',

    /* Respect reduced-motion */
    '@media(prefers-reduced-motion:reduce){*,.gs-reveal,.gs-reveal-left,.gs-reveal-right,.gs-reveal-scale,.hero,.hero-shell,.btn-primary,.pack-card,article,.pack-thumb-link img,#feedback .ok,#feedback .bad,#reportOverlay.show,body{animation:none!important;transition:none!important;transform:none!important}}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Scroll reveal observer ── */
  function initReveal() {
    var targets = document.querySelectorAll(
      '.section, .section-flat, .section-band-dark, .pack-card, ' +
      '.pricing-card, article, .mission-panel, .hero-visual, ' +
      'main > h2, main > h1, main > p, .grid > *, .wrap > *'
    );

    var seen = [];
    targets.forEach(function (el) {
      if (!el.classList.contains('gs-reveal') &&
          !el.classList.contains('gs-reveal-scale') &&
          !el.classList.contains('hero') &&
          !el.classList.contains('hero-shell')) {

        if (el.classList.contains('pack-card') || el.tagName === 'ARTICLE') {
          el.classList.add('gs-reveal-scale');
        } else {
          el.classList.add('gs-reveal');
        }
        seen.push(el);
      }
    });

    var grid = document.querySelectorAll('.grid');
    grid.forEach(function (g) { g.classList.add('gs-stagger'); });

    if (!window.IntersectionObserver) {
      seen.forEach(function (el) {
        el.classList.add('gs-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('gs-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    seen.forEach(function (el) { observer.observe(el); });
  }

  /* ── Auto-tag stagger on pack grids ── */
  function tagGrids() {
    document.querySelectorAll('.grid').forEach(function (g) {
      g.classList.add('gs-stagger');
    });
  }

  function boot() {
    tagGrids();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('layout:ready', function () {
    tagGrids();
    initReveal();
  });
})();
