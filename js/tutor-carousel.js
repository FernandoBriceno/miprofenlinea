// js/tutor-carousel.js (INFINITO estable con 3 listas completas)
const TUTORES_JSON_URL = "data/tutores.json";

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
 * Scroll a un índice dentro de las slides.
 * Si instant=true, no anima (salto invisible).
 */
function scrollToIndex(track, index, instant = false) {
  const slides = [...track.querySelectorAll(".tutor-slide")];
  if (!slides.length) return;

  const target = slides[Math.max(0, Math.min(index, slides.length - 1))];

  if (instant) {
    const prev = track.style.scrollBehavior;
    track.style.scrollBehavior = "auto";
    target.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    track.style.scrollBehavior = prev || "";
  } else {
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
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

    // 1) Triple lista: [real][real][real]
    const extended = [...real, ...real, ...real];
    track.innerHTML = extended.map(tutorSlideHTML).join("");

    // 2) Comenzar en el primer elemento del bloque del medio
    // Bloque 0: 0..n-1, bloque 1: n..2n-1, bloque 2: 2n..3n-1
    let activeExtendedIndex = n;

    requestAnimationFrame(() => {
      scrollToIndex(track, activeExtendedIndex, true);
      setActiveByCenter(track);
    });

    // Helper: índice del activo (por clase)
    function currentExtendedIndex() {
      const slides = [...track.querySelectorAll(".tutor-slide")];
      const idx = slides.findIndex(s => s.classList.contains("is-active"));
      return idx >= 0 ? idx : activeExtendedIndex;
    }

    // Flechas
    btnPrev?.addEventListener("click", () => {
      const idx = currentExtendedIndex();
      scrollToIndex(track, idx - 1);
    });

    btnNext?.addEventListener("click", () => {
      const idx = currentExtendedIndex();
      scrollToIndex(track, idx + 1);
    });

    // 3) Teleport SOLO al finalizar scroll (evita salto/temblor)
    let raf = null;
    let scrollEndTimer = null;

    track.addEventListener("scroll", () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setActiveByCenter(track));

      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        const idx = currentExtendedIndex();

        // Si caes en bloque izquierdo, salta al medio (idx + n)
        // Si caes en bloque derecho, salta al medio (idx - n)
        let newIdx = idx;

        if (idx < n) newIdx = idx + n;
        else if (idx >= 2 * n) newIdx = idx - n;

        if (newIdx !== idx) {
          activeExtendedIndex = newIdx;
          scrollToIndex(track, newIdx, true); // invisible
        } else {
          activeExtendedIndex = idx;
        }

        setActiveByCenter(track);
      }, 120);
    });

    // 4) Resize: mantener el índice activo centrado (sin romper back/forward)
    window.addEventListener("resize", () => {
      scrollToIndex(track, activeExtendedIndex, true);
      setActiveByCenter(track);
    });

  } catch (e) {
    console.error(e);
    track.innerHTML = `<div style="opacity:.75">No se pudieron cargar los tutores.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", initTutorCarousel);