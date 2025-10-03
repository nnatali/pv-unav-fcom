document.addEventListener('DOMContentLoaded', () => {

  const hero = document.getElementById('hero');
  const video = document.getElementById('video');

  document.getElementById('videoPlay').addEventListener('click',(e)=>{
    e.preventDefault();
    
    hero.classList.add('is-playing');
    
    video.autoplay = false;
    video.muted = false;
    video.loop = false;
    video.controls = true;

    video.removeAttribute('autoplay');
    video.removeAttribute('muted');
    video.removeAttribute('loop');
    video.setAttribute('controls', true);
    
    video.play();
  });

  (() => {
    if (!hero || !video) return;
  
    const setPlaying = (on) => hero.classList.toggle('is-playing', on);

    video.addEventListener('pause', () => setPlaying(false));
    video.addEventListener('ended', () => setPlaying(false));
  })();

  document.querySelectorAll('.doc__item').forEach((item)=>{
    item.addEventListener('click', (e)=>{
      e.preventDefault();
      let _this = e.currentTarget;
      document.querySelectorAll('.doc__item').forEach((item)=>{
        if (item == _this) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    });
  });

  const handleViewport = () => {
    const sections = [...document.querySelectorAll('section')];
    const IN_VIEW = 'viewport';
    const THRESHOLD = 0.66; // 66%

    const update = () => {
      const vh = innerHeight;

      sections.forEach(el => {
        const { top, bottom, height } = el.getBoundingClientRect();
        const visible = Math.max(0, Math.min(bottom, vh) - Math.max(top, 0));
        const ratio = height ? visible / height : 0;

        // Añade solo si ≥66%; si no, quita.
        el.classList.toggle(IN_VIEW, ratio >= THRESHOLD);
      });
    };

    const onScrollOrResize = () => requestAnimationFrame(update);

    update();
    addEventListener('scroll', onScrollOrResize, { passive: true });
    addEventListener('resize', onScrollOrResize);
  };

  handleViewport();

    
  
});
