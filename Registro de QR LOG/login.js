document.addEventListener("DOMContentLoaded", () => {
  // Mostrar imagen guardada si existe en el login
  const avatar = document.getElementById("login-avatar");
  const avatarGuardado = localStorage.getItem("fotoPerfil");
  if (avatarGuardado && avatar) {
    avatar.src = avatarGuardado;
  }

  const boton = document.getElementById("btn-login");

  boton.addEventListener("click", () => {
    const email = document.getElementById("correo").value.trim().toLowerCase();
    const clave = document.getElementById("clave").value.trim();
    const error = document.getElementById("login-error");

    if (!email.endsWith("@uach.mx")) {
      error.innerText = "El correo debe terminar en @uach.mx";
      error.style.display = "block";
      return;
    }

    // Simulación simple
    if (email.startsWith("p") && clave === "admin123") {
      localStorage.setItem("usuarioTipo", "admin");
      window.location.href = "index.html";
    } else if (email.startsWith("a") && clave === "user123") {
      localStorage.setItem("usuarioTipo", "alumno");
      window.location.href = "gestion.html";
    } else {
      error.innerText = "Correo o contraseña incorrectos";
      error.style.display = "block";
    }
  });
});
