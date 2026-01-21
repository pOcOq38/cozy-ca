document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const bDateInput = document.getElementById("bDate");
    const pwInput = document.getElementById("password");
    const bDateError = document.getElementById("bDateError");
    const pwError = document.getElementById("pwError");

    const validateBirth = () => {
      const v = bDateInput.value;
      let msg = "";
      if (!v) msg = "Birth date is required.";
      else {
        const age = calAge(v);
        if (age < 18 || age > 120) msg = "Age must be between 18 and 120.";
      }

      if (msg) {
        bDateInput.classList.add("invalid");
        if (bDateError) bDateError.textContent = msg;
        return false;
      } else {
        bDateInput.classList.remove("invalid");
        if (bDateError) bDateError.textContent = "";
        return true;
      }
    };

    const validatePw = () => {
      const msg = isValidPw(pwInput.value);

      if (msg) {
        pwInput.classList.add("invalid");
        if (pwError) pwError.innerHTML = msg.split("\n").map((t) => `• ${t}`).join("<br>");
        return false;
      } else {
        pwInput.classList.remove("invalid");
        if (pwError) pwError.textContent = "";
        return true;
      }
    };

    bDateInput?.addEventListener("input", validateBirth);
    pwInput?.addEventListener("input", validatePw);

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fname = document.getElementById("fname").value;
      const lname = document.getElementById("lname").value;
      const bdate = bDateInput.value;
      const email = document.getElementById("email").value;
      const password = pwInput.value;

      const users = JSON.parse(localStorage.getItem("users")) || [];

      if (users.find((user) => user.email === email)) {
        alert("This email is already registered.");
        return;
      }

      const okBirth = validateBirth();
      const okPw = validatePw();
      if (!okBirth || !okPw) return;

      users.push({ fname, lname, bdate, email, password });
      localStorage.setItem("users", JSON.stringify(users));

      const now = Date.now();
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          fname: fname,
          lname: lname,
          email: email,
          bdate: bdate,
          loginAt: now,
          expiresAt: now + 60 * 60 * 1000,
        })
      );

      alert(`Welcome to CozyCA, ${fname}!`);
      window.location.href = "index.html";
    });
  }
});

function calAge(bdStr) {
  const today = new Date();
  const birthdate = new Date(bdStr);

  let age = today.getFullYear() - birthdate.getFullYear();
  const mon = today.getMonth() - birthdate.getMonth();

  if (mon < 0 || (mon === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

function isValidPw(password) {
  const errors = [];
  if (password.length < 6) errors.push("At least 6 characters");
  if (!/[a-zA-Z]/.test(password)) errors.push("At least one letter");
  if (!/[0-9]/.test(password)) errors.push("At least one number");
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push("At least one special character");
  return errors.length ? errors.join("\n") : "";
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      const now = Date.now();

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
        fname: user.fname,
        email: user.email,
        loginAt: now,
        expiresAt: now + 60 * 60 * 1000,
        })
      );

      alert(`Welcome, ${user.fname}`);
      window.location.href = "index.html";
    } else {
      alert("Invalid email or password.");
    }
  });
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
}

function logoutAndGoLogin(message) {
  localStorage.removeItem("currentUser");
  if (message) alert(message);
  window.location.href = "login.html";
}

function formatMs(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function mountSessionTimerUI() {
  const userMenu = document.querySelector(".session-box");
  if (!userMenu) return;

  const user = getCurrentUser();
  if (!user) return;

  const timerEl = document.createElement("div");
  timerEl.id = "sessionTimer";
  timerEl.style.display = "flex";
  timerEl.style.alignItems = "center";
  timerEl.style.gap = "10px";

  timerEl.innerHTML = `
    <span id="sessionTimeText" style="font-size:13px; color:#666; font-weight:600;"></span>
    <button id="btnExtendSession" class="btn-login" style="padding:6px 12px; border-radius:14px;">Extend</button>
  `;

  userMenu.appendChild(timerEl);

  const text = document.getElementById("sessionTimeText");
  const btn = document.getElementById("btnExtendSession");

  const tick = () => {
    const u = getCurrentUser();
    if (!u || !u.expiresAt) return;

    const now = Date.now();
    const remaining = u.expiresAt - now;
    const elapsed = now - (u.loginAt || now);

    if (remaining <= 0) {
      logoutAndGoLogin("Session expired. Please log in again.");
      return;
    }

    if (text) {
      text.textContent = `${formatMs(remaining)}`;
    }
  };

  btn?.addEventListener("click", () => {
    const u = getCurrentUser();
    if (!u) return;
    const now = Date.now();
    u.loginAt = u.loginAt || now;
    u.expiresAt = now + 60 * 60 * 1000;
    localStorage.setItem("currentUser", JSON.stringify(u));
    tick();
  });

  tick();
  setInterval(tick, 1000);
}

function enforceSessionOrRedirect() {
  const user = getCurrentUser();
  if (!user) return;

  if (!user.expiresAt) {
    const now = Date.now();
    user.loginAt = now;
    user.expiresAt = now + 60 * 60 * 1000;
    localStorage.setItem("currentUser", JSON.stringify(user));
    return;
  }

  if (Date.now() > user.expiresAt) {
    logoutAndGoLogin("Session expired. Please log in again.");
  }
}

