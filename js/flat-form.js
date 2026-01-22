function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  }
  
  function ensureSession() {
    const u = getCurrentUser();
    if (!u) {
      window.location.href = "login.html";
      return null;
    }
    if (u.expiresAt && Date.now() > u.expiresAt) {
      localStorage.removeItem("currentUser");
      alert("Session expired. Please log in again.");
      window.location.href = "login.html";
      return null;
    }
    return u;
  }
  
  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const user = ensureSession();
    if (!user) return;
  
    const id = qs("id");
    const editing = Boolean(id);
  
    const pageTitle = document.getElementById("pageTitle");
    const btnDelete = document.getElementById("btnDelete");
    const btnBack = document.getElementById("btnBack");
    const form = document.getElementById("flatForm");
  
    const title = document.getElementById("title");
    const city = document.getElementById("city");
    const streetName = document.getElementById("streetName");
    const streetNumber = document.getElementById("streetNumber");
    const beds = document.getElementById("beds");
    const baths = document.getElementById("baths");

    const hasAC = document.getElementById("hasAC");
    const yearBuilt = document.getElementById("yearBuilt");
    const rentPrice = document.getElementById("rentPrice");
    const dateAvailable = document.getElementById("dateAvailable");
    const image = document.getElementById("image");
    const desc = document.getElementById("desc");
    const lat = document.getElementById("lat");
    const lng = document.getElementById("lng");
  
    let existing = null;
    
  
    if (editing) {
      pageTitle.textContent = "Edit Flat";
      existing = db.get(id);
  
      if (!existing) {
        alert("Listing not found.");
        window.location.href = "my-flats.html";
        return;
      }
  
      if (!existing.ownerEmail || existing.ownerEmail !== user.email) {
        alert("You can only edit your own listings.");
        window.location.href = "my-flats.html";
        return;
      }
  
      title.value = existing.title || "";
      city.value = existing.city || "";
      streetName.value = existing.streetName || "";
      streetNumber.value = existing.streetNumber ?? "";
      beds.value = existing.beds ?? "";
      baths.value = existing.baths ?? "";
      hasAC.value = String(Boolean(existing.hasAC));
      yearBuilt.value = existing.yearBuilt ?? "";
      rentPrice.value = existing.rentPrice ?? existing.price ?? "";
      dateAvailable.value = existing.dateAvailable || "";
      image.value = existing.image || "";
      desc.value = existing.desc || "";
      lat.value = existing.lat ?? "";
      lng.value = existing.lng ?? "";
  
      btnDelete.style.display = "block";
    }
  
    btnBack.addEventListener("click", () => {
      window.location.href = "my-flats.html";
    });
  
    const map = L.map("flatMap").setView(
      [
        Number(lat.value) || 49.275,
        Number(lng.value) || -123.12
      ],
      13
    );
  
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
  
    let marker = null;
  
    if (lat.value && lng.value) {
      marker = L.marker([Number(lat.value), Number(lng.value)]).addTo(map);
    }
  
    map.on("click", (e) => {
      lat.value = e.latlng.lat.toFixed(6);
      lng.value = e.latlng.lng.toFixed(6);
  
      if (marker) marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      else marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    });
  
    btnDelete.addEventListener("click", () => {
      if (!confirm("Delete this listing?")) return;
      db.delete(id);
      alert("Deleted.");
      window.location.href = "my-flats.html";
    });
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      if (!lat.value || !lng.value) {
        alert("Click on the map to set lat/lng.");
        return;
      }
  
      const payload = {
        city: city.value.trim(),
        streetName: streetName.value.trim(),
        streetNumber: Number(streetNumber.value),
        hasAC: hasAC.value === "true",
        yearBuilt: Number(yearBuilt.value),
        rentPrice: Number(rentPrice.value),
        price: Number(rentPrice.value),
        dateAvailable: dateAvailable.value,
        image: image.value.trim(),
        desc: desc.value.trim(),
        lat: Number(lat.value),
        lng: Number(lng.value),
        ownerEmail: user.email,
        title: title.value.trim(),
        location: city.value.trim(),
        beds: existing?.beds ?? 1,
        baths: existing?.baths ?? 1,
        type: existing?.type ?? "Flat",
      };
  
      if (editing) {
        db.update(id, payload);
        alert("Updated.");
      } else {
        db.add(payload);
        alert("Added.");
      }
  
      window.location.href = "my-flats.html";
    });
  });
  