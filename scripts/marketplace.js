// ====== Variables ======
const TOTAL_CHAPTERS = 6;
const LESSONS_PER_CHAPTER = 5;

//#region ====== Draw Game Card Elements ======
// Generate shape icon if no game logo
function iconSVG(index) {
  const shapes = [
    `<circle cx="11" cy="11" r="7" fill="rgba(107,92,255,.25)" />`,
    `<rect x="5" y="5" width="12" height="12" fill="rgba(107,92,255,.25)" />`,
    `<polygon points="11,3 19,17 3,17" fill="rgba(107,92,255,.25)" />`
  ];
  return shapes[index % shapes.length];
}

// Update button look according to learning progress
function getButtonState(completedChapters) {
  if (completedChapters <= 0) { // if haven't started
    return {
      label: "Start",
      className: "secondary"
    };
  }

  if (completedChapters >= TOTAL_CHAPTERS) { // if finished all
    return {
      label: "Review",
      className: "review"
    };
  }

  return { // if in middle of progress
    label: "Continue",
    className: ""
  };
}

// progress = completed chapters (0..6)
// Display always "Lesson xx–xx" (1–5 ... 26–30)
// If completedChapters == 6, still display last range 26–30.
function getLessonRange(completedChapters) {
  const chapterIndex = Math.min(
    Math.max(completedChapters, 0),
    TOTAL_CHAPTERS - 1
  );

  const start = chapterIndex * LESSONS_PER_CHAPTER + 1;
  const end = start + LESSONS_PER_CHAPTER - 1;
  return { start, end };
}

// Make sure the number of completed chapters is legal
function clampChapters(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, 0), TOTAL_CHAPTERS);
}

// Generate segments in progress bar according to the number of completed chapters
function renderSegments(completedChapters) {
  const done = clampChapters(completedChapters);
  let html = "";
  for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
    html += `<span class="seg ${i <= done ? "on" : ""}" aria-hidden="true"></span>`;
  }
  return html;
}

//#endregion

// Draw All Game Cards
document.addEventListener("DOMContentLoaded", () => {
  const leftCol = document.getElementById("col-left");
  const rightCol = document.getElementById("col-right");

  if (!leftCol || !rightCol) {
    console.error("Missing #col-left or #col-right in index.html");
    return;
  }
  
  function render() {
    leftCol.innerHTML = "";
    rightCol.innerHTML = "";

    games.forEach((game, i) => {
      const hasProgress = typeof game.userdata_progress === "number";
      const completedChapters = clampChapters(hasProgress ? game.userdata_progress : 0);
      const range = getLessonRange(completedChapters);
      const buttonState = getButtonState(completedChapters);

      const card = document.createElement("article");
      card.className = "card";

      card.innerHTML = `
        <div class="row">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 22 22">${iconSVG(i)}</svg>
          </div>

          <div class="meta">
            <h2 class="game-title">${game.title}</h2>
            <p class="desc">${game.desc}</p>

            <div class="progress-wrap">
              <div class="progress" style="${hasProgress ? "" : "display:none"}" aria-label="lesson progress">
                <div class="progress-label">
                  <span>Lesson ${range.start}–${range.end}</span>
                  <span>${completedChapters}/${TOTAL_CHAPTERS}</span>
                </div>

                <div class="segbar"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="${TOTAL_CHAPTERS}"
                    aria-valuenow="${completedChapters}"
                    aria-label="Chapters completed">
                  ${renderSegments(completedChapters)}
                </div>
              </div>

              <button class="btn ${buttonState.className}" type="button">
                ▶ ${buttonState.label}
              </button>
            </div>
          </div>
        </div>
      `;
      // Add this into div meta if we want tags
      // <ul class="chips" aria-label="game tags">
        // ${game.tags.map(t => `<li class="chip">${t}</li>`).join("")}
      // </ul>

      // Click on button to open game url
      const button = card.querySelector("button.btn");
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = game.url;
      });

      // Assign this card to left or right column
      if (i % 2 === 0) leftCol.appendChild(card);
      else rightCol.appendChild(card);
    });
  }

  render();
});

