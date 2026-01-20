(async function(){
  const mount = document.getElementById('nav-placeholder');
  if(!mount) return;

  const partialPath = mount.dataset.nav || 'partials/nav.html';
  const base = mount.dataset.base || '';

  try{
    const res = await fetch(partialPath, {cache:'no-cache'});
    if(!res.ok) throw new Error('No se pudo cargar el menu');
    mount.innerHTML = await res.text();

    // Set hrefs using data-href + base
    document.querySelectorAll('[data-href]').forEach(el => {
      const target = el.getAttribute('data-href');
      if(target) el.setAttribute('href', base + target);
    });

    // Activate current link
    const current = (location.pathname.split('/').pop() || 'index.html');
    document.querySelectorAll('.nav-link').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if(href === current){ a.classList.add('active'); }
    });

    // Toggle mobile
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if(toggle && links){
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
  }catch(err){
    console.error(err);
  }
})();
