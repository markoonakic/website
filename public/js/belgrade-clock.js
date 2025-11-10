(function() {
  'use strict';
  const UPDATE_INTERVAL = 1000;
  const TIMEZONE = 'Europe/Belgrade';
  const DEFAULT_TZ = 'CET';
  const LOCALE = 'en-US';
  
  const timeEl = document.getElementById('belgrade-time');
  const tzEl = document.getElementById('belgrade-tz');
  if (!timeEl || !tzEl) return;
  
  const timeFmt = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const tzFmt = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    timeZoneName: 'short'
  });
  
  function update() {
    const now = new Date();
    const timeParts = timeFmt.formatToParts(now);
    const tzParts = tzFmt.formatToParts(now);
    const h = timeParts.find(p => p.type === 'hour').value;
    const m = timeParts.find(p => p.type === 'minute').value;
    const s = timeParts.find(p => p.type === 'second').value;
    const p = timeParts.find(p => p.type === 'dayPeriod').value.toUpperCase();
    const tz = tzParts.find(p => p.type === 'timeZoneName')?.value || DEFAULT_TZ;
    timeEl.textContent = `${h}:${m}:${s} ${p}`;
    tzEl.textContent = tz;
  }
  
  update();
  setInterval(update, UPDATE_INTERVAL);
})();
