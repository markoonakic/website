(function() {
  'use strict';

  const RESET_DELAY = 2000;
  const DEBOUNCE_DELAY = 100;
  const CLIPBOARD_ICON = 'bi bi-clipboard';
  const CHECK_ICON = 'bi bi-check';

  function getCodeText(codeBlock) {
    const codeElement = codeBlock.querySelector('code');
    if (codeElement) {
      return codeElement.textContent || codeElement.innerText;
    }
    return codeBlock.textContent || codeBlock.innerText;
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  }

  function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'code-copy-button';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.setAttribute('title', 'Copy code');
    button.innerHTML = '<i class="bi bi-clipboard" aria-hidden="true"></i>';
    return button;
  }

  const buttonTimeouts = new WeakMap();
  const originalIcons = new WeakMap();
  const isCopying = new WeakMap();

  function resetButton(button) {
    const icon = button.querySelector('i');
    const storedIcon = originalIcons.get(button) || CLIPBOARD_ICON;
    
    if (!icon) {
      button.classList.remove('copied');
      button.setAttribute('title', 'Copy code');
      buttonTimeouts.delete(button);
      isCopying.delete(button);
      return;
    }
    
    button.classList.add('resetting');
    void button.offsetHeight;
    icon.className = storedIcon;
    button.classList.remove('copied');
    void button.offsetHeight;
    void icon.offsetHeight;
    button.classList.remove('resetting');
    void button.offsetHeight;
    button.setAttribute('title', 'Copy code');
    buttonTimeouts.delete(button);
    isCopying.delete(button);
  }

  function showCopiedFeedback(button) {
    const icon = button.querySelector('i');
    
    if (!icon) {
      console.error('Icon not found in button');
      return;
    }
    
    const existingTimeout = buttonTimeouts.get(button);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      buttonTimeouts.delete(button);
    }
    
    if (!originalIcons.has(button)) {
      originalIcons.set(button, icon.className);
    }
    
    icon.style.opacity = '1';
    icon.style.transition = 'none';
    icon.className = CHECK_ICON;
    button.classList.add('copied');
    button.setAttribute('title', 'Copied!');
    void button.offsetHeight;
    
    const timeout = setTimeout(() => {
      resetButton(button);
    }, RESET_DELAY);
    
    buttonTimeouts.set(button, timeout);
  }

  function wrapCodeBlock(codeBlock) {
    if (codeBlock.parentElement && codeBlock.parentElement.classList.contains('code-block-wrapper')) {
      return codeBlock.parentElement;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    codeBlock.parentNode.insertBefore(wrapper, codeBlock);
    wrapper.appendChild(codeBlock);
    return wrapper;
  }

  function processCodeBlock(codeBlock, processedBlocks) {
    const parent = codeBlock.parentElement;
    if (parent && parent.classList.contains('code-block-wrapper')) {
      if (parent.querySelector('.code-copy-button')) {
        processedBlocks.add(codeBlock);
        return;
      }
    } else {
      if (codeBlock.querySelector('.code-copy-button')) {
        processedBlocks.add(codeBlock);
        return;
      }
    }

    const wrapper = wrapCodeBlock(codeBlock);
    if (!wrapper) {
      console.error('Failed to create wrapper for code block');
      return;
    }

    const wrapperStyle = window.getComputedStyle(wrapper);
    if (wrapperStyle.position === 'static') {
      wrapper.style.position = 'relative';
    }

    let buttonContainer = wrapper.querySelector('.code-copy-button-container');
    if (!buttonContainer) {
      buttonContainer = document.createElement('div');
      buttonContainer.className = 'code-copy-button-container';
      wrapper.appendChild(buttonContainer);
    }

    const copyButton = createCopyButton();
    if (!copyButton) {
      console.error('Failed to create copy button');
      return;
    }
    buttonContainer.appendChild(copyButton);
    processedBlocks.add(codeBlock);

    copyButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isCopying.get(copyButton) || copyButton.classList.contains('copied')) {
        return;
      }

      isCopying.set(copyButton, true);

      try {
        const codeText = getCodeText(codeBlock);
        const success = await copyToClipboard(codeText);

        if (success) {
          showCopiedFeedback(copyButton);
        } else {
          console.error('Failed to copy code');
          isCopying.delete(copyButton);
          if (copyButton.classList.contains('copied')) {
            resetButton(copyButton);
          }
        }
      } catch (error) {
        console.error('Error copying code:', error);
        isCopying.delete(copyButton);
        if (copyButton.classList.contains('copied')) {
          resetButton(copyButton);
        }
      }
    });
  }

  function addCopyButtons() {
    const chromaBlocks = document.querySelectorAll('#page-content .chroma, article .chroma, main .chroma');
    const processedBlocks = new Set();
    
    chromaBlocks.forEach((chromaBlock) => {
      processCodeBlock(chromaBlock, processedBlocks);
    });

    const preBlocks = document.querySelectorAll('#page-content pre, article pre, main pre');
    
    preBlocks.forEach((preBlock) => {
      if (processedBlocks.has(preBlock) || preBlock.closest('.chroma')) {
        return;
      }
      processCodeBlock(preBlock, processedBlocks);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }

  let observerTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      addCopyButtons();
    }, DEBOUNCE_DELAY);
  });

  const pageContent = document.querySelector('#page-content, article, main');
  if (pageContent) {
    observer.observe(pageContent, {
      childList: true,
      subtree: true
    });
  }
})();

