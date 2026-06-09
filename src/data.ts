export const MENU_DATA = {
  starters: [
    { category: 'Salad', items: [ { name: 'Onion Salad', price: 30 }, { name: 'Chilly Fry', price: 25 }, { name: 'Green Salad', price: 60 }, { name: 'Punjabi Salad', price: 80 } ] },
    { category: 'Veg Starter', items: [ { name: 'Crispy Corn', price: 210 }, { name: 'Veg Manchurian', price: 220 }, { name: 'Veg Kothe', price: 240 }, { name: 'Veg Lollipop', price: 230 } ] },
    { category: 'Paneer Starter', items: [ { name: 'Chilly Paneer', price: 240 }, { name: 'Shezwan Paneer', price: 280 }, { name: 'Paneer Shangai', price: 280 }, { name: 'Paneer Menthai', price: 290 } ] },
    { category: 'Kebabs', items: [ { name: 'Hara Bhara Kebab', price: 210 }, { name: 'Dahi Kebab', price: 230 }, { name: 'Corn Malai Kebab', price: 275 }, { name: 'Veg Burasi Kebab', price: 290 } ] },
    { category: 'Tikkas', items: [ { name: 'Gobhi Tikka', price: 220 }, { name: 'Mushroom Tikka', price: 255 }, { name: 'Broccoli Malai Tikka', price: 255 }, { name: 'Paneer Pahadi Tikka', price: 255 }, { name: 'Paneer Achari Tikka', price: 255 }, { name: 'Paneer Malai Tikka', price: 280 }, { name: 'Amritsari Tikka', price: 290 }, { name: 'Cheese Pudina Tikka', price: 320 }, { name: 'Pepper Paneer Tikka', price: 320 } ] },
    { category: 'Rolls', items: [ { name: 'Veg Spring Roll', price: 220 }, { name: 'Cheese Corn Roll', price: 220 }, { name: 'Cheese Cigar Roll', price: 240 }, { name: 'Cheese Balls', price: 240 }, { name: 'Mexican Roll', price: 295 } ] }
  ],
  main: [
    { category: 'Veg Course', items: [ { name: 'Aloo Mutter', price: 160 }, { name: 'Jeera Aloo', price: 150 }, { name: 'Sev Tomato', price: 160 }, { name: 'Gobhi Masala', price: 160 }, { name: 'Bhindi Masala', price: 170 }, { name: 'Chana Masala', price: 170 }, { name: 'Mix Veg', price: 180 }, { name: 'Aloo do Pyaja', price: 190 }, { name: 'Bhindi Kurmuri', price: 190 }, { name: 'Veg Jalfrezi', price: 220 }, { name: 'Kashmiri Dum Aloo', price: 220 }, { name: 'Tawa Veg', price: 275 }, { name: 'Green Peas Kaju Masala', price: 275 }, { name: 'Kaju Masala', price: 280 }, { name: 'Mushroom Masala', price: 280 } ] },
    { category: 'Paneer Course', items: [ { name: 'Palak Paneer', price: 200 }, { name: 'Mutter Paneer', price: 200 }, { name: 'Butter Paneer Masala', price: 225 }, { name: 'Shahi Paneer', price: 225 }, { name: 'Paneer Bhurji', price: 260 }, { name: 'Paneer Punjabi', price: 260 }, { name: 'Kadai Paneer', price: 260 }, { name: 'Paneer Lavabdar', price: 260 }, { name: 'Paneer Rajasthani', price: 260 }, { name: 'Cheese B.P.M.', price: 280 }, { name: 'Paneer Tikka Masala', price: 280 }, { name: 'Kaju Paneer', price: 280 }, { name: 'Paneer Taka Tak', price: 280 }, { name: 'Paneer Angara', price: 280 } ] },
    { category: 'Kofta / Curry', items: [ { name: 'Veg Kofta', price: 195 }, { name: 'Malai Kofta', price: 220 }, { name: 'Nargis Kofta', price: 240 }, { name: 'Cheese Kofta', price: 260 }, { name: 'Navratan Curry', price: 225 }, { name: 'Kaju Curry', price: 225 } ] },
    { category: 'Dal', items: [ { name: 'Dal Fry', price: 140 }, { name: 'Dal Tadka', price: 155 }, { name: 'Dal Butter Fry', price: 180 }, { name: 'Dal Handi', price: 180 }, { name: 'Dal Makhani', price: 210 } ] },
    { category: 'Dahi / Raita', items: [ { name: 'Butter Milk', price: 30 }, { name: 'Dahi', price: 80 }, { name: 'Bundi Raita', price: 100 }, { name: 'Veg Raita', price: 100 }, { name: 'Fruit Raita', price: 140 } ] }
  ],
  breads: [
    { category: 'Chapati / Roti', items: [ { name: 'Plain Chapati', price: 12, desc: 'Soft whole wheat chapati, freshly made on tawa' }, { name: 'Butter Chapati', price: 15, desc: 'Freshly made chapati with a dollop of butter' }, { name: 'Tawa Roti Plain/Butter', price: '16 / 18' }, { name: 'Tandoori Roti Plain/Butter', price: '18 / 20' }, { name: 'Missi Roti', price: 40 }, { name: 'Lachha Paratha', price: 45 }, { name: 'Pudhina Paratha', price: 60 }, { name: 'Lal Mirch Paratha', price: 60 }, { name: 'Butter Nan', price: 70 }, { name: 'Garlic Nan', price: 90 }, { name: 'Cheese Garlic Nan', price: 125 }, { name: 'Cheese Paratha', price: 100 }, { name: 'Aloo Paratha', price: 80 }, { name: 'Paneer Paratha', price: 95 } ] },
    { category: 'Rice', items: [ { name: 'Rice Plain', price: 110 }, { name: 'Rice Jeera Fry', price: 130 }, { name: 'Butter Khichadi', price: 190 }, { name: 'Indori Khichadi (with Raita & Papad)', price: 220 }, { name: 'Veg Pulav', price: 210 }, { name: 'Kashmiri Pulav', price: 250 }, { name: 'Veg Biryani (with Raita & Papad)', price: 240 }, { name: 'Hyderabadi Biryani (with Raita & Papad)', price: 240 }, { name: 'Veg Fried Rice', price: 210 }, { name: 'Veg Shezwan Fried Rice', price: 250 } ] }
  ],
  platters: [
    { category: 'Platters (Serves 2-3)', items: [ { name: 'Veg Platter', desc: 'Crispy Corn, Veg Pakoda, Veg Crispy, Veg Shole', price: 425 }, { name: 'Sizzler Platter', desc: 'Veg Cutlet, French Fries, Chinese Vegetables', price: 485 }, { name: 'Kabab Platter', desc: 'Hara Bhara Kabab, Dahi Kabab, Corn Malai Kebab', price: 485 }, { name: 'Chinese Platter', desc: 'Chilly Paneer, Munchurian, Noodles, Fried Rice', price: 425 }, { name: 'Tandoor Platter', desc: 'Paneer Tikka, Veg Shole, Achari Aloo, Nurani Gobhi', price: 485 } ] },
    { category: 'Soup', items: [ { name: 'Tomato Soup', price: 120 }, { name: 'Sweet Corn Soup', price: 120 }, { name: 'Lemon Coriander Soup', price: 120 }, { name: 'Hot & Sour Soup', price: 130 }, { name: 'Veg Manchow Soup', price: 130 }, { name: 'Cream of Mushroom Soup', price: 160 }, { name: 'Khow Suey Soup', price: 160 } ] },
    { category: 'Munchies', items: [ { name: 'Papad Roast / Fry', price: 25 }, { name: 'Papad Masala', price: 40 }, { name: 'Shahi Papad', price: 75 }, { name: 'Peanut / Aloo Chat', price: 150 }, { name: 'French Fries Plain', price: 140 }, { name: 'Peri-Peri Fries', price: 160 }, { name: 'French Fries Loaded', price: 180 }, { name: 'Chana Roast', price: 160 }, { name: 'Chinese Bhel', price: 180 }, { name: 'Chole Bhature', price: 190 } ] }
  ],
  continental: [
    { category: 'Noodles', items: [ { name: 'Veg Noodles', price: 170 }, { name: 'Veg Chowmin', price: 180 }, { name: 'Veg Hakka Noodles', price: 180 }, { name: 'Burnt Garlic Noodles', price: 210 }, { name: 'Veg Shezwan Noodles', price: 220 }, { name: 'American Choupsey', price: 280 } ] },
    { category: 'Continental', items: [ { name: 'Plain Garlic Bread', price: 125 }, { name: 'Cheese Chilly Garlic Bread', price: 155 }, { name: 'Corn Cheese Garlic Bread', price: 155 }, { name: 'Margherita Pizza', price: 245 }, { name: 'Greek Pizza', price: 275 }, { name: '3 Cheese Pizza', price: 295 }, { name: 'Peppy Paneer Pizza', price: 295 }, { name: 'Alfredo Pasta', price: 275 }, { name: 'Arrabiata Pasta', price: 275 }, { name: 'Pasta in Pesto Sauce', price: 275 }, { name: 'Classic Lasagna', price: 345 }, { name: 'Baked Veg', price: 345 }, { name: 'Mac & Cheese', price: 295 } ] }
  ],
  drinks: [
    { category: 'Mocktails — Classic', items: [ { name: 'Virgin Mojito', price: 110 }, { name: 'Masala Lemonade', price: 120 }, { name: 'Kaccha Aam', price: 120 }, { name: 'Blue Sea', price: 150 }, { name: 'Pina Colada', price: 150 }, { name: 'Sweet Sunrise', price: 150 }, { name: 'Kesariya Adrak', price: 150 } ] },
    { category: 'Mocktails — Supreme', items: [ { name: 'Virgin Mary', price: 115 }, { name: 'Cindrella', price: 125 }, { name: 'Deep Sea', price: 135 }, { name: 'Blue Ice', price: 145 }, { name: 'Green Lemonade', price: 145 }, { name: 'Butter Beer', price: 185 }, { name: 'Coconut Mounteen', price: 195 }, { name: 'Red Velvet', price: 225 }, { name: 'Hot Not Today (Sugar-Free)', price: 225 }, { name: 'Love Bite', price: 225 }, { name: 'Better Half', price: 245 } ] },
    { category: 'Shakes', items: [ { name: 'Banana Shake', price: 120 }, { name: 'Apple Shake', price: 120 }, { name: 'Mango Shake', price: 120 }, { name: 'Butter Scotch Shake', price: 130 }, { name: 'Oreo Shake', price: 130 }, { name: 'Kitkat Shake', price: 130 }, { name: 'Oreo Nutella Shake', price: 150 }, { name: 'Paan Shake', price: 150 }, { name: 'Gulkand Shake', price: 150 }, { name: 'Kaju-Badaam Shake', price: 160 } ] }
  ],
  extras: [
    { category: 'Indori Morning Specials', items: [ { name: 'Poha', desc: 'Indore\'s iconic breakfast', price: 30 }, { name: 'Kachori', desc: 'Crispy, freshly fried', price: 30 }, { name: 'Poha + Kachori Combo', desc: 'The ultimate Indori breakfast', price: 60 }, { name: 'Jalebi (Fresh & Hot)', desc: 'Crispy golden spirals', price: 40 } ] }
  ],
  desserts: [
    { category: 'Ice Cream', items: [ { name: 'Vanilla Ice Cream', desc: 'Classic creamy vanilla scoop', price: 80 }, { name: 'Chocolate Ice Cream', desc: 'Rich Belgian chocolate scoop', price: 90 }, { name: 'Mango Ice Cream', desc: 'Fresh Alphonso mango flavour', price: 90 }, { name: 'Butterscotch Ice Cream', desc: 'Golden butterscotch with caramel crunch', price: 90 }, { name: 'Mixed Fruit Ice Cream', desc: 'Assorted seasonal fruits blended in cream', price: 100 }, { name: 'Chocolate Brownie with Ice Cream', desc: 'Warm fudgy brownie topped with vanilla scoop', price: 160 } ] },
    { category: 'Cakes & Sweets', items: [ { name: 'Fresh Cream Cake (Slice)', desc: 'Light sponge with fresh cream & fruit topping', price: 120 }, { name: 'Black Forest Cake (Slice)', desc: 'Classic chocolate cherry cream cake', price: 130 }, { name: 'Chocolate Truffle Cake (Slice)', desc: 'Decadent dark chocolate ganache cake', price: 140 }, { name: 'Gulab Jamun (2 pc)', desc: 'Soft golden dumplings in rose-cardamom syrup', price: 60 }, { name: 'Rasgulla (2 pc)', desc: 'Soft chenna balls in light sugar syrup', price: 60 }, { name: 'Gajar Ka Halwa', desc: 'Slow-cooked carrot halwa with dry fruits', price: 100 }, { name: 'Moong Dal Halwa', desc: 'Traditional rich moong dal halwa', price: 110 } ] }
  ],
  events: [
    { category: 'Birthday & Celebration Packages', items: [ { name: 'Rooftop Birthday Party', desc: 'Exclusive rooftop terrace decorated with lights, balloons & birthday setup for your special celebration. Contact us to enquire & book.', price: 0 }, { name: 'Open Garden Birthday Event', desc: 'Beautiful open-air garden area perfect for birthday parties, anniversaries & family gatherings. Enquire for custom packages.', price: 0 }, { name: 'Private Hall Booking', desc: 'Fully air-conditioned private dining hall available for corporate events, family functions & celebrations. Catering included.', price: 0 }, { name: 'Romantic Candlelight Dinner', desc: 'Exclusive candle-lit table setting on the rooftop or garden for couples. Pre-booking required.', price: 0 } ] }
  ]
};

