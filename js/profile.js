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
  
    const form = document.getElementById("profileForm");
    const fnameEl = document.getElementById("fname");
    const lnameEl = document.getElementById("lname");
    const emailEl = document.getElementById("email");
    const bdateEl = document.getElementById("bdate");
    const btnBack = document.getElementById("btnBack");
  
console.log("user.bdate :: ", user.bdate);

    emailEl.value = user.email || "";
    fnameEl.value = user.fname || "";
    lnameEl.value = user.lname || "";
    bdateEl.value = user.bdate || "";
  
    btnBack.addEventListener("click", () => (window.location.href = "index.html"));
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const fname = fnameEl.value.trim();
      const lname = lnameEl.value.trim();
      const email = emailEl.value.trim();
  
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const idx = users.findIndex((u) => u.email === email);
  
      if (idx === -1) {
        alert("User record not found.");
        return;
      }
  
      users[idx].fname = fname;
      users[idx].lname = lname;
      localStorage.setItem("users", JSON.stringify(users));
  
      const updatedCurrent = { ...user, fname, lname };
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrent));
  
      alert("Profile updated.");
      window.location.href = "index.html";
    });
  });
  