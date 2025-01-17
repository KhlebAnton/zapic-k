document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.reviews-container');
    const carousel = document.querySelector('.carousel');
    const reviews = Array.from(document.querySelectorAll('.review'));
    let currentIndex = 0;
    let isAnimating = false;
    
    // Drag functionality variables
    let isDragging = false;
    let startX;
    let startScrollX;
    let dragThreshold = 50; // Minimum drag distance to trigger slide
    
    // Remove existing clones and create new ones
    const existingClones = container.querySelectorAll('.review-clone');
    existingClones.forEach(clone => clone.remove());
    
     // Clone reviews for infinite loop
  // Create clones before - take from end of the array
  const clonesBefore = [];
  for (let i = reviews.length - 1; i >= 0; i--) {
    const clone = reviews[i].cloneNode(true);
    clone.classList.add('review-clone');
    container.insertBefore(clone, container.firstChild);
    clonesBefore.unshift(clone);
  }
  
  // Create clones after - take from start of the array
  const clonesAfter = [];
  for (let i = 0; i < reviews.length; i++) {
    const clone = reviews[i].cloneNode(true);
    clone.classList.add('review-clone');
    container.appendChild(clone);
    clonesAfter.push(clone);
  }
  
    function getTranslateX(index) {
      const reviewWidth = 328; // Default review width
      let activeWidth = 414; // Active review width
      if(window.screen.width <= 600) {
        activeWidth = carousel.clientWidth;
      }
      const gap = 45; // Gap between reviews
      const carouselWidth = carousel.offsetWidth;
      const offset = (carouselWidth - activeWidth) / 2;
      return -(index + reviews.length) * (reviewWidth + gap) + offset;
    }
  
    function updateCarousel(animate = true) {
      if (animate) {
        container.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      } else {
        container.style.transition = 'none';
      }
      
      const translateX = getTranslateX(currentIndex);
      container.style.transform = `translateX(${translateX}px)`;
      
      // Update active states
      const allReviews = [...clonesBefore, ...reviews, ...clonesAfter];
      allReviews.forEach((review, index) => {
        review.classList.remove('active');
        if (index === currentIndex + reviews.length) {
          review.classList.add('active');
        }
      });
    }
  
    function slide(direction) {
      if (isAnimating) return;
      isAnimating = true;
      
      currentIndex += direction;
      updateCarousel(true);
      
      // Handle infinite loop
      if (currentIndex >= reviews.length || currentIndex < 0) {
        setTimeout(() => {
          currentIndex = currentIndex >= reviews.length ? 0 : reviews.length - 1;
          updateCarousel(false);
          isAnimating = false;
        }, 500);
      } else {
        setTimeout(() => {
          isAnimating = false;
        }, 500);
      }
    }
  
    // Drag event handlers
    function handleDragStart(e) {
      if (isAnimating) return;
      
      isDragging = true;
      startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
      startScrollX = getTranslateX(currentIndex);
      
      container.style.transition = 'none';
      container.style.cursor = 'grabbing';
    }
  
    function handleDragMove(e) {
      if (!isDragging) return;
      
      e.preventDefault();
      const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
      const diff = x - startX;
      container.style.transform = `translateX(${startScrollX + diff}px)`;
    }
  
    function handleDragEnd(e) {
      if (!isDragging) return;
      
      isDragging = false;
      container.style.cursor = '';
      
      const x = e.type === 'mouseup' ? e.pageX : (e.changedTouches ? e.changedTouches[0].pageX : startX);
      const diff = x - startX;
      
      if (Math.abs(diff) > dragThreshold) {
        slide(diff > 0 ? -1 : 1);
      } else {
        updateCarousel(true);
      }
    }
  
    // Add drag event listeners
    container.addEventListener('mousedown', handleDragStart);
    container.addEventListener('touchstart', handleDragStart);
    
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    
    // Prevent context menu on long press
    container.addEventListener('contextmenu', (e) => e.preventDefault());
  
    // Add click handlers for navigation buttons
    document.querySelector('.nav-button.prev').addEventListener('click', () => slide(-1));
    document.querySelector('.nav-button.next').addEventListener('click', () => slide(1));
  
    // Initial setup
    updateCarousel(false);
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCarousel(false);
      }, 100);
    });
  });