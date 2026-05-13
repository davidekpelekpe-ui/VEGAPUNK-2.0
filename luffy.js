const speech = document.getElementById("speech");

/* =========================
   LUFFY FULL AI BRAIN SYSTEM
   ========================= */

/*
  This system has 4 layers:

  1. Personality Layer (emotion + tone)
  2. Context Layer (detects zone + intent)
  3. Knowledge Layer (teaching + explanations)
  4. Memory Layer (XP + learning history)
*/

/* -------------------------
   MEMORY SYSTEM
--------------------------*/

let XP = parseInt(localStorage.getItem("XP") || "0");
let mistakes = JSON.parse(localStorage.getItem("mistakes") || "[]");

function saveMemory() {
  localStorage.setItem("XP", XP);
  localStorage.setItem("mistakes", JSON.stringify(mistakes));
}

/* -------------------------
   PERSONALITY SYSTEM
--------------------------*/

const moods = {
  happy: [
    "Hahaha! You’re getting stronger!",
    "Nice move! That’s real pirate energy!",
    "Keep going, I like this!",
  ],
  thinking: [
    "Hmm… let me break this down for you.",
    "Interesting situation… analyzing now.",
    "Alright, let’s think this through.",
  ],
  serious: [
    "Focus. This is important.",
    "No mistakes here. Think carefully.",
    "This is where discipline matters.",
  ],
  teaching: [
    "Listen carefully, I’ll explain step by step.",
    "This is important for your growth.",
    "I’ll simplify it for you.",
  ],
};

/* -------------------------
   CORE SPEAK FUNCTION
--------------------------*/

function luffySay(mood, customText = null) {
  if (customText) {
    speech.innerText = customText;
    return;
  }

  const list = moods[mood] || moods.thinking;
  const msg = list[Math.floor(Math.random() * list.length)];
  speech.innerText = msg;
}

/* -------------------------
   XP SYSTEM
--------------------------*/

function addXP(amount) {
  XP += amount;
  saveMemory();

  const level = Math.floor(XP / 5);

  speech.innerText = `XP +${amount} | Level ${level}`;

  setTimeout(() => {
    luffySay("thinking");
  }, 1200);
}

/* -------------------------
   MISTAKE TRACKING
--------------------------*/

function recordMistake(context, note) {
  mistakes.push({ context, note, time: Date.now() });
  saveMemory();
}

/* -------------------------
   CONTEXT DETECTION ENGINE
--------------------------*/

function detectContext(zone, input = "") {
  const text = input.toLowerCase();

  if (zone === "gaming") return "gaming";
  if (zone === "trading") return "trading";
  if (zone === "learning") return "learning";

  // assignment / help detection
  if (
    text.includes("solve") ||
    text.includes("explain") ||
    text.includes("homework") ||
    text.includes("assignment") ||
    text.includes("question")
  ) {
    return "assignment";
  }

  return "general";
}

/* -------------------------
   KNOWLEDGE ENGINE
--------------------------*/

function respondToContext(context, data = {}) {
  /* ===== GAMING ===== */
  if (context === "gaming") {
    luffySay("happy", "Gaming mode active. Train your reflexes!");
    return;
  }

  /* ===== TRADING ===== */
  if (context === "trading") {
    luffySay(
      "serious",
      "Trading mode: Focus on risk management, not emotions.",
    );
    return;
  }

  /* ===== LEARNING ===== */
  if (context === "learning") {
    luffySay(
      "thinking",
      "Learning mode: Use flashcards and repetition to improve retention.",
    );
    return;
  }

  /* ===== ASSIGNMENT HELP ===== */
  if (context === "assignment") {
    luffySay("teaching");

    const explanation = data.question
      ? `Let’s break this down step by step:\n\n1. Understand the question\n2. Identify key parts\n3. Solve systematically\n\nQuestion: ${data.question}`
      : "Send me the question and I will break it down step by step.";

    speech.innerText = explanation;
    return;
  }

  /* ===== DEFAULT ===== */
  luffySay("thinking", "Tell me what you want to do next.");
}

/* -------------------------
   PERFORMANCE FEEDBACK
--------------------------*/

function handleGameResult(type, success) {
  if (success) {
    addXP(type === "trading" ? 2 : 1);
    luffySay("happy");
  } else {
    recordMistake(type, "User failed challenge");
    luffySay("serious");
  }
}

/* -------------------------
   GLOBAL EXPORTS
--------------------------*/

window.luffySay = luffySay;
window.addXP = addXP;
window.detectContext = detectContext;
window.respondToContext = respondToContext;
window.handleGameResult = handleGameResult;

/* -------------------------
   INITIAL STATE
--------------------------*/

luffySay("thinking");