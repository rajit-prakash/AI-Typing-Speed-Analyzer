let timer = 60;
let interval = null;
let testRunning = false;
let errorCount = 0;
let paragraphIndex = 0;

const paraEl  = document.getElementById("paragraph");
const inputEl = document.getElementById("input");

let currentParagraph = "";

/* ── Paragraph rendering with per-character highlights ── */
function renderParagraph(typed) {
  paraEl.innerHTML = currentParagraph.split("").map((ch, i) => {
    let cls = "char-pending";
    if (i < typed.length) {
      cls = typed[i] === ch ? "char-correct" : "char-wrong";
    } else if (i === typed.length) {
      cls = "char-pending char-cursor";
    }
    const safe = ch === " "
      ? "&nbsp;"
      : ch.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<span class="${cls}">${safe}</span>`;
  }).join("");
}

function loadParagraph() {
  paragraphIndex   = Math.floor(Math.random() * paragraphs.length);
  currentParagraph = paragraphs[paragraphIndex];
  renderParagraph("");
}

loadParagraph();

/* ── Live input handler ── */
inputEl.addEventListener("input", () => {
  if (!testRunning) return;
  const typed = inputEl.value;
  renderParagraph(typed);
  updateStats();

  // Auto-advance when paragraph is completed correctly
  if (typed === currentParagraph) {
    inputEl.value = "";
    loadParagraph();
  }
});

/* ── Controls ── */
function startTest() {
  clearInterval(interval);
  testRunning = true;
  errorCount  = 0;

  timer = parseInt(document.getElementById("duration").value);
  document.getElementById("time").textContent = timer;

  inputEl.value    = "";
  inputEl.disabled = false;
  inputEl.focus();
  paraEl.classList.add("active");

  document.getElementById("btn-start").disabled = true;
  document.getElementById("btn-stop").disabled  = false;
  document.getElementById("result-area").style.display = "none";

  loadParagraph();

  interval = setInterval(() => {
    timer--;
    document.getElementById("time").textContent = timer;
    updateStats();
    if (timer <= 0) {
      clearInterval(interval);
      finishTest();
    }
  }, 1000);
}

function stopTest() {
  clearInterval(interval);
  testRunning = false;
  finishTest();
}

function restartTest() {
  clearInterval(interval);
  testRunning = false;

  inputEl.value    = "";
  inputEl.disabled = true;
  paraEl.classList.remove("active");

  document.getElementById("btn-start").disabled = false;
  document.getElementById("btn-stop").disabled  = true;
  document.getElementById("result-area").style.display = "none";

  document.getElementById("wpm").textContent      = "0";
  document.getElementById("accuracy").textContent = "100";
  document.getElementById("errors").textContent   = "0";

  timer = parseInt(document.getElementById("duration").value);
  document.getElementById("time").textContent = timer;

  loadParagraph();
}

/* ── Live stats ── */
function updateStats() {
  const typed    = inputEl.value;
  const duration = parseInt(document.getElementById("duration").value);
  const elapsed  = duration - timer;
  const minutes  = elapsed / 60;
  const words    = typed.trim() ? typed.trim().split(/\s+/).length : 0;
  const wpm      = minutes > 0 ? Math.round(words / minutes) : 0;

  document.getElementById("wpm").textContent = wpm;

  let correct = 0, errors = 0;
  for (let i = 0; i < typed.length; i++) {
    typed[i] === currentParagraph[i] ? correct++ : errors++;
  }
  errorCount = errors;

  const accuracy = typed.length
    ? Math.round((correct / typed.length) * 100)
    : 100;

  document.getElementById("accuracy").textContent = accuracy;
  document.getElementById("errors").textContent   = errors;
}

/* ── Finish ── */
function finishTest() {
  testRunning      = false;
  inputEl.disabled = true;
  paraEl.classList.remove("active");

  document.getElementById("btn-start").disabled = false;
  document.getElementById("btn-stop").disabled  = true;

  updateStats();

  const wpm      = Number(document.getElementById("wpm").textContent);
  const accuracy = Number(document.getElementById("accuracy").textContent);

  document.getElementById("finalWpm").textContent      = `🚀 ${wpm} WPM`;
  document.getElementById("finalAccuracy").textContent = `🎯 ${accuracy}% accuracy`;
  document.getElementById("finalErrors").textContent   = `❌ ${errorCount} errors`;
  document.getElementById("result-area").style.display = "block";

  const feedbackEl = document.getElementById("feedback");
  feedbackEl.className = "feedback";

  if (wpm >= 70 && accuracy >= 95) {
    feedbackEl.textContent = "Excellent — you're at professional proficiency. Keep maintaining that accuracy at speed.";
  } else if (wpm >= 40) {
    feedbackEl.textContent = "Good speed! Focus on reducing errors; push accuracy above 95% to solidify your gains.";
  } else {
    feedbackEl.textContent = "Keep practicing. Start slow to build muscle memory — speed follows accuracy naturally.";
  }

  saveScore(wpm, accuracy, errorCount);
}

/* ── Score persistence (model.json schema) ── */
function saveScore(wpm, accuracy, errors) {
  const model = JSON.parse(
    localStorage.getItem("typingModel") || '{"sessions":[]}'
  );

  model.sessions.push({
    id:              Math.random().toString(36).slice(2),
    date:            new Date().toISOString(),
    durationSetting: parseInt(document.getElementById("duration").value),
    timeElapsed:     parseInt(document.getElementById("duration").value) - timer,
    paragraph: {
      index: paragraphIndex,
      text:  currentParagraph
    },
    result: { wpm, accuracy, errors }
  });

  // Keep last 20 sessions
  if (model.sessions.length > 20) model.sessions.shift();
  localStorage.setItem("typingModel", JSON.stringify(model));

  drawChart(model.sessions.map(s => s.result.wpm));
}

/* ── WPM progress chart ── */
let chart;
function drawChart(scores) {
  const ctx = document.getElementById("scoreChart");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: scores.map((_, i) => `Test ${i + 1}`),
      datasets: [{
        label:           "WPM",
        data:            scores,
        borderColor:     "#4f9cf0",
        backgroundColor: "rgba(79, 156, 240, 0.12)",
        borderWidth:     2,
        pointRadius:     4,
        tension:         0.3,
        fill:            true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "WPM" } }
      }
    }
  });
}

window.addEventListener("load", () => {
  const model = JSON.parse(
    localStorage.getItem("typingModel") || '{"sessions":[]}'
  );
  if (model.sessions.length) {
    drawChart(model.sessions.map(s => s.result.wpm));
  }
});
