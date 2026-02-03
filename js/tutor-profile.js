const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcWh2_N6ETMJxjUG_bqCwmphLalzMzo4JUx3wtMkmlVCNNI8sgPdpaKLvbtSnYI-W-W2mDdBB9Huyv/pub?gid=0&single=true&output=csv";

const GENERIC_PHOTO = "../../assets/tutores/perfil_generico.png";

// Cambia el numero si quieres
const WA_NUMBER = "573132864977";
const WA_BASE_MSG = "Hola! me gustaría aprender con ustedes";

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') { cell += '"'; i++; continue; }
    if (ch === '"') { inQuotes = !inQuotes; continue; }

    if (ch === "," && !inQuotes) { row.push(cell); cell = ""; continue; }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      if (!row.every(v => v.trim() === "")) rows.push(row);
      row = []; cell = "";
      continue;
    }

    cell += ch;
  }
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

function getUsernameFromURL() {
  // 1) Query param ?u=
  const params = new URLSearchParams(window.location.search);
  const u = (params.get("u") || "").trim();
  if (u) return u;

  // 2) Ruta /username
  const path = window.location.pathname.replace(/\/+$/, "");
  const last = path.split("/").pop();
  if (!last || last.includes(".html")) return "";

  return decodeURIComponent(last);
}



//Poner lindo el nombre de usuario
function setPrettyUrl(username) {
  const clean = encodeURIComponent(username.trim());
  const prettyPath = `/${clean}`;

  // No cambia la URL si ya está en /username
  if (window.location.pathname !== prettyPath) {
    window.history.replaceState({}, "", prettyPath);
  }
}


function tutorPhotoPath(username) {
  // Si usas PNG en vez de JPG, cambia la extension aquí
  return `../../assets/tutores/${username}.png`;
}

async function loadProfile() {
  const username = getUsernameFromURL();
  if (!username) {
    document.getElementById("tutorNombre").textContent = "Tutor no especificado";
    return;
  }

  //cambia la URL visible a /username (sin recargar)
  setPrettyUrl(username);

  const url = `${SHEET_CSV_URL}&_=${Date.now()}`; // evita cache
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  const rows = parseCSV(text);
  const tutores = rowsToObjects(rows);

  const t = tutores.find(x => (x.username || "").trim() === username);

  if (!t) {
    document.getElementById("tutorNombre").textContent = "Tutor no encontrado";
    document.getElementById("tutorDescripcion").textContent =
      "Revisa que el username exista en Google Sheets y que la hoja esté publicada.";
    return;
  }

  // Título de la pestaña
  document.title = `miprofenlinea | ${t.nombre || username}`;

  // Set info
  document.getElementById("tutorNombre").textContent = t.nombre || username;
  document.getElementById("tutorTitulo").textContent = t.titulo || "";
  document.getElementById("tutorMaterias").textContent = t.materias || "";
  document.getElementById("tutorNivel").textContent = t.nivel || "";
  document.getElementById("tutorModalidad").textContent = t.modalidad || "";
  //document.getElementById("tutorPrecio").textContent = t.precio || "";
  document.getElementById("tutorDescripcion").textContent = t.descripcion || "";

  // Foto (si no existe, usa genérica)
  const img = document.getElementById("tutorFoto");
  img.src = tutorPhotoPath(username);
  img.onerror = () => { img.onerror = null; img.src = GENERIC_PHOTO; };

  // Botón WhatsApp (mensaje base + nombre tutor)
  const msg = `${WA_BASE_MSG} (Tutor: ${t.nombre || username})`;
  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  document.getElementById("btnAgendarWA").href = waLink;
}

loadProfile();
