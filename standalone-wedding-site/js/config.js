/**
 * VIJAY & RASHIMA WEDDING - GLOBAL CONFIGURATION
 */
const WEDDING_CONFIG = {
  couple: {
    groom: "Vijay",
    bride: "Rashima",
    hashtag: "#ViShimaForever",
    secondaryHashtag: "#RashimaGotVi"
  },
  dates: {
    weddingDate: new Date("2026-12-14T10:00:00+05:30"),
    displayDate: "December 14, 2026",
    displayRange: "December 12 – 14, 2026"
  },
  venue: {
    name: "The Oberoi Udaivilas & Royal Palace Grounds",
    city: "Udaipur, Rajasthan, India",
    address: "Badi-Gorela Mulla Talai, Haridas Ji Ki Magri, Udaipur, Rajasthan 313001",
    googleMapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3627.886364024419!2d73.66699297607736!3d24.58882575607065!2m3!1f0!2f0!3f0!32m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967e5628b05615d%3A0xe54e3d30e527f54c!2sThe%20Oberoi%20Udaivilas%2C%20Udaipur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
  },
  contacts: {
    rsvpPhone: "+919876543210",
    helpDeskEmail: "concierge@vishimawedding.com"
  },
  events: [
    {
      id: "haldi",
      title: "Haldi Ceremony",
      subtitle: "Pithi & Phoolon Ki Holi",
      date: "Saturday, Dec 12, 2026",
      time: "10:00 AM onwards",
      venue: "Chandani Courtyard, Udaivilas",
      dressCode: "Sunburst Yellow, Ochre & Mustard Silk",
      palette: ["#FFD700", "#FFA000", "#FFF9C4"],
      image: "assets/images/haldi_couple.jpg",
      description: "An auspicious morning bathed in golden turmeric, marigold flower showers, heartfelt giggles, and traditional dholak beats as we bless the couple with sunshine and love."
    },
    {
      id: "mehendi",
      title: "Mehendi Carnival",
      subtitle: "Henna, Bangles & Folk Melodies",
      date: "Saturday, Dec 12, 2026",
      time: "04:30 PM onwards",
      venue: "Poolside Gardens, Udaivilas",
      dressCode: "Emerald Greens, Mint & Bohemian Florals",
      palette: ["#2E7D32", "#81C784", "#E8F5E9"],
      image: "assets/images/mehendi_couple.jpg",
      description: "Intricate henna art applied with love, a colorful live bangles bazaar, Rajasthani folk vocalists, savory street chaat corners, and joyous celebrations by the lake."
    },
    {
      id: "sangeet",
      title: "Sangeet Extravaganza",
      subtitle: "Dance Face-offs, Cocktails & Glitz",
      date: "Sunday, Dec 13, 2026",
      time: "07:00 PM onwards",
      venue: "The Grand Royal Ballroom",
      dressCode: "Midnight Navy, Metallic Sequins & Indo-Western Glam",
      palette: ["#1A237E", "#C5A059", "#EDE7F6"],
      image: "assets/images/sangeet_couple.jpg",
      description: "Get ready to dance the night away! High-energy family dance performances, dazzling stage spotlights, live percussionists, celebrity DJ, and artisanal cocktails."
    },
    {
      id: "wedding",
      title: "The Sacred Wedding",
      subtitle: "Baraat, Varmala & Saat Phere",
      date: "Monday, Dec 14, 2026",
      time: "10:30 AM (Baraat) • 12:30 PM (Phere)",
      venue: "Lakeside Royal Mandap",
      dressCode: "Regal Heritage, Crimson Red & Classic Pastels",
      palette: ["#C62828", "#D4AF37", "#FFF8E1"],
      image: "assets/images/wedding_couple.jpg",
      description: "With holy mantras and sacred flames under a marigold-draped mandap overlooking Lake Pichola, Vijay and Rashima solemnize their eternal vows of love and companionship."
    },
    {
      id: "reception",
      title: "Grand Wedding Reception",
      subtitle: "An Evening of Elegance & Toasts",
      date: "Monday, Dec 14, 2026",
      time: "07:30 PM onwards",
      venue: "The Palace Grand Lawn",
      dressCode: "Black Tie, Luxury Evening Gowns & Formal Suits",
      palette: ["#212121", "#F48FB1", "#E0E0E0"],
      image: "assets/images/reception_couple.jpg",
      description: "A lavish black-tie gala under fairy-lit chandeliers. Celebrate the newlyweds with a champagne toast, multi-course culinary banquet, live symphony orchestra, and unforgettable memories."
    }
  ]
};
