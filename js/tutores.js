// 1) Pega aquí TU URL publicada como CSV (Google Sheets -> Publicar en la web -> CSV)
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcWh2_N6ETMJxjUG_bqCwmphLalzMzo4JUx3wtMkmlVCNNI8sgPdpaKLvbtSnYI-W-W2mDdBB9Huyv/pub?gid=0&single=true&output=csv";

// 2) Si usarás fotos locales por username, ponlas en: assets/tutores/<username>.jpg (o .png)
function getTutorPhoto(username) {
  // Ajusta la extension si prefieres .png
  return `../assets/tutores/${username}.jpg`;
}

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// CSV parser simple (maneja comillas)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cell += '"'; // comillas escapadas
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++; // CRLF
      row.push(cell);
      const isEmptyRow = row.every(v => v.trim() === "");
      if (!isEmptyRow) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  // last cell
  row.push(cell);
  if (!row.every(v => v.trim() === "")) rows.push(row);

  return rows;
}

function rowsToObjects(rows) {
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = (r[idx] ?? "").trim()));
    return obj;
  });
}

function tutorCard(t) {
  const username = t.username.trim();
  const perfil = `tutores/perfil.html?u=${encodeURIComponent(username)}`;


  // foto local por username (assets/tutores/<username>.jpg)
  const foto = `../assets/tutores/${username}.png`;

  return `
    <a class="tutor-card" href="${perfil}" aria-label="Ver perfil de ${escapeHTML(t.nombre)}">
      <div class="tutor-top">
        <div class="avatar">
          <img src="${foto}" alt="Foto de ${escapeHTML(t.nombre)}"
               onerror="this.src='../assets/tutores/perfil_generico.png'"/>
        </div>
        <div>
          <h3 class="tutor-name">${escapeHTML(t.nombre)}</h3>
          <p class="tutor-role">${escapeHTML(t.titulo)}</p>
          <p class="tutor-uni">${escapeHTML(t.universidad)}</p>
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

        <!-- 
        <div class="meta-row">
          <span class="meta-label">Precios</span>
          <span class="meta-value">${escapeHTML(t.precio)}</span>
        </div>
        -->
      </div>
    </a>
  `;
}

async function loadTutores() {
  const grid = document.getElementById("tutoresGrid");
  if (!grid) return;

  try {
    const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    const rows = parseCSV(text);
    const tutores = rowsToObjects(rows);

    // Render
    grid.innerHTML = tutores.map(tutorCard).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="opacity:.85">No se pudieron cargar los tutores. Revisa la URL CSV y que la hoja esté publicada.</p>`;
  }
}

loadTutores();
