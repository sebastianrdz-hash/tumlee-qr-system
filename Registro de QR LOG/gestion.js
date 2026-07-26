document.addEventListener("DOMContentLoaded", () => {
  // Gráfico de materias inscritas
  const ctx1 = document.getElementById('graficoMaterias')?.getContext('2d');
  if (ctx1) {
    new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Matemáticas', 'Física', 'Historia', 'Biología'],
        datasets: [{
          label: 'Avance',
          data: [25, 25, 30, 20],
          backgroundColor: ['#8e44ad', '#3498db', '#2ecc71', '#f1c40f'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Avance por Materia'
          }
        }
      }
    });
  }

  // Gráfico de calificaciones
  const ctx2 = document.getElementById('graficoCalificaciones')?.getContext('2d');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: ['Matemáticas', 'Física', 'Historia', 'Biología'],
        datasets: [{
          label: 'Calificación',
          data: [90, 85, 78, 92],
          backgroundColor: ['#9b59b6', '#2980b9', '#27ae60', '#f39c12']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Calificaciones de Juan Pérez'
          }
        }
      }
    });
  }

  // Asistencias por semana
  const ctx3 = document.getElementById('graficoAsistencias')?.getContext('2d');
  if (ctx3) {
    new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        datasets: [{
          label: 'Asistencias',
          data: [1, 1, 0, 1, 1],
          backgroundColor: '#4B0082'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Asistencia Semanal'
          }
        }
      }
    });
  }

  // Tareas entregadas por semana
  const ctx4 = document.getElementById('graficoTareas')?.getContext('2d');
  if (ctx4) {
    new Chart(ctx4, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Tareas Entregadas',
          data: [2, 3, 1, 4],
          fill: true,
          backgroundColor: 'rgba(75, 0, 130, 0.2)',
          borderColor: '#4B0082',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Tareas Entregadas por Semana'
          }
        }
      }
    });
  }

  // Mostrar imagen guardada en perfil si existe
  const imgPreview = document.getElementById('foto-perfil-preview');
  const inputFoto = document.getElementById('input-foto-perfil');

  if (imgPreview) {
    const imagenGuardada = localStorage.getItem('fotoPerfil');
    if (imagenGuardada) {
      imgPreview.src = imagenGuardada;
    }
  }

  inputFoto?.addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = function (event) {
        const dataUrl = event.target.result;
        imgPreview.src = dataUrl;
        localStorage.setItem('fotoPerfil', dataUrl);
      };
      lector.readAsDataURL(archivo);
    }
  });

 // Botón cerrar sesión (sin borrar la foto)
document.querySelector('.logout')?.addEventListener('click', () => {
  const foto = localStorage.getItem('fotoPerfil'); // Guardamos temporalmente la imagen
  localStorage.clear();                            // Limpiamos todo
  if (foto) localStorage.setItem('fotoPerfil', foto); // Restauramos solo la imagen
  window.location.href = 'login.html';
});


  // Mostrar panel correspondiente y ocultar los demás
  document.querySelectorAll('.action-buttons button[data-target]')?.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      document.querySelectorAll('section').forEach(panel => {
        panel.style.display = panel.id === target ? 'block' : 'none';
      });
    });
  });

  // Envío de justificación (demo)
  document.getElementById('submit-justificacion')?.addEventListener('click', () => {
    const motivo = document.getElementById('motivo')?.value.trim();
    const archivo = document.getElementById('archivo')?.files[0];

    if (motivo && archivo) {
      alert('Justificación enviada con éxito.');
      document.getElementById('form-justificacion').style.display = 'none';
      document.getElementById('motivo').value = '';
      document.getElementById('archivo').value = '';
    } else {
      alert('Completa todos los campos.');
    }
  });
});
