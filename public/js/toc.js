(function () {
  'use strict';
  const ANIMATION_DURATION = 0.2;
  const ANIMATION_EASE = 'power2.out';
  const ARROW_ROTATION_OPEN = '90deg';
  const ARROW_ROTATION_CLOSED = '0deg';
  const OPACITY_OPEN = '1';
  const OPACITY_CLOSED = '0';
  const HEIGHT_CLOSED = '0px';
  const KEY_ENTER = 'Enter';
  const KEY_SPACE = ' ';

  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded');
    return;
  }

  const detailsNodes = document.querySelectorAll('.toc-collapsible');
  if (!detailsNodes.length) return;

  detailsNodes.forEach((details) => {
    const summary = details.querySelector('.toc-summary');
    const wrapper = details.querySelector('.toc-anim-wrapper');
    if (!summary || !wrapper) return;

    let isOpen = details.hasAttribute('open');
    let animation = null;
    let arrowAnimation = null;
    
    const measureHeight = () => {
      const oldHeight = wrapper.style.height;
      const oldMaxHeight = wrapper.style.maxHeight;
      const oldOpacity = wrapper.style.opacity;
      
      wrapper.style.height = 'auto';
      wrapper.style.maxHeight = 'none';
      wrapper.style.opacity = '1';
      wrapper.style.visibility = 'hidden';
      
      void wrapper.offsetHeight;
      
      const height = wrapper.scrollHeight;
      
      wrapper.style.height = oldHeight || '';
      wrapper.style.maxHeight = oldMaxHeight || '';
      wrapper.style.opacity = oldOpacity || '';
      wrapper.style.visibility = '';
      
      return height;
    };

    if (isOpen) {
      const height = measureHeight();
      wrapper.style.height = height + 'px';
      wrapper.style.maxHeight = height + 'px';
      wrapper.style.opacity = OPACITY_OPEN;
      summary.style.setProperty('--arrow-rotation', ARROW_ROTATION_OPEN);
    } else {
      wrapper.style.height = HEIGHT_CLOSED;
      wrapper.style.maxHeight = HEIGHT_CLOSED;
      wrapper.style.opacity = OPACITY_CLOSED;
      summary.style.setProperty('--arrow-rotation', ARROW_ROTATION_CLOSED);
    }

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (animation) animation.kill();
      if (arrowAnimation) arrowAnimation.kill();
      isOpen = !isOpen;

      if (isOpen) {
        details.setAttribute('open', '');
        const targetHeight = measureHeight();
        wrapper.style.height = HEIGHT_CLOSED;
        wrapper.style.maxHeight = HEIGHT_CLOSED;
        wrapper.style.opacity = OPACITY_CLOSED;
        summary.style.setProperty('--arrow-rotation', ARROW_ROTATION_CLOSED);
        void wrapper.offsetHeight;
        animation = gsap.to(wrapper, {
          height: targetHeight + 'px',
          maxHeight: targetHeight + 'px',
          opacity: 1,
          duration: ANIMATION_DURATION,
          ease: ANIMATION_EASE,
          onComplete: () => {
            animation = null;
          }
        });
        arrowAnimation = gsap.to(summary, {
          '--arrow-rotation': ARROW_ROTATION_OPEN,
          duration: ANIMATION_DURATION,
          ease: ANIMATION_EASE,
          onComplete: () => {
            arrowAnimation = null;
          }
        });
      } else {
        const currentHeight = measureHeight();
        wrapper.style.height = currentHeight + 'px';
        wrapper.style.maxHeight = currentHeight + 'px';
        wrapper.style.opacity = OPACITY_OPEN;
        summary.style.setProperty('--arrow-rotation', ARROW_ROTATION_OPEN);
        void wrapper.offsetHeight;
        animation = gsap.to(wrapper, {
          height: HEIGHT_CLOSED,
          maxHeight: HEIGHT_CLOSED,
          opacity: 0,
          duration: ANIMATION_DURATION,
          ease: ANIMATION_EASE,
          onComplete: () => {
            details.removeAttribute('open');
            animation = null;
          }
        });
        arrowAnimation = gsap.to(summary, {
          '--arrow-rotation': ARROW_ROTATION_CLOSED,
          duration: ANIMATION_DURATION,
          ease: ANIMATION_EASE,
          onComplete: () => {
            arrowAnimation = null;
          }
        });
      }
    });

    summary.addEventListener('keydown', (e) => {
      if (e.key === KEY_ENTER || e.key === KEY_SPACE) {
        e.preventDefault();
        summary.click();
      }
    });
  });
})();
