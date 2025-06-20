// Star rating selection logic
document.addEventListener('DOMContentLoaded', function() {
  const stars = document.querySelectorAll('#star-rating i');
  const ratingInput = document.getElementById('rating-value');
  let current = 0;
  stars.forEach((star, idx) => {
    star.addEventListener('mouseenter', () => {
      for (let i = 0; i < stars.length; i++) {
        stars[i].classList.remove('ri-star-fill');
        stars[i].classList.add('ri-star-line');
        if (i <= idx) stars[i].classList.add('ri-star-fill');
      }
    });
    star.addEventListener('mouseleave', () => {
      for (let i = 0; i < stars.length; i++) {
        stars[i].classList.remove('ri-star-fill');
        stars[i].classList.add('ri-star-line');
        if (i < current) stars[i].classList.add('ri-star-fill');
      }
    });
    star.addEventListener('click', () => {
      current = idx + 1;
      ratingInput.value = current;
      for (let i = 0; i < stars.length; i++) {
        stars[i].classList.remove('ri-star-fill');
        stars[i].classList.add('ri-star-line');
        if (i < current) stars[i].classList.add('ri-star-fill');
      }
    });
  });

  // Review slider logic
  const reviewsPerPage = 3;
  const slider = document.getElementById('review-slider');
  const reviewCards = slider.querySelectorAll('.review-card');
  const dots = document.getElementById('slider-dots').querySelectorAll('.slider-dot');
  let currentPage = 0;
  let totalPages = Math.ceil(reviewCards.length / reviewsPerPage);

  function showPage(page) {
    for (let i = 0; i < reviewCards.length; i++) {
      reviewCards[i].style.display = (i >= page * reviewsPerPage && i < (page + 1) * reviewsPerPage) ? 'block' : 'none';
    }
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === page);
    });
  }

  // Initial display
  showPage(currentPage);

  // Dots click event
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentPage = idx;
      showPage(currentPage);
      resetAutoSlide();
    });
  });

  // Auto slide
  let autoSlideInterval = setInterval(() => {
    currentPage = (currentPage + 1) % totalPages;
    showPage(currentPage);
  }, 4000);

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      currentPage = (currentPage + 1) % totalPages;
      showPage(currentPage);
    }, 4000);
  }
});
