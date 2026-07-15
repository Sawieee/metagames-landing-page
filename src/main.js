/* ==========================================================================
   MetaGames — main.js
   Handles: full-screen section sizing, scroll-snap container height,
   sports & games / meta movement carousels, news feature switcher,
   "It's for" audience tabs, and emblem color cycler.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1) FULL-SCREEN SECTIONS
     Every <section class="screen-section"> should exactly fill the
     viewport that's left after the sticky header. We measure the
     header height and expose it as a CSS var, then set each section's
     min-height with JS (belt-and-braces on top of the CSS rule) so it
     also behaves on mobile browsers where 100vh is unreliable.
  ------------------------------------------------------------------ */
  const header = document.getElementById('site-header');
  const sections = document.querySelectorAll('.screen-section');

  function sizeSections() {
    const headerH = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-h', headerH + 'px');

    // Use visualViewport height when available (more accurate on mobile)
    const viewportH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const usableH = viewportH - headerH;

    sections.forEach((section) => {
      section.style.minHeight = usableH + 'px';
    });
  }

  sizeSections();
  window.addEventListener('resize', sizeSections);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', sizeSections);
  }

  /* ------------------------------------------------------------------
     1b) MOBILE NAV MENU
     Toggles the dropdown menu on small screens and closes it again
     whenever a link inside it is tapped or the viewport grows past
     the md breakpoint.
  ------------------------------------------------------------------ */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
      sizeSections();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
        sizeSections();
      });
    });

    // Collapse back to the desktop nav automatically if the window
    // is resized/rotated past the md breakpoint while menu is open.
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) closeMobileMenu();
    });
  }

  /* ------------------------------------------------------------------
     2) GENERIC HORIZONTAL CAROUSEL (Sports & Games / Meta Movement)
     Any button with [data-carousel-prev] / [data-carousel-next]
     scrolls the track with the matching id by one "page".
  ------------------------------------------------------------------ */
  // Tracks that are full one-card-per-page carousels (slide exactly one
  // viewport-width card at a time). Any other track just scrolls 90% of
  // its own width per click.
  const PAGE_TRACK_IDS = ['sg-track'];

  function scrollTrack(trackId, direction) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const isPagedCarousel = PAGE_TRACK_IDS.includes(trackId);
    const amount = isPagedCarousel
      ? track.clientWidth * direction
      : track.clientWidth * 0.9 * direction;
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-carousel-prev]').forEach((btn) => {
    btn.addEventListener('click', () => scrollTrack(btn.dataset.carouselPrev, -1));
  });
  document.querySelectorAll('[data-carousel-next]').forEach((btn) => {
    btn.addEventListener('click', () => scrollTrack(btn.dataset.carouselNext, 1));
  });

  // Sports & Games dot indicator: each card is exactly one page wide,
  // so the current page = scrollLeft / clientWidth.
  const sgTrack = document.getElementById('sg-track');
  const sgDots = document.querySelectorAll('#sg-dots span');
  if (sgTrack && sgDots.length) {
    let sgScrollTimer = null;
    sgTrack.addEventListener('scroll', () => {
      clearTimeout(sgScrollTimer);
      sgScrollTimer = setTimeout(() => {
        const page = Math.round(sgTrack.scrollLeft / sgTrack.clientWidth);
        sgDots.forEach((dot, i) => {
          dot.classList.toggle('bg-white', i === page);
          dot.classList.toggle('bg-slate-600', i !== page);
        });
      }, 60);
    });

    // Clicking a dot jumps straight to that page
    sgDots.forEach((dot, i) => {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', () => {
        sgTrack.scrollTo({ left: sgTrack.clientWidth * i, behavior: 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------
     3) NEWS FEATURE SWITCHER
     Clicking a side-list item swaps the big feature image/title/desc.
     Prev/next arrows cycle through the same list.
  ------------------------------------------------------------------ */
  const newsItems = [
    {
      img: 'assets/news-featured-host-nations.jpg',
      alt: 'MetaGames host nations announced',
      title: 'MetaGames Host Nations Announced',
      desc: 'Discover the countries leading the global MetaGames experience.'
    },
    {
      img: 'assets/news-thumb-new-categories.jpg',
      alt: 'New sports and game categories added',
      title: 'New Sports & Game Categories Added',
      desc: 'Fresh disciplines have joined the roster across mind, digital, and physical sports.'
    },
    {
      img: 'assets/news-thumb-registration-updates.jpg',
      alt: 'Registration updates',
      title: 'Registration Updates',
      desc: 'Key dates and requirements for athlete and team registration.'
    },
    {
      img: 'assets/news-thumb-partnerships.jpg',
      alt: 'Official partnerships and collaborations',
      title: 'Official Partnerships & Collaborations',
      desc: 'MetaGames welcomes new federations and technology partners.'
    }
  ];

  const newsFeature = document.getElementById('news-feature');
  if (newsFeature) {
    const newsImg = newsFeature.querySelector('img');
    const newsTitle = newsFeature.querySelector('[data-news-title]');
    const newsDesc = newsFeature.querySelector('[data-news-desc]');

    function renderNews(index) {
      const i = ((index % newsItems.length) + newsItems.length) % newsItems.length;
      const item = newsItems[i];
      newsFeature.dataset.index = i;
      newsImg.src = item.img;
      newsImg.alt = item.alt;
      newsTitle.textContent = item.title;
      newsDesc.textContent = item.desc;
    }

    document.querySelectorAll('[data-news-select]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        renderNews(parseInt(el.dataset.newsSelect, 10));
      });
    });

    const newsPrev = newsFeature.querySelector('[data-news-prev]');
    const newsNext = newsFeature.querySelector('[data-news-next]');
    if (newsPrev) newsPrev.addEventListener('click', () => renderNews(parseInt(newsFeature.dataset.index, 10) - 1));
    if (newsNext) newsNext.addEventListener('click', () => renderNews(parseInt(newsFeature.dataset.index, 10) + 1));
  }

  /* ------------------------------------------------------------------
     4) "IT'S FOR" AUDIENCE TABS
     Highlights the selected audience button.
  ------------------------------------------------------------------ */
  const audienceButtons = document.querySelectorAll('.audience-btn');

  audienceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      audienceButtons.forEach((b) => {
        b.classList.remove('bg-white', 'text-blue-700');
        b.classList.add('bg-blue-900', 'text-white');
      });
      btn.classList.remove('bg-blue-900', 'text-white');
      btn.classList.add('bg-white', 'text-blue-700');
    });
  });

  /* ------------------------------------------------------------------
     5) EMBLEM COLOR CYCLER
     Prev/next buttons step through the emblem's color meanings and
     highlight the matching swatch dot.
  ------------------------------------------------------------------ */
  const emblemStops = [
    { name: 'Red', hex: '#dc2626', meaning: 'Physical Sports' },
    { name: 'Yellow', hex: '#facc15', meaning: 'Mind Sports' },
    { name: 'White', hex: '#ffffff', meaning: 'Fair Play & Inclusivity' },
    { name: 'Green', hex: '#16a34a', meaning: 'Multi-Cultural Sports' },
    { name: 'Blue', hex: '#2563eb', meaning: 'Digital & Virtual Sports' },
    { name: 'Black', hex: '#111827', meaning: 'Esports' }
  ];

  const emblemColorEl = document.getElementById('emblem-color');
  const emblemMeaningEl = document.getElementById('emblem-meaning');
  const emblemSwatchEl = document.getElementById('emblem-swatch');
  const emblemWheelEl = document.getElementById('emblem-wheel');
  const emblemPrevBtn = document.getElementById('emblem-prev');
  const emblemNextBtn = document.getElementById('emblem-next');

  // Each wedge is 360 / stops = 60deg wide, centered at (i*60 + 30) in the
  // conic-gradient's own coordinates (0deg = top, clockwise). The arrow sits
  // at the wheel's east/right edge, i.e. screen-angle 90deg. So the rotation
  // that brings wedge i's center to the arrow is: 90 - (i*60 + 30) = 60 - 60*i.
  //
  // emblemStep is an unbounded counter (not wrapped) so the wheel always
  // keeps spinning the direction it was pushed instead of snapping back;
  // emblemIndex (wrapped) is derived from it for looking up color/meaning.
  const emblemWedgeDeg = 360 / emblemStops.length;
  let emblemStep = 3; // starts on Green, matching the wireframe

  function renderEmblem() {
    const emblemIndex = ((emblemStep % emblemStops.length) + emblemStops.length) % emblemStops.length;
    const stop = emblemStops[emblemIndex];
    const rotation = 60 - emblemWedgeDeg * emblemStep;
    if (emblemColorEl) emblemColorEl.textContent = stop.name;
    if (emblemMeaningEl) emblemMeaningEl.textContent = stop.meaning;
    if (emblemSwatchEl) emblemSwatchEl.style.backgroundColor = stop.hex;
    if (emblemWheelEl) emblemWheelEl.style.transform = `rotate(${rotation}deg)`;
  }

  if (emblemPrevBtn) {
    emblemPrevBtn.addEventListener('click', () => {
      emblemStep -= 1;
      renderEmblem();
    });
  }
  if (emblemNextBtn) {
    emblemNextBtn.addEventListener('click', () => {
      emblemStep += 1;
      renderEmblem();
    });
  }
  renderEmblem();

  /* ------------------------------------------------------------------
     6) THEME SONG PLAY BUTTON (placeholder toggle)
     Swaps the play icon to a pause icon. Wire up a real <video>/<audio>
     element here once the asset is available.
  ------------------------------------------------------------------ */
  const themePlayBtn = document.getElementById('theme-play');
  if (themePlayBtn) {
    let playing = false;
    themePlayBtn.addEventListener('click', () => {
      playing = !playing;
      themePlayBtn.querySelector('span').innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
    });
  }

});
