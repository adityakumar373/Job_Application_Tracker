// STATE
let jobs = [];
const STORAGE_KEY = 'jobTracker_v2';

// INIT
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderJobs();
    // Set today as default date in form
    document.getElementById('date').valueAsDate = new Date();
});

// STORAGE
function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        jobs = saved ? JSON.parse(saved) : [];
    } catch (e) {
        jobs = [];
        showToast('Failed to load saved data.', 'error');
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
        showToast('Could not save to browser storage!', 'error');
    }
}

// EXPORT JSON
function exportJSON() {
    if (jobs.length === 0) {
        showToast('No data to export yet!', 'error');
        return;
    }

    const exportData = {
        exportedAt: new Date().toISOString(),
        exportedBy: 'Aditya Kumar',
        version: '1.0',
        totalApplications: jobs.length,
        jobs: jobs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');

    // File name includes today's date
    const today = new Date().toISOString().split('T')[0];
    a.href     = url;
    a.download = `job-applications-${today}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast(`✅ Exported ${jobs.length} application(s) as JSON!`, 'success');
}

// IMPORT JSON 
function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        showToast('Please select a valid .json file!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);

            // Support both direct array and our export format
            const importedJobs = Array.isArray(parsed) ? parsed : (parsed.jobs || []);

            if (!Array.isArray(importedJobs) || importedJobs.length === 0) {
                showToast('No valid job data found in file!', 'error');
                return;
            }

            // Validate each job has required fields, assign new IDs to avoid conflicts
            const validJobs = importedJobs
                .filter(j => j.company && j.role && j.date && j.status)
                .map(j => ({
                    id:      j.id || Date.now().toString() + Math.random().toString(36).slice(2),
                    company: j.company,
                    role:    j.role,
                    date:    j.date,
                    status:  j.status,
                    notes:   j.notes || ''
                }));

            if (validJobs.length === 0) {
                showToast('No valid entries found. Check your JSON format!', 'error');
                return;
            }

            if (confirm(`Found ${validJobs.length} applications. Merge with existing data?`)) {
                // Merge: avoid duplicates by ID
                const existingIds = new Set(jobs.map(j => j.id));
                const newJobs = validJobs.filter(j => !existingIds.has(j.id));
                jobs = [...jobs, ...newJobs];
            } else {
                // Replace all
                jobs = validJobs;
            }

            saveToStorage();
            renderJobs();
            showToast(`✅ Imported ${validJobs.length} application(s) successfully!`, 'success');

        } catch (err) {
            showToast('Invalid JSON file. Please try again.', 'error');
        }

        // Reset file input so user can import again
        event.target.value = '';
    };

    reader.readAsText(file);
}

//  CLEAR ALL
function clearAllData() {
    if (jobs.length === 0) {
        showToast('Nothing to clear!', 'error');
        return;
    }
    if (confirm(`Are you sure? This will permanently delete all ${jobs.length} application(s).`)) {
        jobs = [];
        saveToStorage();
        renderJobs();
        showToast('🗑 All data cleared.', 'success');
    }
}

// MODAL
let editingId = null;

function openModal(jobId = null) {
    editingId = jobId;
    const form = document.getElementById('jobForm');
    form.reset();

    if (jobId) {
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;
        document.getElementById('modal-title').textContent = 'Edit Application';
        document.getElementById('company').value = job.company;
        document.getElementById('role').value    = job.role;
        document.getElementById('date').value    = job.date;
        document.getElementById('status').value  = job.status;
        document.getElementById('notes').value   = job.notes;
    } else {
        document.getElementById('modal-title').textContent = 'Add New Application';
        document.getElementById('date').valueAsDate = new Date();
    }

    const modal = document.getElementById('jobModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal() {
    const modal = document.getElementById('jobModal');
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('jobModal')) closeModal();
}

// SAVE JOB
function saveJob(e) {
    e.preventDefault();

    const company = document.getElementById('company').value.trim();
    const role    = document.getElementById('role').value.trim();
    const date    = document.getElementById('date').value;
    const status  = document.getElementById('status').value;
    const notes   = document.getElementById('notes').value.trim();

    if (editingId) {
        const idx = jobs.findIndex(j => j.id === editingId);
        if (idx !== -1) {
            jobs[idx] = { ...jobs[idx], company, role, date, status, notes };
            showToast(' Application updated!', 'success');
        }
    } else {
        jobs.push({
            id:      Date.now().toString() + Math.random().toString(36).slice(2),
            company, role, date, status, notes
        });
        showToast('✅ Application added!', 'success');
    }

    saveToStorage();
    renderJobs();
    closeModal();
}

// DELETE JOB
function deleteJob(id) {
    if (!confirm('Delete this application?')) return;
    jobs = jobs.filter(j => j.id !== id);
    saveToStorage();
    renderJobs();
    showToast('🗑 Application deleted.', 'success');
}

// RENDER JOBS
function renderJobs() {
    const search   = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const filter   = document.getElementById('filterStatus')?.value || 'All';
    const tbody    = document.getElementById('job-list');
    const empty    = document.getElementById('empty-state');
    const tableWrap = document.getElementById('table-wrap');

    if (!tbody) return; // guard: elements not in DOM yet

    // Filter
    const filtered = jobs.filter(j => {
        const matchSearch = !search ||
            j.company.toLowerCase().includes(search) ||
            j.role.toLowerCase().includes(search);
        const matchStatus = filter === 'All' || j.status === filter;
        return matchSearch && matchStatus;
    });

    // Sort newest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        empty.classList.remove('hidden');
        if (tableWrap) tableWrap.classList.add('hidden');
    } else {
        empty.classList.add('hidden');
        if (tableWrap) tableWrap.classList.remove('hidden');

        filtered.forEach(job => {
            const tr = document.createElement('tr');
            // Parse as LOCAL date (avoids off-by-one UTC bug in timezones like IST)
            const [y, m, d] = job.date.split('-').map(Number);
            const formattedDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
            tr.innerHTML = `
                <td><div class="company-name-cell"><strong>${esc(job.company)}</strong></div></td>
                <td>${esc(job.role)}</td>
                <td>${formattedDate}</td>
                <td><span class="badge ${job.status.toLowerCase()}">${job.status}</span></td>
                <td><div class="note-text" title="${esc(job.notes)}">${esc(job.notes) || '—'}</div></td>
                <td>
                    <button class="action-btn edit"   onclick="openModal('${job.id}')" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteJob('${job.id}')" title="Delete">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateStats();
    updateDashboard();
}

// STATS
function updateStats() {
    const counts = { Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 };
    jobs.forEach(j => { if (counts[j.status] !== undefined) counts[j.status]++; });

    document.getElementById('stat-total').textContent     = jobs.length;
    document.getElementById('stat-interview').textContent = counts.Interviewing;
    document.getElementById('stat-offer').textContent     = counts.Offer;
    document.getElementById('stat-rejected').textContent  = counts.Rejected;
}

// DASHBOARD
function updateDashboard() {
    const counts = { Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 };
    jobs.forEach(j => { if (counts[j.status] !== undefined) counts[j.status]++; });

    const total = jobs.length || 1;

    // Bar Chart
    const barChart = document.getElementById('barChart');
    if (barChart) {
        const barDefs = [
            { label: 'Applied',      count: counts.Applied,      color: '#3b82f6' },
            { label: 'Interviewing', count: counts.Interviewing,  color: '#a855f7' },
            { label: 'Offer',        count: counts.Offer,         color: '#22c55e' },
            { label: 'Rejected',     count: counts.Rejected,      color: '#ef4444' },
        ];

        const maxCount = Math.max(...Object.values(counts), 1);
        barChart.innerHTML = barDefs.map(b => `
            <div class="bar-item">
                <div class="bar-count" style="color:${b.color}">${b.count}</div>
                <div class="bar-fill" style="height:${Math.round((b.count / maxCount) * 120)}px; background:${b.color}; opacity:0.85;"></div>
                <div class="bar-label">${b.label}</div>
            </div>
        `).join('');
    }

    // Ring — offer rate
    const offerRate    = jobs.length ? Math.round((counts.Offer / jobs.length) * 100) : 0;
    const ring         = document.getElementById('ringProgress');
    const ringPercent  = document.getElementById('ringPercent');
    if (ring && ringPercent) {
        const circumference = 238.76;
        ring.style.strokeDashoffset = circumference - (circumference * offerRate / 100);
        ringPercent.textContent = `${offerRate}%`;
    }

    // Recent Activity (latest 5)
    const activityList  = document.getElementById('activityList');
    const activityEmpty = document.getElementById('activityEmpty');
    if (activityList) {
        const recent = [...jobs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        const dotColors = { Applied: '#3b82f6', Interviewing: '#a855f7', Offer: '#22c55e', Rejected: '#ef4444' };

        if (recent.length === 0) {
            activityList.innerHTML = '';
            activityEmpty.classList.remove('hidden');
        } else {
            activityEmpty.classList.add('hidden');
            activityList.innerHTML = recent.map(j => `
                <li class="activity-item">
                    <span class="activity-dot" style="background:${dotColors[j.status]}"></span>
                    <div class="activity-text">
                        <strong>${esc(j.company)}</strong>
                        <span>${esc(j.role)} · ${(([y,m,d]) => new Date(y, m-1, d).toLocaleDateString('en-US',{month:'short',day:'numeric'}))(j.date.split('-').map(Number))}</span>
                    </div>
                    <span class="badge ${j.status.toLowerCase()}">${j.status}</span>
                </li>
            `).join('');
        }
    }
}

// NAVIGATION
function showView(viewName, clickedEl) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });

    // Show target view
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (clickedEl) clickedEl.classList.add('active');

    // Re-render dashboard when switching to it
    if (viewName === 'dashboard') updateDashboard();
}

// TOAST
let toastTimer;
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// UTILS
function esc(str = '') {
    return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
