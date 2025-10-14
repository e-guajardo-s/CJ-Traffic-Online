document.addEventListener('DOMContentLoaded', () => {
  // Protección
  const email = sessionStorage.getItem('cj_user_email');
  if (!email) { window.location.replace('./index.html'); return; }
  document.getElementById('user-email')?.append(document.createTextNode(email));
  document.getElementById('logout')?.addEventListener('click', () => {
    sessionStorage.removeItem('cj_user_email'); window.location.replace('./index.html');
  });

  // Mapa
  const map = L.map('map', { zoomControl: true, attributionControl: false })
               .setView([-33.4489, -70.6693], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20 }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20 }).addTo(map);

  // Ubicarme
  let userMarker, accuracyCircle;
  function showLocation(latlng, accuracy = 30) {
    if (userMarker) map.removeLayer(userMarker);
    if (accuracyCircle) map.removeLayer(accuracyCircle);
    userMarker = L.marker(latlng).addTo(map);
    accuracyCircle = L.circle(latlng, { radius: accuracy, color: '#2a7fff', fillColor: '#2a7fff', fillOpacity: 0.15, weight: 2 }).addTo(map);
    map.setView(latlng, Math.max(map.getZoom(), 16), { animate: true });
  }
  map.on('locationfound', (e) => showLocation(e.latlng, e.accuracy));
  map.on('locationerror', () => alert('No se pudo obtener tu ubicación.'));
  const LocateControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: () => {
      const c = L.DomUtil.create('div', 'leaflet-bar');
      const a = L.DomUtil.create('a', '', c);
      a.href = '#'; a.title = 'Ubicarme'; a.setAttribute('aria-label', 'Ubicarme');
      a.innerHTML = '⌖'; a.style.fontSize = '18px'; a.style.lineHeight = '26px'; a.style.textAlign = 'center';
      L.DomEvent.on(a, 'click', L.DomEvent.stop).on(a, 'click', () => map.locate({ enableHighAccuracy: true }));
      return c;
    }
  });
  map.addControl(new LocateControl());

  // Overlay sobre el mapa
  const mapMenu = document.getElementById('mapMenu');
  const mapMenuClose = document.getElementById('mapMenuClose');
  const mapMenuBody = mapMenu?.querySelector('.map-menu-body');
  const openMapMenu = (html) => {
    if (mapMenuBody) mapMenuBody.innerHTML = html;
    mapMenu?.classList.add('show');
    mapMenu?.setAttribute('aria-hidden', 'false');
  };
  const closeMapMenu = () => {
    mapMenu?.classList.remove('show');
    mapMenu?.setAttribute('aria-hidden', 'true');
  };
  mapMenu?.addEventListener('click', (e) => e.stopPropagation()); // no cerrar al hacer clic dentro
  mapMenuClose?.addEventListener('click', closeMapMenu);
  map.on('click', closeMapMenu); // clic en mapa cierra overlay

  // Menú lateral que EMPUJA el mapa
  const toggle = document.getElementById('menuToggle');
  const panel = document.getElementById('sideMenu');
  const mainEl = document.querySelector('.app-main');
  const setSideOpen = (open) => {
    panel?.classList.toggle('open', open);
    toggle?.classList.toggle('open', open);
    mainEl?.classList.toggle('shifted', open);
    toggle?.setAttribute('aria-expanded', String(open));
    panel?.setAttribute('aria-hidden', String(!open));
    setTimeout(() => map.invalidateSize(), 260);
  };
  toggle?.addEventListener('click', () => setSideOpen(!panel?.classList.contains('open')));

  // Círculo verde y acción al clic
  const punto = L.latLng(-33.36425, -70.514444);
  const greenCircle = L.circle(punto, { radius: 25, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.35, weight: 2 }).addTo(map);

  greenCircle.on('click', (e) => {
    L.DomEvent.stopPropagation(e);

    // Overlay con tabla y círculos verdes centrados
    const html = `
      <div class="signal-table-wrapper">
      <div class="signal-overall-status">Estado: Operativo</div>
      <p>
        <strong>ID:</strong> #34<br>
        <strong>UOCT:</strong> J055331<br>
        <strong>RED:</strong> J055<br>
        <strong>CONTROLADOR:</strong> Siemens ST950
      </p>
    <div class="signal-table-wrapper">
      <table class="signal-table">
        <thead>
          <tr>
            <th>Controlador</th>
            <th>Alimentación</th>
            <th>UPS</th>
            <th>Luces</th>
            <th>UOCT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="status-dot"></span></td>
            <td><span class="status-dot"></span></td>
            <td><span class="status-dot"></span></td>
            <td><span class="status-dot"></span></td>
            <td><span class="status-dot"></span></td>
          </tr>
        </tbody>
      </table>

      <div class="signal-status-box">El semaforo esta funcionando en condiciones optimas</div>

      <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
        <button id="centrarPunto" class="btn-out" type="button">Centrar</button>
        <button id="reportarFallaBtn" class="btn-out btn-danger" type="button">Reportar Falla</button>
        <button id="verModificarHojaBtn" class="btn-out" type="button" style="background:#6c757d; color:#fff; border-color:#6c757d;">
          Ver/Modificar Hoja Diaria
        </button>
      </div>
    </div>
  `;
    openMapMenu(html);

    setTimeout(() => {
      document.getElementById('centrarPunto')
        ?.addEventListener('click', () => map.setView(punto, 18, { animate: true }));

      const fallaBtn = document.getElementById('reportarFallaBtn');
      fallaBtn?.addEventListener('click', () => {
        if (document.getElementById('fallaModal')) return; // evitar duplicado
        const modal = document.createElement('div');
        modal.id = 'fallaModal';
        modal.className = 'falla-modal';
        // aquí iría la construcción del modal de falla si aplica
      });

      // NUEVO: abrir modal Hoja Diaria (PDFs)
      const hojaBtn = document.getElementById('verModificarHojaBtn');
      hojaBtn?.addEventListener('click', () => openHojaDiariaModal('34'));

      function openHojaDiariaModal(signalId){
        // elimina instancia previa
        document.getElementById('hojaModal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'hojaModal';
        modal.className = 'falla-modal';
        modal.innerHTML = `
          <div class="falla-modal-box" role="dialog" aria-modal="true" aria-labelledby="hojaTitle">
            <div class="falla-modal-header" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <h3 id="hojaTitle" style="margin:0;">Hoja Diaria - #${signalId}</h3>
              <button type="button" class="btn-out btn-danger btn-close" aria-label="Cerrar">&times;</button>
            </div>
            <div class="falla-modal-content">
              <div class="uploader" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px;">
                <label class="btn-out" for="pdfInput">Seleccionar PDF(s)</label>
                <input id="pdfInput" type="file" accept="application/pdf" multiple style="display:none;" />
                <button id="uploadBtn" class="btn-out">Subir</button>
              </div>

              <div class="pdf-list-empty" style="margin-top:10px;">No hay PDFs publicados.</div>
              <ul class="pdf-list" style="margin-top:10px; list-style:none; padding:0;"></ul>
            </div>
            <div class="falla-modal-footer" style="margin-top:12px; display:flex; justify-content:flex-end; gap:8px;">
              <button type="button" class="btn-out" id="closeHoja">Cerrar</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.addEventListener('click', e => { if (e.target === modal) close(); });
        modal.querySelector('.btn-close')?.addEventListener('click', close);
        modal.querySelector('#closeHoja')?.addEventListener('click', close);

        const key = `hojaDiariaDocs_${signalId}`;
        const load = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
        const save = (arr) => localStorage.setItem(key, JSON.stringify(arr));

        const listEl = modal.querySelector('.pdf-list');
        const emptyEl = modal.querySelector('.pdf-list-empty');

        function render(){
          const items = load();
          if (!items.length){
            emptyEl.style.display = '';
            listEl.innerHTML = '';
            return;
          }
          emptyEl.style.display = 'none';
          listEl.innerHTML = items.map((it, idx) => `
            <li data-idx="${idx}" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:6px;">
              <div style="display:flex; flex-direction:column;">
                <strong>${it.name}</strong>
                <small>${(it.size/1024).toFixed(1)} KB · ${new Date(it.addedAt).toLocaleString()}</small>
              </div>
              <div style="display:flex; gap:6px;">
                <a class="btn-out" href="${it.dataUrl}" download="${it.name}" target="_blank" rel="noopener">Descargar</a>
                <button class="btn-out btn-danger del">Eliminar</button>
              </div>
            </li>
          `).join('');
        }

        render();

        listEl.addEventListener('click', e => {
          const delBtn = e.target.closest('.del');
          if (!delBtn) return;
          const li = delBtn.closest('li');
          const idx = parseInt(li.dataset.idx, 10);
          const arr = load();
          arr.splice(idx, 1);
          save(arr);
          render();
        });

        const input = modal.querySelector('#pdfInput');
        const uploadBtn = modal.querySelector('#uploadBtn');
        let selectedFiles = [];

        input.addEventListener('change', () => {
          selectedFiles = Array.from(input.files || []);
        });

        uploadBtn.addEventListener('click', async () => {
          if (!selectedFiles.length){ alert('Selecciona uno o más PDFs.'); return; }
          const arr = load();
          for (const file of selectedFiles){
            if (file.type !== 'application/pdf') continue;
            const dataUrl = await fileToDataUrl(file);
            arr.push({ name: file.name, size: file.size, addedAt: Date.now(), dataUrl });
          }
          save(arr);
          selectedFiles = [];
          input.value = '';
          render();
        });

        function fileToDataUrl(file){
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
      }
    }, 0);
  });

  // Estados por capa (ejemplo básico)
  const layersByState = {
    operativo: L.layerGroup().addTo(map),
    fuera: L.layerGroup().addTo(map),
    anomalia: L.layerGroup().addTo(map),   // nuevo grupo
    mant: L.layerGroup().addTo(map)
  };
  // Mueve el círculo verde a la capa "operativo"
  layersByState.operativo.addLayer(greenCircle);

  // Contadores demo (ajusta cuando tengas datos reales)
  function updateStats() {
    const op = layersByState.operativo.getLayers().length;
    const fs = layersByState.fuera.getLayers().length;
    const an = layersByState.anomalia.getLayers().length; // nuevo conteo
    const mt = layersByState.mant.getLayers().length;
    const alerta = 0;      // placeholder si lo usas
    const total = op + fs + an + mt + alerta;

    document.getElementById('st-total').textContent = String(total);
    document.getElementById('st-operativos').textContent = String(op);
    document.getElementById('st-alerta').textContent = String(alerta);
    document.getElementById('st-anomalia').textContent = String(an);
    document.getElementById('st-mant').textContent = String(mt);
  }
  updateStats();

  // Filtros por estado (muestran/ocultan capas)
  const fOp = document.getElementById('f-operativo');
  const fFa = document.getElementById('f-falla');
  const fAn = document.getElementById('f-anomalia');   // nuevo
  const fMt = document.getElementById('f-mant');

  function applyFilters() {
    const show = (flag, layerGroup) => {
      if (flag) layerGroup.addTo(map); else map.removeLayer(layerGroup);
    };
    show(fOp?.checked, layersByState.operativo);
    show(fFa?.checked, layersByState.fuera);
    show(fAn?.checked, layersByState.anomalia);  // aplica filtro de anomalías
    show(fMt?.checked, layersByState.mant);
    setTimeout(() => map.invalidateSize(), 0);
  }
  [fOp, fFa, fAn, fMt].forEach(el => el?.addEventListener('change', applyFilters));

  // Buscador de semáforos
  const searchInput = document.getElementById('signalSearch');
  if (searchInput) {
    const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
    const targetNames = [
      'av. raul labbe con av. la dehesa',
      'av raul labbe con av la dehesa'
    ];
    function handleSearch() {
      const val = normalize(searchInput.value);
      if (targetNames.includes(val)) {
        map.setView(punto, 18, { animate:true });
        // Dispara el mismo overlay del círculo
        greenCircle.fire('click');
      }
    }
    searchInput.addEventListener('change', handleSearch);
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
  }

  // Reemplazo lógica del datalist por sugerencias rectangulares
  (function initSignalSearch(){
    const input = document.getElementById('signalSearch');
    const box = document.getElementById('signalSuggestions');
    if(!input || !box) return;

    // Lista (podrás añadir más luego)
    const signals = [
      {
        nombre: 'Av. Raúl Labbé con Av. La Dehesa',
        aliases: [
          'av. raul labbe con av. la dehesa',
          'av raul labbe con av la dehesa'
        ],
        latlng: punto,        // reutiliza el existente
        trigger: () => greenCircle.fire('click')
      }
    ];

    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
                    .toLowerCase().replace(/\s+/g,' ').trim();

    function render(list){
      if(!list.length){ box.innerHTML=''; box.hidden=true; return; }
      box.innerHTML = list.map((s,i)=>`
        <div class="sugg-item" data-index="${i}">
          <span>${s.nombre}</span>
          <span class="badge">Semáforo</span>
        </div>`).join('');
      box.hidden = false;
    }

    function filter(){
      const q = norm(input.value);
      if(!q){ render([]); return; }
      const matched = signals.filter(s =>
        norm(s.nombre).includes(q) || s.aliases.some(a=>a.includes(q))
      );
      render(matched);
      activeIndex = matched.length ? 0 : -1;
      highlight();
      currentList = matched;
    }

    let currentList = [];
    let activeIndex = -1;

    function highlight(){
      [...box.querySelectorAll('.sugg-item')].forEach((el,i)=>{
        el.classList.toggle('active', i===activeIndex);
      });
    }

    function choose(index){
      if(index<0 || index>=currentList.length) return;
      const sel = currentList[index];
      input.value = sel.nombre;
      box.hidden = true;
      // Centrar y abrir overlay
      map.setView(sel.latlng, 18, { animate:true });
      sel.trigger?.();
    }

    input.addEventListener('input', filter);
    input.addEventListener('focus', filter);
    input.addEventListener('keydown', e=>{
      if(box.hidden) return;
      if(e.key==='ArrowDown'){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, currentList.length-1); highlight(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); highlight(); }
      else if(e.key==='Enter'){ if(activeIndex>-1){ e.preventDefault(); choose(activeIndex);} }
      else if(e.key==='Escape'){ box.hidden=true; }
    });

    box.addEventListener('mousedown', e=>{
      const item = e.target.closest('.sugg-item');
      if(!item) return;
      choose(parseInt(item.dataset.index,10));
    });

    document.addEventListener('click', e=>{
      if(!box.contains(e.target) && e.target!==input) box.hidden=true;
    });
  })();
});