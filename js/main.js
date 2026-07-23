/**
 * main.js — Application entry point.
 *
 * Imports all modules and wires them together with DOM event listeners.
 * No business logic lives here; this file is purely orchestration.
 *
 * Requires a local server (e.g. `npx serve`, VS Code Live Server, or
 * any static host) because ES modules don't load over file://.
 */

import { updateWeightClasses, updateCert, scaleCertificate, toggleConfig } from './certificate.js';
import { renderRecordsList, addRecord, removeRecord, readRecords }          from './records.js';
import { exportPDF }                                                         from './export.js';

// ── Event binding ──────────────────────────────────────────────────

function bindEvents() {

  // Lifter name
  document.getElementById('lifterName')
    ?.addEventListener('input', updateCert);

  // Records list — use event delegation so dynamically-added inputs are covered
  const list = document.getElementById('recordsList');

  list?.addEventListener('input',  () => { readRecords(); updateCert(); });
  list?.addEventListener('change', () => { readRecords(); updateCert(); });
  list?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove"]');
    if (btn) {
      removeRecord(Number(btn.dataset.id));
      updateCert();
    }
  });

  // Add-record button
  document.getElementById('addRecordBtn')
    ?.addEventListener('click', () => { addRecord(); updateCert(); });

  // Category selects
  document.getElementById('gender')?.addEventListener('change', () => {
    updateWeightClasses();
    updateCert();
  });

  ['weightClass', 'equipment'].forEach(id =>
    document.getElementById(id)?.addEventListener('change', updateCert)
  );

  // Age class is now a checkbox group — use event delegation on the fieldset
  document.getElementById('ageClassGroup')
    ?.addEventListener('change', updateCert);

  // Competition fields
  ['compDate', 'compName', 'registrarName'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', updateCert)
  );

  // Export buttons (sidebar + mobile)
  document.getElementById('exportBtn')
    ?.addEventListener('click', exportPDF);
  document.getElementById('mobileExportBtn')
    ?.addEventListener('click', exportPDF);

  // Mobile config toggle
  document.getElementById('formToggleBar')
    ?.addEventListener('click', toggleConfig);

  // Responsive scaling on resize
  window.addEventListener('resize', scaleCertificate);
}

// ── Initialise ─────────────────────────────────────────────────────

function init() {
  // Populate weight-class dropdown for the default gender
  updateWeightClasses();

  // Default competition date to today
  const dateEl = document.getElementById('compDate');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];

  // Render the initial single-record form row
  renderRecordsList();

  // Draw the certificate with default values
  updateCert();

  // Scale to fit viewport (matters on first mobile load)
  scaleCertificate();

  // Bind all DOM events
  bindEvents();
}

// Run once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', init);
