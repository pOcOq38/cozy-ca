//sign up
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const users = JSON.parse(localStorage.getItem("users")) || [];

      if (users.find((user) => user.email === email)) {
        alert("This email is already registered.");
        return;
      }

      users.push({ name, email, password });
      localStorage.setItem("users", JSON.stringify(users));

      localStorage.setItem(
        "currentUser",
        JSON.stringify({ name: name, email: email })
      );

      alert(`Welcome to CozyCA, ${name}!`);
      window.location.href = "index.html";
    });
  }
});

//login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ name: user.name, email: user.email })
      );
      alert(`Welcome, ${user.name}`);
      window.location.href = "index.html";
    } else {
      alert("Invalid email or password.");
    }
  });
}
