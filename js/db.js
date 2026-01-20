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
  delete: (id) => {
    const data = db.getAll();
    const filtered = data.filter((item) => item.id != id);
    localStorage.setItem(DB_NAME, JSON.stringify(filtered));
  },
};

const bookmarkManager = {
  getAll: () => {
    return JSON.parse(localStorage.getItem("bookmarks")) || [];
  },
  has: (id) => {
    const list = bookmarkManager.getAll();
    return list.includes(Number(id));
  },
  toggle: (id) => {
    let list = bookmarkManager.getAll();
    const numericId = Number(id);
    if (list.includes(numericId)) {
      list = list.filter((item) => item !== numericId);
    } else {
      list.push(numericId);
    }
    localStorage.setItem("bookmarks", JSON.stringify(list));
    return list.includes(numericId);
  },
};
