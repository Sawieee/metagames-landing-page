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
     Highlights the selected audience and swaps a line of copy.
  ------------------------------------------------------------------ */
  const audienceCopy = {
    Athletes: 'Compete, train, and connect with fellow athletes across every sport in the MetaGames.',
    Gamers: 'Rise through the ranks in esports titles and digital arenas built for competitive gamers.',
    Students: 'Represent your school and build skills through mind sports, esports, and physical events.',
    Professionals: 'Network, sponsor, and showcase talent through official MetaGames partnerships.',
    Nations: 'Host events, field national teams, and put your country on the global MetaGames stage.'
  };

  const audienceButtons = document.querySelectorAll('.audience-btn');
  const audienceCopyEl = document.getElementById('audience-copy');

  audienceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      audienceButtons.forEach((b) => {
        b.classList.remove('bg-white', 'text-slate-800');
        b.classList.add('bg-blue-900', 'text-white');
      });
      btn.classList.remove('bg-blue-900', 'text-white');
      btn.classList.add('bg-white', 'text-slate-800');
      if (audienceCopyEl) {
        audienceCopyEl.textContent = audienceCopy[btn.dataset.audience] || '';
      }
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

  let emblemIndex = 3; // starts on Green, matching the wireframe
  const emblemColorEl = document.getElementById('emblem-color');
  const emblemMeaningEl = document.getElementById('emblem-meaning');
  const emblemSwatchEl = document.getElementById('emblem-swatch');
  const emblemPrevBtn = document.getElementById('emblem-prev');
  const emblemNextBtn = document.getElementById('emblem-next');

  function renderEmblem() {
    const stop = emblemStops[emblemIndex];
    if (emblemColorEl) emblemColorEl.textContent = stop.name;
    if (emblemMeaningEl) emblemMeaningEl.textContent = stop.meaning;
    if (emblemSwatchEl) emblemSwatchEl.style.backgroundColor = stop.hex;
  }

  if (emblemPrevBtn) {
    emblemPrevBtn.addEventListener('click', () => {
      emblemIndex = (emblemIndex - 1 + emblemStops.length) % emblemStops.length;
      renderEmblem();
    });
  }
  if (emblemNextBtn) {
    emblemNextBtn.addEventListener('click', () => {
      emblemIndex = (emblemIndex + 1) % emblemStops.length;
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