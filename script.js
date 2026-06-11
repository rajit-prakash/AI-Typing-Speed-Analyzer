let timer = 30;
let interval = null;
let testRunning = false;
let errorCount = 0;
let paragraphIndex = 0;
let currentParagraph = "";
let dur = 30;

const paraEl  = document.getElementById("paragraph");
const inputEl = document.getElementById("input");

/* ── Duration pill buttons ── */
document.querySelectorAll(".db").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".db").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    dur = parseInt(btn.dataset.val);
    document.getElementById("duration").value = dur;
    if (!testRunning) {
      timer = dur;
      document.getElementById("time").textContent = timer;
    }
  });
});

/* ── Paragraph rendering ── */
function renderParagraph(typed) {
  paraEl.innerHTML = currentParagraph.split("").map((ch, i) => {
    let cls = "td";
    if (i < typed.length) {
      cls = typed[i] === ch ? "co" : "er";
    } else if (i === typed.length) {
      cls = "td cu";
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

/* ── Live input ── */
inputEl.addEventListener("input", () => {
  if (!testRunning) return;
  const typed = inputEl.value;
  renderParagraph(typed);
  updateStats();
  if (typed === currentParagraph) {
    inputEl.value = "";
    loadParagraph();
  }
});

/* ── Start ── */
function startTest() {
  clearInterval(interval);
  testRunning = true;
  errorCount  = 0;

  timer = dur;
  document.getElementById("time").textContent = timer;

  inputEl.value    = "";
  inputEl.disabled = false;
  inputEl.focus();
  paraEl.classList.add("on");

  document.getElementById("btn-start").disabled = true;
  document.getElementById("btn-stop").disabled  = false;
  document.getElementById("result-area").style.display = "none";

  loadParagraph();

  interval = setInterval(() => {
    timer--;
    document.getElementById("time").textContent = timer;
    updateStats();
    if (timer <= 0) { clearInterval(interval); finishTest(); }
  }, 1000);
}

/* ── Stop ── */
function stopTest() {
  clearInterval(interval);
  testRunning = false;
  finishTest();
}

/* ── Reset ── */
function restartTest() {
  clearInterval(interval);
  testRunning = false;

  inputEl.value    = "";
  inputEl.disabled = true;
  paraEl.classList.remove("on");

  document.getElementById("btn-start").disabled = false;
  document.getElementById("btn-stop").disabled  = true;
  document.getElementById("result-area").style.display = "none";

  document.getElementById("wpm").textContent      = "—";
  document.getElementById("accuracy").textContent = "100";
  document.getElementById("errors").textContent   = "0";

  timer = dur;
  document.getElementById("time").textContent = timer;
  loadParagraph();
}

/* ── Live stats ── */
function updateStats() {
  const typed   = inputEl.value;
  const elapsed = dur - timer;
  const minutes = elapsed / 60;
  const words   = typed.trim() ? typed.trim().split(/\s+/).length : 0;
  const wpm     = minutes > 0 ? Math.round(words / minutes) : 0;

  document.getElementById("wpm").textContent = wpm;

  let correct = 0, errors = 0;
  for (let i = 0; i < typed.length; i++) {
    typed[i] === currentParagraph[i] ? correct++ : errors++;
  }
  errorCount = errors;

  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  document.getElementById("accuracy").textContent = accuracy;
  document.getElementById("errors").textContent   = errors;
}

/* ── Finish ── */
function finishTest() {
  testRunning      = false;
  inputEl.disabled = true;
  paraEl.classList.remove("on");

  document.getElementById("btn-start").disabled = false;
  document.getElementById("btn-stop").disabled  = true;

  updateStats();

  const wpm      = parseInt(document.getElementById("wpm").textContent) || 0;
  const accuracy = parseInt(document.getElementById("accuracy").textContent) || 0;

  document.getElementById("finalWpm").textContent      = wpm;
  document.getElementById("finalAccuracy").textContent = accuracy + "%";
  document.getElementById("finalErrors").textContent   = errorCount;
  document.getElementById("result-area").style.display = "block";

  const fb = document.getElementById("feedback");
  if (wpm >= 70 && accuracy >= 95) {
    fb.textContent = "Professional-grade speed and precision. You're in the top tier — keep that accuracy locked in as you push higher.";
  } else if (wpm >= 40) {
    fb.textContent = "Solid speed. Accuracy is your next lever — aim for 95%+ before chasing higher WPM.";
  } else {
    fb.textContent = "Good start. Slow down slightly, prioritise accuracy, and speed will follow naturally.";
  }

  saveScore(wpm, accuracy, errorCount);
}

/* ── Persistence (model.json schema) ── */
function saveScore(wpm, accuracy, errors) {
  const model = JSON.parse(localStorage.getItem("typingModel") || '{"sessions":[]}');
  model.sessions.push({
    id:              Math.random().toString(36).slice(2),
    date:            new Date().toISOString(),
    durationSetting: dur,
    timeElapsed:     dur - timer,
    paragraph:       { index: paragraphIndex, text: currentParagraph },
    result:          { wpm, accuracy, errors }
  });
  if (model.sessions.length > 20) model.sessions.shift();
  localStorage.setItem("typingModel", JSON.stringify(model));
  drawChart(model.sessions.map(s => s.result.wpm));
}

/* ── Chart ── */
let chart;
function drawChart(scores) {
  document.getElementById("chart-wrap").style.display = "block";
  const ctx = document.getElementById("scoreChart");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: scores.map((_, i) => `#${i + 1}`),
      datasets: [{
        data:                scores,
        borderColor:         "#4fffb0",
        backgroundColor:     "rgba(79,255,176,0.06)",
        borderWidth:         2,
        pointRadius:         3,
        pointBackgroundColor:"#4fffb0",
        tension:             0.35,
        fill:                true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#181c27",
          borderColor:     "#252c3f",
          borderWidth:     1,
          titleColor:      "#4fffb0",
          bodyColor:       "#8891a8",
          callbacks: { label: c => ` ${c.parsed.y} wpm` }
        }
      },
      scales: {
        x: { ticks: { color: "#3e4560", font: { family: "JetBrains Mono", size: 10 } }, grid: { color: "#1a1f2e" } },
        y: { beginAtZero: true, ticks: { color: "#3e4560", font: { family: "JetBrains Mono", size: 10 } }, grid: { color: "#1a1f2e" } }
      }
    }
  });
}

/* ── Load chart on startup if history exists ── */
window.addEventListener("load", () => {
  const model = JSON.parse(localStorage.getItem("typingModel") || '{"sessions":[]}');
  if (model.sessions.length) drawChart(model.sessions.map(s => s.result.wpm));
});