export const REVIEWS = [
  { initial: 'S', name: 'Shardul Badave', meta: 'Local Guide · 120 reviews', bg: 'bg-gradient-to-br from-saffron to-maroon', text: 'Excellent halt for travelers. Wholesome meal, quick bites, desserts — this place has you covered. The paneer dishes are outstanding and the service is quick even during rush hours.' },
  { initial: 'V', name: 'Vedant Parkhe', meta: 'Regular Visitor', bg: 'bg-gradient-to-br from-green-500 to-green-700', text: 'Good food, great service, nice staff, clean and hygienic place. The Indori Khichadi is a must-try — served with raita and papad, it\'s a complete meal. Highly recommend for families!' },
  { initial: 'D', name: 'D Jas', meta: 'Verified Diner', bg: 'bg-gradient-to-br from-gold to-saffron', text: 'The Paneer Butter Masala was rich and creamy, with soft, flavorful paneer. The Butter Nan was perfectly soft. Amazing ambiance and the mocktails are refreshing. Will definitely come back!' }
];

export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
  dalMakhani: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  poha: 'https://i.pinimg.com/originals/ce/91/a8/ce91a8fe2c53baf261a8381b5c2377e4.jpg',
  kachori: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80',
  paneerButterMasala: 'https://i.pinimg.com/originals/10/21/5f/10215f3e50a42ab56806c96a62c805fe.jpg',
  jalebi: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
  thali: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  drink: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
  fries: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80',
  manchurian: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
  kebab: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  rolls: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80',
  soup: 'https://images.unsplash.com/photo-1547592165-e1d17fed6006?w=800&q=80',
  breads: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=800&q=80',
  rice: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  noodles: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&q=80',
  shake: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
  curry: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
  choleBhature: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&q=80',
  garlicBread: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1563379971899-660589a01cc3?w=800&q=80'
};

