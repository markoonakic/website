(function() {
  'use strict';
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  let posts = [];
  async function loadPosts() {
    try {
      const response = await fetch('/search/index.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      posts = await response.json();
    } catch (e) {
      console.error('Failed to load posts:', e);
      results.innerHTML = '<p class="text-secondary mt-3">Failed to load search index.</p>';
    }
  }
  function search(query) {
    if (!query.trim()) {
      results.innerHTML = '';
      return;
    }
    const q = query.toLowerCase().trim();
    const matches = posts.filter(post => {
      const title = (post.title || '').toLowerCase();
      return title.includes(q);
    });
    if (matches.length === 0) {
      results.innerHTML = '<p class="text-secondary mt-3">No results found.</p>';
      return;
    }
    results.innerHTML = '<div class="mt-3">' + matches.map(post => {
      const title = post.title || 'Untitled';
      const url = post.url || '#';
      return `<div class="mb-2"><a href="${url}" class="text-decoration-none">${title}</a></div>`;
    }).join('') + '</div>';
  }
  loadPosts();
  input.addEventListener('input', e => search(e.target.value));
})();
