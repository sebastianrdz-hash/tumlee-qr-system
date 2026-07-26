// script.js – QR + Foto + descarga emparejada
document.addEventListener('DOMContentLoaded', function() {
  // Referencias DOM
  const btnGenerar    = document.getElementById('generar');
  const btnDownload   = document.getElementById('download-qr');
  const photoInput    = document.getElementById('photo-input');
  const startCamera   = document.getElementById('start-camera');
  const video         = document.getElementById('video');
  const capturePhoto  = document.getElementById('capture-photo');
  const photoPreview  = document.getElementById('photo-preview');
  const fileInput     = document.getElementById('file-input');
  const procesarExcel = document.getElementById('procesar-excel');
  const qrContainer   = document.getElementById('qrcode');
  const jsonContainer = document.getElementById('json-data');
  const resultBox     = document.getElementById('result-container');

  let cameraStream = null;
  let capturedPhotoBlob = null;

  // Formatea fecha y hora
  function formatoHora(d) {
    const hh = String(d.getHours()).padStart(2,'0'),
          mm = String(d.getMinutes()).padStart(2,'0'),
          ss = String(d.getSeconds()).padStart(2,'0');
    return hh + mm + ss;
  }
  function formatoFecha(d) {
    const dd = String(d.getDate()).padStart(2,'0'),
          MM = String(d.getMonth()+1).padStart(2,'0'),
          aa = String(d.getFullYear()).slice(-2);
    return dd + MM + aa;
  }

  // Muestra QR+foto y datos
  function showResult(datos, photoFile) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('result-item');
    itemDiv.dataset.matricula = datos.matricula;
    itemDiv.dataset.nombre    = datos.nombre.replace(/\s+/g,'_');

    // JSON
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(datos, null, 2);
    jsonContainer.appendChild(pre);

    // QR
    const qrDiv = document.createElement('div');
    new QRCode(qrDiv, {
      text: JSON.stringify(datos),
      width: 200, height: 200,
      colorDark: '#000', colorLight: '#fff',
      correctLevel: QRCode.CorrectLevel.M
    });
    itemDiv.appendChild(qrDiv);

    // Foto
    if (photoFile) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(photoFile);
      itemDiv.photoFile = photoFile;
      itemDiv.appendChild(img);
    }

    qrContainer.appendChild(itemDiv);
  }

  // Valida campos individuales
  function validarCampos() {
    let ok = true;
    ['matricula','nombre','carrera','evento'].forEach(id => {
      const val = document.getElementById(id).value.trim();
      const al  = document.getElementById(id+'-alert');
      if (!val || (id==='matricula' && isNaN(val))) {
        al.style.display = 'block'; ok = false;
      } else al.style.display = 'none';
    });
    if (!capturedPhotoBlob && !photoInput.files[0]) {
      document.getElementById('photo-alert').style.display = 'block';
      ok = false;
    } else {
      document.getElementById('photo-alert').style.display = 'none';
    }
    return ok;
  }

  // Manejo de carga de archivo de foto
  photoInput.addEventListener('change', () => {
    if (photoInput.files[0]) {
      capturedPhotoBlob = photoInput.files[0];
      photoPreview.src = URL.createObjectURL(capturedPhotoBlob);
      photoPreview.style.display = 'block';
    }
  });

  // Iniciar cámara
  startCamera.addEventListener('click', async () => {
    if (!cameraStream) {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = cameraStream;
        video.style.display = 'block';
        capturePhoto.style.display = 'inline-block';
      } catch (err) {
        alert('No se pudo acceder a la cámara');
      }
    }
  });

  // Capturar foto
  capturePhoto.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      capturedPhotoBlob = blob;
      photoPreview.src = URL.createObjectURL(blob);
      photoPreview.style.display = 'block';
    });
    // detener cámara
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
    video.style.display = 'none';
    capturePhoto.style.display = 'none';
  });

  // Generación individual
  btnGenerar.addEventListener('click', () => {
    if (!validarCampos()) return;
    qrContainer.innerHTML   = '';
    jsonContainer.innerHTML = '';

    const mat = parseInt(document.getElementById('matricula').value,10),
          nom = document.getElementById('nombre').value.trim(),
          car = document.getElementById('carrera').value.trim(),
          cls = document.getElementById('evento').value.trim(),
          now = new Date();

    const datos = {
      matricula: mat,
      nombre: nom,
      carrera: car,
      nombre_de_la_clase: cls,
      fecha: formatoFecha(now),
      hora: formatoHora(now)
    };

    showResult(datos, capturedPhotoBlob);
    resultBox.style.display = 'block';
  });

  // Descargar QR + foto
  btnDownload.addEventListener('click', () => {
    const items = qrContainer.querySelectorAll('.result-item');
    items.forEach(item => {
      const mat = item.dataset.matricula;
      // QR
      const canvas = item.querySelector('canvas');
      if (canvas) {
        canvas.toBlob(blob => {
          const link = document.createElement('a');
          link.download = `QR${mat}.png`;
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(link.href);
          document.body.removeChild(link);
        });
      }
      // Foto
      if (item.photoFile) {
        const file = item.photoFile;
        const ext  = file.name ? file.name.split('.').pop() : 'png';
        const link = document.createElement('a');
        link.download = `Foto${mat}.${ext}`;
        link.href = URL.createObjectURL(file);
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      }
    });
  });

  // Carga masiva desde Excel (sin foto)
  procesarExcel.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) { alert('Selecciona un Excel'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const wb   = XLSX.read(new Uint8Array(e.target.result), { type:'array' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      qrContainer.innerHTML   = '';
      jsonContainer.innerHTML = '';
      rows.forEach(r => {
        const cls = r.evento || r['nombre de la clase'] || r['nombre_de_la_clase'];
        if (r.matricula && r.nombre && r.carrera && cls) {
          const now   = new Date();
          const datos = {
            matricula: r.matricula,
            nombre:    r.nombre,
            carrera:   r.carrera,
            nombre_de_la_clase: cls,
            fecha:     formatoFecha(now),
            hora:      formatoHora(now)
          };
          showResult(datos, null);
        }
      });
      resultBox.style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
  });
});