export function getItemImage(name: string, category: string) {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();
  
  if (lowerName.includes('poha')) return IMAGES.poha;
  if (lowerName.includes('kachori')) return IMAGES.kachori;
  if (lowerName.includes('jalebi')) return IMAGES.jalebi;
  if (lowerName.includes('chole bhature')) return IMAGES.choleBhature;
  if (lowerName.includes('paneer')) return IMAGES.paneerButterMasala;
  if (lowerName.includes('dal')) return IMAGES.dalMakhani;
  if (lowerName.includes('garlic bread')) return IMAGES.garlicBread;
  if (lowerName.includes('pizza')) return IMAGES.pizza;
  if (lowerName.includes('pasta') || lowerName.includes('lasagna') || lowerName.includes('mac & cheese')) return IMAGES.pasta;
  if (lowerName.includes('noodle') || lowerName.includes('chowmin') || lowerName.includes('choupsey') || lowerName.includes('bhel')) return IMAGES.noodles;
  if (lowerCat.includes('soup')) return IMAGES.soup;
  if (lowerName.includes('manchurian') || lowerName.includes('kothe') || lowerName.includes('lollipop') || lowerName.includes('corn')) return IMAGES.manchurian;
  if (lowerName.includes('kebab') || lowerName.includes('tikka')) return IMAGES.kebab;
  if (lowerName.includes('roll') || lowerName.includes('balls')) return IMAGES.rolls;
  if (lowerCat.includes('salad')) return IMAGES.salad;
  if (lowerCat.includes('rice') || lowerName.includes('rice') || lowerName.includes('biryani') || lowerName.includes('pulav') || lowerName.includes('khichadi')) return IMAGES.rice;
  if (lowerCat.includes('breads') || lowerName.includes('roti') || lowerName.includes('nan') || lowerName.includes('paratha')) return IMAGES.breads;
  if (lowerCat.includes('shakes') || lowerName.includes('shake')) return IMAGES.shake;
  if (lowerCat.includes('mocktail') || lowerCat.includes('drink') || lowerName.includes('mojito') || lowerName.includes('lemonade') || lowerName.includes('cola') || lowerName.includes('sunset') || lowerName.includes('adrak') || lowerName.includes('mary') || lowerName.includes('cindrella') || lowerName.includes('sea') || lowerName.includes('ice') || lowerName.includes('beer') || lowerName.includes('mountain') || lowerName.includes('velvet') || lowerName.includes('bite') || lowerName.includes('half') || lowerName.includes('butter milk')) return IMAGES.drink;
  if (lowerName.includes('fries') || lowerName.includes('chat') || lowerName.includes('papad') || lowerCat.includes('munchies')) return IMAGES.fries;
  if (lowerCat.includes('veg course') || lowerCat.includes('kofta') || lowerName.includes('aloo') || lowerName.includes('mutter') || lowerName.includes('masala') || lowerName.includes('sev') || lowerName.includes('bhindi') || lowerName.includes('veg') || lowerName.includes('kofta') || lowerName.includes('curry')) return IMAGES.curry;
  
  return IMAGES.thali;
}

