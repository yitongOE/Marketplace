//#region ====== DOM References ======

// Main
const leftCol = document.getElementById("col-left");
const rightCol = document.getElementById("col-right");

// Search bar
const searchInput = document.getElementById("game-search");
const clearBtn = document.getElementById("search-clear");
const noResults = document.getElementById("no-results");
const feed = document.querySelector(".feed");

// Leaderboard
const lbOverlay = document.getElementById("lb-overlay");
const lbTitle = document.getElementById("lb-title");
const lbContent = document.getElementById("lb-content");
const lbCloseBtn = document.getElementById("lb-close");
const lbPlayBtn = document.getElementById("lb-play");

//#endregion

// ====== Variables ======

const TOTAL_CHAPTERS = 6;
//const LESSONS_PER_CHAPTER = 5;
const userdata_username = "username"
let curGameToOpen = null;

// ====== General Logics ======

function openGameURL(game) {
  window.top.location.href = game.url;
}

//#region ====== Draw Game Card ======

// Generate shape icon if no game logo
function iconSVG(index) {
  const shapes = [
    `<circle cx="11" cy="11" r="7" fill="rgba(107,92,255,.25)" />`,
    `<rect x="5" y="5" width="12" height="12" fill="rgba(107,92,255,.25)" />`,
    `<polygon points="11,3 19,17 3,17" fill="rgba(107,92,255,.25)" />`
  ];
  return shapes[index % shapes.length];
}

// Display game logo
function renderLogo(game, index) {
  if (game.logo) {
    return `
      <img
        src="${game.logo}"
        alt="${game.title} logo"
        class="game-logo"
        draggable="false"
      />
    `;
  }

  return `
    <svg viewBox="0 0 22 22" aria-hidden="true">
      ${iconSVG(index)}
    </svg>
  `;
}

// progress = completed chapters (0..6)
// Display always "Lesson xx–xx" (1–5 ... 26–30)
// If completedChapters == 6, still display last range 26–30.
// function getLessonRange(completedChapters) {
//   const chapterIndex = Math.min(
//     Math.max(completedChapters, 0),
//     TOTAL_CHAPTERS - 1
//   );

//   const start = chapterIndex * LESSONS_PER_CHAPTER + 1;
//   const end = start + LESSONS_PER_CHAPTER - 1;
//   return { start, end };
// }

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

