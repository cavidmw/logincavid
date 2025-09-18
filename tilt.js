(function(){
  const target = document.querySelector('[data-tilt]');
  if (!target) return;

  const max = 6; // derece
  let req = null;

  function onMove(e){
    const r = target.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;  // 0..1
    const py = (e.clientY - r.top)  / r.height; // 0..1
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;

    if (req) cancelAnimationFrame(req);
    req = requestAnimationFrame(()=> {
      target.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  }
  function reset(){ target.style.transform = 'rotateX(0) rotateY(0)'; }

  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerleave', reset);
})();
