/**
 * data.js — Static reference data for the certificate maker.
 * No DOM access; safe to import anywhere.
 */

export const WEIGHT_CLASSES = {
  "women's": ["–47kg", "–52kg", "–57kg", "–63kg", "–69kg", "–76kg", "–84kg", "84kg+"],
  "men's":   ["–59kg", "–66kg", "–74kg", "–83kg", "–93kg", "–105kg", "–120kg", "120kg+"],
};

export const DISCIPLINES = [
  { value: "squat",        label: "Squat" },
  { value: "bench press",  label: "Bench Press" },
  { value: "bench press A/C", label: "Bench Press A/C" },
  { value: "deadlift",     label: "Deadlift" },
  { value: "total",        label: "Total" },
];

/** Maps the <select> value to the display text used on the certificate. */
export const AGE_CLASS_DISPLAY = {
  sj:   "Sub-Junior",
  j:    "Junior",
  open: "Open",        // shown when combined; omitted when selected alone
  m1:   "M1",
  m2:   "M2",
  m3:   "M3",
  m4:   "M4",
};
