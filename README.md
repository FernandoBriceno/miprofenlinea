# miprofenlinea (sitio estatico)

Proyecto sencillo en **HTML/CSS/JS** con paginas separadas y un menu compartido.

## Estructura
- `index.html` : redirecciona a `views/index.html`
- `views/` : paginas HTML
  - `index.html` (Inicio)
  - `tutores.html`
  - `quienes-somos.html`
  - `contacto.html`
  - `partials/nav.html` (menu compartido)
  - `tutores/` (perfiles de ejemplo)
- `css/styles.css` : estilos globales (paleta principal #313d53 y #6a99b4)
- `js/include-nav.js` : inserta el menu en cada pagina y marca el link activo
- `js/main.js` : utilidades (anio automatico, etc.)
- `assets/` : imagenes y avatares

## Como verlo
Opcion A (rapida): abre `index.html` en tu navegador.

Opcion B (recomendado en VSCode): instala la extension **Live Server** y abre `views/index.html` con Live Server.

## WhatsApp
El boton flotante usa el texto automatico:

> Hola! me gustaria aprender con ustedes

Cambia el numero/ texto en `js/main.js`.
