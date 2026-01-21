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
  
    document.getElementById("btnBack").addEventListener("click", () => {
      window.location.href = "index.html";
    });
  
    const listEl = document.getElementById("bookmarkList");
    const bookmarkedIds = bookmarkManager.getAll();
    const all = db.getAll() || [];
    const items = all.filter((x) => bookmarkedIds.includes(Number(x.id)));
  
    listEl.innerHTML = "";
  
    if (items.length === 0) {
      listEl.innerHTML =
        '<p style="text-align:center; padding:20px; color:#888;">No bookmarks yet.</p>';
      return;
    }
  
    items.forEach((house) => {
      const card = document.createElement("div");
      card.className = "card";
      card.onclick = () => (window.location.href = `detail.html?id=${house.id}`);
  
      card.innerHTML = `
        <button class="btn-bookmark-card active" data-bm="${house.id}">
          <i class="fa-solid fa-bookmark"></i>
        </button>
  
        <div class="card-img" style="background-image:url('${house.image || "https://via.placeholder.com/300"}');"></div>
  
        <div class="card-info">
          <p class="price">$${house.rentPrice ?? house.price} <span class="period">/ Month</span></p>
          <h3>${house.title}</h3>
          <p class="location"><i class="fa-solid fa-map-pin"></i> ${house.location || house.city || ""}</p>
          <p class="specs">${house.beds || 1} Bed • ${house.baths || 1} Bath</p>
        </div>
      `;
  
      card.querySelector("[data-bm]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        bookmarkManager.toggle(house.id);
        card.remove();
        if (listEl.children.length === 0) {
          listEl.innerHTML =
            '<p style="text-align:center; padding:20px; color:#888;">No bookmarks yet.</p>';
        }
      });
  
      listEl.appendChild(card);
    });
  });
  