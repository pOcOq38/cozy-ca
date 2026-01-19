document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  loadHouseData();
});

function checkLoginStatus() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userMenuContainer = document.querySelector(".user-menu");

  if (!userMenuContainer) return;

  if (currentUser) {
    userMenuContainer.innerHTML = `
          <button class="btn-icon-nav" onclick="alert('Bookmark page coming soon!')" title="My Bookmarks">
              <i class="fa-regular fa-bookmark"></i>
          </button>
          <div class="user-profile">
              <i class="fa-solid fa-circle-user"></i>
              <span>${currentUser.name}</span>
          </div>
          <button class="btn-logout" id="btn-logout-action" title="Log out">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
      `;

    const btnLogout = document.getElementById("btn-logout-action");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
          localStorage.removeItem("currentUser");
          window.location.href = "index.html";
        }
      });
    }
  } else {
    userMenuContainer.innerHTML = `
          <button class="btn-login" onclick="window.location.href='login.html'">Log in</button>
      `;
  }
}

async function loadHouseData() {
  const listSection = document.querySelector(".list-section");
  if (!listSection) return;

  listSection.innerHTML =
    '<p style="padding:20px; text-align:center;">Loading homes...</p>';

  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let houses = [];
    if (typeof db !== "undefined") {
      houses = db.getAll();
    }

    renderHouseList(houses);
    initMap(houses);
  } catch (error) {
    console.error(error);
    if (listSection) listSection.innerHTML = "<p>Error loading data.</p>";
  }
}

function renderHouseList(items) {
  const listSection = document.querySelector(".list-section");
  if (!listSection) return;

  listSection.innerHTML = "";

  if (items.length === 0) {
    listSection.innerHTML =
      '<p style="text-align:center; padding:20px; color:#888;">No homes found.</p>';
    return;
  }

  items.forEach((house) => {
    const isBookmarked = bookmarkManager.has(house.id);
    const activeClass = isBookmarked ? "active" : "";
    const iconClass = isBookmarked ? "fa-solid" : "fa-regular";

    const cardHTML = `
          <div class="card" onclick="location.href='detail.html?id=${
            house.id
          }'">
              <button class="btn-bookmark-card ${activeClass}" 
                      onclick="toggleCardBookmark(event, '${house.id}')">
                  <i class="${iconClass} fa-bookmark"></i>
              </button>
              <div class="card-img" style="background-image: url('${
                house.image || "https://via.placeholder.com/300"
              }');"></div>
              <div class="card-info">
                  <p class="price">$${
                    house.price
                  } <span class="period">/ Month</span></p>
                  <h3>${house.title}</h3>
                  <p class="location"><i class="fa-solid fa-map-pin"></i> ${
                    house.location
                  }</p>
                  <p class="specs">${house.beds || 1} Bed • ${
      house.baths || 1
    } Bath</p>
              </div>
          </div>
      `;
    listSection.insertAdjacentHTML("beforeend", cardHTML);
  });
}

function toggleCardBookmark(event, id) {
  event.stopPropagation();
  const isActive = bookmarkManager.toggle(id);
  const btn = event.currentTarget;
  const icon = btn.querySelector("i");

  if (isActive) {
    btn.classList.add("active");
    icon.classList.replace("fa-regular", "fa-solid");
  } else {
    btn.classList.remove("active");
    icon.classList.replace("fa-solid", "fa-regular");
  }
}

function initMap(houses) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  var map = L.map("map").setView([49.2827, -123.1207], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  houses.forEach((house) => {
    if (house.lat && house.lng) {
      L.marker([house.lat, house.lng])
        .addTo(map)
        .bindPopup(`<b>${house.title}</b><br>$${house.price}`);
    }
  });
}
