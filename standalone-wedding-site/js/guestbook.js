/**
 * VIJAY & RASHIMA WEDDING - INTERACTIVE GUESTBOOK
 */

(function () {
  const form = document.getElementById('guestbook-form');
  const wall = document.getElementById('guestbook-wall');
  const emojiBtns = document.querySelectorAll('.emoji-btn');

  if (!wall) return;

  let selectedEmoji = '❤️';

  // Default warm pre-populated wishes from close family and friends
  const defaultWishes = [
    {
      id: 1,
      name: "Rohit & Ananya Verma",
      relation: "Cousins of Groom",
      emoji: "🥂",
      time: "Yesterday",
      message: "Vijay bhai & Rashima bhabhi, we are beyond thrilled! Counting down the days to the Sangeet dance face-offs in Udaipur! Love you both to the moon and back!"
    },
    {
      id: 2,
      name: "Dadi & Dadaji (Kapur Family)",
      relation: "Grandparents",
      emoji: "🧿",
      time: "2 days ago",
      message: "May Ishwar shower our beloved Vijay and lovely Rashima with boundless health, understanding, happiness, and eternal warmth. Sada khush raho baccho."
    },
    {
      id: 3,
      name: "Simran Kaur",
      relation: "Best Friend of Bride",
      emoji: "🌸",
      time: "3 days ago",
      message: "From college canteen secrets to seeing you marry the absolute man of your dreams! Rashima, you are going to be the most breathtaking bride ever! Vijay, take good care of our queen!"
    },
    {
      id: 4,
      name: "Arjun Singhal & Team Tech",
      relation: "Vijay's College Squad",
      emoji: "✨",
      time: "4 days ago",
      message: "Bro, you finally found your forever player 2! Can't wait for the Baraat madness. Get your dancing shoes polished, Udaipur won't know what hit it!"
    }
  ];

  // Emoji picker
  emojiBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      emojiBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEmoji = btn.getAttribute('data-emoji') || '❤️';
    });
  });

  function getStoredWishes() {
    const saved = localStorage.getItem('wedding_guestbook_wishes');
    if (!saved) return defaultWishes;
    try {
      return JSON.parse(saved);
    } catch {
      return defaultWishes;
    }
  }

  function renderWishes() {
    const wishes = getStoredWishes();
    wall.innerHTML = '';

    wishes.forEach((w) => {
      const card = document.createElement('div');
      card.className = 'guestbook-card glass-card';
      const initial = w.name.charAt(0).toUpperCase();

      card.innerHTML = `
        <div class="guestbook-card-header">
          <div class="guestbook-author-info">
            <div class="guestbook-avatar">${initial}</div>
            <div>
              <div class="guestbook-author-name">${escapeHtml(w.name)}</div>
              <div class="guestbook-time">${escapeHtml(w.relation || 'Well-wisher')} • ${w.time}</div>
            </div>
          </div>
          <span style="font-size: 1.5rem;">${w.emoji}</span>
        </div>
        <div class="guestbook-text">${escapeHtml(w.message)}</div>
      `;
      wall.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Handle Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('gb-name');
      const relationInput = document.getElementById('gb-relation');
      const messageInput = document.getElementById('gb-message');

      const name = nameInput.value.trim();
      const relation = relationInput ? relationInput.value.trim() : 'Guest';
      const message = messageInput.value.trim();

      if (!name || !message) {
        alert('Please share your name and heartfelt message!');
        return;
      }

      const newWish = {
        id: Date.now(),
        name,
        relation: relation || 'Guest & Well-wisher',
        emoji: selectedEmoji,
        time: 'Just now',
        message
      };

      const wishes = getStoredWishes();
      wishes.unshift(newWish); // prepend to top
      localStorage.setItem('wedding_guestbook_wishes', JSON.stringify(wishes));

      renderWishes();
      form.reset();

      // Reset emoji selector
      emojiBtns.forEach((b) => b.classList.remove('active'));
      if (emojiBtns[0]) emojiBtns[0].classList.add('active');
      selectedEmoji = '❤️';

      if (window.showWeddingToast) {
        window.showWeddingToast('💌 Thank you! Your warm wish has been posted to the guestbook.');
      }
    });
  }

  renderWishes();
})();
