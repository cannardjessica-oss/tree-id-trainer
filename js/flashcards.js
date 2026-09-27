export function initFlashcardMode({ speciesList, progress, elements }) {
  let filtered = [...speciesList];
  let index = 0;
  let flipped = false;
  let filterMode = "all";

  function createSpeciesImage(species, altText) {
    if (species.image) {
      const img = document.createElement("img");
      img.src = species.image;
      img.alt = altText;
      img.addEventListener("error", () => {
        img.replaceWith(createImagePlaceholder());
      });
      return img;
    }
    return createImagePlaceholder();
  }

  function createImagePlaceholder() {
    const div = document.createElement("div");
    div.className = "image-placeholder";
    div.textContent = "Photo coming soon";
    return div;
  }

  function applyFilter() {
    filtered =
      filterMode === "all"
        ? [...speciesList]
        : speciesList.filter((s) => progress.getStatus(s.id) === filterMode);
    index = 0;
    flipped = false;
    render();
  }

  function shuffle() {
    for (let i = filtered.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    index = 0;
    flipped = false;
    render();
  }

  function render() {
    if (filtered.length === 0) {
      elements.card.innerHTML =
        '<p class="empty-msg">No species in this filter yet.</p>';
      elements.progressLabel.textContent = "";
      elements.answerControls.classList.add("hidden");
      return;
    }

    const species = filtered[index];
    elements.progressLabel.textContent = `${index + 1} / ${filtered.length}`;
    elements.card.innerHTML = "";

    const face = document.createElement("div");
    face.className = "flashcard-face";
    face.tabIndex = 0;

    const img = createSpeciesImage(
      species,
      flipped ? `${species.commonName} leaves` : "Tree leaves",
    );
    face.appendChild(img);

    if (!flipped) {
      const hint = document.createElement("p");
      hint.className = "tap-hint";
      hint.textContent = "Tap to reveal name";
      face.appendChild(hint);
      elements.answerControls.classList.add("hidden");
    } else {
      const h2 = document.createElement("h2");
      h2.textContent = species.commonName;
      const latin = document.createElement("p");
      latin.className = "latin-name";
      const em = document.createElement("em");
      em.textContent = species.latinName;
      latin.appendChild(em);
      face.appendChild(h2);
      face.appendChild(latin);
      elements.answerControls.classList.remove("hidden");
    }

    face.addEventListener("click", () => {
      flipped = !flipped;
      render();
    });

    elements.card.appendChild(face);
  }

  function goNext() {
    flipped = false;
    index = (index + 1) % filtered.length;
    render();
  }

  function goPrev() {
    flipped = false;
    index = (index - 1 + filtered.length) % filtered.length;
    render();
  }

  elements.knewItBtn.addEventListener("click", () => {
    if (filtered.length === 0) return;
    progress.setStatus(filtered[index].id, "known");
    goNext();
  });

  elements.stillLearningBtn.addEventListener("click", () => {
    if (filtered.length === 0) return;
    progress.setStatus(filtered[index].id, "learning");
    goNext();
  });

  elements.nextBtn.addEventListener("click", goNext);
  elements.prevBtn.addEventListener("click", goPrev);
  elements.shuffleBtn.addEventListener("click", shuffle);
  elements.filterRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      filterMode = event.target.value;
      applyFilter();
    });
  });

  return { start: applyFilter };
}