export const ROOMS_DATA = [
  {
    id: "deluxe",
    name: "Kings Deluxe Room",
    price: 2600,
    size: "100 sq. ft.",
    bed: "1 Double Bed",
    guests: "2 Adults + 1 Child",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80"
    ],
    amenities: ["Air Conditioning", "Flat Screen TV", "Complimentary Wi-Fi", "Seating Area", "Attached Bathroom", "Intercom", "24/7 Room Service"],
    description: "Elegant and cozy room perfect for business travelers and couples. Equipped with all modern amenities for a comfortable stay."
  },
  {
    id: "superior",
    name: "Kings Superior Room",
    price: 3200,
    size: "120 sq. ft.",
    bed: "1 King Bed",
    guests: "2 Adults + 2 Children",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
      "https://images.unsplash.com/photo-1611891405120-449e0839e440?w=800&q=80",
      "https://images.unsplash.com/photo-1505693395321-883724634266?w=800&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"
    ],
    amenities: ["Air Conditioning", "Flat Screen TV", "Complimentary Wi-Fi", "Room Heater", "Seating Area", "Electric Kettle", "Attached Premium Bathroom", "24/7 Room Service"],
    description: "Slightly more spacious room offering superior comfort, including a room heater for winter months and premium toiletries."
  },
  {
    id: "executive-suite",
    name: "Kings Executive Suite",
    price: 4500,
    size: "180 sq. ft.",
    bed: "1 King Bed + Sofa Bed",
    guests: "3 Adults or 2 Adults + 2 Children",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
      "https://images.unsplash.com/photo-1556784344-ad913c73cfc4?w=800&q=80"
    ],
    amenities: ["Air Conditioning", "Flat Screen Smart TV", "High-speed Wi-Fi", "Room Heater", "Plush Lounge Sofa", "Mini Refrigerator", "Electric Kettle / Tea Maker", "Premium Bathroom with Bathtub", "24/7 Priority Room Service"],
    description: "Our signature luxury suite, featuring a separate living space, a mini-fridge, and priority guest services for a premium experience."
  }
];

