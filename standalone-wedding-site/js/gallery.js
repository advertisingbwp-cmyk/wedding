/**
 * VIJAY & RASHIMA WEDDING - COUPLE GALLERY & LIGHTBOX
 */

(function () {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox) return;

  let currentList = [];
  let currentIndex = 0;

  // Filtering Logic
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter || (filter === 'ceremonies' && category.includes('ceremony'))) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Collect visible cards for Lightbox
  function updateVisibleList() {
    currentList = [];
    galleryCards.forEach((card) => {
      if (card.style.display !== 'none') {
        const img = card.querySelector('img');
        const title = card.querySelector('.gallery-overlay-title')?.textContent || '';
        const caption = card.querySelector('.gallery-overlay-caption')?.textContent || '';
        currentList.push({
          src: img.src,
          alt: img.alt,
          caption: `${title} — ${caption}`
        });
      }
    });
  }

  function showLightbox(index) {
    updateVisibleList();
    if (currentList.length === 0) return;

    currentIndex = (index + currentList.length) % currentList.length;
    const item = currentList[currentIndex];

    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.caption;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Click on gallery card
  galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      updateVisibleList();
      const img = card.querySelector('img');
      const idx = currentList.findIndex((item) => item.src === img.src);
      showLightbox(idx >= 0 ? idx : 0);
    });
  });

  // Lightbox Controls
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightbox(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightbox(currentIndex + 1);
    });
  }

  // Background click to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(currentIndex + 1);
  });
})();
