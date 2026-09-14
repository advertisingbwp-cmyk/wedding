/**
 * VIJAY & RASHIMA WEDDING - RSVP FORM CONTROLLER
 */

(function () {
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  if (!rsvpForm) return;

  const attendanceCards = document.querySelectorAll('.attendance-radio-card');
  const attendanceInputs = document.querySelectorAll('input[name="attendance"]');

  // Attendance card toggle styling
  attendanceInputs.forEach((input) => {
    input.addEventListener('change', () => {
      attendanceCards.forEach((card) => card.classList.remove('active'));
      const parent = input.closest('.attendance-radio-card');
      if (parent) parent.classList.add('active');

      const functionsGroup = document.getElementById('functions-selection-group');
      if (functionsGroup) {
        functionsGroup.style.display = input.value === 'attending' ? 'block' : 'none';
      }
    });
  });

  // Handle Form Submit
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guest-name').value.trim();
    const phone = document.getElementById('guest-phone').value.trim();
    const email = document.getElementById('guest-email')?.value.trim() || 'N/A';
    const guestCount = document.getElementById('guest-count').value;
    const attendance = document.querySelector('input[name="attendance"]:checked')?.value || 'attending';
    const meal = document.getElementById('meal-preference').value;
    const message = document.getElementById('guest-message').value.trim();

    const selectedEvents = [];
    document.querySelectorAll('input[name="events"]:checked').forEach((cb) => {
      selectedEvents.push(cb.value);
    });

    if (!name || !phone) {
      alert('Please fill in your name and phone number so we can reserve your invitation!');
      return;
    }

    // Save RSVP to LocalStorage
    const rsvpEntry = {
      id: Date.now(),
      name,
      phone,
      email,
      guestCount,
      attendance,
      events: selectedEvents,
      meal,
      message,
      submittedAt: new Date().toLocaleString()
    };

    const existingRsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    existingRsvps.push(rsvpEntry);
    localStorage.setItem('wedding_rsvps', JSON.stringify(existingRsvps));

    // Fire celebration confetti!
    if (window.fireCelebrationConfetti) {
      window.fireCelebrationConfetti();
    }

    // Show celebratory toast
    if (window.showWeddingToast) {
      window.showWeddingToast(`🎉 Thank you ${name}! Your RSVP has been lovingly received.`);
    }

    // Generate pre-filled WhatsApp message
    const formattedAttendance = attendance === 'attending' ? 'joyfully attending 🥳' : 'regretfully unable to make it 💌';
    const eventsStr = selectedEvents.length > 0 ? selectedEvents.join(', ') : 'All Ceremonies';
    const waText = encodeURIComponent(
      `*Wedding RSVP for Vijay & Rashima*\n` +
      `👤 *Guest Name:* ${name}\n` +
      `📱 *Phone:* ${phone}\n` +
      `✨ *Status:* I am ${formattedAttendance}\n` +
      `👥 *Number of Guests:* ${guestCount}\n` +
      `📅 *Functions Attending:* ${eventsStr}\n` +
      `🍽️ *Meal Preference:* ${meal}\n` +
      `💬 *Blessings Note:* ${message || 'Wishing you both a lifetime of happiness!'}`
    );

    const waUrl = `https://api.whatsapp.com/send?phone=${WEDDING_CONFIG.contacts.rsvpPhone}&text=${waText}`;

    // Prompt user with choice to send direct WhatsApp message
    setTimeout(() => {
      const confirmSend = confirm(
        `Thank you for confirming your presence, ${name}!\n\nWould you like to open WhatsApp to send your confirmation message directly to the wedding concierge?`
      );
      if (confirmSend) {
        window.open(waUrl, '_blank');
      }
    }, 600);

    // Reset Form
    rsvpForm.reset();
    attendanceCards.forEach((c) => c.classList.remove('active'));
    attendanceCards[0].classList.add('active');
  });
})();
