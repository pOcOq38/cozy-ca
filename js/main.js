let allHouses = [];

document.addEventListener("DOMContentLoaded", () => {
  enforceSessionOrRedirect();
  checkLoginStatus();
  mountSessionTimerUI();
  setupSearchAndFilters();
  loadHouseData();
  setupProfileDropdown();
});


function setupSearchAndFilters() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  const locationSelect = document.getElementById("locationSelect");
  const bedsSelect = document.getElementById("bedsSelect");
  const bathsSelect = document.getElementById("bathsSelect");
  const minPrice = document.getElementById("minPrice");
  const maxPrice = document.getElementById("maxPrice");

  if (!searchInput) return;

  const run = () => applyFilters();

  searchInput.addEventListener("input", run);

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      run();
    });
  }

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run();
  });

  [locationSelect, bedsSelect, bathsSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", run);
  });

  [minPrice, maxPrice].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", run);
    el.addEventListener("change", run);
  });
}



function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const btnSignIn = document.getElementById("btnSignIn");
  const userControls = document.getElementById("userControls");
  const profileName = document.getElementById("profileName");

  if (!btnSignIn || !userControls) return;

  if (!user) {
    btnSignIn.style.display = "inline-flex";
    userControls.style.display = "none";

    btnSignIn.onclick = () => (window.location.href = "login.html");
    return;
  }

  btnSignIn.style.display = "none";
  userControls.style.display = "flex";

  if (profileName) profileName.textContent = user.fname || user.name || "User";
}


async function loadHouseData() {
  const listSection = document.querySelector(".list-section");
  if (!listSection) return;

  listSection.innerHTML =
    '<p style="padding:20px; text-align:center;">Loading homes...</p>';

  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    allHouses = (typeof db !== "undefined") ? db.getAll() : [];

    renderHouseList(allHouses, { showEmptyMessage: false });
    initMap(allHouses);
  } catch (error) {
    console.error(error);
    if (listSection) listSection.innerHTML = "<p>Error loading data.</p>";
  }
}

function matchWord(title, keyword){
  if(!keyword) return true;
  const normalized = String(title || "").toLowerCase();
  const words = normalized.split(/[\s,-]+/);
  return words.some((w) => w.startsWith(keyword));
}

function applyFilters() {
  const location = document.getElementById("locationSelect")?.value || "";
  const bedsVal = document.getElementById("bedsSelect")?.value || "";
  const bathsVal = document.getElementById("bathsSelect")?.value || "";

  const minStr = document.getElementById("minPrice")?.value || "";
  const maxStr = document.getElementById("maxPrice")?.value || "";
  const min = minStr === "" ? null : Number(minStr);
  const max = maxStr === "" ? null : Number(maxStr);

  const filtered = allHouses.filter((h) => {
    if (location) {
      const a = String(h.location || "").trim().toLowerCase();
      const b = String(location).trim().toLowerCase();
      if (a !== b) return false;
    }

    const price = Number(String(h.price).replace(/[^0-9.]/g, ""));
    if (min !== null && Number.isFinite(min) && price < min) return false;
    if (max !== null && Number.isFinite(max) && price > max) return false;
    if (bedsVal) {
      const beds = Number(h.beds);
      if (!Number.isFinite(beds)) return false;

      if (bedsVal === "4+") {
        if (beds < 4) return false;
      } else {
        const targetBeds = Number(bedsVal);
        if (beds !== targetBeds) return false;
      }
    }

    if (bathsVal) {
      const baths = Number(h.baths);
      if (!Number.isFinite(baths)) return false;

      if (bathsVal === "3+") {
        if (baths < 3) return false;
      } else {
        const targetBaths = Number(bathsVal);
        if (baths !== targetBaths) return false;
      }
    }

    return true;
  });

  const anyFilterUsed =
    Boolean(location) ||
    Boolean(bedsVal) ||
    Boolean(bathsVal) ||
    minStr !== "" ||
    maxStr !== "";

  renderHouseList(filtered, { showEmptyMessage: anyFilterUsed });
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
                house.image || "images/placeholder.png"
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

  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.email) {
    alert("Please log in to use bookmarks.");
    window.location.href = "login.html";
    return;
  }

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


let mainMap = null;
let markerLayer = null;


function initMap(houses) {

  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  if (!mainMap) {
    mainMap = L.map(mapContainer).setView([49.2827, -123.1207], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(mainMap);

    markerLayer = L.layerGroup().addTo(mainMap);
    setTimeout(() => mainMap.invalidateSize(), 0);

  }

  markerLayer.clearLayers();

  houses.forEach((house) => {
    if (house.lat && house.lng) {
      L.marker([house.lat, house.lng])
        .addTo(markerLayer)
        .bindPopup(`<b>${house.title}</b><br>$${house.price}`);
    }
  });
}
function setupProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  const trigger = document.getElementById("profileTrigger");
  const menu = document.getElementById("profileMenu");
  const btnEdit = document.getElementById("btnProfileEdit");
  const btnLogout = document.getElementById("btnLogout");
  const btnMyFlats = document.getElementById("btnMyFlats");

  if (!dropdown || !trigger || !menu) return;

  const isOpen = () => dropdown.classList.contains("open");

  const close = () => {
    dropdown.classList.remove("open");
    menu.style.display = "none";
    trigger.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    dropdown.classList.add("open");
    menu.style.display = "block";
    trigger.setAttribute("aria-expanded", "true");
  };

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) close();
    else open();
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener(
    "click",
    (e) => {
      if (!dropdown.contains(e.target)) close();
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  btnEdit?.addEventListener("click", () => {
    close();
    requirePasswordConfirm(() => {
      window.location.href = "profile.html";
    });
  });
  
  btnMyFlats?.addEventListener("click", () => {
    close();
    requirePasswordConfirm(() => {
      window.location.href = "my-flats.html";
    });
  });
  

  btnLogout?.addEventListener("click", () => {
    close();
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    }
  });
}

document.getElementById("btnBookmark")?.addEventListener("click", () => {
  window.location.href = "bookmarks.html";
});