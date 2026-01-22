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
  
  document.addEventListener("DOMContentLoaded", () => {
    const user = ensureSession();
    if (!user) return;
  
    document.getElementById("btnAdd").addEventListener("click", () => {
      window.location.href = "flat-form.html";
    });
  
  
    const listEl = document.getElementById("myList");
    const all = db.getAll() || [];
    const mine = all.filter((x) => x.ownerEmail && x.ownerEmail === user.email);
  
    listEl.innerHTML = "";
  
    if (mine.length === 0) {
      listEl.innerHTML =
        '<p style="text-align:center; padding:20px; color:#888;">No flats yet. Click "Add Flat".</p>';
      return;
    }
  
    mine.forEach((flat) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.height = "170px";
  
      card.innerHTML = `
        <div class="card-img" style="background-image:url('${flat.image || "images/placeholder.png"}');"></div>
        <div class="card-info">
          <p class="price">$${flat.rentPrice ?? flat.price} <span class="period">/ Month</span></p>
          <h3>${flat.title || `${flat.streetNumber} ${flat.streetName}`}</h3>
          <p class="location"><i class="fa-solid fa-map-pin"></i> ${flat.city || flat.location || ""}</p>
          <p class="specs">${flat.areaSize ?? ""} sqft • ${flat.hasAC ? "AC" : "No AC"} • ${flat.yearBuilt ?? ""}</p>
          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="btn-login" style="padding:8px 12px;" data-edit="${flat.id}">Edit</button>
            <button class="btn-login" style="padding:8px 12px; background:#dc2626;" data-del="${flat.id}">Delete</button>
          </div>
        </div>
      `;
  
      card.querySelector("[data-edit]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `flat-form.html?id=${flat.id}`;
      });
  
      card.querySelector("[data-del]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm("Delete this listing?")) return;
        db.delete(flat.id);
        window.location.reload();
      });
  
      listEl.appendChild(card);
    });
  });
  