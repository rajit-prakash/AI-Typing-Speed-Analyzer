let timer = 60;
let interval = null;
let testRunning = false;
let errorCount = 0;
let paragraphIndex = 0;
let currentParagraph = "";

const paraEl  = document.getElementById("paragraph");
const inputEl = document.getElementById("input");

/* ── Duration pill buttons ── */
document.querySelectorAll(".dur-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dur-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("duration").value = btn.dataset.val;
    if (!testRunning) {
      timer = parseInt(btn.dataset.val);
      document.getElementById("time").textContent = timer;
    }
  });
});

/* ── Paragraph rendering ── */
function renderParagraph(typed) {
  paraEl.innerHTML = currentParagraph.split("").map((ch, i) => {
    let cls = "ch-todo";
    if (i < typed.length) {
      cls = typed[i] === ch ? "ch-ok" : "ch-err";
    } else if (i === typed.length) {
      cls = "ch-todo ch-cur";
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
    if (timer <= 0) { clearInterval(interval); finishTest(); }
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

  document.getElementById("wpm").textContent      = "—";
  document.getElementById("accuracy").textContent = "100";
  document.getElementById("errors").textContent   = "0";

  timer = parseInt(document.getElementById("duration").value);
  document.getElementById("time").textContent = timer;

  loadParagraph();
}

/* ── Stats ── */
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

  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
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

  const wpm      = parseInt(document.getElementById("wpm").textContent) || 0;
  const accuracy = parseInt(document.getElementById("accuracy").textContent) || 0;

  document.getElementById("finalWpm").textContent      = wpm;
  document.getElementById("finalAccuracy").textContent = accuracy + "%";
  document.getElementById("finalErrors").textContent   = errorCount;
  document.getElementById("result-area").style.display = "block";

  const fb = document.getElementById("feedback");
  if (wpm >= 70 && accuracy >= 95) {
    fb.textContent = "Professional-grade speed and precision. You're in the top tier — keep that accuracy locked in as you push for higher WPM.";
  } else if (wpm >= 40) {
    fb.textContent = "Solid speed. Your accuracy is the next lever to pull — aim for 95%+ before chasing higher WPM.";
  } else {
    fb.textContent = "Good start. Slow down slightly, focus on accuracy first, and speed will follow naturally with practice.";
  }

  saveScore(wpm, accuracy, errorCount);
}

/* ── Persistence using model.json schema ── */
function saveScore(wpm, accuracy, errors) {
  const model = JSON.parse(localStorage.getItem("typingModel") || '{"sessions":[]}');
  model.sessions.push({
    id:              Math.random().toString(36).slice(2),
    date:            new Date().toISOString(),
    durationSetting: parseInt(document.getElementById("duration").value),
    timeElapsed:     parseInt(document.getElementById("duration").value) - timer,
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
  const wrap = document.getElementById("chart-wrap");
  wrap.style.display = "block";

  const ctx = document.getElementById("scoreChart");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: scores.map((_, i) => `#${i + 1}`),
      datasets: [{
        label:           "WPM",
        data:            scores,
        borderColor:     "#4fffb0",
        backgroundColor: "rgba(79,255,176,0.07)",
        borderWidth:     2,
        pointRadius:     4,
        pointBackgroundColor: "#4fffb0",
        tension:         0.35,
        fill:            true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#181c27",
          borderColor: "#2a2f42",
          borderWidth: 1,
          titleColor: "#4fffb0",
          bodyColor:  "#8891a8",
          callbacks: { label: ctx => ` ${ctx.parsed.y} wpm` }
        }
      },
      scales: {
        x: {
          ticks: { color: "#4a5166", font: { family: "'JetBrains Mono', monospace", size: 11 } },
          grid:  { color: "#1f2435" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#4a5166", font: { family: "'JetBrains Mono', monospace", size: 11 } },
          grid:  { color: "#1f2435" },
          title: { display: true, text: "wpm", color: "#4a5166", font: { family: "'JetBrains Mono', monospace", size: 11 } }
        }
      }
    }
  });
}

/* ── Load saved history on startup ── */
window.addEventListener("load", () => {
  const model = JSON.parse(localStorage.getItem("typingModel") || '{"sessions":[]}');
  if (model.sessions.length) drawChart(model.sessions.map(s => s.result.wpm));
});
