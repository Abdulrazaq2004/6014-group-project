// questionsData.js
// Cyber6014 Game — Updated Question Bank (Arabic-Compatible Categories)

window.questions = [
  /* ---------------- PHISHING ---------------- */
  {
    category: "Phishing",
    difficulty: "easy",
    question_text: "ما الهدف الرئيسي من رسائل التصيد الإلكتروني (Phishing)؟",
    options: [
      "خداع المستخدم للحصول على معلوماته الحساسة",
      "تحديث النظام بشكل تلقائي",
      "تحسين أداء الشبكة",
      "إصلاح ثغرات في الجهاز"
    ],
    correct_answer: "خداع المستخدم للحصول على معلوماته الحساسة",
    points: 5,
    incident_title: "هجوم تصيد إلكتروني",
    incident_details: "أرسل المهاجم بريدًا إلكترونيًا مزيفًا يبدو كأنه من جهة موثوقة لسرقة بيانات الدخول.",
    article_link: "https://owasp.org/www-community/attacks/Phishing"
  },
  {
    category: "Phishing",
    difficulty: "medium",
    question_text: "ما العلامة التي تدل على أن البريد الإلكتروني مشبوه؟",
    options: [
      "عنوان بريد غير مطابق للجهة الأصلية",
      "لغة صحيحة وخالية من الأخطاء",
      "توقيع رسمي من الشركة",
      "إرفاق شعار الشركة الحقيقي"
    ],
    correct_answer: "عنوان بريد غير مطابق للجهة الأصلية",
    points: 10,
    incident_title: "عنوان بريد مزيف",
    incident_details: "تم استخدام عنوان بريد مزيف يشبه البريد الرسمي لخداع المستخدمين.",
    article_link: "https://www.cisa.gov/topics/cybersecurity-best-practices"
  },
  {
    category: "Phishing",
    difficulty: "hard",
    question_text: "ما التقنية المستخدمة لاكتشاف مواقع التصيد الجديدة؟",
    options: [
      "تحليل الروابط وسلوك النطاقات",
      "زيادة سعة الخادم",
      "تغيير عناوين IP باستمرار",
      "استخدام كلمات مرور قصيرة"
    ],
    correct_answer: "تحليل الروابط وسلوك النطاقات",
    points: 15,
    incident_title: "اكتشاف موقع تصيد",
    incident_details: "استخدم فريق الأمان تحليل الروابط لتحديد المواقع المزيفة الجديدة.",
    article_link: "https://phishing.org"
  },

  /* ---------------- PASSWORDS ---------------- */
  {
    category: "Passwords",
    difficulty: "easy",
    question_text: "لماذا يجب ألا تستخدم نفس كلمة المرور لكل الحسابات؟",
    options: [
      "لأن اختراق حساب واحد يكشف البقية",
      "لأنها تجعل الدخول بطيئًا",
      "لأن الأنظمة تمنع ذلك دائمًا",
      "لأنها تستهلك مساحة تخزين كبيرة"
    ],
    correct_answer: "لأن اختراق حساب واحد يكشف البقية",
    points: 5,
    incident_title: "إعادة استخدام كلمات المرور",
    incident_details: "أدى استخدام نفس كلمة المرور في عدة مواقع إلى اختراق الحسابات جميعها.",
    article_link: "https://owasp.org/www-community/passwords"
  },
  {
    category: "Passwords",
    difficulty: "medium",
    question_text: "ما أفضل طريقة لتخزين كلمات المرور في قاعدة البيانات؟",
    options: [
      "تجزئتها (Hashing) باستخدام خوارزمية قوية",
      "تخزينها بنص صريح",
      "إرسالها بالبريد الإلكتروني للمستخدم",
      "تشفيرها بمفتاح عام فقط"
    ],
    correct_answer: "تجزئتها (Hashing) باستخدام خوارزمية قوية",
    points: 10,
    incident_title: "تخزين آمن لكلمات المرور",
    incident_details: "تم تحسين الأمان باستخدام خوارزمية bcrypt لتجزئة كلمات المرور.",
    article_link: "https://owasp.org/www-community/Password_Storage_Cheat_Sheet"
  },
  {
    category: "Passwords",
    difficulty: "hard",
    question_text: "ما فائدة استخدام مدير كلمات المرور؟",
    options: [
      "توليد كلمات مرور قوية وتخزينها بأمان",
      "تسريع الاتصال بالإنترنت",
      "منع فيروسات النظام",
      "حذف الملفات المؤقتة"
    ],
    correct_answer: "توليد كلمات مرور قوية وتخزينها بأمان",
    points: 15,
    incident_title: "مدير كلمات المرور",
    incident_details: "يُستخدم مدير كلمات المرور لإنشاء كلمات قوية وتخزينها مشفرة.",
    article_link: "https://www.ncsc.gov.uk/collection/passwords"
  },

  /* ---------------- MALWARE ---------------- */
  {
    category: "Malware",
    difficulty: "easy",
    question_text: "ما الذي يميز برامج الفدية (Ransomware)؟",
    options: [
      "تشفير ملفات المستخدم وطلب فدية لفكها",
      "تحسين أداء الجهاز",
      "تسريع الاتصال بالشبكة",
      "تحديث النظام تلقائيًا"
    ],
    correct_answer: "تشفير ملفات المستخدم وطلب فدية لفكها",
    points: 5,
    incident_title: "هجوم فدية",
    incident_details: "تم تشفير بيانات الشركة بالكامل والمهاجم طالب بمبلغ مالي لفك التشفير.",
    article_link: "https://www.cisa.gov/stopransomware"
  },
  {
    category: "Malware",
    difficulty: "medium",
    question_text: "أي من الخيارات التالية يُعد وسيلة شائعة لانتشار البرمجيات الخبيثة؟",
    options: [
      "فتح مرفقات بريد إلكتروني مجهولة المصدر",
      "تحديث النظام بانتظام",
      "استخدام برامج الحماية",
      "تنزيل الملفات من المصادر الرسمية"
    ],
    correct_answer: "فتح مرفقات بريد إلكتروني مجهولة المصدر",
    points: 10,
    incident_title: "نشر البرمجيات الخبيثة",
    incident_details: "تم تحميل ملف ضار من بريد إلكتروني مزيف، مما أدى لاختراق النظام.",
    article_link: "https://owasp.org/www-community/malware"
  },
  {
    category: "Malware",
    difficulty: "hard",
    question_text: "ما نوع البرمجية التي تتيح للمهاجم التحكم بالجهاز عن بُعد؟",
    options: [
      "Trojan (حصان طروادة)",
      "Worm (دودة)",
      "Keylogger (مسجل ضغطات)",
      "Rootkit"
    ],
    correct_answer: "Trojan (حصان طروادة)",
    points: 15,
    incident_title: "حصان طروادة",
    incident_details: "تم تثبيت برنامج خفي يمنح المهاجم صلاحية كاملة على الجهاز.",
    article_link: "https://owasp.org/www-community/attacks/Trojan_Horse"
  },

  /* ---------------- SOCIAL ENGINEERING ---------------- */
  {
    category: "Social Engineering",
    difficulty: "easy",
    question_text: "ما المقصود بالهندسة الاجتماعية في الأمن السيبراني؟",
    options: [
      "خداع الأشخاص للحصول على معلومات حساسة",
      "اختبار أداء الخوادم",
      "تحديث جدران الحماية",
      "تحليل البرمجيات الضارة"
    ],
    correct_answer: "خداع الأشخاص للحصول على معلومات حساسة",
    points: 5,
    incident_title: "خداع بشري",
    incident_details: "تمكن المهاجم من إقناع الموظف بتسليم بيانات الدخول عبر مكالمة هاتفية.",
    article_link: "https://owasp.org/www-community/attacks/Social_Engineering"
  },

  /* ---------------- NETWORK SECURITY ---------------- */
  {
    category: "Network Security",
    difficulty: "easy",
    question_text: "ما الغرض من جدار الحماية (Firewall)؟",
    options: [
      "منع الاتصالات غير المصرح بها بالشبكة",
      "زيادة سرعة الإنترنت",
      "تشفير الأقراص الصلبة",
      "تحديث النظام تلقائيًا"
    ],
    correct_answer: "منع الاتصالات غير المصرح بها بالشبكة",
    points: 5,
    incident_title: "حماية الشبكة",
    incident_details: "ساعد جدار الحماية في منع محاولات اختراق من خارج المؤسسة.",
    article_link: "https://owasp.org/www-community/Firewall"
  },

/* ---------------- WEB SECURITY — EASY (5 pts) ---------------- */
{
  category: "Web Security",
  difficulty: "easy",
  question_text: "What makes Cross-Site Scripting (XSS) dangerous?",
  options: [
    "It allows attackers to inject scripts into web pages",
    "It only slows down page load speed",
    "It requires admin privileges",
    "It hides the website URL"
  ],
  correct_answer: "It allows attackers to inject scripts into web pages",
  points: 5,
  incident_title: "XSS Vulnerability",
  incident_details: "An attacker injected JavaScript into a comment form, allowing theft of session tokens.",
  article_link: "https://owasp.org/www-community/attacks/xss/"
},
{
  category: "Web Security",
  difficulty: "easy",
  question_text: "How can developers prevent XSS attacks?",
  options: [
    "Sanitize and escape all user inputs",
    "Use larger JavaScript files",
    "Disable CSS",
    "Block all images"
  ],
  correct_answer: "Sanitize and escape all user inputs",
  points: 5,
  incident_title: "Preventing XSS",
  incident_details: "Input sanitization and output encoding help block malicious scripts from executing.",
  article_link: "https://owasp.org/www-community/xss-prevention"
},
{
  category: "Web Security",
  difficulty: "easy",
  question_text: "What is the purpose of HTTPS?",
  options: [
    "Encrypt data transmitted between client and server",
    "Speed up webpage loading",
    "Improve SEO ranking only",
    "Hide website source code"
  ],
  correct_answer: "Encrypt data transmitted between client and server",
  points: 5,
  incident_title: "Encrypted Connection",
  incident_details: "HTTPS protects sensitive data like passwords and payment information from interception.",
  article_link: "https://owasp.org/www-project-top-ten/"
},
{
  category: "Web Security",
  difficulty: "easy",
  question_text: "What is the main purpose of the Content-Security-Policy (CSP) header?",
  options: [
    "To prevent loading of scripts from untrusted sources",
    "To cache images faster",
    "To hide HTML elements",
    "To reduce bandwidth usage"
  ],
  correct_answer: "To prevent loading of scripts from untrusted sources",
  points: 5,
  incident_title: "Using CSP",
  incident_details: "CSP restricts browsers to load resources only from trusted origins.",
  article_link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
},
{
  category: "Web Security",
  difficulty: "easy",
  question_text: "What is a common sign of a phishing webpage?",
  options: [
    "A suspicious or misspelled URL",
    "The site uses HTTPS",
    "It has a professional logo",
    "It loads quickly"
  ],
  correct_answer: "A suspicious or misspelled URL",
  points: 5,
  incident_title: "Phishing Attempt",
  incident_details: "The fake login page had a slightly altered domain name to trick users.",
  article_link: "https://owasp.org/www-community/attacks/Phishing"
},

/* ---------------- WEB SECURITY — MEDIUM (10 pts) ---------------- */
{
  category: "Web Security",
  difficulty: "medium",
  question_text: "What can lead to SQL Injection vulnerabilities?",
  options: [
    "Concatenating user input directly into SQL queries",
    "Using HTTPS connections",
    "Hashing passwords",
    "Escaping HTML tags"
  ],
  correct_answer: "Concatenating user input directly into SQL queries",
  points: 10,
  incident_title: "SQL Injection",
  incident_details: "Attackers exploited unvalidated input to extract data from the database.",
  article_link: "https://owasp.org/www-community/attacks/SQL_Injection"
},
{
  category: "Web Security",
  difficulty: "medium",
  question_text: "What is the safest way to handle user authentication sessions?",
  options: [
    "Regenerate session IDs after login",
    "Store sessions in localStorage without encryption",
    "Send session ID in a URL",
    "Have no session timeout"
  ],
  correct_answer: "Regenerate session IDs after login",
  points: 10,
  incident_title: "Session Fixation Prevention",
  incident_details: "Regenerating session IDs after login prevents attackers from reusing stolen tokens.",
  article_link: "https://owasp.org/www-community/attacks/Session_fixation"
},
{
  category: "Web Security",
  difficulty: "medium",
  question_text: "What is the purpose of input validation on the backend?",
  options: [
    "To ensure only safe and expected data is processed",
    "To make the website load faster",
    "To change how pages are displayed",
    "To block large image uploads"
  ],
  correct_answer: "To ensure only safe and expected data is processed",
  points: 10,
  incident_title: "Input Validation",
  incident_details: "The system rejected harmful characters to prevent SQL and XSS injection.",
  article_link: "https://owasp.org/www-community/controls/Input_Validation"
},
{
  category: "Web Security",
  difficulty: "medium",
  question_text: "What is Directory Traversal?",
  options: [
    "Accessing files outside the intended directory using '../' in paths",
    "A technique for speeding up file loading",
    "A method of encrypting URLs",
    "A way to clean up server logs"
  ],
  correct_answer: "Accessing files outside the intended directory using '../' in paths",
  points: 10,
  incident_title: "Directory Traversal Attack",
  incident_details: "An attacker accessed restricted configuration files by manipulating file paths.",
  article_link: "https://owasp.org/www-community/attacks/Path_Traversal"
},
{
  category: "Web Security",
  difficulty: "medium",
  question_text: "What is a security misconfiguration example?",
  options: [
    "Leaving admin panels publicly accessible",
    "Using a strong password policy",
    "Updating servers regularly",
    "Implementing HTTPS"
  ],
  correct_answer: "Leaving admin panels publicly accessible",
  points: 10,
  incident_title: "Security Misconfiguration",
  incident_details: "An exposed admin panel allowed attackers to modify database settings remotely.",
  article_link: "https://owasp.org/www-community/Misconfiguration"
},

/* ---------------- WEB SECURITY — HARD (15 pts) ---------------- */
{
  category: "Web Security",
  difficulty: "hard",
  question_text: "Why are Server-Side Request Forgery (SSRF) attacks dangerous?",
  options: [
    "They allow access to internal network resources",
    "They can only affect static websites",
    "They require physical access to servers",
    "They are easily detected by browsers"
  ],
  correct_answer: "They allow access to internal network resources",
  points: 15,
  incident_title: "SSRF Attack",
  incident_details: "Attackers used SSRF to access internal APIs that were not meant for public exposure.",
  article_link: "https://owasp.org/www-community/attacks/Server_Side_Request_Forgery"
},
{
  category: "Web Security",
  difficulty: "hard",
  question_text: "What is an Insecure Direct Object Reference (IDOR)?",
  options: [
    "When a user can access data by modifying an identifier in the URL",
    "When the website fails to use HTTPS",
    "When user sessions are logged out automatically",
    "When cookies are encrypted"
  ],
  correct_answer: "When a user can access data by modifying an identifier in the URL",
  points: 15,
  incident_title: "IDOR Exploit",
  incident_details: "The attacker changed the user ID in the URL and accessed another account's data.",
  article_link: "https://owasp.org/www-community/attacks/IDOR"
},
{
  category: "Web Security",
  difficulty: "hard",
  question_text: "Why should API keys not be stored in frontend code?",
  options: [
    "Because anyone can read them from browser code",
    "Because they slow down APIs",
    "Because they are too long",
    "Because they are encrypted automatically"
  ],
  correct_answer: "Because anyone can read them from browser code",
  points: 15,
  incident_title: "API Key Exposure",
  incident_details: "Sensitive keys in client-side JavaScript allowed attackers to abuse APIs.",
  article_link: "https://owasp.org/www-community/vulnerabilities/Exposed_API_Keys"
},
{
  category: "Web Security",
  difficulty: "hard",
  question_text: "What can prevent Clickjacking attacks?",
  options: [
    "Using the X-Frame-Options header",
    "Allowing all iframes",
    "Disabling JavaScript globally",
    "Running the site on HTTP"
  ],
  correct_answer: "Using the X-Frame-Options header",
  points: 15,
  incident_title: "Clickjacking Prevention",
  incident_details: "X-Frame-Options header prevents malicious websites from embedding your site in iframes.",
  article_link: "https://owasp.org/www-community/attacks/Clickjacking"
},
{
  category: "Web Security",
  difficulty: "hard",
  question_text: "What is a common mitigation for Cross-Site Request Forgery (CSRF)?",
  options: [
    "Implement anti-CSRF tokens and validate them",
    "Disable HTTPS",
    "Allow requests from any origin",
    "Use GET requests for state changes"
  ],
  correct_answer: "Implement anti-CSRF tokens and validate them",
  points: 15,
  incident_title: "CSRF Mitigation",
  incident_details: "CSRF tokens ensured that requests originated from legitimate sessions only.",
  article_link: "https://owasp.org/www-community/attacks/csrf"
}
];
// End of questionsData.js