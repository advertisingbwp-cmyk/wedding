/**
 * VIJAY & RASHIMA WEDDING - LIVE COUNTDOWN TIMER
 */

(function () {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-minutes');
  const secsEl = document.getElementById('count-seconds');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  const targetDate = WEDDING_CONFIG.dates.weddingDate.getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      const statusText = document.getElementById('countdown-status-text');
      if (statusText) statusText.textContent = 'Happily Married! Today is the Day!';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  // Google Calendar Integration
  const calBtn = document.getElementById('add-to-calendar-btn');
  if (calBtn) {
    calBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = encodeURIComponent("Vijay & Rashima's Royal Wedding");
      const details = encodeURIComponent("Celebrating the wedding of Vijay & Rashima at The Oberoi Udaivilas, Udaipur! #ViShimaForever");
      const location = encodeURIComponent("The Oberoi Udaivilas, Udaipur, Rajasthan, India");
      // Format 20261214T050000Z to 20261214T183000Z (UTC)
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261214T050000Z/20261214T183000Z&details=${details}&location=${location}`;
      window.open(gcalUrl, '_blank');
    });
  }
})();
