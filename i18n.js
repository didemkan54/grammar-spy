/**
 * Grammar Spy™ — lightweight i18n. Use data-i18n="key" on elements to replace text with the current language.
 * Language: ?lang=es or localStorage gs_lang. Default: en.
 */
(function () {
  var STORAGE_KEY = 'gs_lang';
  var SUPPORTED = ['en', 'es', 'fr', 'am', 'tr', 'ar', 'hi', 'ur', 'ps', 'vi', 'zh', 'ko', 'so', 'ti', 'pt'];

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
      home_beginMission01: 'One mission, minimal prep. Start with Mission 01 and add more when you\'re ready.',
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
    },
    am: {
      nav_home: 'መነሻ', nav_missions: 'ተልዕኮዎች', nav_blog: 'ብሎግ', nav_pricing: 'ዋጋ',
      nav_createAccount: 'መለያ ፍጠር', nav_signIn: 'ግባ', nav_signOut: 'ውጣ',
      hero_tagline: 'የተደራጀ ሰዋሰው። ግልጽ ውጤቶች። ምንም ግራ መጋባት።',
      hero_subcopy: 'ለእውነተኛ ክፍሎች በ ELD መምህር የተሰራ።',
      hero_startHere: 'እዚህ ጀምር', hero_teacher: 'መምህር', hero_student: 'ተማሪ',
      hero_continue: 'ቀጥል', hero_signUpFree: 'በነጻ ተመዝገብ', hero_trySample: 'ናሙና ተልዕኮ ሞክር',
      hero_passive: 'የመምህር መንገድ መግባት ያስፈልጋል። ተልዕኮ 01 ነጻ፤ ሁሉንም ለመክፈት ያሻሽሉ።',
      home_howItWorks: 'እንዴት እንደሚሰራ', home_whatHappens: 'በአንድ ተልዕኮ ውስጥ ምን ይከሰታል',
      packs_openMission: 'ተልዕኮ ክፈት', pricing_title: 'ዋጋ', pricing_signUpFree: 'በነጻ ተመዝገብ'
    },
    tr: {
      nav_home: 'Ana Sayfa', nav_missions: 'Görevler', nav_blog: 'Blog', nav_pricing: 'Fiyatlar',
      nav_createAccount: 'Hesap Oluştur', nav_signIn: 'Giriş Yap', nav_signOut: 'Çıkış Yap',
      hero_tagline: 'Yapılandırılmış dilbilgisi. Net sonuçlar. Sıfır karmaşa.',
      hero_subcopy: 'Gerçek sınıflar için bir ELD öğretmeni tarafından oluşturuldu.',
      hero_startHere: 'Buradan başla', hero_teacher: 'Öğretmen', hero_student: 'Öğrenci',
      hero_continue: 'Devam', hero_signUpFree: 'Ücretsiz kaydol', hero_trySample: 'Örnek görev dene',
      hero_passive: 'Öğretmen yolu oturum açmayı gerektirir. Görev 01 ücretsiz; tümünü açmak için yükseltin.',
      home_howItWorks: 'Nasıl çalışır', home_whatHappens: 'Bir görevde ne olur',
      packs_openMission: 'Görevi aç', pricing_title: 'Fiyatlar', pricing_signUpFree: 'Ücretsiz kaydol'
    },
    ar: {
      nav_home: 'الرئيسية', nav_missions: 'المهمات', nav_blog: 'المدونة', nav_pricing: 'الأسعار',
      nav_createAccount: 'إنشاء حساب', nav_signIn: 'تسجيل الدخول', nav_signOut: 'تسجيل الخروج',
      hero_tagline: 'قواعد منظمة. نتائج واضحة. صفر فوضى.',
      hero_subcopy: 'صُمم بواسطة معلم ELD للفصول الدراسية الحقيقية.',
      hero_startHere: 'ابدأ هنا', hero_teacher: 'معلم', hero_student: 'طالب',
      hero_continue: 'متابعة', hero_signUpFree: 'سجل مجاناً', hero_trySample: 'جرب مهمة تجريبية',
      hero_passive: 'مسار المعلم يتطلب تسجيل الدخول. المهمة 01 مجانية؛ قم بالترقية لفتح الكل.',
      home_howItWorks: 'كيف يعمل', home_whatHappens: 'ماذا يحدث في مهمة واحدة',
      packs_openMission: 'افتح المهمة', pricing_title: 'الأسعار', pricing_signUpFree: 'سجل مجاناً'
    },
    hi: {
      nav_home: 'होम', nav_missions: 'मिशन', nav_blog: 'ब्लॉग', nav_pricing: 'मूल्य',
      nav_createAccount: 'खाता बनाएं', nav_signIn: 'साइन इन', nav_signOut: 'साइन आउट',
      hero_tagline: 'व्यवस्थित व्याकरण। स्पष्ट परिणाम। शून्य अराजकता।',
      hero_subcopy: 'असली कक्षाओं के लिए एक ELD शिक्षक द्वारा बनाया गया।',
      hero_startHere: 'यहाँ शुरू करें', hero_teacher: 'शिक्षक', hero_student: 'छात्र',
      hero_continue: 'जारी रखें', hero_signUpFree: 'मुफ़्त साइन अप', hero_trySample: 'नमूना मिशन आज़माएं',
      hero_passive: 'शिक्षक पथ के लिए साइन-इन आवश्यक है। मिशन 01 मुफ़्त; सभी अनलॉक करने के लिए अपग्रेड करें।',
      home_howItWorks: 'यह कैसे काम करता है', home_whatHappens: 'एक मिशन में क्या होता है',
      packs_openMission: 'मिशन खोलें', pricing_title: 'मूल्य', pricing_signUpFree: 'मुफ़्त साइन अप'
    },
    ur: {
      nav_home: 'ہوم', nav_missions: 'مشن', nav_blog: 'بلاگ', nav_pricing: 'قیمتیں',
      nav_createAccount: 'اکاؤنٹ بنائیں', nav_signIn: 'سائن ان', nav_signOut: 'سائن آؤٹ',
      hero_tagline: 'منظم گرامر۔ واضح نتائج۔ کوئی افراتفری نہیں۔',
      hero_subcopy: 'حقیقی کلاس رومز کے لیے ایک ELD ٹیچر نے بنایا۔',
      hero_startHere: 'یہاں شروع کریں', hero_teacher: 'استاد', hero_student: 'طالب علم',
      hero_continue: 'جاری رکھیں', hero_signUpFree: 'مفت سائن اپ', hero_trySample: 'نمونہ مشن آزمائیں',
      hero_passive: 'استاد کے راستے کے لیے سائن ان ضروری ہے۔ مشن 01 مفت؛ سب کھولنے کے لیے اپ گریڈ کریں۔',
      home_howItWorks: 'یہ کیسے کام کرتا ہے', home_whatHappens: 'ایک مشن میں کیا ہوتا ہے',
      packs_openMission: 'مشن کھولیں', pricing_title: 'قیمتیں', pricing_signUpFree: 'مفت سائن اپ'
    },
    ps: {
      nav_home: 'کور', nav_missions: 'ماموریتونه', nav_blog: 'بلاګ', nav_pricing: 'نرخونه',
      nav_createAccount: 'حساب جوړ کړئ', nav_signIn: 'ننوتل', nav_signOut: 'وتل',
      hero_tagline: 'منظم ګرامر۔ روښانه پایلې۔ هیڅ ګډوډي نشته۔',
      hero_subcopy: 'د ریښتیني ټولګیو لپاره د ELD ښوونکي لخوا جوړ شوی۔',
      hero_startHere: 'دلته پیل کړئ', hero_teacher: 'ښوونکی', hero_student: 'زده کونکی',
      hero_continue: 'دوام ورکړئ', hero_signUpFree: 'وړیا ثبت نام', hero_trySample: 'نمونه ماموریت وازمایئ',
      packs_openMission: 'ماموریت خلاص کړئ', pricing_title: 'نرخونه', pricing_signUpFree: 'وړیا ثبت نام'
    },
    vi: {
      nav_home: 'Trang chủ', nav_missions: 'Nhiệm vụ', nav_blog: 'Blog', nav_pricing: 'Giá',
      nav_createAccount: 'Tạo tài khoản', nav_signIn: 'Đăng nhập', nav_signOut: 'Đăng xuất',
      hero_tagline: 'Ngữ pháp có cấu trúc. Kết quả rõ ràng. Không hỗn loạn.',
      hero_subcopy: 'Được tạo bởi giáo viên ELD cho lớp học thực tế.',
      hero_startHere: 'Bắt đầu tại đây', hero_teacher: 'Giáo viên', hero_student: 'Học sinh',
      hero_continue: 'Tiếp tục', hero_signUpFree: 'Đăng ký miễn phí', hero_trySample: 'Thử nhiệm vụ mẫu',
      hero_passive: 'Đường dẫn giáo viên yêu cầu đăng nhập. Nhiệm vụ 01 miễn phí; nâng cấp để mở tất cả.',
      home_howItWorks: 'Cách hoạt động', home_whatHappens: 'Điều gì xảy ra trong một nhiệm vụ',
      packs_openMission: 'Mở nhiệm vụ', pricing_title: 'Giá', pricing_signUpFree: 'Đăng ký miễn phí'
    },
    zh: {
      nav_home: '首页', nav_missions: '任务', nav_blog: '博客', nav_pricing: '价格',
      nav_createAccount: '创建账户', nav_signIn: '登录', nav_signOut: '退出',
      hero_tagline: '结构化语法。清晰结果。零混乱。',
      hero_subcopy: '由ELD教师为真实课堂创建。',
      hero_startHere: '从这里开始', hero_teacher: '教师', hero_student: '学生',
      hero_continue: '继续', hero_signUpFree: '免费注册', hero_trySample: '试试示例任务',
      hero_passive: '教师路径需要登录。任务01免费；升级解锁全部。',
      home_howItWorks: '如何运作', home_whatHappens: '一个任务中会发生什么',
      packs_openMission: '打开任务', pricing_title: '价格', pricing_signUpFree: '免费注册'
    },
    ko: {
      nav_home: '홈', nav_missions: '미션', nav_blog: '블로그', nav_pricing: '가격',
      nav_createAccount: '계정 만들기', nav_signIn: '로그인', nav_signOut: '로그아웃',
      hero_tagline: '체계적인 문법. 명확한 결과. 혼란 제로.',
      hero_subcopy: '실제 교실을 위해 ELD 교사가 만들었습니다.',
      hero_startHere: '여기서 시작', hero_teacher: '교사', hero_student: '학생',
      hero_continue: '계속', hero_signUpFree: '무료 가입', hero_trySample: '샘플 미션 체험',
      hero_passive: '교사 경로는 로그인이 필요합니다. 미션 01 무료; 업그레이드하여 전체 잠금 해제.',
      home_howItWorks: '작동 방식', home_whatHappens: '미션에서 일어나는 일',
      packs_openMission: '미션 열기', pricing_title: '가격', pricing_signUpFree: '무료 가입'
    },
    so: {
      nav_home: 'Bogga Hore', nav_missions: 'Hawlaha', nav_blog: 'Blog', nav_pricing: 'Qiimaha',
      nav_createAccount: 'Samee Akoon', nav_signIn: 'Soo Gal', nav_signOut: 'Ka Bax',
      hero_tagline: 'Naxwe habaynaysa. Natiijooyin cad. Qas la\'aan.',
      hero_subcopy: 'Waxaa sameeyay macallin ELD fasallo dhabta ah.',
      hero_startHere: 'Halkan ka bilow', hero_teacher: 'Macallin', hero_student: 'Arday',
      hero_continue: 'Sii wad', hero_signUpFree: 'Bilaash isdiiwaan geli', hero_trySample: 'Tijaabi hawl tusaale ah',
      packs_openMission: 'Fur hawsha', pricing_title: 'Qiimaha', pricing_signUpFree: 'Bilaash isdiiwaan geli'
    },
    ti: {
      nav_home: 'መበገሲ', nav_missions: 'ተልእኾታት', nav_blog: 'ብሎግ', nav_pricing: 'ዋጋ',
      nav_createAccount: 'ሕሳብ ፍጠር', nav_signIn: 'እቶ', nav_signOut: 'ውጻእ',
      hero_tagline: 'ስሩዕ ሰዋስው። ንጹር ውጽኢታት። ዜሮ ምድንጋር።',
      hero_subcopy: 'ንሓቀኛ ክፍልታት ብ ELD መምህር ዝተሰርሐ።',
      hero_startHere: 'ኣብዚ ጀምር', hero_teacher: 'መምህር', hero_student: 'ተማሃራይ',
      hero_continue: 'ቀጽል', hero_signUpFree: 'ብነጻ ተመዝገብ', hero_trySample: 'ናሙና ተልእኾ ፈትን',
      packs_openMission: 'ተልእኾ ክፈት', pricing_title: 'ዋጋ', pricing_signUpFree: 'ብነጻ ተመዝገብ'
    },
    pt: {
      nav_home: 'Início', nav_missions: 'Missões', nav_blog: 'Blog', nav_pricing: 'Preços',
      nav_createAccount: 'Criar conta', nav_signIn: 'Entrar', nav_signOut: 'Sair',
      hero_tagline: 'Gramática estruturada. Resultados claros. Zero caos.',
      hero_subcopy: 'Criado por um professor de ELD para salas de aula reais.',
      hero_startHere: 'Comece aqui', hero_teacher: 'Professor', hero_student: 'Aluno',
      hero_continue: 'Continuar', hero_signUpFree: 'Cadastre-se grátis', hero_trySample: 'Experimente uma missão',
      hero_passive: 'Caminho do professor requer login. Missão 01 grátis; atualize para desbloquear tudo.',
      home_howItWorks: 'Como funciona', home_whatHappens: 'O que acontece em uma missão',
      packs_openMission: 'Abrir missão', pricing_title: 'Preços', pricing_signUpFree: 'Cadastre-se grátis'
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

  function syncSelect() {
    var lang = getLang();
    document.querySelectorAll('#gsLangSelect').forEach(function (sel) {
      sel.value = lang;
    });
  }

  function bindToSelect(sel) {
    if (sel._i18nBound) return;
    sel._i18nBound = true;
    sel.value = getLang();
    sel.addEventListener('change', function () {
      var lang = sel.value;
      if (lang && SUPPORTED.indexOf(lang) >= 0) {
        setLang(lang);
        syncSelect();
      }
    });
  }

  function bindSwitcher() {
    document.querySelectorAll('#gsLangSelect').forEach(bindToSelect);
    document.addEventListener('layout:ready', function () {
      document.querySelectorAll('#gsLangSelect').forEach(bindToSelect);
      apply();
    });
    var observer = new MutationObserver(function () {
      document.querySelectorAll('#gsLangSelect').forEach(bindToSelect);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function boot() {
    apply();
    bindSwitcher();
    syncSelect();
    document.dispatchEvent(new CustomEvent('i18n:applied'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('layout:ready', function() {
    apply();
    syncSelect();
  });
  // Re-apply after a short delay to catch late-rendered headers
  setTimeout(function() { apply(); syncSelect(); }, 800);
  setTimeout(function() { apply(); syncSelect(); }, 2000);
})();
