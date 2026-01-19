document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  const house = db.get(id);

  if (!house) {
    alert("This property no longer exists.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("d-title").innerText = house.title;
  document.getElementById("d-price").innerText = `$${house.price}`;
  document.getElementById(
    "d-location"
  ).innerHTML = `<i class="fa-solid fa-map-pin"></i> ${house.location}`;
  document.getElementById("d-desc").innerText =
    house.desc || "No description provided.";
  document.getElementById("d-image").src =
    house.image || "https://via.placeholder.com/800x400";
  document.getElementById("d-beds").innerText = `${house.beds || 1} Bed`;
  document.getElementById("d-baths").innerText = `${house.baths || 1} Bath`;

  if (typeof checkLoginStatus === "function") {
    checkLoginStatus();
  }

  const btnBookmark = document.getElementById("btn-bookmark-detail");
  const iconBookmark = btnBookmark.querySelector("i");

  if (bookmarkManager.has(id)) {
    btnBookmark.classList.add("active");
    iconBookmark.classList.replace("fa-regular", "fa-solid");
  }

  btnBookmark.addEventListener("click", () => {
    const isActive = bookmarkManager.toggle(id);
    if (isActive) {
      btnBookmark.classList.add("active");
      iconBookmark.classList.replace("fa-regular", "fa-solid");
    } else {
      btnBookmark.classList.remove("active");
      iconBookmark.classList.replace("fa-solid", "fa-regular");
    }
  });

  const lat = house.lat || 49.2827;
  const lng = house.lng || -123.1207;

  const mapContainer = document.getElementById("detail-map");
  if (mapContainer) {
    var map = L.map("detail-map").setView([lat, lng], 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<b>${house.title}</b><br>$${house.price}`)
      .openPopup();
  }

  const btnDelete = document.getElementById("btn-delete");
  if (btnDelete) {
    btnDelete.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this listing?")) {
        db.delete(id);
        alert("Deleted successfully.");
        window.location.href = "index.html";
      }
    });
  }

  const btnEdit = document.getElementById("btn-edit");
  if (btnEdit) {
    btnEdit.addEventListener("click", () => {
      alert("Edit page not implemented yet!");
    });
  }
});
