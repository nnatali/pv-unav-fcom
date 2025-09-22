document.addEventListener('DOMContentLoaded', () => {

  /**
   * Viewport Observer
   * Adds "viewport" class to <section> elements as they enter the viewport
   */
  const handleViewportObserver = () => {
    const sections = document.querySelectorAll('section');

    const viewportObserverOptions = {
      root: null,
      rootMargin: '0px 0px -25% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('viewport', entry.isIntersecting);
      });
    }, viewportObserverOptions);

    sections.forEach(section => observer.observe(section));
  };

  /**
   * Fixed Observer
   * Adds "fixed" class when element's top reaches top of viewport
   * Adds "at-bottom" class when element's bottom is visible in viewport
   */
  const handleFixedObserver = () => {
    const elements = document.querySelectorAll('[data-fixed]');

    const fixedTopObserverOptions = {
      root: null,
      rootMargin: '0px 0px -100% 0px',
      threshold: 0
    };

    const topObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('fixed', entry.isIntersecting);
      });
    }, fixedTopObserverOptions);

    const checkBottomVisibility = () => {
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const bottomVisible = rect.bottom >= 0 && rect.bottom <= window.innerHeight;
        el.classList.toggle('at-bottom', bottomVisible);
      });
    };

    // Scroll/resize listeners
    window.addEventListener('scroll', checkBottomVisibility, { passive: true });
    window.addEventListener('resize', checkBottomVisibility);

    // Initial setup
    checkBottomVisibility();
    elements.forEach(el => topObserver.observe(el));
  };

  /**
   * Scroll Steps
   * Adds a "step-X" class based on scroll progress inside elements with [data-steps]
   */
  const handleScrollSteps = (defaultStepsCount = 3) => {
    const elements = document.querySelectorAll('[data-steps]');
    const scrollY = window.scrollY;

    elements.forEach(element => {
      const stepsCount = parseInt(element.getAttribute('data-steps'), 10) || defaultStepsCount;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const scrollRelative = scrollY - elementTop;

      const percentVisible = Math.min(Math.max(scrollRelative / elementHeight, 0), 1);
      let step = 1;

      for (let i = 1; i <= stepsCount; i++) {
        if (percentVisible <= i / stepsCount) {
          step = i;
          break;
        }
      }

      const stepClass = `step-${step}`;

      element.classList.forEach(cls => {
        if (cls.startsWith('step-') && cls !== stepClass) {
          element.classList.remove(cls);
        }
      });

      if (!element.classList.contains(stepClass)) {
        element.classList.add(stepClass);
      }

      if(element.id == 'info') {
        let maxStroke = 1000;
        let recalcStroke1 = percentVisible * 2500;
        let recalcStroke2 = percentVisible * 1500;
        document.getElementById('black').style.strokeDashoffset =  (maxStroke - recalcStroke1);
        if (percentVisible > 0.42) {
          document.getElementById('black2').style.strokeDashoffset =  (maxStroke - recalcStroke2);
        } else {
          document.getElementById('black2').style.strokeDashoffset = maxStroke;
        }
      }
    });
  };

  /**
   * Video players + Swiper init
   */
  function fmtTime(sec) {
    sec = Math.floor(sec);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  /**
   * Initialize Swiper Carousel
   */
  const initCarousel = () => {
    const mySwiper = new Swiper('.swiper', {
      spaceBetween: 20,
      slidesPerView: 'auto',
      centeredSlides: true,
      initialSlide: 2,
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
    });

    // Pause any playing videos when the slide changes
    mySwiper.on('slideChange', () => {
      document.querySelectorAll('.swiper-slide video').forEach(video => {
        if (!video.paused) video.pause();
      });
    });

    // Set up each video player (has access to mySwiper via closure)
    document.querySelectorAll('.carousel__item').forEach((player) => {
      const video = player.querySelector('.carousel__item-video') || player.querySelector('video');
      const playBtn = player.querySelector('.carousel__play');
      const progress = player.querySelector('.carousel__progress');
      const filled = player.querySelector('.carousel__progress-filled');
      const timeDisplay = player.querySelector('.carousel__time');
      const controls = player.querySelector('.carousel__controls');

      function togglePlay() {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }

      function updatePlayButton() {
        if (video.paused) {
          playBtn.classList.remove('paused');
          player.classList.remove('is-playing');
        } else {
          playBtn.classList.add('paused');
          player.classList.add('is-playing');
        }
      }

      function updateProgress() {
        if (!video.duration || isNaN(video.duration)) return;
        const percent = (video.currentTime / video.duration) * 100;
        filled.style.width = percent + '%';
        timeDisplay.textContent = fmtTime(video.duration - video.currentTime);
      }

      function seek(e) {
        const rect = progress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (video.duration && !isNaN(video.duration)) {
          video.currentTime = Math.max(0, Math.min(1, percent)) * video.duration;
        }
      }

      // Init UI when metadata is ready
      video.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = fmtTime(video.duration);
        updateProgress();
        updatePlayButton();
      });

      // Controls events
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // keep player-click handler from running
        togglePlay();
      });
      video.addEventListener('play', updatePlayButton);
      video.addEventListener('pause', updatePlayButton);
      video.addEventListener('timeupdate', updateProgress);
      progress.addEventListener('click', (e) => { e.stopPropagation(); seek(e); });

      // Click anywhere in carousel__item except controls
      player.addEventListener('click', (e) => {
        if (controls && controls.contains(e.target)) return;

        // If not the active slide, make it active
        if (!player.classList.contains('swiper-slide-active')) {
          const slideIndex = Array.prototype.indexOf.call(mySwiper.slides, player);
          if (slideIndex > -1) mySwiper.slideTo(slideIndex);
          return; // don’t toggle video until it’s active
        }

        // Already active → toggle video
        togglePlay();
      });

      // Clean up state when video ends
      video.addEventListener('ended', () => {
        player.classList.remove('is-playing');
        playBtn.classList.remove('paused');
        filled.style.width = '0%';
        timeDisplay.textContent = fmtTime(video.duration);
      });
    });
  };

  // Initialize all
  handleFixedObserver();
  handleViewportObserver();
  initCarousel();

  // Scroll listener for step-based animations
  window.addEventListener('scroll', () => handleScrollSteps(), { passive: true });
});
