/**
 * certificate.js — Certificate rendering and UI helpers.
 *
 * Reads from the DOM (form values + records state) and writes
 * to the certificate preview. Also owns responsive scaling.
 */

import { WEIGHT_CLASSES, AGE_CLASS_DISPLAY } from './data.js';
import { getRecords }                        from './records.js';

// ── Utility helpers ────────────────────────────────────────────────

/** Formats a weight number cleanly: 152 → "152", 152.5 → "152.5". */
export function fmtW(w) {
  const n = parseFloat(w);
  if (!n) return '0';
  return n % 1 === 0 ? String(parseInt(n)) : n.toFixed(1);
}

/** Returns a day-ordinal date string, e.g. "23rd July 2026". */
export function formatDate(str) {
  if (!str) return '';
  const d = new Date(`${str}T00:00:00`);
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const day = d.getDate();
  const sfx = n => n >= 11 && n <= 13 ? 'th'
    : ['th','st','nd','rd','th','th','th','th','th','th'][n % 10];
  return `${day}${sfx(day)} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Weight class population ────────────────────────────────────────

/** Repopulates the weight-class <select> when gender changes. */
export function updateWeightClasses() {
  const gender = document.getElementById('gender')?.value ?? "women's";
  const sel    = document.getElementById('weightClass');
  if (!sel) return;

  const prev = sel.value;
  sel.innerHTML = '';
  WEIGHT_CLASSES[gender].forEach(wc => {
    const o = document.createElement('option');
    o.value = o.textContent = wc;
    sel.appendChild(o);
  });

  // Restore previously selected class if it still exists
  if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
  else sel.selectedIndex = 5; // sensible default (~76 kg / ~83 kg)
}

// ── Main render ────────────────────────────────────────────────────

/** Reads all form values and redraws the certificate preview. */
export function updateCert() {
  const v = id => document.getElementById(id)?.value ?? '';

  const name        = v('lifterName') || 'Lifter Name';
  const equipment   = v('equipment');
  const gender      = v('gender');
  const weightClass = v('weightClass') || '–76kg';
  const dateStr     = v('compDate');

  // Multiple age classes supported via checkboxes
  const ageClasses = [...document.querySelectorAll('input[name="ageClass"]:checked')]
    .map(cb => cb.value);
  const compName    = v('compName');
  const registrar   = v('registrarName') || 'Records Registrar';

  // ── Lifter name (scales down for long names) ──
  const nameEl = document.getElementById('certName');
  if (nameEl) {
    nameEl.textContent = name;
    nameEl.className   = 'cert-name'
      + (name.length > 26 ? ' ultra-long'
        : name.length > 20 ? ' very-long'
        : name.length > 15 ? ' long' : '');
  }

  // ── Records: single vs. multi display ────────
  const records   = getRecords();
  const singleDiv = document.getElementById('certSingleRecord');
  const gridDiv   = document.getElementById('certRecordsGrid');

  if (records.length === 1) {
    if (singleDiv) singleDiv.style.display = '';
    if (gridDiv)   gridDiv.style.display   = 'none';
    const liftEl = document.getElementById('certLift');
    if (liftEl) liftEl.textContent = `${fmtW(records[0].weight)}kg ${records[0].discipline}`;
  } else {
    if (singleDiv) singleDiv.style.display = 'none';
    if (gridDiv) {
      gridDiv.style.display = '';
      const n   = records.length;
      const wSz = n === 2 ? 40 : n === 3 ? 31 : 26;
      const dSz = n === 2 ? 22 : n === 3 ? 17 : 14;
      gridDiv.innerHTML = records.map(r => `
        <div class="cert-record-card">
          <div class="cert-record-weight" style="font-size:${wSz}px">${fmtW(r.weight)}kg</div>
          <div class="cert-record-disc"   style="font-size:${dSz}px">${r.discipline}</div>
        </div>`).join('');
    }
  }

  // ── Class line — handles single or multiple age classes ──
  const genDisp   = gender === "women's" ? "Women's" : "Men's";
  const ageLabels = ageClasses
    .map(a => AGE_CLASS_DISPLAY[a])
    .filter(Boolean);

  let classStr;
  if (ageClasses.length === 0 || (ageClasses.length === 1 && ageClasses[0] === 'open')) {
    // Open alone (or nothing) → use gender instead of an age label
    classStr = `in the ${equipment} ${genDisp} ${weightClass} class`;
  } else if (ageLabels.length === 1) {
    classStr = `in the ${equipment} ${ageLabels[0]} ${weightClass} class`;
  } else {
    // e.g. 'M2, M1 & Open' or 'M2 & M1'
    const last = ageLabels[ageLabels.length - 1];
    const rest = ageLabels.slice(0, -1).join(', ');
    classStr = `in the ${equipment} ${rest} & ${last} ${weightClass} class`;
  }

  const classEl = document.getElementById('certClass');
  if (classEl) classEl.textContent = classStr;

  // ── Date line ─────────────────────────────────
  const fd     = formatDate(dateStr);
  const dateEl = document.getElementById('certDate');
  if (dateEl) {
    dateEl.textContent = fd && compName
      ? `Achieved on ${fd} at the ${compName}`
      : fd      ? `Achieved on ${fd}`
      : compName ? `Achieved at the ${compName}` : '';
  }

  // ── Registrar ─────────────────────────────────
  const regEl = document.getElementById('certRegistrarName');
  if (regEl) regEl.textContent = registrar;
}

// ── Responsive scaling ────────────────────────────────────────────

/**
 * Scales the certificate to fit the available preview width on mobile.
 * Uses CSS transform so the visual output matches the print dimensions exactly.
 */
export function scaleCertificate() {
  const wrap    = document.getElementById('certWrap');
  const certEl  = document.getElementById('certificate');
  const preview = document.querySelector('.preview-panel');
  if (!wrap || !certEl || !preview) return;

  if (window.innerWidth <= 768) {
    const availW = preview.clientWidth - 24; // 12 px padding each side
    const scale  = Math.min(availW / 1123, 1);

    certEl.style.transform       = `scale(${scale})`;
    certEl.style.transformOrigin = 'top left';
    wrap.style.width             = `${Math.ceil(1123 * scale)}px`;
    wrap.style.height            = `${Math.ceil(794  * scale)}px`;
    wrap.style.overflow          = 'hidden';
  } else {
    // Reset to natural size on desktop
    certEl.style.transform       = '';
    certEl.style.transformOrigin = '';
    wrap.style.width             = '';
    wrap.style.height            = '';
    wrap.style.overflow          = '';
  }
}

// ── Mobile config toggle ─────────────────────────────────────────

/** Expands or collapses the configuration panel on mobile. */
export function toggleConfig() {
  const body = document.getElementById('formPanelBody');
  const btn  = document.getElementById('formToggleBar');
  if (!body || !btn) return;

  const isOpen = body.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));

  // Re-scale in case panel width shifted
  if (isOpen) setTimeout(scaleCertificate, 10);
}
