import { initKeyMode } from "./key.js";
import { initFlashcardMode } from "./flashcards.js";
import * as progress from "./progress.js";

async function loadData() {
  const [speciesRes, keyTreeRes] = await Promise.all([
    fetch("data/species.json"),
    fetch("data/keyTree.json"),
  ]);
  const speciesList = await speciesRes.json();
  const keyTree = await keyTreeRes.json();
  return { speciesList, keyTree };
}

function showView(viewId) {
  document
    .querySelectorAll(".view")
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById(viewId).classList.remove("hidden");
}

function updateStats(speciesList) {
  const stats = progress.getStats(speciesList.length);
  document.getElementById("stats-line").textContent =
    `${stats.known} known · ${stats.learning} learning · ${stats.new} new (out of ${stats.total})`;
}

async function main() {
  const { speciesList, keyTree } = await loadData();
  updateStats(speciesList);

  const keyMode = initKeyMode({
    speciesList,
    keyTree,
    progress,
    elements: {
      question: document.getElementById("key-question"),
      candidates: document.getElementById("key-candidates"),
      reveal: document.getElementById("key-reveal"),
      backBtn: document.getElementById("key-back-btn"),
      restartBtn: document.getElementById("key-restart-btn"),
    },
  });

  const flashcardMode = initFlashcardMode({
    speciesList,
    progress,
    elements: {
      card: document.getElementById("flashcard"),
      progressLabel: document.getElementById("flash-progress"),
      answerControls: document.getElementById("flash-answer-controls"),
      knewItBtn: document.getElementById("knew-it-btn"),
      stillLearningBtn: document.getElementById("still-learning-btn"),
      nextBtn: document.getElementById("next-card-btn"),
      prevBtn: document.getElementById("prev-card-btn"),
      shuffleBtn: document.getElementById("shuffle-btn"),
      filterRadios: document.querySelectorAll('input[name="filter"]'),
    },
  });

  document.getElementById("start-key-btn").addEventListener("click", () => {
    showView("key-view");
    keyMode.start();
  });

  document
    .getElementById("start-flashcards-btn")
    .addEventListener("click", () => {
      showView("flashcard-view");
      flashcardMode.start();
    });

  document.getElementById("key-home-btn").addEventListener("click", () => {
    showView("home-view");
    updateStats(speciesList);
  });

  document.getElementById("flash-home-btn").addEventListener("click", () => {
    showView("home-view");
    updateStats(speciesList);
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch((err) => {
        console.warn("Service worker registration failed", err);
      });
    });
  }
}

main().catch((err) => {
  console.error("Failed to start Tree ID Trainer", err);
  document.body.innerHTML =
    '<p style="padding:2rem">Failed to load app data. Check the console for details.</p>';
});
