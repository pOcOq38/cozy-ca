document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
});

function checkLoginStatus() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const loginBtn = document.querySelector(".btn-login");

  if (currentUser) {
    loginBtn.innerHTML = '<i class="fa-solid fa-user"></i> ' + currentUser.name;
    loginBtn.style.background = "#d97706";
    loginBtn.onclick = () => {
      if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("currentUser");
        window.location.reload();
      }
    };
  } else {
    loginBtn.innerText = "Log in";
    loginBtn.style.background = "#222";

    loginBtn.onclick = () => {
      window.location.href = "login.html";
    };
  }
}
