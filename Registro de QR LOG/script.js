document.addEventListener('DOMContentLoaded', () => {
  // DOM
  const btnScanQR      = document.getElementById('btn-scan-qr');
  const btnManual      = document.getElementById('btn-manual-entry');
  const btnExport      = document.getElementById('btn-export-excel');
  const btnClearAll    = document.getElementById('btn-clear-all');
  const btnSubmit      = document.getElementById('btn-submit-manual');
  const btnCancel      = document.getElementById('btn-cancel-manual');
  const qrReader       = document.getElementById('qr-reader');
  const manualForm     = document.getElementById('manual-form');
  const tablaBody      = document.getElementById('registros-body');
  const contador       = document.getElementById('registros-count');
  const deleteModal    = document.getElementById('delete-modal');
  const clearModal     = document.getElementById('clear-all-modal');
  const notification   = document.getElementById('notification');
  const photoFolder    = document.getElementById('photo-folder');

  let photoFiles  = {};
  let registros   = JSON.parse(localStorage.getItem('registrosAsistencia')) || [];
  let html5QrCode = null;
  let deleteId    = null;

  // Carga carpeta de fotos
  photoFolder.addEventListener('change', e => {
    photoFiles = {};
    for (const f of e.target.files) {
      photoFiles[f.name] = f;
    }
    showNotification('Fotos cargadas', 'success');
  });

  // Fecha && hora
  const formatDate = d => d.toLocaleDateString();
  const formatTime = d => d.toLocaleTimeString();

  // Guardado en local
  const save = () => localStorage.setItem('registrosAsistencia', JSON.stringify(registros));

  // Notificación
  function showNotification(msg, type='success') {
    notification.textContent = msg;
    notification.style.backgroundColor = 
      type === 'success' ? '#2ECC71' :
      type === 'warning' ? '#F1C40F' : '#E74C3C';
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 2000);
  }

  // Render tabla
  function render() {
    tablaBody.innerHTML = '';
    registros.forEach(r => {
      const tr = document.createElement('tr');
      const fotoName = `Foto${r.matricula}.png`;
      const fotoURL  = photoFiles[fotoName] ? URL.createObjectURL(photoFiles[fotoName]) : '';
      tr.innerHTML = `
        <td>${r.matricula}</td>
        <td>${r.nombre}</td>
        <td>${r.carrera}</td>
        <td>${r.evento}</td>
        <td>${r.fecha}</td>
        <td>${r.hora}</td>
        <td>${ fotoURL ? `<img src="${fotoURL}" alt="Foto">` : '' }</td>
        <td><button class="danger" data-id="${r.id}">🗑️</button></td>
      `;
      tablaBody.appendChild(tr);
    });
    tablaBody.querySelectorAll('button.danger').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteId = Number(btn.dataset.id);
        deleteModal.style.display = 'block';
      });
    });
    contador.textContent = registros.length;
  }

  // QR Scanner
  btnScanQR.addEventListener('click', () => {
    if (html5QrCode) {
      html5QrCode.stop().catch(()=>{});
      html5QrCode = null;
      qrReader.style.display = 'none';
      btnScanQR.textContent = 'Escanear Código QR';
    } else {
      manualForm.style.display = 'none';
      qrReader.style.display = 'block';
      btnScanQR.textContent = 'Detener Escáner';
      html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        onQRCodeSuccess
      ).catch(() => showNotification('Error al iniciar escáner','error'));
    }
  });

  // Al leer QR
  function onQRCodeSuccess(text) {
    try {
      const data = JSON.parse(text);
      if (registros.some(r => r.matricula === data.matricula)) {
        return showNotification('Registro duplicado','warning');
      }
      const now = new Date();
      registros.push({
        id:        Date.now(),
        matricula: data.matricula,
        nombre:    data.nombre,
        carrera:   data.carrera,
        evento:    data.evento,
        fecha:     formatDate(now),
        hora:      formatTime(now)
      });
      save();
      render();
      showNotification('Asistencia registrada');
      const fotoName = `Foto${data.matricula}.png`;
      if (photoFiles[fotoName]) {
        alert(`Foto detectada para matrícula ${data.matricula}`);
      }
    } catch {
      showNotification('QR inválido','error');
    }
  }

  // Manual entry
  btnManual.addEventListener('click', () => {
    qrReader.style.display = 'none';
    manualForm.style.display = 'block';
  });
  document.getElementById('btn-cancel-manual').addEventListener('click', () => {
    manualForm.style.display = 'none';
  });
  btnSubmit.addEventListener('click', () => {
    const m = +document.getElementById('m-matricula').value;
    const n = document.getElementById('m-nombre').value.trim();
    const c = document.getElementById('m-carrera').value.trim();
    const e = document.getElementById('m-evento').value.trim();
    if (!m||!n||!c||!e) return showNotification('Todos los campos son obligatorios','error');
    if (registros.some(r => r.matricula === m)) return showNotification('Duplicado','warning');
    const now = new Date();
    registros.push({
      id:        Date.now(),
      matricula: m,
      nombre:    n,
      carrera:   c,
      evento:    e,
      fecha:     formatDate(now),
      hora:      formatTime(now)
    });
    save(); render(); manualForm.style.display = 'none'; showNotification('Registro agregado');
  });

  // Exportar Excel
  btnExport.addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(registros);
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
    const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([wbout], { type:'application/octet-stream' }), 'registros_asistencia.xlsx');
  });

  // Borrar todos
  document.getElementById('confirm-clear-all').addEventListener('click', () => {
    registros = [];
    save(); render(); clearModal.style.display='none'; showNotification('Todos borrados');
  });
  document.getElementById('cancel-clear-all').addEventListener('click', () => clearModal.style.display='none');

  // Borrar uno
  document.getElementById('confirm-delete').addEventListener('click', () => {
    registros = registros.filter(r => r.id !== deleteId);
    save(); render(); deleteModal.style.display='none'; showNotification('Registro eliminado');
  });
  document.getElementById('cancel-delete').addEventListener('click', () => deleteModal.style.display='none');

  // Cerrar modales
  document.querySelectorAll('.close').forEach(btn => {
    btn.onclick = () => { deleteModal.style.display='none'; clearModal.style.display='none'; };
  });

  // Init
  render();
});

