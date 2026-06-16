export interface Post {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  location: string;
  readTime: string;
  saves: number;
  timeAgo: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  imageUrl: string;
  body: string;
  featured?: boolean;
}

export const POSTS: Post[] = [
  {
    id: '1',
    category: 'MOUNTAINS',
    title: 'Wonder of the Shelf',
    subtitle: 'Thoughts about mountains',
    location: 'Stellenbosch, South Africa',
    readTime: '12 min read',
    saves: 612,
    timeAgo: '2 hours ago',
    author: {
      name: 'Sarah Whitmore',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    body: `The Stellenbosch mountains rise in quiet layers against the morning sky, each ridge a deeper shade of violet as the sun climbs. Walking here, you understand why ancient peoples built their sanctuaries in high places — not to be closer to gods, but to feel the peculiar smallness that actually frees you.\n\nThe air carries the faint mineral scent of granite warmed by afternoon light. Hikers speak in lower voices on the ridge. It is not reverence exactly, more like the instinctive courtesy you show when entering a room where something important is happening.\n\nLooking south from the summit, the ocean glitters forty kilometres away. The valley between is a patchwork of vineyards, their rows running in precise parallels that contrast with every ragged edge above them. The tension between the cultivated and the wild is what makes this landscape so peculiarly South African — everywhere here, order and wilderness negotiate at close quarters.`,
    featured: true,
  },
  {
    id: '2',
    category: 'SOUTH AFRICAN MOUNTAINS',
    title: 'Drakensberg Mountains, South Africa',
    location: 'KwaZulu-Natal',
    readTime: '15 min read',
    saves: 553,
    timeAgo: '1 day ago',
    author: {
      name: 'James Ndlovu',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    body: `The Drakensberg — "Dragon's Mountain" in Afrikaans — earns its name from the serrated basalt escarpment that runs 1,000 kilometres along the eastern edge of the South African interior plateau. The San people painted these cliffs for thousands of years; more than 40,000 individual figures survive in rock shelters across the range.\n\nClimbing from the Golden Gate Highlands into the high Berg, the vegetation shifts in clear bands: afromontane forest gives way to grassland, then to the bleak high plateau that feels more like Scotland than Africa. The change happens quickly enough to notice, slowly enough to inhabit.\n\nThe Amphitheatre at the Royal Natal section is the range at its most theatrical — a five-kilometre cliff face rising 1,200 metres, the Tugela River dropping off its rim in a series of falls that rank among the world's tallest. In winter the upper falls freeze into a chandelier of ice visible from the valley floor.`,
  },
  {
    id: '3',
    category: 'SOUTH AFRICAN MOUNTAINS',
    title: 'Franschhoek Mountains, South Africa',
    location: 'Western Cape',
    readTime: '10 min read',
    saves: 204,
    timeAgo: '3 days ago',
    author: {
      name: 'Elise du Plessis',
      avatarUrl: 'https://i.pravatar.cc/150?img=32',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    body: `The Franschhoek valley sits inside a horseshoe of mountains so symmetrical it looks designed. French Huguenot refugees arrived here in 1688 and named the valley — "French Corner" — after themselves, planting vineyards on slopes that were already ancient when they got here.\n\nThe Franschhoek Pass that climbs out of the valley to the east is one of the oldest mountain passes in the country. Walking it early, before the tourist traffic starts, you get the road almost to yourself — just the sound of wind in the proteas and a view back over the valley that explains why people stayed.\n\nThe mountains here are Wemmershoek sandstone, hundreds of millions of years old, folded and compressed until the layering inside them runs nearly vertical. Afternoon light catches these layers and makes the cliffs glow amber for about twenty minutes before the sun drops behind the western range. Regular visitors plan their days around this moment.`,
  },
  {
    id: '4',
    category: 'COASTAL',
    title: 'Mountain Creampike',
    location: 'New Campton',
    readTime: '8 min read',
    saves: 786,
    timeAgo: '25 sec ago',
    author: {
      name: 'Ted Milano',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=800&q=80',
    body: `Where the mountain meets the ocean at New Campton, the landscape refuses to decide what it is. The cliffs drop straight into the water, and the waves have carved caves and arches into the base that you can only see from a kayak or, in flat conditions, a careful swim.\n\nThe coastal fynbos here is unlike anything found inland — salt-tolerant restios and succulents that have adapted to the spray and the wind. In spring the clifftop turns pink with Erica and red with Watsonia, a colour combination that looks chosen rather than accidental.\n\nThe mountain above the coast rises to just under a thousand metres, enough to catch clouds that the coastal plain never sees. On clear days the summit is visible from far out to sea, and ships have used it as a navigation marker for centuries. The locals call it the Creampike for the pale quartzite band that rings its upper third — a geological stripe that catches the light like a crown.`,
  },
];

export const CATEGORIES = ['All', 'Mountains', 'Coastal', 'Forest', 'Desert'];
