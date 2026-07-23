/**
 * records.js — Record state management.
 *
 * Owns the mutable `records` array and all functions that touch it.
 * Does not interact with the certificate display directly; that's
 * certificate.js's job. main.js wires the two together.
 */

import { DISCIPLINES } from './data.js';

/** @type {{ id: number, weight: string, discipline: string }[]} */
let records = [{ id: 0, weight: '', discipline: 'squat' }];
let nextId  = 1;

/** Returns a shallow copy so callers can't mutate the internal array. */
export const getRecords = () => [...records];

/**
 * Syncs the records array from the current DOM values.
 * Call before reading records for an export or preview update.
 */
export function readRecords() {
  records.forEach(rec => {
    const w = document.getElementById(`rec-weight-${rec.id}`);
    const d = document.getElementById(`rec-disc-${rec.id}`);
    if (w) rec.weight     = w.value;
    if (d) rec.discipline = d.value;
  });
}

/**
 * Rebuilds the records list in the sidebar.
 * Calling code is responsible for triggering a certificate redraw afterwards.
 */
export function renderRecordsList() {
  const list = document.getElementById('recordsList');
  if (!list) return;

  list.innerHTML = '';

  records.forEach((rec, idx) => {
    const entry = document.createElement('div');
    entry.className = 'record-entry';
    entry.id        = `rec-${rec.id}`;

    // Re-read DISCIPLINES at call time so renames in data.js are reflected
    const discOptions = DISCIPLINES.map(d =>
      `<option value="${d.value}"${rec.discipline === d.value ? ' selected' : ''}>${d.label}</option>`
    ).join('');

    const removeBtn = records.length > 1
      ? `<button class="btn-remove-record" type="button"
                 data-action="remove" data-id="${rec.id}"
                 aria-label="Remove record ${idx + 1}">×</button>`
      : '';

    entry.innerHTML = `
      <div class="record-entry-header">
        <span class="record-entry-num">Record ${idx + 1}</span>
        ${removeBtn}
      </div>
      <div class="form-row">
        <div>
          <label for="rec-weight-${rec.id}">Weight (kg)</label>
          <input type="number" id="rec-weight-${rec.id}"
                 value="${rec.weight}" placeholder="e.g. 152.5"
                 step="0.5" min="0">
        </div>
        <div>
          <label for="rec-disc-${rec.id}">Lift</label>
          <select id="rec-disc-${rec.id}">${discOptions}</select>
        </div>
      </div>`;

    list.appendChild(entry);
  });
}

/** Appends a new blank record (maximum 5). */
export function addRecord() {
  if (records.length >= 5) return;
  records.push({ id: nextId++, weight: '', discipline: 'squat' });
  renderRecordsList();
}

/** Removes the record with the given id (minimum 1 must remain). */
export function removeRecord(id) {
  if (records.length <= 1) return;
  records = records.filter(r => r.id !== id);
  renderRecordsList();
}
