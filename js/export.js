/**
 * export.js — PDF generation.
 *
 * html2canvas cannot render SVG <img> tags natively, so we rasterise
 * each one to a PNG before capturing, then restore the originals.
 *
 * Dependencies loaded via CDN <script> tags in index.html:
 *   - html2canvas  (attaches to window.html2canvas)
 *   - jsPDF        (attaches to window.jspdf)
 */

/**
 * Draws an SVG <img> onto an off-screen canvas and returns
 * a PNG data URL, replacing the img.src in-place.
 *
 * @param {HTMLImageElement} img
 * @returns {Promise<string>} The original src (for restoration after capture).
 */
function rasteriseSvg(img) {
  return new Promise(resolve => {
    const origSrc = img.src;
    const scale   = 3; // 3× for print quality
    const w       = (img.offsetWidth  || 80) * scale;
    const h       = (img.offsetHeight || 80) * scale;
    const tmp     = new Image();

    tmp.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(tmp, 0, 0, w, h);
        img.src = cv.toDataURL('image/png');
      } catch {
        // SecurityError on tainted canvas — leave original
      }
      resolve(origSrc);
    };

    tmp.onerror = () => resolve(origSrc);
    tmp.src = origSrc;
  });
}

/** Downloads the certificate as an A4 landscape PDF. */
export async function exportPDF() {
  const overlay = document.getElementById('exportOverlay');
  const buttons = document.querySelectorAll('.btn-export, .mobile-download-btn');

  overlay?.classList.add('active');
  buttons.forEach(b => { b.disabled = true; });

  try {
    const cert    = document.getElementById('certificate');
    const svgImgs = [...cert.querySelectorAll('img[src$=".svg"]')];

    // 1. Rasterise SVG logos → PNG
    const origSrcs = await Promise.all(svgImgs.map(rasteriseSvg));

    // 2. Capture certificate at 3× resolution
    const canvas = await window.html2canvas(cert, {
      scale:           3,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: '#ffffff',
      logging:         false,
    });

    // 3. Restore original SVG sources so the preview stays crisp
    svgImgs.forEach((img, i) => { img.src = origSrcs[i]; });

    // 4. Build A4 landscape PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit:        'mm',
      format:      'a4',
      compress:    true,
    });

    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);

    const lifterName = (document.getElementById('lifterName')?.value || 'certificate')
      .replace(/[^a-z0-9]/gi, '_').toLowerCase();

    pdf.save(`ynepf_record_${lifterName}.pdf`);

  } catch (err) {
    console.error('PDF export failed:', err);
    alert('There was a problem generating the PDF. Please try again.');
  } finally {
    overlay?.classList.remove('active');
    buttons.forEach(b => { b.disabled = false; });
  }
}
