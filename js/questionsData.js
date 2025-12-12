// =================== CYBER6014 Question Bank ===================

window.questions = [

  /* ---------------- PHISHING & SCAM MESSAGES ---------------- */

  // === EASY LEVEL ===
  {
    category: "Phishing",
    difficulty: "easy",
    question_text: "True or False: Phishing emails often create a sense of urgency to trick you into acting quickly.",
    question_type: "true-false",
    options: ["True", "False"],
    correct_answer: "True",
    points: 5
  },

  {
    category: "Phishing",
    difficulty: "easy",
    question_text: "Look at the email below and choose whether it is legitimate or a phishing attempt.",
    question_type: "image-single",
    image: "images/phishing_email.png",
    options: ["Legitimate", "Phishing"],
    correct_answer: "Phishing",
    points: 5,
    explanation_image: "images/phishing_email_explain.png",

  },

  {
    category: "Phishing",
    difficulty: "easy",
    question_text: "Which of the following is a clear red flag of a phishing email?",
    question_type: "multiple-choice",
    options: [
      "A polite greeting",
      "An urgent request to verify your account",
      "A detailed signature",
      "A short message with no links"
    ],
    correct_answer: "An urgent request to verify your account",
    points: 5
  },

  // === MEDIUM LEVEL ===
  {
    category: "Phishing",
    difficulty: "medium",
    question_text: "Look at the email header image. Which detail shows the sender might be spoofed?",
    question_type: "image-single",
    image: "images/spoofing_email.png",
    options: [
      "The subject line is friendly",
      "The sender domain looks misspelled",
      "It uses your first name",
      "It includes a company logo"
    ],
    correct_answer: "The sender domain looks misspelled",
    points: 10,
    explanation_image: "images/spoofing_email_explain.png",
  },

  {
    category: "Phishing",
    difficulty: "medium",
    question_text: "You receive an email from ‘security@bankexamp1e.com’ asking to confirm your password. What’s the best action?",
    question_type: "scenario",
    options: [
      "Reply to confirm your credentials",
      "Click the link to check your account",
      "Ignore and delete the message",
      "Report it to your IT/security team"
    ],
    correct_answer: "Report it to your IT/security team",
    points: 10
  },

  {
    category: "Phishing",
    difficulty: "medium",
    question_text: "Arrange the correct steps to verify if an email is legitimate (click on the options to order them)",
    question_type: "ordering",
    options: [
      "Check sender address carefully",
      "Look for spelling or grammar errors",
      "Hover over links before clicking",
      "Contact the company through official channels"
    ],
    correct_order: [
      "Check sender address carefully",
      "Hover over links before clicking",
      "Look for spelling or grammar errors",
      "Contact the company through official channels"
    ],
    points: 10
  },

  // === HARD LEVEL ===
{
  category: "Phishing",
  difficulty: "hard",
  question_text: "Study this image of a phishing email and the most obvious sign.",
  question_type: "image-single",
  image: "images/fedex_email.png",
  options: [
    "Delivery attempted: Signature required",
    "Your package will be returned to sender",
    "Manage Delivery” link",
    "Hi, Demo” greeting"
  ],
  correct_answer: "Manage Delivery” link",
  points: 15,
  explanation_image: "images/fedex_explain.png",
},

  {
    category: "Phishing",
    difficulty: "hard",
    question_text: "Read this message: “Your account has been flagged for unusual activity. Verify your details immediately to avoid permanent suspension.”Which phrase is the strongest phishing trigger?",
    question_type: "multiple-choice",
    options: [
      "“flagged for unusual activity”",
      "“Verify your details immediately”",
      "“Your account has been”",
      "“to avoid permanent suspension”"
    ],
    correct_answer: "“Verify your details immediately”",
    points: 15
  },

  {
    category: "Phishing",
    difficulty: "hard",
    question_text: "Create the correct response order when you suspect a phishing attempt.",
    question_type: "ordering",
    options: [
      "Do not click any links or attachments",
      "Report to IT/security team",
      "Warn colleagues",
      "Delete the email"
    ],
    correct_order: [
      "Do not click any links or attachments",
      "Report to IT/security team",
      "Warn colleagues",
      "Delete the email"
    ],
    points: 15
  }

  /* ---------------- Other categories left empty ---------------- */
];

// =================== END OF QUESTION BANK ===================
