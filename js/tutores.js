// tutores.js (consume JSON local)

// Ruta al JSON (relativa a la página tutores.html en el root)
const TUTORES_JSON_URL = "data/tutores.json";

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function tutorCard(t) {
  const username = (t.username || "").trim();
  const perfil = `tutores/perfil.html?u=${encodeURIComponent(username)}`;

  // Foto principal en webp
  const foto = `assets/tutores/${username}.webp`;

  return `
    <a class="tutor-card" href="${perfil}" aria-label="Ver perfil de ${escapeHTML(t.nombre)}">
      <div class="tutor-top">
        <div class="avatar">
          <img
            src="${foto}"
            alt="Foto de ${escapeHTML(t.nombre)}"
            loading="lazy"
            decoding="async"
            width="240"
            height="240"
            onerror="
              if(!this.dataset.try){ this.dataset.try='png'; this.src='assets/tutores/${username}.png'; }
              else if(this.dataset.try==='png'){ this.dataset.try='jpg'; this.src='assets/tutores/${username}.jpg'; }
              else { this.onerror=null; this.src='assets/tutores/perfil_generico.webp'; }
            "
          />
        </div>

        <div>
          <h3 class="tutor-name">${escapeHTML(t.nombre)}</h3>
          <p class="tutor-role">${escapeHTML(t.titulo)}</p>
          <p class="tutor-uni">${escapeHTML(t.universidad || "")}</p>
        </div>
      </div>

      <div class="meta">
        <div class="meta-row">
          <span class="meta-label">Materias</span>
          <span class="meta-value">${escapeHTML(t.materias)}</span>
        </div>

        <div class="meta-row">
          <span class="meta-label">Niveles</span>
          <span class="meta-value">${escapeHTML(t.nivel)}</span>
        </div>

        <div class="meta-row">
          <span class="meta-label">Modalidad</span>
          <span class="meta-value">${escapeHTML(t.modalidad)}</span>
        </div>
      </div>
    </a>
  `;
}

async function loadTutores() {
  const grid = document.getElementById("tutoresGrid");
  if (!grid) return;

  try {
    const res = await fetch(`${TUTORES_JSON_URL}?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const tutores = await res.json();

    // Render
    grid.innerHTML = (tutores || []).map(tutorCard).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="opacity:.85">No se pudieron cargar los tutores. Revisa que exista <code>data/tutores.json</code>.</p>`;
  }
}

loadTutores();