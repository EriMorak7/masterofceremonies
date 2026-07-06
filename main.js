/* ============================================================
   MASTER OF CEREMONIES — MAIN JAVASCRIPT
   Scroll Reveals, Sticky Header, Mobile Menu,
   Gallery Filters, Lightbox, Smooth Scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPageTransition();
  initStickyHeader();
  initMobileMenu();
  initScrollReveal();
  initSmoothScroll();
  initGalleryFilters();
  initLightbox();
  initParallax();
  initContactForm();
});


/* --- Page Transition --- */
function initPageTransition() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade out the loading overlay
  requestAnimationFrame(() => {
    overlay.classList.add('loaded');
    setTimeout(() => overlay.remove(), 700);
  });

  // Fade in on navigation to other pages
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;

    link.addEventListener('click', e => {
      if (href.endsWith('.html') || href === '/' || href === '') {
        e.preventDefault();
        const transition = document.createElement('div');
        transition.className = 'page-transition';
        document.body.appendChild(transition);
        // Force reflow
        transition.offsetHeight;
        setTimeout(() => {
          window.location.href = href;
        }, 100);
      }
    });
  });
}


/* --- Sticky Header --- */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  const threshold = 50;

  function onScroll() {
    const scrollY = window.scrollY;

    if (scrollY > threshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial check
}


/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.header__nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      toggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}


/* --- Scroll Reveal Animations --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  reveals.forEach(el => observer.observe(el));
}


/* --- Smooth Scroll for Anchor Links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}


/* --- Gallery Filters --- */
function initGalleryFilters() {
  const buttons = document.querySelectorAll('.gallery-filters button');
  const items = document.querySelectorAll('.gallery-item');
  if (!buttons.length || !items.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'none';
          item.offsetHeight; // Reflow
          item.style.animation = '';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}


/* --- Lightbox --- */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  // Create lightbox DOM
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox__close" aria-label="Close lightbox">&times;</button>
    <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">&#8249;</button>
    <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">&#8250;</button>
    <img class="lightbox__img" src="" alt="" />
    <div class="lightbox__caption"></div>
  `;
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('.lightbox__img');
  const lbCaption = lightbox.querySelector('.lightbox__caption');
  const lbClose = lightbox.querySelector('.lightbox__close');
  const lbPrev = lightbox.querySelector('.lightbox__nav--prev');
  const lbNext = lightbox.querySelector('.lightbox__nav--next');

  let currentIndex = 0;
  let visibleItems = [];

  function getVisibleItems() {
    return Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  }

  function openLightbox(index) {
    visibleItems = getVisibleItems();
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = visibleItems[currentIndex];
    if (!item) return;
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-item__overlay span');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = caption ? caption.textContent : '';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
    updateLightbox();
  }

  // Event listeners
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const visible = getVisibleItems();
      const visibleIdx = visible.indexOf(item);
      openLightbox(visibleIdx >= 0 ? visibleIdx : 0);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}


/* --- Subtle Parallax on Hero --- */
function initParallax() {
  const heroes = document.querySelectorAll('.hero__bg img');
  if (!heroes.length) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroes.forEach(img => {
      const parent = img.closest('.hero');
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const speed = 0.3;
      img.style.transform = `translateY(${scrollY * speed}px) scale(1.1)`;
    });
  }, { passive: true });
}


/* --- Contact Form Validation --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    let valid = true;

    [name, email, message].forEach(field => {
      if (!field) return;
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (email && email.value && !isValidEmail(email.value)) {
      email.style.borderColor = '#c0392b';
      valid = false;
    }

    if (valid) {
      // Simulate form submission
      const btn = form.querySelector('.btn');
      const originalText = btn.textContent;
      btn.textContent = 'SENDING...';
      btn.style.pointerEvents = 'none';

      setTimeout(() => {
        btn.textContent = 'MESSAGE SENT ✓';
        btn.style.background = 'var(--accent-gold)';
        btn.style.color = 'var(--bg-primary)';

        setTimeout(() => {
          form.reset();
          btn.textContent = originalText;
          btn.style.pointerEvents = '';
          btn.style.background = '';
          btn.style.color = '';
        }, 3000);
      }, 1500);
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* --- Set Active Nav Link --- */
(function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header__nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();
