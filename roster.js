/* roster.js
   Client-side roster management with a demo admin login.
   WARNING: This is client-side only. For production, move auth and storage to a server.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Hardcoded demo password (client-side). For production, never do this.
  const DEMO_ADMIN_PASSWORD = 'SYNEX_aDMIN1';

  // DOM
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');
  const loginCloseBtns = loginModal.querySelectorAll('.modal-close');

  const staffModal = document.getElementById('staffModal');
  const staffForm = document.getElementById('staffForm');
  const staffModalCloseBtns = staffModal.querySelectorAll('.modal-close');
  const staffCancel = document.getElementById('staffCancel');
  const staffModalTitle = document.getElementById('staffModalTitle');

  const addStaffBtn = document.getElementById('addStaffBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  const rosterGrid = document.getElementById('rosterGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const importJsonInput = document.getElementById('importJsonInput');

  // Storage keys
  const STORAGE_KEY = 'synex_staff_v1';
  const ADMIN_SESSION_KEY = 'synex_admin_session';

  // Sample initial roster (will be used if no data in localStorage)
  const SAMPLE_ROSTER = [
    { id: genId(), name: 'Jack', role: 'Owner / Community Manager', bio: 'Co-owner and event lead.', avatar: '' },
    { id: genId(), name: 'Deadly', role: 'Owner / Moderation Lead', bio: 'Co-owner and moderation lead.', avatar: '' },
    { id: genId(), name: 'Lucas', role: 'Owner / Technical Lead', bio: 'Donor and technical lead. DM for updates.', avatar: '' },
    { id: genId(), name: 'Ensena', role: 'Owner / Partnerships', bio: 'Co-owner handling partnerships and outreach.', avatar: '' }
  ];

  // Utilities
  function genId(){ return 's_' + Math.random().toString(36).slice(2,9); }
  function saveRoster(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  function loadRoster(){ try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw); } catch(e){ return null; } }
  function isAdmin(){ return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'; }
  function setAdmin(flag){ if (flag) sessionStorage.setItem(ADMIN_SESSION_KEY, 'true'); else sessionStorage.removeItem(ADMIN_SESSION_KEY); updateAuthUI(); }

  // Initialize roster
  let roster = loadRoster();
  if (!roster || !Array.isArray(roster) || roster.length === 0) {
    roster = SAMPLE_ROSTER.slice();
    saveRoster(roster);
  }

  // Render roster
  function renderRoster(){
    const q = (searchInput.value || '').trim().toLowerCase();
    let list = roster.slice();

    // Filter
    if (q) {
      list = list.filter(s => (s.name + ' ' + s.role + ' ' + (s.bio||'')).toLowerCase().includes(q));
    }

    // Sort
    const sort = sortSelect.value || 'name-asc';
    list.sort((a,b) => {
      if (sort.startsWith('name')) {
        return sort.endsWith('asc') ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else {
        return sort.endsWith('asc') ? a.role.localeCompare(b.role) : b.role.localeCompare(a.role);
      }
    });

    rosterGrid.innerHTML = '';
    if (list.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      list.forEach(staff => {
        const card = document.createElement('div');
        card.className = 'staff-card reveal';

        const left = document.createElement('div');
        left.className = 'staff-avatar';
        if (staff.avatar) {
          const img = document.createElement('img');
          img.src = staff.avatar;
          img.alt = staff.name + ' avatar';
          left.appendChild(img);
        } else {
          left.innerHTML = `<div style="text-align:center;color:var(--muted);font-weight:700">${(staff.name||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>`;
        }

        const body = document.createElement('div');
        body.className = 'staff-info';
        body.innerHTML = `<p class="staff-name">${escapeHtml(staff.name)}</p>
                          <p class="staff-role">${escapeHtml(staff.role)}</p>
                          <p class="staff-bio">${escapeHtml(staff.bio||'')}</p>`;

        const actions = document.createElement('div');
        actions.className = 'staff-actions';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-ghost';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => showStaffDetails(staff));

        actions.appendChild(viewBtn);

        if (isAdmin()) {
          const editBtn = document.createElement('button');
          editBtn.className = 'cta';
          editBtn.textContent = 'Edit';
          editBtn.addEventListener('click', () => openStaffModal('edit', staff.id));
          actions.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'btn-ghost';
          delBtn.textContent = 'Delete';
          delBtn.addEventListener('click', () => {
            if (confirm(`Delete ${staff.name}? This cannot be undone.`)) {
              roster = roster.filter(s => s.id !== staff.id);
              saveRoster(roster);
              renderRoster();
            }
          });
          actions.appendChild(delBtn);
        }

        body.appendChild(actions);
        card.appendChild(left);
        card.appendChild(body);
        rosterGrid.appendChild(card);
      });
    }

    // Trigger reveal for newly added elements
    document.querySelectorAll('.reveal').forEach(el => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  }

  // Escape HTML helper
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Show staff details (simple modal alert for demo)
  function showStaffDetails(staff){
    const lines = [`Name: ${staff.name}`, `Role: ${staff.role}`, `Bio: ${staff.bio||'(none)'}`];
    if (staff.avatar) lines.push(`Avatar: ${staff.avatar}`);
    alert(lines.join('\n'));
  }

  // Admin login modal controls
  function openModal(modal){ modal.setAttribute('aria-hidden','false'); modal.querySelector('input,button,textarea')?.focus(); }
  function closeModal(modal){ modal.setAttribute('aria-hidden','true'); }

  loginBtn.addEventListener('click', () => openModal(loginModal));
  loginCloseBtns.forEach(b => b.addEventListener('click', () => closeModal(loginModal)));

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('adminPassword').value || '';
    if (pw === DEMO_ADMIN_PASSWORD) {
      setAdmin(true);
      loginMsg.textContent = 'Login successful.';
      loginMsg.style.color = '#bfffcf';
      closeModal(loginModal);
    } else {
      loginMsg.textContent = 'Incorrect password.';
      loginMsg.style.color = '#ffb4b4';
    }
    loginForm.reset();
  });

  // Update UI based on auth
  function updateAuthUI(){
    const admin = isAdmin();
    addStaffBtn.disabled = !admin;
    logoutBtn.style.display = admin ? 'inline-block' : 'none';
    loginBtn.style.display = admin ? 'none' : 'inline-block';
    // show edit/delete buttons by re-rendering
    renderRoster();
  }

  logoutBtn.addEventListener('click', () => {
    if (confirm('Log out of supervisor session?')) {
      setAdmin(false);
    }
  });

  // Add/Edit staff modal
  addStaffBtn.addEventListener('click', () => openStaffModal('add'));
  staffModalCloseBtns.forEach(b => b.addEventListener('click', () => closeModal(staffModal)));
  staffCancel.addEventListener('click', () => closeModal(staffModal));

  function openStaffModal(mode, id){
    if (!isAdmin()) { alert('Supervisor login required to manage staff.'); return; }
    staffForm.reset();
    document.getElementById('staffFormMsg').textContent = '';
    if (mode === 'add') {
      staffModalTitle.textContent = 'Add Staff Member';
      document.getElementById('staffId').value = '';
    } else {
      staffModalTitle.textContent = 'Edit Staff Member';
      const s = roster.find(x => x.id === id);
      if (!s) return alert('Staff not found.');
      document.getElementById('staffId').value = s.id;
      document.getElementById('staffName').value = s.name;
      document.getElementById('staffRole').value = s.role;
      document.getElementById('staffBio').value = s.bio || '';
      document.getElementById('staffAvatar').value = s.avatar || '';
    }
    openModal(staffModal);
  }

  staffForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('staffId').value;
    const name = (document.getElementById('staffName').value || '').trim();
    const role = (document.getElementById('staffRole').value || '').trim();
    const bio = (document.getElementById('staffBio').value || '').trim();
    const avatar = (document.getElementById('staffAvatar').value || '').trim();

    if (!name || !role) {
      document.getElementById('staffFormMsg').textContent = 'Name and role are required.';
      document.getElementById('staffFormMsg').style.color = '#ffb4b4';
      return;
    }

    if (id) {
      // edit
      const idx = roster.findIndex(s => s.id === id);
      if (idx >= 0) {
        roster[idx] = { id, name, role, bio, avatar };
      }
    } else {
      // add
      roster.push({ id: genId(), name, role, bio, avatar });
    }
    saveRoster(roster);
    renderRoster();
    closeModal(staffModal);
  });

  // Search & sort
  searchInput.addEventListener('input', () => renderRoster());
  sortSelect.addEventListener('change', () => renderRoster());

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    if (!roster || roster.length === 0) return alert('No staff to export.');
    const rows = [['Name','Role','Bio','Avatar']];
    roster.forEach(s => rows.push([s.name, s.role, s.bio || '', s.avatar || '']));
    const csv = rows.map(r => r.map(cell => `"${String(cell||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synex_roster.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Import JSON
  importJsonInput.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error('JSON must be an array of staff objects.');
        // Normalize and add ids if missing
        const imported = data.map(item => ({
          id: item.id || genId(),
          name: String(item.name || '').trim(),
          role: String(item.role || '').trim(),
          bio: String(item.bio || '').trim(),
          avatar: String(item.avatar || '').trim()
        })).filter(s => s.name && s.role);
        roster = roster.concat(imported);
        saveRoster(roster);
        renderRoster();
        alert(`Imported ${imported.length} staff entries.`);
      } catch (err) {
        alert('Failed to import JSON: ' + err.message);
      }
    };
    reader.readAsText(f);
    // reset input
    e.target.value = '';
  });

  // Initial UI
  updateAuthUI();
  renderRoster();

  // Accessibility: close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loginModal.getAttribute('aria-hidden') === 'false') closeModal(loginModal);
      if (staffModal.getAttribute('aria-hidden') === 'false') closeModal(staffModal);
    }
  });
});
