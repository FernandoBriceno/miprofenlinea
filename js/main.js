(function(){
  // Footer year
  const y = document.getElementById('year');
  if(y) y.textContent = String(new Date().getFullYear());

  // WhatsApp floating button (same on all pages)
  const btn = document.getElementById('wa-float');
  if(btn){
    const phone = '573132864977';
    const text = 'Hola! me gustar\u00eda aprender con ustedes';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    btn.setAttribute('href', url);
  }
})();
