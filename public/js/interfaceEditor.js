// public/js/ui/interfaceEditor.js
// Drawer-based Interface Editor (no modals).
// Pure DOM + Bootstrap 5 Offcanvas. No jQuery required.

import InterfacesAPI from './api/interfaces.js';

/** Tiny UI helpers */
function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function el(tag, attrs={}){ const e=document.createElement(tag); Object.assign(e, attrs); return e; }
function text(s){ return document.createTextNode(s); }

function moveSelected(fromSel, toSel) {
  const from = $(fromSel); const to = $(toSel);
  Array.from(from.selectedOptions).forEach(opt => to.appendChild(opt));
}

function getAttachedFeatureIds() {
  return $all('#ifFeatAttached option').map(o => Number(o.value));
}

function setOptions(selectEl, rows, valueKey, labelKey) {
  selectEl.innerHTML = '';
  rows.forEach(r => {
    const opt = el('option');
    opt.value = r[valueKey];
    opt.textContent = r[labelKey];
    selectEl.appendChild(opt);
  });
}

function setInterfacesList(selectEl, rows, selectedId) {
  selectEl.innerHTML = '';
  rows.forEach(r => {
    const opt = el('option');
    opt.value = r.id_interface;
    opt.textContent = r.name;
    if (selectedId && Number(selectedId) === Number(r.id_interface)) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

/** Render the drawer skeleton into the page if missing */
function ensureDrawer() {
  if (document.getElementById('interfaceEditor')) return;
  const wrapper = el('div');
  wrapper.innerHTML = `
  <div class="offcanvas offcanvas-end" tabindex="-1" id="interfaceEditor" style="width: 560px;">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="ifTitle">Edit Interface</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <div id="ifAlert" class="alert alert-danger d-none" role="alert"></div>

      <div class="mb-3">
        <label for="ifSelect" class="form-label">Select Interface</label>
        <select id="ifSelect" class="form-select"></select>
        <div class="form-text">Choose an existing interface, or click "New" to create one.</div>
      </div>

      <div class="mb-3">
        <label for="ifName" class="form-label">Name</label>
        <input id="ifName" class="form-control" required>
      </div>

      <div class="mb-3">
        <label for="ifDesc" class="form-label">Description</label>
        <textarea id="ifDesc" class="form-control" rows="3"></textarea>
      </div>

      <div class="mb-3">
        <label for="ifImage" class="form-label">Image (URL or key)</label>
        <div class="input-group">
          <input id="ifImage" class="form-control">
          <button id="ifPickIcon" class="btn btn-outline-secondary" type="button">Pick…</button>
        </div>
      </div>

      <!-- Collapsible picker panel -->
      <div id="iconPicker" class="border rounded p-2 d-none">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <input id="iconSearch" class="form-control form-control-sm w-50" placeholder="Search…">
          <button id="iconClose" class="btn btn-sm btn-secondary">Close</button>
        </div>
        <div id="iconGrid" class="row row-cols-3 row-cols-sm-4 row-cols-md-5 g-2" style="max-height: 50vh; overflow:auto;"></div>
      </div>

      <div class="row g-2 align-items-stretch">
        <div class="col-5">
          <label class="form-label">Available features</label>
          <select id="ifFeatAvail" class="form-select" size="8" multiple></select>
        </div>
        <div class="col-2 d-flex flex-column justify-content-center align-items-center">
          <button id="ifAddFeat" type="button" class="btn btn-outline-primary mb-2" title="Attach">&gt;</button>
          <button id="ifRemoveFeat" type="button" class="btn btn-outline-secondary" title="Detach">&lt;</button>
        </div>
        <div class="col-5">
          <label class="form-label">Attached features</label>
          <select id="ifFeatAttached" class="form-select" size="8" multiple></select>
        </div>
      </div>
    </div>
    <div class="offcanvas-footer p-3 border-top d-flex justify-content-between align-items-center">
      <div class="text-muted small" id="ifStatus">&nbsp;</div>
      <div>
        <button id="ifNew" type="button" class="btn btn-info me-2">New</button>
        <button id="ifSave" type="button" class="btn btn-primary" disabled>Save</button>
        <button class="btn btn-secondary ms-2" data-bs-dismiss="offcanvas">Close</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(wrapper.firstElementChild);
}

/** Main entry */
export async function openInterfaceEditor({ id_interface = 0 } = {}) {
  ensureDrawer();

  // Bootstrap offcanvas instance
  const drawerEl = document.getElementById('interfaceEditor');
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(drawerEl);

  // UI elements
  const title = $('#ifTitle');
  const ifSelect = $('#ifSelect');
  const ifName = $('#ifName');
  const ifDesc = $('#ifDesc');
  const ifImage = $('#ifImage');
  const featAvail = $('#ifFeatAvail');
  const featAttached = $('#ifFeatAttached');
  const alertBox = $('#ifAlert');
  const status = $('#ifStatus');
  const btnSave = $('#ifSave');
  const btnNew = $('#ifNew');
  const btnAdd = $('#ifAddFeat');
  const btnRemove = $('#ifRemoveFeat');
  const btnPickIcon = $('#ifPickIcon');

  let dirty = false;
  function setDirty(v=true){ dirty = v; btnSave.disabled = !dirty; status.textContent = dirty ? 'Unsaved changes' : ' '; }
  function showError(msg){ alertBox.textContent = msg || 'An error occurred'; alertBox.classList.remove('d-none'); }
  function hideError(){ alertBox.classList.add('d-none'); alertBox.textContent = ''; }

  // Load view model
  let vm;
  try {
    vm = await InterfacesAPI.getEditView(Number(id_interface) || undefined);
  } catch (e) {
    showError(e.message);
    return;
  }

  // Title
  title.textContent = id_interface ? 'Edit Interface' : 'New Interface';

  // Populate interface picker
  setInterfacesList(ifSelect, vm.interfaces, id_interface || undefined);

  // Populate fields (if editing)
  ifName.value = vm.interface?.name || '';
  ifDesc.value = vm.interface?.description || '';
  ifImage.value = vm.interface?.image || '';

  // Populate features
  setOptions(featAvail, vm.featuresAvailable, 'id_feature', 'name');
  setOptions(featAttached, vm.featuresAttached, 'id_feature', 'name');

  // Wire interactions
  [ifName, ifDesc, ifImage, featAvail, featAttached].forEach(inp => {
    inp.addEventListener('input', () => setDirty(true), { passive: true });
    inp.addEventListener('change', () => setDirty(true));
  });

  btnAdd.onclick = () => { moveSelected('#ifFeatAvail', '#ifFeatAttached'); setDirty(true); };
  btnRemove.onclick = () => { moveSelected('#ifFeatAttached', '#ifFeatAvail'); setDirty(true); };

  // Change selected interface → reload editor for that ID
  ifSelect.onchange = () => {
    const nextId = Number(ifSelect.value);
    openInterfaceEditor({ id_interface: nextId });
  };

  // New entity
  btnNew.onclick = () => openInterfaceEditor({ id_interface: 0 });

  // Icon picker
  btnPickIcon.onclick = () => {
    mountIconPicker({
      onPick: (item) => {
        ifImage.value = item.url;
        $('#ifImagePreview').innerHTML = `<img src="${item.url}" alt="${item.name}" height="32">`;
        document.getElementById('iconPicker').classList.add('d-none');
        setDirty(true);
      }
    });
  };

  // Save handler
  btnSave.onclick = async () => {
    hideError();
    const name = ifName.value.trim();
    if (!name) { showError('Name is required'); return; }

    const dto = {
      name,
      description: ifDesc.value.trim() || null,
      image: ifImage.value.trim() || null,
      features: getAttachedFeatureIds()
    };

    try {
      btnSave.disabled = true;
      status.textContent = 'Saving…';
      const result = id_interface ? await InterfacesAPI.update(Number(id_interface), dto)
                                  : await InterfacesAPI.create(dto);
      setDirty(false);
      status.textContent = result.created ? 'Created' : 'Saved';
      // Reload with the saved/created id to refresh lists + title
      openInterfaceEditor({ id_interface: result.id_interface });
    } catch (e) {
      btnSave.disabled = false;
      showError(e.message);
      status.textContent = ' ';
    }
  };




// If loading an existing interface with an image, show preview:
if (vm.interface?.image) {
  $('#ifImagePreview').innerHTML = `<img src="${vm.interface.image}" alt="" height="32">`;
}



  // Show drawer
  offcanvas.show();
}


async function fetchIcons({ q = '', page = 1, limit = 60 }) {
  const res = await fetch(`/api/images?prefix=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load icons');
  return res.json();
}

function renderIconTile(item, onPick) {
  const col = document.createElement('div');
  col.className = 'col';
  col.innerHTML = `
    <button class="btn w-100 p-2 border bg-white" title="${item.name}">
      <img src="${item.url}" alt="${item.name}" class="img-fluid" loading="lazy">
      <div class="small text-truncate mt-1">${item.name}</div>
    </button>`;
  col.querySelector('button').onclick = () => onPick(item);
  return col;
}

function mountIconPicker({ onPick }) {
  const picker = document.getElementById('iconPicker');
  const grid   = document.getElementById('iconGrid');
  const search = document.getElementById('iconSearch');
  const close  = document.getElementById('iconClose');

  let q = '', page = 1, loading = false, nextPage = 1;

  async function load(reset = false) {
    if (loading || nextPage === null) return;
    loading = true;
    if (reset) { grid.innerHTML = ''; page = 1; nextPage = 1; }
    const data = await fetchIcons({ q, page });
    data.items.forEach(item => grid.appendChild(renderIconTile(item, onPick)));
    nextPage = data.nextPage;
    page = (nextPage ?? page);
    loading = false;
  }

  // Infinite scroll
  grid.addEventListener('scroll', () => {
    if (grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 40) load();
  });

  // Search
  let t;
  search.oninput = () => { clearTimeout(t); t = setTimeout(() => { q = search.value.trim(); load(true); }, 200); };

  // Open/close
  picker.classList.remove('d-none');
  close.onclick = () => picker.classList.add('d-none');

  load(true);
}
