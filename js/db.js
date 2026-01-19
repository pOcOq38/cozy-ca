const DB_NAME = "cozyca_data";

const dummyData = [
  {
    id: 1,
    title: "Downtown Luxury Condo View",
    price: 2800,
    location: "Vancouver Downtown",
    type: "Condo",
    // 404 에러 방지: Unsplash Source URL 사용
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    lat: 49.2827,
    lng: -123.1207,
    beds: 1,
    baths: 1,
    desc: "Enjoy spectacular views from this modern downtown condo. Features include floor-to-ceiling windows, stainless steel appliances, and building amenities like a gym and pool.",
  },
  {
    id: 2,
    title: "Metrotown Station Room",
    price: 950,
    location: "Burnaby",
    type: "Room",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    lat: 49.226,
    lng: -123.0032,
    beds: 1,
    baths: 1,
    desc: "Cozy private room near Metrotown. 5 mins walk to Skytrain. Shared bathroom and kitchen. Perfect for students or young professionals.",
  },
  {
    id: 3,
    title: "Coquitlam Townhouse",
    price: 3500,
    location: "Coquitlam",
    type: "Townhouse",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    lat: 49.2838,
    lng: -122.7932,
    beds: 3,
    baths: 2,
    desc: "Spacious family townhouse in a quiet neighborhood. Close to parks and schools. Includes private garage and backyard.",
  },
  {
    id: 4,
    title: "UBC Campus Shared Room",
    price: 1200,
    location: "UBC",
    type: "Room",
    // 이 URL이 404가 났던 것으로 추정되어 안전한 링크로 교체
    image:
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    lat: 49.2606,
    lng: -123.246,
    beds: 1,
    baths: 1,
    desc: "Affordable shared room right on campus. Perfect for students. High-speed internet included.",
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
