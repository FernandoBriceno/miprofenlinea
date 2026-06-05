// tutor-profile.js — consume JSON local (data/tutores.json)
const TUTORES_JSON_URL = "/data/tutores.json"; // ruta absoluta (segura con URLs bonitas)
const GENERIC_PHOTO = "/assets/tutores/perfil_generico.webp";

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

function getUsernameFromURL() {
  // 1) Query param ?u=
  const params = new URLSearchParams(window.location.search);
  const u = (params.get("u") || "").trim();
  if (u) return u;

  // 2) Ruta /username (cuando usas URL bonita)
  const path = window.location.pathname.replace(/\/+$/, "");
  const last = path.split("/").pop();
  if (!last || last.includes(".html")) return "";

  return decodeURIComponent(last);
}

// Poner lindo el nombre de usuario
function setPrettyUrl(username) {
  const clean = encodeURIComponent(username.trim());
  const prettyPath = `/${clean}`;

  // No cambia la URL si ya está en /username
  if (window.location.pathname !== prettyPath) {
    window.history.replaceState({}, "", prettyPath);
  }
}

function tutorPhotoPath(username, ext = "webp") {
  return `/assets/tutores/${username}.${ext}`;
}

async function loadProfile() {
  const username = getUsernameFromURL();
  if (!username) {
    document.getElementById("tutorNombre").textContent = "Tutor no especificado";
    return;
  }

  // cambia la URL visible a /username (sin recargar)
  setPrettyUrl(username);

  try {
    const res = await fetch(`${TUTORES_JSON_URL}?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const tutores = await res.json();
    const t = (tutores || []).find(x => (x.username || "").trim() === username);

    if (!t) {
      document.getElementById("tutorNombre").textContent = "Tutor no encontrado";
      document.getElementById("tutorDescripcion").textContent =
        "Revisa que el username exista en data/tutores.json.";
      return;
    }

    // Título de la pestaña
    document.title = `miprofenlinea | ${t.nombre || username}`;

    // Set info
    document.getElementById("tutorNombre").textContent = t.nombre || username;
    document.getElementById("tutorTitulo").textContent = t.titulo || "";
    document.getElementById("tutorUniversidad").textContent = t.universidad || "";
    document.getElementById("tutorMaterias").textContent = t.materias || "";
    document.getElementById("tutorNivel").textContent = t.nivel || "";
    document.getElementById("tutorModalidad").textContent = t.modalidad || "";
    document.getElementById("tutorDescripcion").textContent = t.descripcion || "";

    // Foto (webp -> png -> jpg -> genérica)
    const img = document.getElementById("tutorFoto");
    img.loading = "eager";
    img.decoding = "async";
    img.width = 240;
    img.height = 240;

    img.dataset.try = "webp";
    img.src = tutorPhotoPath(username, "webp");

    img.onerror = () => {
      if (img.dataset.try === "webp") {
        img.dataset.try = "png";
        img.src = tutorPhotoPath(username, "png");
      } else if (img.dataset.try === "png") {
        img.dataset.try = "jpg";
        img.src = tutorPhotoPath(username, "jpg");
      } else {
        img.onerror = null;
        img.src = GENERIC_PHOTO;
      }
    };

    // Botón WhatsApp (mensaje base + nombre tutor)
    const msg = `${WA_BASE_MSG} (Tutor: ${t.nombre || username})`;
    const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    document.getElementById("btnAgendarWA").href = waLink;

  } catch (err) {
    console.error(err);
    document.getElementById("tutorNombre").textContent = "Error cargando datos";
    document.getElementById("tutorDescripcion").textContent =
      "No se pudo leer data/tutores.json. Revisa la ruta y que el archivo exista.";
  }
}

loadProfile();