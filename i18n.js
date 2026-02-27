/**
 * Grammar Spy™ — lightweight i18n. Use data-i18n="key" on elements to replace text with the current language.
 * Language: ?lang=es or localStorage gs_lang. Default: en.
 */
(function () {
  var STORAGE_KEY = 'gs_lang';
  var SUPPORTED = ['en', 'es', 'fr'];

  var t = {
    en: {
      nav_home: 'Home',
      nav_missions: 'Missions',
      nav_blog: 'Blog',
      nav_pricing: 'Pricing',
      nav_createAccount: 'Create account',
      nav_signIn: 'Sign In',
      nav_signOut: 'Sign Out',
      nav_dashboard: 'Dashboard',
      hero_tagline: 'Structured grammar. Clear results. Zero chaos.',
      hero_subcopy: 'Created by an ELD teacher for real classrooms.',
      hero_startHere: 'Start here',
      hero_ctaCopy: 'Less prep, less chaos—one focused mission. Choose Teacher or Student, then Continue. Mission 01 free; upgrade to unlock all.',
      hero_teacher: 'Teacher',
      hero_student: 'Student',
      hero_continue: 'Continue',
      hero_signUpFree: 'Sign up free',
      hero_trySample: 'Try a sample mission',
      hero_passive: 'Teacher path requires sign-in. Mission 01 free; upgrade for all missions.',
      home_howItWorks: 'How it works',
      home_whatHappens: 'What Happens in One Mission',
      home_oneTarget: 'One target per mission, minimal prep, clear results—so you and your students know exactly what to do next. Less chaos, more confidence.',
      home_brief: 'Brief',
      home_briefDesc: 'One clear target.',
      home_activity: 'Activity',
      home_activityDesc: 'One focused task.',
      home_feedbackLabel: 'Feedback',
      home_feedback: 'Immediate correction.',
      home_report: 'Report',
      home_reportDesc: 'Next-step guidance.',
      home_openSetup: 'Open mission setup',
      home_sampleMission: 'Sample mission',
      home_classroomCase: "Today's Classroom Case",
      home_exploreCase: 'Explore one case before full missions.',
      home_missingAnnouncement: 'The Missing Morning Announcement',
      home_findTense: 'Find the tense breach and rebuild the final line.',
      home_exploreMission: 'Explore This Mission',
      home_forTeachers: 'For teachers & students',
      home_supportsFlow: 'Relief, Not More Prep',
      home_classroomRhythm: 'Clear structure so you spend less time planning and more time teaching. Independent practice that builds student confidence.',
      home_structuredPacing: 'Less chaos—one mission at a time',
      home_realtimeFeedback: 'Instant feedback, less grading',
      home_reusableMissions: 'Reusable missions, year after year',
      home_learnMore: 'Learn more',
      home_start: 'Start',
      home_startFirst: 'Start Your First Mission',
      home_beginMission01: 'One mission, minimal prep. Start with Mission 01 and add more when you're ready.',
      home_tryMission01Free: 'Try Mission 01 Free',
      home_moreOptions: 'More options',
      home_viewAllMissions: 'View all missions',
      home_viewPricing: 'View pricing',
      welcome_title: 'Get the full experience of Grammar Spy',
      welcome_desc: 'Less prep. Clear structure. Students who can work with confidence. One mission at a time.',
      welcome_join: 'Join free',
      welcome_continue: 'Continue to site',
      packs_missionLibrary: 'Mission library',
      packs_chooseMission: 'Choose a mission to find your flow.',
      packs_selectContent: 'Select content first. Choose difficulty in the next step.',
      packs_openMission: 'Open mission',
      pricing_title: 'Pricing',
      pricing_intro: 'Less prep. Clear structure. Grammar training that gives you relief—reliable, replay-ready missions. Mission 01 free; upgrade to unlock all.',
      pricing_freeLabel: 'Free — One Pack',
      pricing_freeDesc: 'Sign up for a free account. Get Mission 01 (Retell What Happened) with no time limit.',
      pricing_signUpFree: 'Sign Up Free',
      pricing_singleTeacher: 'Single Teacher',
      pricing_studentLabel: 'Student',
      pricing_studentDesc: '$69/year — save when you pay annually. All missions, one learner.',
      pricing_student_feature1: 'All missions',
      pricing_student_feature2: 'Self-paced practice',
      pricing_student_feature3: 'Progress & reports',
      pricing_student_included: 'All missions included',
      pricing_schoolLicense: 'School License',
      pricing_custom: 'Custom',
      skipToMain: 'Skip to main content',
      email_getMission01: 'Get Mission 01 free.',
      email_captureDesc: 'No login yet? Drop your email and we\'ll send you access to Mission 01.',
      email_submit: 'Send me Mission 01',
      email_onList: "You're on the list. We'll be in touch."
    },
    es: {
      nav_home: 'Inicio',
      nav_missions: 'Misiones',
      nav_blog: 'Blog',
      nav_pricing: 'Precios',
      nav_createAccount: 'Crear cuenta',
      nav_signIn: 'Iniciar sesión',
      nav_signOut: 'Cerrar sesión',
      nav_dashboard: 'Panel',
      hero_tagline: 'Gramática estructurada. Resultados claros. Cero caos.',
      hero_subcopy: 'Creado por una profesora de ELD para aulas reales.',
      hero_startHere: 'Empieza aquí',
      hero_ctaCopy: 'Menos preparación, menos caos—una misión enfocada. Elige Profesor o Estudiante y luego Continuar. Misión 01 gratis; mejora para desbloquear todas.',
      hero_teacher: 'Profesor',
      hero_student: 'Estudiante',
      hero_continue: 'Continuar',
      hero_signUpFree: 'Registrarse gratis',
      hero_trySample: 'Probar una misión de ejemplo',
      hero_passive: 'Ruta profesor requiere inicio de sesión. Misión 01 gratis; mejora para todas las misiones.',
      home_howItWorks: 'Cómo funciona',
      home_whatHappens: 'Qué pasa en una misión',
      home_oneTarget: 'Un objetivo por misión, mínima preparación, resultados claros—para que tú y tus alumnos sepáis qué hacer después. Menos caos, más confianza.',
      home_brief: 'Brief',
      home_briefDesc: 'Un objetivo claro.',
      home_activity: 'Actividad',
      home_activityDesc: 'Una tarea enfocada.',
      home_feedbackLabel: 'Retroalimentación',
      home_feedback: 'Corrección inmediata.',
      home_report: 'Informe',
      home_reportDesc: 'Orientación para el siguiente paso.',
      home_openSetup: 'Abrir configuración de misión',
      home_sampleMission: 'Misión de ejemplo',
      home_classroomCase: 'Caso de aula de hoy',
      home_exploreCase: 'Explora un caso antes de las misiones completas.',
      home_missingAnnouncement: 'El anuncio matutino perdido',
      home_findTense: 'Encuentra el error de tiempo y reconstruye la línea final.',
      home_exploreMission: 'Explorar esta misión',
      home_forTeachers: 'Para profesores y estudiantes',
      home_supportsFlow: 'Alivio, no más preparación',
      home_classroomRhythm: 'Estructura clara para dedicar menos a planificar y más a enseñar. Práctica independiente que da confianza al alumnado.',
      home_structuredPacing: 'Menos caos—una misión a la vez',
      home_realtimeFeedback: 'Retroalimentación al instante, menos corrección',
      home_reusableMissions: 'Misiones reutilizables, curso tras curso',
      home_learnMore: 'Saber más',
      home_start: 'Empezar',
      home_startFirst: 'Empieza tu primera misión',
      home_beginMission01: 'Una misión, mínima preparación. Empieza con Misión 01 y añade más cuando quieras.',
      home_tryMission01Free: 'Probar Misión 01 gratis',
      home_moreOptions: 'Más opciones',
      home_viewAllMissions: 'Ver todas las misiones',
      home_viewPricing: 'Ver precios',
      welcome_title: 'Vive la experiencia completa de Grammar Spy',
      welcome_desc: 'Menos preparación. Estructura clara. Estudiantes que trabajan con confianza. Una misión a la vez.',
      welcome_join: 'Unirse gratis',
      welcome_continue: 'Continuar al sitio',
      packs_missionLibrary: 'Biblioteca de misiones',
      packs_chooseMission: 'Elige una misión y encuentra tu ritmo.',
      packs_selectContent: 'Elige el contenido primero. Elige la dificultad en el siguiente paso.',
      packs_openMission: 'Abrir misión',
      pricing_title: 'Precios',
      pricing_intro: 'Menos preparación. Estructura clara. Formación gramatical que te da alivio—misiones fiables y listas para repetir. Misión 01 gratis; mejora para desbloquear todas.',
      pricing_freeLabel: 'Gratis — Un pack',
      pricing_freeDesc: 'Regístrate gratis. Obtén la Misión 01 (Retell What Happened) sin límite de tiempo.',
      pricing_signUpFree: 'Registrarse gratis',
      pricing_singleTeacher: 'Un profesor',
      pricing_studentLabel: 'Estudiante',
      pricing_studentDesc: '69 $/año — ahorra pagando anual. Todas las misiones, un aprendiz.',
      pricing_student_feature1: 'Todas las misiones',
      pricing_student_feature2: 'Práctica a tu ritmo',
      pricing_student_feature3: 'Progreso e informes',
      pricing_student_included: 'Todas las misiones incluidas',
      pricing_schoolLicense: 'Licencia escolar',
      pricing_custom: 'Personalizado',
      skipToMain: 'Ir al contenido principal',
      email_getMission01: 'Obtén la Misión 01 gratis.',
      email_captureDesc: '¿Sin cuenta? Deja tu correo y te enviamos acceso a Misión 01.',
      email_submit: 'Envíame Misión 01',
      email_onList: 'Estás en la lista. Te contactaremos.'
    },
    fr: {
      nav_home: 'Accueil',
      nav_missions: 'Missions',
      nav_blog: 'Blog',
      nav_pricing: 'Tarifs',
      nav_createAccount: 'Créer un compte',
      nav_signIn: 'Connexion',
      nav_signOut: 'Déconnexion',
      nav_dashboard: 'Tableau de bord',
      hero_tagline: 'Grammaire structurée. Résultats clairs. Zéro chaos.',
      hero_subcopy: 'Créé par un enseignant ELD pour de vraies classes.',
      hero_startHere: 'Commencer ici',
      hero_ctaCopy: 'Moins de préparation, moins de chaos—une mission ciblée. Choisis Enseignant ou Élève puis Continuer. Mission 01 gratuite ; upgrade pour tout débloquer.',
      hero_teacher: 'Enseignant',
      hero_student: 'Élève',
      hero_continue: 'Continuer',
      hero_signUpFree: 'S\'inscrire gratuitement',
      hero_trySample: 'Essayer une mission',
      hero_passive: 'Accès enseignant après connexion. Mission 01 gratuite ; mise à niveau pour toutes les missions.',
      home_howItWorks: 'Comment ça marche',
      home_whatHappens: 'Ce qui se passe dans une mission',
      home_oneTarget: 'Un objectif par mission, peu de préparation, des résultats clairs—pour que toi et tes élèves sachiez quoi faire ensuite. Moins de chaos, plus de confiance.',
      home_brief: 'Brief',
      home_briefDesc: 'Un objectif clair.',
      home_activity: 'Activité',
      home_activityDesc: 'Une tâche ciblée.',
      home_feedbackLabel: 'Retour',
      home_feedback: 'Correction immédiate.',
      home_report: 'Rapport',
      home_reportDesc: 'Pistes pour la suite.',
      home_openSetup: 'Ouvrir la mission',
      home_sampleMission: 'Mission d\'exemple',
      home_classroomCase: 'Cas du jour',
      home_exploreCase: 'Explore un cas avant les missions complètes.',
      home_missingAnnouncement: 'L\'annonce du matin manquante',
      home_findTense: 'Trouve l\'erreur de temps et reconstruis la ligne finale.',
      home_exploreMission: 'Explorer cette mission',
      home_forTeachers: 'Pour enseignants et élèves',
      home_supportsFlow: 'Soulagement, pas plus de prépa',
      home_classroomRhythm: 'Structure claire pour moins préparer et plus enseigner. Pratique autonome qui donne confiance aux élèves.',
      home_structuredPacing: 'Moins de chaos—une mission à la fois',
      home_realtimeFeedback: 'Retour instantané, moins de correction',
      home_reusableMissions: 'Missions réutilisables, année après année',
      home_learnMore: 'En savoir plus',
      home_start: 'Commencer',
      home_startFirst: 'Lance ta première mission',
      home_beginMission01: 'Une mission, peu de prépa. Commence par la Mission 01 et ajoute le reste quand tu veux.',
      home_tryMission01Free: 'Essayer la Mission 01 gratuitement',
      home_moreOptions: 'Plus d\'options',
      home_viewAllMissions: 'Voir toutes les missions',
      home_viewPricing: 'Voir les tarifs',
      welcome_title: 'Vivez l\'expérience complète de Grammar Spy',
      welcome_desc: 'Rejoignez notre communauté—enseignants et élèves qui progressent en grammaire, une mission à la fois.',
      welcome_join: 'Rejoindre gratuitement',
      welcome_continue: 'Continuer vers le site',
      packs_missionLibrary: 'Bibliothèque de missions',
      packs_chooseMission: 'Choisis une mission pour trouver ton rythme.',
      packs_selectContent: 'Choisis d\'abord le contenu. Puis la difficulté à l\'étape suivante.',
      packs_openMission: 'Ouvrir la mission',
      pricing_title: 'Tarifs',
      pricing_intro: 'Formation grammaticale structurée pour les enseignants—fiabilité, progression et flux de cours prêt à rejouer. Mission 01 gratuite ; mise à niveau pour débloquer toutes les missions.',
      pricing_freeLabel: 'Gratuit — Un pack',
      pricing_freeDesc: 'Crée un compte gratuit. Mission 01 (Retell What Happened) sans limite de temps.',
      pricing_signUpFree: 'S\'inscrire gratuitement',
      pricing_singleTeacher: 'Un enseignant',
      pricing_studentLabel: 'Étudiant',
      pricing_studentDesc: '69 €/an — économisez en payant annuel. Toutes les missions, un apprenant.',
      pricing_student_feature1: 'Toutes les missions',
      pricing_student_feature2: 'Pratique à son rythme',
      pricing_student_feature3: 'Progression et rapports',
      pricing_student_included: 'Toutes les missions incluses',
      pricing_schoolLicense: 'Licence établissement',
      pricing_custom: 'Sur devis',
      skipToMain: 'Aller au contenu principal',
      email_getMission01: 'Obtenez la Mission 01 gratuitement.',
      email_captureDesc: 'Pas encore de compte ? Laissez votre e-mail et on vous envoie l\'accès à Mission 01.',
      email_submit: 'Envoyez-moi Mission 01',
      email_onList: 'Vous êtes sur la liste. On vous recontacte.'
    }
  };

  function getLang() {
    var fromUrl = typeof URLSearchParams !== 'undefined' && location.search ? new URLSearchParams(location.search).get('lang') : null;
    if (fromUrl && SUPPORTED.indexOf(fromUrl) >= 0) {
      try { localStorage.setItem(STORAGE_KEY, fromUrl); } catch (_) {}
      return fromUrl;
    }
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(stored) >= 0 ? stored : 'en';
    } catch (_) {
      return 'en';
    }
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    document.documentElement.lang = lang;
    apply();
  }

  function apply() {
    var lang = getLang();
    document.documentElement.lang = lang;
    var strings = t[lang] || t.en;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      var val = strings[key];
      if (val != null) nodes[i].textContent = val;
    }
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
      var k = placeholders[j].getAttribute('data-i18n-placeholder');
      var v = strings[k];
      if (v != null) placeholders[j].setAttribute('placeholder', v);
    }
  }

  window.GS_I18N = {
    getLang: getLang,
    setLang: setLang,
    apply: apply,
    supported: SUPPORTED
  };

  function bindSwitcher() {
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('#gsLangSwitcher .gs-lang-btn');
      if (!btn) return;
      var lang = btn.getAttribute('data-lang');
      if (lang && SUPPORTED.indexOf(lang) >= 0) {
        setLang(lang);
        document.querySelectorAll('#gsLangSwitcher .gs-lang-btn').forEach(function (b) {
          b.style.background = b.getAttribute('data-lang') === lang ? 'rgba(31,95,99,.15)' : 'transparent';
          b.style.fontWeight = b.getAttribute('data-lang') === lang ? '800' : '700';
        });
      }
    });
    document.addEventListener('layout:ready', function () {
      var lang = getLang();
      document.querySelectorAll('#gsLangSwitcher .gs-lang-btn').forEach(function (b) {
        b.style.background = b.getAttribute('data-lang') === lang ? 'rgba(31,95,99,.15)' : 'transparent';
        b.style.fontWeight = b.getAttribute('data-lang') === lang ? '800' : '700';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      apply();
      bindSwitcher();
      document.dispatchEvent(new CustomEvent('i18n:applied'));
    });
  } else {
    apply();
    bindSwitcher();
    document.dispatchEvent(new CustomEvent('i18n:applied'));
  }
  document.addEventListener('layout:ready', apply);
})();
