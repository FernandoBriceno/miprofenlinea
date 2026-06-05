// js/tutor-carousel.js (FINITO con lista duplicada/triplicada real)
const TUTORES_JSON_URL = "data/tutores.json";

// Cuántas copias completas quieres (3 recomendado: [real][real][real])
const COPIES = 3;

function firstName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/);
  return parts[0] || "";
}

function top3Subjects(materias = "") {
  const arr = String(materias)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return arr.slice(0, 3);
}

function tutorSlideHTML(t) {
  const username = (t.username || "").trim();
  const perfil = `tutores/perfil.html?u=${encodeURIComponent(username)}`;
  const foto = `assets/tutores/${username}.webp`;

  const materias3 = top3Subjects(t.materias).join(", ");
  const nombre1 = firstName(t.nombre);

  return `
    <a class="tutor-slide" href="${perfil}" role="listitem" aria-label="Ver perfil de ${nombre1}">
      <div class="tutor-slide__top">
        <div class="tutor-slide__avatar">
          <img
            src="${foto}"
            alt="Foto de ${nombre1}"
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
          <h3 class="tutor-slide__name">${nombre1}</h3>
          <p class="tutor-slide__title">${t.titulo || ""}</p>
        </div>
      </div>

      <div class="tutor-slide__subjects">
        ${materias3 || "—"} ...más
      </div>
    </a>
  `;
}

function setActiveByCenter(track) {
  const slides = [...track.querySelectorAll(".tutor-slide")];
  if (!slides.length) return;

  const trackRect = track.getBoundingClientRect();
  const centerX = trackRect.left + trackRect.width / 2;

  let best = slides[0];
  let bestDist = Infinity;

  for (const s of slides) {
    const r = s.getBoundingClientRect();
    const sCenter = r.left + r.width / 2;
    const dist = Math.abs(centerX - sCenter);
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }

  slides.forEach(el => el.classList.toggle("is-active", el === best));
}

/**
 * Centrado horizontal dentro del viewport del carrusel
 * (NO usa scrollIntoView para evitar saltos verticales en móvil)
 */
function scrollToIndex(track, index, instant = false) {
  const slides = [...track.querySelectorAll(".tutor-slide")];
  if (!slides.length) return;

  const target = slides[Math.max(0, Math.min(index, slides.length - 1))];

  const viewport = track.closest(".tutor-carousel__viewport");
  const viewportW = viewport ? viewport.clientWidth : track.clientWidth;

  const left = target.offsetLeft - (viewportW - target.offsetWidth) / 2;

  track.scrollTo({
    left,
    behavior: instant ? "auto" : "smooth"
  });
}

async function initTutorCarousel() {
  const track = document.getElementById("tutorCarouselTrack");
  if (!track) return;

  const wrap = track.closest(".tutor-carousel");
  const btnPrev = wrap?.querySelector(".tutor-carousel__btn--prev");
  const btnNext = wrap?.querySelector(".tutor-carousel__btn--next");

  try {
    const res = await fetch(`${TUTORES_JSON_URL}?_=${Date.now()}`, { cache: "no-store" });
    const tutores = await res.json();
    const real = tutores || [];
    const n = real.length;

    if (n === 0) {
      track.innerHTML = `<div style="opacity:.75">No hay tutores.</div>`;
      return;
    }

    // 1) Crear un nuevo arreglo REAL duplicado COPIES veces
    // Ej: COPIES=3 => [real][real][real]
    const extended = Array.from({ length: COPIES }, () => real).flat();

    track.innerHTML = extended.map(tutorSlideHTML).join("");

    const slides = [...track.querySelectorAll(".tutor-slide")];
    const total = slides.length;

    // 2) Comenzar en el primer elemento del bloque del medio:
    // si COPIES=3, el bloque del medio comienza en index = n
    // si COPIES=5, el bloque del medio comienza en index = 2n, etc.
    const middleBlock = Math.floor(COPIES / 2);
    let activeIndex = middleBlock * n; // primer item del bloque central

    // Centrar inicial sin animación
    requestAnimationFrame(() => {
      scrollToIndex(track, activeIndex, true);
      setActiveByCenter(track);
      updateButtons();
    });

    // Índice actual del activo por clase (por si el usuario desliza con dedo)
    function currentIndex() {
      const idx = slides.findIndex(s => s.classList.contains("is-active"));
      return idx >= 0 ? idx : activeIndex;
    }

    function updateButtons() {
      // Deshabilita visualmente si estás en extremos
      if (btnPrev) btnPrev.disabled = (activeIndex <= 0);
      if (btnNext) btnNext.disabled = (activeIndex >= total - 1);
      if (btnPrev) btnPrev.style.opacity = btnPrev.disabled ? ".45" : "1";
      if (btnNext) btnNext.style.opacity = btnNext.disabled ? ".45" : "1";
      if (btnPrev) btnPrev.style.pointerEvents = btnPrev.disabled ? "none" : "auto";
      if (btnNext) btnNext.style.pointerEvents = btnNext.disabled ? "none" : "auto";
    }

    // Flechas: FINITO (no wrap)
    btnPrev?.addEventListener("click", () => {
      const idx = currentIndex();
      activeIndex = Math.max(0, idx - 1);
      scrollToIndex(track, activeIndex);
      updateButtons();
    });

    btnNext?.addEventListener("click", () => {
      const idx = currentIndex();
      activeIndex = Math.min(total - 1, idx + 1);
      scrollToIndex(track, activeIndex);
      updateButtons();
    });

    // Scroll manual (touch): solo actualiza activo + botones al final del scroll
    let raf = null;
    let scrollEndTimer = null;

    track.addEventListener("scroll", () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setActiveByCenter(track));

      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        activeIndex = currentIndex();
        updateButtons();
      }, 120);
    });

    // Resize: recenter sin romper
    window.addEventListener("resize", () => {
      scrollToIndex(track, activeIndex, true);
      setActiveByCenter(track);
      updateButtons();
    });

  } catch (e) {
    console.error(e);
    track.innerHTML = `<div style="opacity:.75">No se pudieron cargar los tutores.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", initTutorCarousel);