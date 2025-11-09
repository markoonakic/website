(function () {
  'use strict';

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
      wrapper.style.height = 'auto';
      wrapper.style.maxHeight = 'none';
      const height = wrapper.scrollHeight;
      wrapper.style.height = oldHeight;
      wrapper.style.maxHeight = oldMaxHeight;
      return height;
    };

    if (isOpen) {
      const height = measureHeight();
      wrapper.style.height = height + 'px';
      wrapper.style.maxHeight = height + 'px';
      wrapper.style.opacity = '1';
      summary.style.setProperty('--arrow-rotation', '90deg');
    } else {
      wrapper.style.height = '0px';
      wrapper.style.maxHeight = '0px';
      wrapper.style.opacity = '0';
      summary.style.setProperty('--arrow-rotation', '0deg');
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
        wrapper.style.height = '0px';
        wrapper.style.maxHeight = '0px';
        wrapper.style.opacity = '0';
        summary.style.setProperty('--arrow-rotation', '0deg');
        void wrapper.offsetHeight;
        animation = gsap.to(wrapper, {
          height: targetHeight + 'px',
          maxHeight: targetHeight + 'px',
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            animation = null;
          }
        });
        arrowAnimation = gsap.to(summary, {
          '--arrow-rotation': '90deg',
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            arrowAnimation = null;
          }
        });
      } else {
        const currentHeight = measureHeight();
        wrapper.style.height = currentHeight + 'px';
        wrapper.style.maxHeight = currentHeight + 'px';
        wrapper.style.opacity = '1';
        summary.style.setProperty('--arrow-rotation', '90deg');
        void wrapper.offsetHeight;
        animation = gsap.to(wrapper, {
          height: '0px',
          maxHeight: '0px',
          opacity: 0,
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            details.removeAttribute('open');
            animation = null;
          }
        });
        arrowAnimation = gsap.to(summary, {
          '--arrow-rotation': '0deg',
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            arrowAnimation = null;
          }
        });
      }
    });

    summary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        summary.click();
      }
    });
  });
})();
