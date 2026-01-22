const DB_NAME = "cozyca_data";

const dummyData = [
  {
    id: 1,
    title: "Downtown Luxury Condo View",
    price: 2800,
    location: "Downtown Vancouver",
    type: "Condo",
    image: "images/photo1.jpeg",
    lat: 49.2827,
    lng: -123.1207,
    beds: 1,
    baths: 1,
    desc: "Enjoy spectacular views from this modern downtown condo. Features include floor-to-ceiling windows, stainless steel appliances, and building amenities like a gym and pool.",
  },
  {
    id: 2,
    title: "Kitsilano Beachside Apartment",
    price: 950,
    location: "Kitsilano",
    type: "Room",
    image: "images/photo2.jpeg",
    lat: 49.2684,
    lng: -123.1586,
    beds: 1,
    baths: 1,
    desc: "Cozy private room near Kitsilano. 5 mins walk to Skytrain. Shared bathroom and kitchen. Perfect for students or young professionals.",
  },
  {
    id: 3,
    title: "Strathcona Townhouse",
    price: 3500,
    location: "Strathcona",
    type: "Townhouse",
    image: "images/photo3.jpeg",
    lat: 49.2766,
    lng: -123.0900,
    beds: 3,
    baths: 2,
    desc: "Spacious family townhouse in a quiet neighborhood. Close to parks and schools. Includes private garage and backyard.",
  },
  {
    id: 4,
    title: "Mount Pleasant Cozy Suite",
    price: 2400,
    location: "Mount Pleasant",
    type: "Room",
    image: "images/photo4.jpeg",
    lat: 49.2607,
    lng: -123.1008,
    beds: 4,
    baths: 4,
    desc: "Affordable suite. Perfect for family. High-speed internet included.",
  },
];

const db = {
  init: () => {
    if (!localStorage.getItem(DB_NAME)) {
      localStorage.setItem(DB_NAME, JSON.stringify(dummyData));
    }
  },
  getAll: () => {
    db.init();
    return JSON.parse(localStorage.getItem(DB_NAME));
  },
  get: (id) => {
    const data = db.getAll();
    return data.find((item) => item.id == id);
  },
  add: (newItem) => {
    const data = db.getAll();
    const item = {
      id: Date.now(),
      ...newItem,
    };
    data.push(item);
    localStorage.setItem(DB_NAME, JSON.stringify(data));
  },
  update: (id, patch) => {
    const data = db.getAll();
    const idx = data.findIndex((item) => item.id == id);
    if (idx === -1) return null;
  
    const updated = {
      ...data[idx],
      ...patch,
      id: data[idx].id,
      updatedAt: Date.now(),
    };
  
    data[idx] = updated;
    localStorage.setItem(DB_NAME, JSON.stringify(data));
    return updated;
  },
  delete: (id) => {
    const data = db.getAll();
    const filtered = data.filter((item) => item.id != id);
    localStorage.setItem(DB_NAME, JSON.stringify(filtered));
  },
};

const bookmarkManager = {
  _key: () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const email = user?.email;
    return email ? `bookmarks_${email}` : null;
  },

  getAll: () => {
    const key = bookmarkManager._key();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  has: (id) => {
    const list = bookmarkManager.getAll();
    return list.includes(Number(id));
  },

  toggle: (id) => {
    const key = bookmarkManager._key();
    if (!key) return false;

    let list = JSON.parse(localStorage.getItem(key)) || [];
    const numericId = Number(id);

    if (list.includes(numericId)) {
      list = list.filter((item) => item !== numericId);
    } else {
      list.push(numericId);
    }

    localStorage.setItem(key, JSON.stringify(list));
    return list.includes(numericId);
  },

  clear: () => {
    const key = bookmarkManager._key();
    if (!key) return;
    localStorage.removeItem(key);
  },
};