// Format rank text
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Draw rank trophy icon
function trophySVG() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4h8v3c0 2.8-1.6 5-4 5s-4-2.2-4-5V4Z" fill="#D4AF37"/>
      <path d="M6 5H4c0 4 2 6 5 6V9C7.1 9 6 7.6 6 5Z" fill="#D4AF37"/>
      <path d="M18 5h2c0 4-2 6-5 6V9c1.9 0 3-1.4 3-4Z" fill="#D4AF37"/>
      <path d="M10 12h4v3a3 3 0 0 1-4 0v-3Z" fill="#C89B2C"/>
      <path d="M9 18h6v2H9v-2Z" fill="#D4AF37"/>
      <path d="M8 20h8v2H8v-2Z" fill="#B8891D"/>
    </svg>
  `;
}

function createRankBadge(rank) {
  const el = document.createElement("div");
  el.className = "rank-badge";
  el.innerHTML = `
    <span class="rank-trophy">${trophySVG()}</span>
    <span class="rank-text">${ordinal(rank)}</span>
  `;
  return el;
}

// Draw All Game Cards
document.addEventListener("DOMContentLoaded", () => {
  if (!leftCol || !rightCol) {
    console.error("Missing #col-left or #col-right in index.html");
    return;
  }
  
  function render(filterText = "") {
    leftCol.innerHTML = "";
    rightCol.innerHTML = "";

    // Toggle search clear button by whether search bar is empty
    if (filterText.length > 0) {
      clearBtn.classList.add("visible");
    } else {
      clearBtn.classList.remove("visible");
    }

    // Remove unmatched games
    const filteredGames = games.filter(game => 
      game.title.toLowerCase().includes(filterText.toLowerCase()) ||
      game.desc.toLowerCase().includes(filterText.toLowerCase())
    );

    // Display No Matching Result text if so
    if (filteredGames.length === 0) {
      feed.style.display = "none";
      noResults.style.display = "block";
      noResults.innerHTML = `No matching results for <span>"${filterText}"</span>`;
    } else {
      feed.style.display = "grid"; // Display matched results
      noResults.style.display = "none";
    }

    filteredGames.forEach((game, index) => {
      const hasProgress = typeof game.userdata_progress === "number";
      const completedChapters = clampChapters(hasProgress ? game.userdata_progress : 0);
      //const range = getLessonRange(completedChapters);

      const card = document.createElement("article");
      card.className = "card";

      card.innerHTML = `
        <div class="row">
          <div class="icon" aria-hidden="true">
            ${renderLogo(game, index)}
          </div>

          <div class="meta">
            <h2 class="game-title">${game.title}</h2>
            <p class="desc">${game.desc}</p>

            <div class="progress-wrap">
              <div class="progress" style="${hasProgress ? "" : "display:none"}" aria-label="lesson progress">
                <div class="progress-label">
                  <span>Level ${game.userdata_progress}</span>
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
            </div>
          </div>
        </div>
      `;

      // Rank button
      const rank = computeUserRank(game);
      if (Number.isFinite(rank)) {
        const meta = card.querySelector(".meta");
        const progressWrap = meta.querySelector(".progress-wrap");
        const rankBadge = createRankBadge(rank);

        meta.insertBefore(rankBadge, progressWrap);

        // Click on rank to open leaderboard
        rankBadge.addEventListener("click", (e) => {
          e.stopPropagation();
          openLeaderboard(game, rank);
        });
      }

      // Click on icon to open game url
      const icon = card.querySelector(".icon");
      icon.onclick = () => {
        openGameURL(game);
      };

      // Add enter animation with stagger delay
      card.classList.add("pop");
      card.style.animationDelay = `${120 + index * 60}ms`;

      // Assign this card to left or right column
      if (index % 2 === 0) leftCol.appendChild(card);
      else rightCol.appendChild(card);
    });
  }

  // Search bar user input
  searchInput.addEventListener("input", (e) => {
    render(e.target.value);
  });

  // Clear search bar with button
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    render("");
    searchInput.focus();
  });

  render();
});

//#endregion

//#region ====== Leaderboard ======

// Sort all users scores
function getSortedScores(game) {
  const base = leaderboardData[game.id].filter(
    p => p.name !== userdata_username && !p.isPlayer
  );

  return [
    ...base,
    { name: userdata_username, score: game.userdata_score, isPlayer: true }
  ].sort((a, b) => b.score - a.score);
}

// Get user rank by comparing scores
function computeUserRank(game) {
  const list = getSortedScores(game);
  return list.findIndex(p => p.isPlayer) + 1;
}

// Draw leaderboard items
function buildLeaderboard(game) {
  const list = getSortedScores(game);
  return list.map((p, i) => ({ ...p, rank: i + 1 }));
}

// Add rank format like 1st, 2nd, 10th
function formatRank(n){
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Placeholder: Get avatar for each user from API
function getAvatarUrl(name){
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
}

// Draw entire leaderbaord
function openLeaderboard(game, rank) {
  lbTitle.textContent = `${game.title} · Leaderboard`;
  curGameToOpen = game;

  const data = buildLeaderboard(game);
  
  // ===== Current User =====
  const player = data.find(p => p.isPlayer);
  
  let currentUserHTML = "";
  if (player) {
    currentUserHTML = `
    <div class="lb-current-user">
      <img
        class="avatar"
        src="${getAvatarUrl(player.name)}"
        alt="${player.name}"
      />

      <div class="info">
        <div class="name">
          ${player.name}
          <span class="you-badge">You</span>
        </div>

        <div class="meta">
          Score: <span class="score">${player.score}</span>
          · Rank <span class="rank">${formatRank(player.rank)}</span>
        </div>
      </div>
    </div>
  `;
  }
  
  document.getElementById("lb-current-user").innerHTML = currentUserHTML;
  
  // ===== Top 3 =====
  const podium = data.slice(0, 3);
  const podiumOrdered = [podium[1], podium[0], podium[2]];
  const podiumHTML = podiumOrdered.map((p) => `
    <div class="lb-podium-item lb-rank-${p.rank} ${p.isPlayer ? "lb-item-player" : ""}">
      <div class="podium-rank">${formatRank(p.rank)}</div>

      <img
        class="avatar"
        src="${getAvatarUrl(p.name)}"
        alt="${p.name}"
      />

      <div class="name">${p.name}</div>
      <div class="score">${p.score}</div>

      ${p.rank === 1 ? `<div class="crown">👑</div>` : ""}
    </div>
  `).join("");

  document.getElementById("lb-podium").innerHTML = podiumHTML;

  // ===== 4–10 =====
  const listHTML = data.slice(3, 10).map(p => `
    <li class="lb-item ${p.isPlayer ? "lb-item-player" : ""}">
      <span class="rank">${formatRank(p.rank)}</span>
      
      <img
        class="avatar"
        src="${getAvatarUrl(p.name)}"
        alt="${p.name}"
      />

      <span class="name">${p.name}</span>
      <span class="score">${p.score}</span>
    </li>
  `).join("");

  document.getElementById("lb-list").innerHTML = listHTML;

  // ===== Player rank > 10 =====
  const overflowHTML = document.getElementById("lb-overflow");
  const isPlayerInTop10 = data.slice(0, 10).some(p => p.isPlayer);

  // reset overflow
  overflowHTML.classList.add("hidden");
  overflowHTML.innerHTML = "";

  if (player && !isPlayerInTop10) {
    overflowHTML.innerHTML = `
      <ul class="lb-list">
        <li class="lb-item lb-item-player">
          <span class="rank">${formatRank(player.rank)}</span>
          
          <img
            class="avatar"
            src="${getAvatarUrl(player.name)}"
            alt="${player.name}"
          />
          
          <span class="name">${player.name}</span>
          <span class="score">${player.score}</span>
        </li>
      </ul>
    `;
    overflowHTML.classList.remove("hidden");
  } else {
    overflowHTML.classList.add("hidden");
  }

  lbOverlay.classList.remove("hidden");
  lbOverlay.setAttribute("aria-hidden", "false");
}

function closeLeaderboard(){
  lbOverlay.classList.add("hidden");
  lbOverlay.setAttribute("aria-hidden", "true");
  curGameToOpen = null;
}

lbCloseBtn.onclick = closeLeaderboard;

lbPlayBtn.onclick = () => {
  if (!curGameToOpen) return;
  openGameURL(curGameToOpen);
};

//#endregion