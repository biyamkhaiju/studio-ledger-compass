// Sample invitations shown in the portfolio. Names are fictional demo content.
export type Demo = { slug: string; title: string; category: string; nepali: string; hosts: string; date: string; venue: string; message: string };

export const DEMOS: Demo[] = [
  { slug: "wedding", title: "Royal Newari Wedding", category: "Wedding", nepali: "शुभ विवाह", hosts: "Aarav & Sita", date: "Sunday, 14 February", venue: "Bhaktapur Durbar Square", message: "With the blessings of our elders, we warmly invite you to celebrate our wedding." },
  { slug: "bratabandha", title: "Sacred Bratabandha", category: "Bratabandha", nepali: "व्रतबन्ध", hosts: "Chi. Kriti", date: "Friday, 6 March", venue: "Changunarayan Temple", message: "Please grace the sacred thread ceremony of our son with your presence and blessings." },
  { slug: "anniversary", title: "Silver Anniversary", category: "Anniversary", nepali: "रजत वार्षिकोत्सव", hosts: "Ram & Gita", date: "Saturday, 18 April", venue: "Hotel Heritage, Bhaktapur", message: "Twenty-five years of love — join us as we celebrate together." },
  { slug: "birthday", title: "First Birthday", category: "Birthday", nepali: "जन्मदिन", hosts: "Little Aayu", date: "Monday, 11 May", venue: "Katunje, Bhaktapur", message: "Our little one turns one! Come celebrate with cake, laughter and love." },
];
