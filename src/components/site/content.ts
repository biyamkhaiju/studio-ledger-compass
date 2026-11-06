export const CONTACT = {
  name: "Biyam Khaiju",
  phone: "9860105891",
  phoneIntl: "+977 986-0105891",
  email: "profbiyam09@gmail.com",
  location: "Katunje, Bhaktapur, Nepal",
};

export const waLink = (text = "Namaste SainoX! I'd like to know more about your digital invitations.") =>
  `https://wa.me/977${CONTACT.phone}?text=${encodeURIComponent(text)}`;

export type Service = { slug: string; title: string; nepali: string; blurb: string; features: string[] };

export const SERVICES: Service[] = [
  { slug: "wedding", title: "Wedding", nepali: "विवाह", blurb: "Grand, personalised wedding invitations that carry your story to every guest.", features: ["Personal link per guest", "Event schedule & venue map", "Couple story & photos"] },
  { slug: "engagement", title: "Engagement", nepali: "सगाई", blurb: "Elegant announcements for the ring ceremony and the beginning of forever.", features: ["Animated reveal", "RSVP-ready layout", "Family introductions"] },
  { slug: "anniversary", title: "Anniversary", nepali: "वार्षिकोत्सव", blurb: "Celebrate years of togetherness with a heartfelt digital keepsake.", features: ["Memory timeline", "Photo gallery", "Warm personal message"] },
  { slug: "bratabandha", title: "Bratabandha", nepali: "व्रतबन्ध", blurb: "Traditional sacred-thread ceremony invitations rooted in Nepali culture.", features: ["Cultural motifs", "Ritual schedule", "Blessings from elders"] },
  { slug: "birthday", title: "Birthday", nepali: "जन्मदिन", blurb: "Joyful birthday invites for little ones, milestones and everyone between.", features: ["Playful animations", "Theme colours", "Countdown to the day"] },
  { slug: "special", title: "Special Occasions", nepali: "विशेष अवसर", blurb: "Pasni, baby welcomes, griha pravesh, pujas and any moment worth sharing.", features: ["Fully custom design", "Any language", "Made to your occasion"] },
];

export const WHY = [
  { title: "Truly personal", text: "Every guest receives their own link that greets them by name." },
  { title: "Graceful animation", text: "Gentle motion and reveals that feel like opening a real card." },
  { title: "Share in a tap", text: "Send instantly on WhatsApp, Viber, Messenger or SMS — no printing, no delay." },
  { title: "Rooted in Nepal", text: "Designs inspired by our temples, mountains and traditions, in Nepali or English." },
  { title: "Always up to date", text: "Venue or time changed? We update it and every guest sees the latest details." },
  { title: "A lasting memory", text: "A beautiful keepsake your family can revisit for years." },
];

export const NAV = [
  { to: "/site", label: "Home" },
  { to: "/site/services", label: "Services" },
  { to: "/site/portfolio", label: "Portfolio" },
  { to: "/site/why-sainox", label: "Why SainoX" },
  { to: "/site/about", label: "About" },
  { to: "/site/our-team", label: "Team" },
  { to: "/site/contact", label: "Contact" },
] as const;

export const FAQ = [
  { q: ["price", "pricing", "cost", "rate", "charge", "how much"], a: "Pricing depends on the design, animations and number of guests. Share your occasion on WhatsApp or the contact form and we'll send a clear quote." },
  { q: ["service", "offer", "what do you", "category", "occasion"], a: "We create digital invitations for weddings, engagements, anniversaries, bratabandha, birthdays and other special occasions." },
  { q: ["time", "long", "days", "deliver", "ready"], a: "Delivery time depends on the design. Tell us your event date and we'll confirm a timeline that works for you." },
  { q: ["guest", "name", "personal", "link"], a: "Yes! Each guest can get their own invitation link that greets them by name." },
  { q: ["nepali", "language", "english"], a: "We design in Nepali, English or both." },
  { q: ["change", "edit", "update"], a: "If your venue or time changes, we can update the invitation and every guest sees the new details." },
  { q: ["contact", "whatsapp", "phone", "call", "email", "reach"], a: `Call or WhatsApp ${CONTACT.phoneIntl}, or email ${CONTACT.email}.` },
  { q: ["where", "location", "office", "address"], a: `We're based in ${CONTACT.location}, and work with families across Nepal and abroad.` },
];
