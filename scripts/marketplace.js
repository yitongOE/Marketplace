const feed = document.getElementById("feed");

function iconSVG(index){
  const shapes = [
    `<circle cx="11" cy="11" r="7" fill="rgba(107,92,255,.25)" />`,
    `<rect x="5" y="5" width="12" height="12" fill="rgba(107,92,255,.25)" />`,
    `<polygon points="11,3 19,17 3,17" fill="rgba(107,92,255,.25)" />`
  ];
  return shapes[index % shapes.length];
}

function render(){
  feed.innerHTML = "";

  games.forEach((g, i) => {
    const card = document.createElement("article");
    card.className = `card ${i % 2 === 0 ? "left" : "right"}`;

    const hasProgress = typeof g.progress === "number";

    card.innerHTML = `
      <div class="row">
        <div class="icon" aria-hidden="true">
          <svg viewBox="0 0 22 22">${iconSVG(i)}</svg>
        </div>
        <div class="meta">
          <h2 class="game-title">${g.title}</h2>
          <p class="desc">${g.desc}</p>
          <ul class="chips" aria-label="game tags">
            ${g.tags.map(t => `<li class="chip">${t}</li>`).join("")}
          </ul>
          <div class="progress-wrap">
            <div class="progress" style="${hasProgress ? "" : "display:none"}" aria-label="progress">
              <div class="progress-label">
                <span>Progress</span>
                <span>${hasProgress ? g.progress : 0}%</span>
              </div>
              <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${hasProgress ? g.progress : 0}">
                <i style="width:${hasProgress ? g.progress : 0}%"></i>
              </div>
            </div>
            <button class="btn ${hasProgress ? "" : "secondary"}" type="button">
              ▶ ${hasProgress ? "Continue" : "Start"}
            </button>
          </div>
        </div>
      </div>
    `;

    card.onclick = () => {
      window.location.href = g.url;
    };

    feed.appendChild(card);
  });
}

render();
