(function () {
  // ========================= [ READ ] =========================
  const initialWords = ["Test", "Rust", "Playing", "Hello", "Javascript", "Muller"];
  const lvls = { "Easy": 5, "Normal": 3, "Hard": 2 };

  // الحالة العامة
  let words = initialWords.slice();
  let DefaultLevelName = "Normal";
  let DefaultLevelSeconds = lvls[DefaultLevelName];
  let countdownId = null;
  let timeLeft = DefaultLevelSeconds;
  let gameOver = false;

  // عناصر الـ DOM
  const levelList = document.querySelector(".level-list");
  const startButton = document.querySelector(".start");
  const restartButton = document.querySelector(".restart");
  const lvlNameSpan = document.querySelector(".message .lvl");
  const secondsSpan = document.querySelector(".message .seconds");
  const theWord = document.querySelector(".the-word");
  const upcomingWord = document.querySelector(".upcoming-word");
  const input = document.querySelector(".user-input");
  const timeLeftSpan = document.querySelector(".time span");
  const scoreGot = document.querySelector(".score .got");
  const scoreTotal = document.querySelector(".score .total");
  const finishMessage = document.querySelector(".finish");

  if (input) input.onpaste = () => false;

  // ========================= [ CREATE ] =========================
  function createUI() {
    if (lvlNameSpan) lvlNameSpan.textContent = DefaultLevelName;
    if (secondsSpan) secondsSpan.textContent = DefaultLevelSeconds;
    if (timeLeftSpan) timeLeftSpan.textContent = DefaultLevelSeconds;
    if (scoreTotal) scoreTotal.textContent = words.length;
    if (scoreGot) scoreGot.textContent = 0;
    if (finishMessage) { finishMessage.innerHTML = ""; finishMessage.style.display = "none"; }
    if (upcomingWord) upcomingWord.innerHTML = "Words Will Show Here";
    if (theWord) theWord.textContent = "";
  }

  function createLevelList() {
    if (!levelList) return;

    levelList.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      selectLevel(li);
    });

    levelList.addEventListener("keydown", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        selectLevel(li);
      }
      if (["ArrowRight", "ArrowDown"].includes(e.key)) { e.preventDefault(); focusNext(li); }
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); focusPrev(li); }
    });
  }

  // ========================= [ UPDATE ] =========================
  function selectLevel(li) {
    levelList.querySelectorAll("li").forEach(other => {
      other.classList.remove("active");
      other.setAttribute("aria-selected", "false");
    });
    li.classList.add("active");
    li.setAttribute("aria-selected", "true");

    const name = li.dataset.level;
    const seconds = Number(li.dataset.seconds || lvls[name] || 3);

    DefaultLevelName = name;
    DefaultLevelSeconds = seconds;

    if (lvlNameSpan) lvlNameSpan.textContent = name;
    if (secondsSpan) secondsSpan.textContent = seconds;
    if (timeLeftSpan) timeLeftSpan.textContent = seconds;

    if (startButton && (startButton.style.display === "none") && !gameOver) {
      clearInterval(countdownId);
      genWords();
      startPlay();
    }
  }

  function focusNext(current) {
    const items = Array.from(levelList.querySelectorAll("li"));
    const idx = items.indexOf(current);
    if (idx >= 0) items[(idx + 1) % items.length].focus();
  }

  function focusPrev(current) {
    const items = Array.from(levelList.querySelectorAll("li"));
    const idx = items.indexOf(current);
    if (idx >= 0) items[(idx - 1 + items.length) % items.length].focus();
  }

  function genWords() {
    if (!words.length) {
      if (theWord) theWord.textContent = "";
      if (upcomingWord) upcomingWord.innerHTML = "";
      return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const idx = words.indexOf(randomWord);
    if (idx > -1) words.splice(idx, 1);

    if (theWord) theWord.textContent = randomWord;

    if (upcomingWord) {
      upcomingWord.innerHTML = "";
      words.forEach(w => {
        const div = document.createElement("div");
        div.textContent = w;
        upcomingWord.appendChild(div);
      });
      upcomingWord.style.display = "";
    }

    timeLeft = DefaultLevelSeconds;
    if (timeLeftSpan) timeLeftSpan.textContent = timeLeft;
  }

  function startPlay() {
    if (gameOver) return;
    if (countdownId) clearInterval(countdownId);
    if (!theWord || !theWord.textContent) genWords();

    timeLeft = DefaultLevelSeconds;
    if (timeLeftSpan) timeLeftSpan.textContent = timeLeft;

    countdownId = setInterval(() => {
      if (gameOver) {
        clearInterval(countdownId);
        countdownId = null;
        return;
      }
      timeLeft--;
      if (timeLeftSpan) timeLeftSpan.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(countdownId);
        countdownId = null;
        handleAnswer();
      }
    }, 1000);
  }

  function handleAnswer() {
    if (gameOver) return;
    gameOver = true;
    if (finishMessage) { finishMessage.innerHTML = ""; finishMessage.style.display = "block"; }
    if (input) input.disabled = true;

    const userTyped = input ? input.value : "";
    const correct = theWord ? theWord.textContent : "";
    const matched = isMatch(correct, userTyped);

    if (matched) {
      if (scoreGot) scoreGot.textContent = Number(scoreGot.textContent || 0) + 1;
      if (words.length > 0) {
        gameOver = false;
        if (input) { input.disabled = false; input.value = ""; }
        genWords();
        startPlay();
        return;
      } else {
        showFinish("good", "Congratulations");
        if (upcomingWord) upcomingWord.style.display = "none";
      }
    } else {
      showFinish("bad", "Game Over");
    }

    if (countdownId) clearInterval(countdownId);
    if (input) input.disabled = true;
  }

  function showFinish(className, message) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = message;
    if (finishMessage) finishMessage.appendChild(span);
  }

  function isMatch(correct, userTyped) {
    if (DefaultLevelName === "Hard") return correct === userTyped;
    return correct.trim().toUpperCase() === userTyped.trim().toUpperCase();
  }

  // ========================= [ DELETE / RESET ] =========================
  function resetGame() {
    words = initialWords.slice();
    gameOver = false;
    clearInterval(countdownId);
    countdownId = null;
    if (input) { input.value = ""; input.disabled = false; }
    if (finishMessage) { finishMessage.innerHTML = ""; finishMessage.style.display = "none"; }
    createUI();
    genWords();
    startPlay();
  }

  // ========================= [ EVENTS ] =========================
  if (startButton) {
    startButton.addEventListener("click", () => {
      startButton.style.display = "none";
      if (restartButton) restartButton.style.display = "inline-block";
      resetGame();
      setTimeout(() => { if (input && !input.disabled) input.focus(); }, 10);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!gameOver && countdownId) {
        clearInterval(countdownId);
        handleAnswer();
      }
    }
  });

  createUI();
  createLevelList();
})();
