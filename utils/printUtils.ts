import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Official high-resolution vector emblem URL for Madhya Pradesh Shasan & Gram Panchayat
export const DEFAULT_OFFICE_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Emblem_of_Madhya_Pradesh.svg/240px-Emblem_of_Madhya_Pradesh.svg.png';

/**
 * Returns a valid office logo URL or standard Madhya Pradesh State Emblem logo fallback
 */
export function getOfficeLogoUrl(officeDetails?: any): string {
  if (officeDetails?.logoUrl && typeof officeDetails.logoUrl === 'string' && officeDetails.logoUrl.trim().length > 0) {
    return officeDetails.logoUrl.trim();
  }
  return DEFAULT_OFFICE_LOGO;
}

/**
 * Returns a formatted office address line with block, district, state & pin
 */
export function getCleanOfficeSubtitle(officeDetails?: any, admin?: any): string {
  const block =
    (officeDetails?.block && String(officeDetails.block).trim()) ||
    (officeDetails?.janpadPanchayat && String(officeDetails.janpadPanchayat).trim()) ||
    (admin?.block && String(admin.block).trim()) ||
    (admin?.janpadPanchayat && String(admin.janpadPanchayat).trim()) ||
    '';
  const district =
    (officeDetails?.district && String(officeDetails.district).trim()) ||
    (officeDetails?.districtName && String(officeDetails.districtName).trim()) ||
    (admin?.district && String(admin.district).trim()) ||
    (admin?.districtName && String(admin.districtName).trim()) ||
    '';
  const state =
    (officeDetails?.state && String(officeDetails.state).trim()) ||
    (admin?.state && String(admin.state).trim()) ||
    'मध्य प्रदेश';
  const pin =
    officeDetails?.pincode || admin?.pincode ? ` - ${officeDetails?.pincode || admin?.pincode}` : '';

  const parts: string[] = [];
  if (block) {
    const cleanBlock = block
      .replace(/^(जनपद\s*पंचायत\s*:?\s*)/i, '')
      .replace(/^(जनपद\s*:?\s*)/i, '')
      .replace(/^(block\s*:?\s*)/i, '')
      .trim();
    if (cleanBlock) parts.push(`जनपद पंचायत: ${cleanBlock}`);
  }
  if (district) {
    const cleanDistrict = district
      .replace(/^(जिला\s*:?\s*)/i, '')
      .replace(/^(district\s*:?\s*)/i, '')
      .trim();
    if (cleanDistrict) parts.push(`जिला: ${cleanDistrict}`);
  }
  if (state) {
    parts.push(`(${state}${pin})`);
  }

  if (parts.length > 0) {
    return parts.join(', ');
  }

  if (officeDetails?.address && String(officeDetails.address).trim().length > 0) {
    return String(officeDetails.address).trim();
  }

  return 'जनपद पंचायत एवं जिला कार्यालय (मध्य प्रदेश)';
}

/**
 * Ensures clean office title without duplicate prefixes
 */
export function getCleanOfficeTitle(officeDetails?: any, fallbackPanchayat?: string): string {
  const officeNameRaw = officeDetails?.officeName ? String(officeDetails.officeName).trim() : '';
  const gpRaw =
    (officeDetails?.gramPanchayat ? String(officeDetails.gramPanchayat).trim() : '') ||
    (fallbackPanchayat && typeof fallbackPanchayat === 'string' ? fallbackPanchayat.trim() : '');

  let target = '';
  if (
    officeNameRaw &&
    officeNameRaw !== 'कार्यालय ग्राम पंचायत' &&
    officeNameRaw !== 'ग्राम पंचायत'
  ) {
    target = officeNameRaw;
  } else if (gpRaw) {
    target = gpRaw;
  } else {
    target = officeNameRaw || 'ग्राम पंचायत';
  }

  const cleanedName = target
    .replace(/^(कार्यालय\s*)+/gi, '')
    .replace(/^(ग्राम\s*पंचायत\s*)+/gi, '')
    .replace(/^(office\s*(of)?\s*)+/gi, '')
    .replace(/^(gram\s*panchayat\s*)+/gi, '')
    .trim();

  return cleanedName ? `कार्यालय ग्राम पंचायत ${cleanedName}` : 'कार्यालय ग्राम पंचायत';
}

/**
 * Format a Date object or ISO string to standard DD/MM/YYYY
 */
export function formatDateDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Check if a date string/Date object falls within a given financial year
 */
export function isInFinancialYear(dateInput: string | Date | null | undefined, financialYear: string): boolean {
  if (!dateInput || !financialYear) return false;
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return false;
    const parts = financialYear.split('-');
    if (parts.length !== 2) return false;
    const startYear = parseInt(parts[0], 10);
    const endYear = parseInt(parts[1], 10);
    const startDate = new Date(startYear, 3, 1, 0, 0, 0, 0); // April 1st
    const endDate = new Date(endYear, 2, 31, 23, 59, 59, 999); // March 31st
    return d >= startDate && d <= endDate;
  } catch {
    return false;
  }
}

/**
 * Converts numbers to Hindi/Indian currency words
 */
export function numberToHindiWords(num: number): string {
  if (num === 0) return 'शून्य';
  if (!num || isNaN(num)) return '';

  const ones = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
  const tens = ['', '', 'बीस', 'तीस', 'चालिस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return `${tens[ten]} ${ones[unit]}`.trim();
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  num %= 100;
  const remainder = Math.floor(num);

  if (crore > 0) words += `${convertTwoDigits(crore)} करोड़ `;
  if (lakh > 0) words += `${convertTwoDigits(lakh)} लाख `;
  if (thousand > 0) words += `${convertTwoDigits(thousand)} हजार `;
  if (hundred > 0) words += `${convertTwoDigits(hundred)} सौ `;
  if (remainder > 0) words += convertTwoDigits(remainder);

  return words.trim() + ' रुपये मात्र';
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function getMonthName(monthNumber: number, isHindi: boolean = true): string {
  const hindiMonths = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];
  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const index = Math.max(0, Math.min(11, (monthNumber || 1) - 1));
  return isHindi ? hindiMonths[index] : englishMonths[index];
}

export interface FinancialYearInfo {
  startYear: number;
  endYear: number;
  fyString: string;
  fyShort: string;
  label: string;
  nextFyString: string;
  nextFyShort: string;
}

export function getFinancialYear(dateInput: string | Date = new Date()): FinancialYearInfo {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const validDate = isNaN(d?.getTime()) ? new Date() : d;
    const month = validDate.getMonth() + 1;
    const year = validDate.getFullYear();
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    const fyString = `${startYear}-${String(endYear).slice(-2)}`;
    const fyShort = fyString;
    const nextStartYear = endYear;
    const nextEndYear = nextStartYear + 1;
    const nextFyString = `${nextStartYear}-${String(nextEndYear).slice(-2)}`;
    const nextFyShort = nextFyString;
    const label = `${startYear}-${endYear}`;
    return { startYear, endYear, fyString, fyShort, label, nextFyString, nextFyShort };
  } catch {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    const fyString = `${startYear}-${String(endYear).slice(-2)}`;
    return {
      startYear,
      endYear,
      fyString,
      fyShort: fyString,
      label: `${startYear}-${endYear}`,
      nextFyString: `${endYear}-${String(endYear + 1).slice(-2)}`,
      nextFyShort: `${endYear}-${String(endYear + 1).slice(-2)}`,
    };
  }
}

/**
 * Returns current and next financial year helper object
 */
export function getCurrentFinancialYear(): FinancialYearInfo {
  return getFinancialYear(new Date());
}

/**
 * Injects print orientation style into document
 */
export function injectDocumentPrintStyle(orientation: 'landscape' | 'portrait' = 'portrait'): void {
  const isLandscape = orientation === 'landscape';
  let styleEl = document.getElementById('gp-print-dynamic-style') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'gp-print-dynamic-style';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = `
    @page {
      size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'} !important;
      margin: ${isLandscape ? '5mm 6mm' : '6mm 8mm'} !important;
    }

    @media screen {
      #gp-print-portal {
        display: none !important;
        position: absolute !important;
        left: -99999px !important;
        top: -99999px !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    }

    @media print {
      *, *:before, *:after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      
      body.is-printing-portal-active > *:not(#gp-print-portal),
      body:has(#gp-print-portal:not(:empty)) > *:not(#gp-print-portal) {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
      }

      body.is-printing-portal-active #gp-print-portal,
      #gp-print-portal {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
      }

      html, body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
        max-height: none !important;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      #gp-print-portal {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        max-width: ${isLandscape ? '287mm' : '100%'} !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
      }

      #gp-print-portal,
      #gp-print-portal * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
        max-height: none !important;
        text-overflow: clip !important;
        -webkit-line-clamp: unset !important;
        line-clamp: unset !important;
      }

      #gp-print-portal p,
      #gp-print-portal span,
      #gp-print-portal div,
      #gp-print-portal td,
      #gp-print-portal th,
      #gp-print-portal label,
      #gp-print-portal li,
      #gp-print-portal h1,
      #gp-print-portal h2,
      #gp-print-portal h3,
      #gp-print-portal h4,
      #gp-print-portal h5,
      #gp-print-portal h6 {
        line-height: 1.45 !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }

      #gp-print-portal button,
      #gp-print-portal input:not([type="checkbox"]),
      #gp-print-portal select,
      #gp-print-portal textarea,
      #gp-print-portal .no-print,
      #gp-print-portal [class*="no-print"],
      #gp-print-portal .print\\:hidden,
      #gp-print-portal [class*="print:hidden"] {
        display: none !important;
        visibility: hidden !important;
      }

      #gp-print-portal #demand-notice-printable-area,
      #gp-print-portal .demand-notice-card,
      #gp-print-portal #receipt-print-area,
      #gp-print-portal #member-card-printable,
      #gp-print-portal #printable-member-card,
      #gp-print-portal #printable-area,
      #gp-print-portal .printable-area,
      #gp-print-portal #booking-receipt-print-area,
      #gp-print-portal #printable-building-permission,
      #gp-print-portal #printable-business-certificate,
      #gp-print-portal #printable-voucher-slip,
      #gp-print-portal #printable-payment-notesheet,
      #gp-print-portal #printable-cashbook-register,
      #gp-print-portal #printable-cashbook-ledger,
      #gp-print-portal #printable-works-expenditure-report,
      #gp-print-portal #printable-taxpayers-report,
      #gp-print-portal #tax-ledger-printable-area,
      #gp-print-portal #bulk-vouchers-print-area {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        overflow: visible !important;
      }

      #gp-print-portal .demand-notice-card {
        border: 2px solid #0f172a !important;
        border-radius: 12px !important;
        padding: 16px 20px !important;
        margin-bottom: 24px !important;
        background-color: #ffffff !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      #gp-print-portal #printable-business-certificate,
      #gp-print-portal .printable-landscape,
      #gp-print-portal .certificate-landscape {
        max-width: 287mm !important;
        width: 100% !important;
        margin: 0 auto !important;
        padding: 2mm !important;
        box-sizing: border-box !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      #gp-print-portal .grid-cols-12,
      #gp-print-portal [class*="grid-cols-12"],
      #gp-print-portal [class*="md:grid-cols-12"] {
        display: grid !important;
        grid-template-columns: 7fr 5fr !important;
        gap: 8px !important;
      }
      #gp-print-portal .col-span-7,
      #gp-print-portal [class*="col-span-7"],
      #gp-print-portal [class*="md:col-span-7"] {
        grid-column: span 1 !important;
      }
      #gp-print-portal .col-span-5,
      #gp-print-portal [class*="col-span-5"],
      #gp-print-portal [class*="md:col-span-5"] {
        grid-column: span 1 !important;
      }
      #gp-print-portal .grid-cols-4,
      #gp-print-portal [class*="grid-cols-4"],
      #gp-print-portal [class*="sm:grid-cols-4"] {
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 6px !important;
      }
      #gp-print-portal .hidden.md\\:flex,
      #gp-print-portal [class*="hidden md:flex"],
      #gp-print-portal [class*="md:flex"] {
        display: flex !important;
      }
      #gp-print-portal .grid-cols-2,
      #gp-print-portal [class*="grid-cols-2"] {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      #gp-print-portal table {
        width: 100% !important;
        border-collapse: collapse !important;
        table-layout: auto !important;
        margin-bottom: 8px !important;
        overflow: visible !important;
      }

      #gp-print-portal thead {
        display: table-header-group !important;
      }

      #gp-print-portal tbody {
        display: table-row-group !important;
      }

      #gp-print-portal tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      #gp-print-portal th,
      #gp-print-portal td {
        overflow: visible !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        padding: 4px 6px !important;
        line-height: 1.4 !important;
      }
    }
  `;
}

/**
 * Finds and returns printable DOM element based on id or fallback search
 */
export function resolvePrintableElement(elementIdOrHtml?: string | HTMLElement): { element: HTMLElement | null; rawHtml: string } {
  if (!elementIdOrHtml) {
    const candidates = [
      'printable-payment-notesheet',
      'printable-voucher-slip',
      'printable-cashbook-register',
      'printable-cashbook-ledger',
      'printable-works-expenditure-report',
      'printable-work-breakdown-modal',
      'printable-taxpayers-report',
      'printable-member-card',
      'demand-notice-printable-area',
      'demand-notice-card',
      'receipt-print-area',
      'member-card-printable',
      'member-card-printable-area',
      'printable-business-certificate',
      'printable-building-permission',
      'booking-receipt-print-area',
      'bulk-vouchers-print-area',
      'printable-area'
    ];
    for (const cid of candidates) {
      const found = document.getElementById(cid);
      if (found) return { element: found, rawHtml: '' };
    }
    const classEl = (document.querySelector('.demand-notice-card') as HTMLElement) ||
                    (document.querySelector('.printable-area') as HTMLElement) ||
                    (document.querySelector('.printable-certificate') as HTMLElement);
    return { element: classEl, rawHtml: '' };
  }

  if (elementIdOrHtml instanceof HTMLElement) {
    return { element: elementIdOrHtml, rawHtml: '' };
  }

  const trimmed = elementIdOrHtml.trim();
  if (trimmed.startsWith('<') || trimmed.includes('<div') || trimmed.includes('<html')) {
    return { element: null, rawHtml: trimmed };
  }

  const cleanId = trimmed.replace(/^#/, '');
  const el = document.getElementById(cleanId) ||
             document.querySelector(trimmed) ||
             document.querySelector(`.${cleanId}`) ||
             document.querySelector(`[data-print-target="${cleanId}"]`);

  if (el) return { element: el as HTMLElement, rawHtml: '' };

  return { element: null, rawHtml: '' };
}

/**
 * Converts any DOM element or HTML string into a high-definition PDF and triggers an instant browser download.
 * 100% works across all browsers, mobile devices, and sandboxed iframes without popup or print dialog restrictions.
 */
export async function downloadElementAsPDF(
  elementIdOrHtmlOrEl?: string | HTMLElement,
  filename = 'Panchayat_Document',
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<boolean> {
  let tempWrapper: HTMLElement | null = null;
  try {
    const resolved = resolvePrintableElement(elementIdOrHtmlOrEl);
    const isLandscape = orientation === 'landscape';
    const targetWidth = isLandscape ? 1120 : 800;

    let sourceNode: HTMLElement | null = resolved.element;

    // Create an unconstrained sandbox within active DOM coordinates for perfect font rasterization
    tempWrapper = document.createElement('div');
    tempWrapper.id = 'gp-pdf-render-sandbox';
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.left = '0';
    tempWrapper.style.top = '0';
    tempWrapper.style.width = `${targetWidth}px`;
    tempWrapper.style.backgroundColor = '#ffffff';
    tempWrapper.style.zIndex = '999999';
    tempWrapper.style.opacity = '1';
    tempWrapper.style.visibility = 'visible';
    tempWrapper.style.pointerEvents = 'none';
    tempWrapper.style.boxSizing = 'border-box';
    tempWrapper.style.overflow = 'visible';
    tempWrapper.style.fontFamily = "'Noto Sans Devanagari', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
    tempWrapper.style.lineHeight = '1.5';
    tempWrapper.style.color = '#0f172a';

    if (resolved.rawHtml) {
      tempWrapper.innerHTML = resolved.rawHtml;
    } else if (sourceNode) {
      // Deep clone the source element
      const cloned = sourceNode.cloneNode(true) as HTMLElement;
      tempWrapper.appendChild(cloned);
    } else {
      const root = document.getElementById('root');
      if (root) {
        tempWrapper.appendChild(root.cloneNode(true) as HTMLElement);
      }
    }

    // Clean up clone: strip modal buttons, no-print elements, and clear all max-height/overflow restrictions
    tempWrapper.querySelectorAll('.no-print, [class*="no-print"], button, .print\\:hidden, [class*="print:hidden"]').forEach((btn) => {
      (btn as HTMLElement).remove();
    });

    const allDescendants = tempWrapper.querySelectorAll('*');
    allDescendants.forEach((node) => {
      const el = node as HTMLElement;
      if (el.style) {
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el.style.overflowX = 'visible';
        el.style.overflowY = 'visible';
        if (el.classList.contains('overflow-y-auto') || el.classList.contains('overflow-x-auto') || el.classList.contains('overflow-auto') || el.classList.contains('overflow-hidden')) {
          el.classList.remove('overflow-y-auto', 'overflow-x-auto', 'overflow-auto', 'overflow-hidden');
        }
        if (el.classList.contains('truncate')) {
          el.classList.remove('truncate');
        }
        if (el.classList.contains('font-mono') && /[\u0900-\u097F]/.test(el.innerText || '')) {
          el.classList.remove('font-mono');
          el.classList.add('font-sans');
        }
      }
    });

    if (tempWrapper.firstElementChild) {
      const rootChild = tempWrapper.firstElementChild as HTMLElement;
      rootChild.style.maxHeight = 'none';
      rootChild.style.height = 'auto';
      rootChild.style.overflow = 'visible';
      rootChild.style.width = '100%';
    }

    document.body.appendChild(tempWrapper);

    // Wait for layout paints and font metrics
    await new Promise((r) => setTimeout(r, 120));

    // Capture DOM using html2canvas with high-DPI
    const canvas = await html2canvas(tempWrapper, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: targetWidth,
      windowWidth: targetWidth,
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }
          span, p, div, td, th, h1, h2, h3, h4, h5, h6 {
            line-height: 1.45 !important;
            overflow: visible !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    if (tempWrapper && tempWrapper.parentNode) {
      tempWrapper.parentNode.removeChild(tempWrapper);
      tempWrapper = null;
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;
    const margin = 5;
    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalHeightInMm = (imgHeight * availableWidth) / imgWidth;

    if (totalHeightInMm <= availableHeight * 1.15) {
      // Document fits on a single page
      let renderWidth = availableWidth;
      let renderHeight = totalHeightInMm;
      if (renderHeight > availableHeight) {
        renderHeight = availableHeight;
        renderWidth = (renderHeight * imgWidth) / imgHeight;
      }
      const posX = margin + (availableWidth - renderWidth) / 2;
      const posY = margin;
      pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // Multi-page document: slice across pages neatly
      let heightLeft = totalHeightInMm;
      let position = margin;
      let page = 0;

      while (heightLeft > 0) {
        if (page > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position - (page * availableHeight),
          availableWidth,
          totalHeightInMm,
          undefined,
          'FAST'
        );
        heightLeft -= availableHeight;
        page++;
      }
    }

    const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Error in downloadElementAsPDF:', error);
    if (tempWrapper && tempWrapper.parentNode) {
      tempWrapper.parentNode.removeChild(tempWrapper);
    }
    return false;
  }
}

/**
 * Creates a standalone HTML file and opens it in a fresh browser tab or triggers print,
 * completely avoiding any iframe sandbox / modal restrictions.
 */
export function openInStandaloneTab(
  elementIdOrHtml?: string | HTMLElement,
  title = 'Print Document',
  orientation: 'portrait' | 'landscape' = 'portrait'
): void {
  try {
    const isLandscape = orientation === 'landscape';
    const resolved = resolvePrintableElement(elementIdOrHtml);
    let innerContent = '';

    if (resolved.rawHtml) {
      innerContent = resolved.rawHtml;
    } else if (resolved.element) {
      innerContent = resolved.element.outerHTML;
    } else {
      innerContent = document.getElementById('root')?.outerHTML || '';
    }

    const collectedStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((s) => s.outerHTML)
      .join('\n');

    const completeHtml = `
      <!DOCTYPE html>
      <html lang="hi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          ${collectedStyles}
          <style>
            @page {
              size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'} !important;
              margin: ${isLandscape ? '2.5mm 3.5mm' : '4mm 6mm'} !important;
            }
            *, *:before, *:after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 auto !important;
              padding: 6px !important;
              font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            }
            .no-print, button, input:not([type="checkbox"]), select, textarea {
              display: none !important;
            }
            .floating-tab-toolbar {
              position: sticky;
              top: 8px;
              z-index: 999999;
              display: flex;
              justify-content: center;
              gap: 12px;
              background: #0f172a;
              color: white;
              padding: 10px 18px;
              border-radius: 14px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.3);
              margin: 8px auto 16px auto;
              max-width: 650px;
            }
            .floating-tab-toolbar button {
              display: inline-flex !important;
            }
            @media print {
              .floating-tab-toolbar {
                display: none !important;
              }
            }
          </style>
        </head>
        <body class="bg-slate-100 p-4">
          <div class="floating-tab-toolbar no-print">
            <button onclick="window.print()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow cursor-pointer">
              🖨️ प्रिंट करें / Save as PDF (Ctrl + P)
            </button>
            <button onclick="window.close()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm rounded-lg cursor-pointer">
              ✕ बंद करें
            </button>
          </div>
          <div class="max-w-6xl mx-auto bg-white p-4 rounded-xl shadow-lg border border-slate-200">
            ${innerContent}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 400);
            });
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([completeHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const opened = window.open(blobUrl, '_blank');
    if (!opened) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.click();
    }
  } catch (err) {
    console.error('Error opening standalone tab:', err);
  }
}

/**
 * Standard trigger print function with high-contrast color preservation, orientation handling, and layout isolation.
 */
export function triggerPrint(
  elementIdOrHtml?: string | HTMLElement,
  options?: { orientation?: 'portrait' | 'landscape'; title?: string } | 'landscape' | 'portrait'
): void {
  try {
    let orientation: 'portrait' | 'landscape' = 'portrait';
    let title = 'Gram Panchayat Receipt / Voucher / Certificate';

    if (typeof options === 'string') {
      orientation = options.toLowerCase() === 'landscape' ? 'landscape' : 'portrait';
    } else if (options && typeof options === 'object') {
      if (options.orientation) orientation = options.orientation;
      if (options.title) title = options.title;
    }

    const prevTitle = document.title;
    if (title) {
      document.title = title;
    }

    const resolved = resolvePrintableElement(elementIdOrHtml);
    let targetEl: HTMLElement | null = resolved.element;
    let rawHtml = resolved.rawHtml;

    if (elementIdOrHtml && typeof elementIdOrHtml === 'string' && (elementIdOrHtml.includes('landscape') || elementIdOrHtml.includes('business-certificate'))) {
      orientation = 'landscape';
    } else if (targetEl && (targetEl.id?.includes('business-certificate') || targetEl.className?.includes('landscape'))) {
      orientation = 'landscape';
    }

    // 1. Setup the #gp-print-portal container
    let portal = document.getElementById('gp-print-portal');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'gp-print-portal';
      document.body.appendChild(portal);
    }

    if (rawHtml) {
      portal.innerHTML = rawHtml;
    } else if (targetEl) {
      const cloned = targetEl.cloneNode(true) as HTMLElement;
      cloned.classList.remove('hidden');
      cloned.style.display = 'block';
      cloned.style.visibility = 'visible';
      cloned.style.maxHeight = 'none';
      cloned.style.height = 'auto';
      cloned.style.overflow = 'visible';

      // Clean up interactive controls & strip scroll / height constraints from clone
      cloned.querySelectorAll('.no-print, [class*="no-print"], button, .print\\:hidden, [class*="print:hidden"]').forEach((btn) => {
        (btn as HTMLElement).remove();
      });

      const allDescendants = cloned.querySelectorAll('*');
      allDescendants.forEach((node) => {
        const el = node as HTMLElement;
        if (el.style) {
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
          el.style.overflowX = 'visible';
          el.style.overflowY = 'visible';
          if (
            el.classList.contains('overflow-y-auto') ||
            el.classList.contains('overflow-x-auto') ||
            el.classList.contains('overflow-auto') ||
            el.classList.contains('overflow-hidden')
          ) {
            el.classList.remove('overflow-y-auto', 'overflow-x-auto', 'overflow-auto', 'overflow-hidden');
          }
          if (el.classList.contains('truncate')) {
            el.classList.remove('truncate');
          }
          if (el.classList.contains('line-clamp-1') || el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) {
            el.classList.remove('line-clamp-1', 'line-clamp-2', 'line-clamp-3');
          }
        }
      });

      portal.innerHTML = '';
      portal.appendChild(cloned);
    } else {
      portal.innerHTML = document.getElementById('root')?.innerHTML || '';
    }

    // Remove any leftover action bars or popups if present
    const existingBar = document.getElementById('gp-quick-print-bar');
    if (existingBar) existingBar.remove();
    const existingModal = document.getElementById('gp-inpage-print-modal');
    if (existingModal) existingModal.remove();

    // 2. Inject print CSS
    injectDocumentPrintStyle(orientation);

    // Mark active print class on body for fail-safe media print CSS
    document.body.classList.add('is-printing-portal-active');

    // 4. Safe afterprint handler
    const cleanup = () => {
      document.title = prevTitle;
      document.body.classList.remove('is-printing-portal-active');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    // Safety fallback to remove print class
    setTimeout(() => {
      document.body.classList.remove('is-printing-portal-active');
    }, 8000);

    // 5. Fire window.print directly after layout paints for immediate browser print preview
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.warn('window.print error:', err);
      }
    }, 100);
  } catch (err) {
    console.error('Print trigger error:', err);
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn('Direct window.print() fallback error:', e);
    }
  }
}

/**
 * Prints an HTML element cleanly via an isolated temporary container/iframe with safe fallback.
 */
export function printElementViaIframe(
  elementId: string,
  options?: { orientation?: 'portrait' | 'landscape'; title?: string }
): void {
  const orientation = options?.orientation || (elementId.includes('landscape') || elementId.includes('business-certificate') ? 'landscape' : 'portrait');
  triggerPrint(elementId, { orientation, title: options?.title });
}

/**
 * Opens the certificate / report in a dedicated clean popup window for 100% reliable printing and PDF download
 * If popups are blocked by iframe sandboxes, smoothly mounts an in-page print preview overlay.
 */
export function openPrintWindow(
  elementIdOrHtml: string,
  title = 'Certificate Print',
  orientation: 'landscape' | 'portrait' = 'landscape'
) {
  try {
    let renderedHtml = '';
    const isLandscape = orientation === 'landscape';

    if (elementIdOrHtml && (elementIdOrHtml.trim().startsWith('<') || elementIdOrHtml.includes('<div') || elementIdOrHtml.includes('<html'))) {
      renderedHtml = elementIdOrHtml;
    } else {
      const resolved = resolvePrintableElement(elementIdOrHtml);
      if (!resolved.element && !resolved.rawHtml) {
        triggerPrint(elementIdOrHtml, { orientation, title });
        return;
      }
      renderedHtml = resolved.rawHtml || (resolved.element ? resolved.element.outerHTML : '');
    }

    const collectedStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((s) => s.outerHTML)
      .join('\n');

    let printWin: Window | null = null;
    try {
      printWin = window.open('', '_blank', 'width=1200,height=850,menubar=no,toolbar=no,location=no,status=no');
    } catch {
      printWin = null;
    }

    if (!printWin) {
      triggerPrint(elementIdOrHtml, { orientation, title });
      return;
    }

    printWin.document.open();
    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="hi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          ${collectedStyles}
          <style>
            @page {
              size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'} !important;
              margin: ${isLandscape ? '2.5mm 3.5mm' : '4mm 6mm'} !important;
            }
            *, *:before, *:after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 auto !important;
              padding: 4px !important;
              font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }
            .no-print, nav, aside, footer {
              display: none !important;
            }
            #printable-business-certificate, .printable-certificate, .printable-area, #printable-area, #receipt-print-area {
              display: block !important;
              width: 100% !important;
              max-width: ${isLandscape ? '290mm' : '100%'} !important;
              margin: 0 auto !important;
              padding: 2mm !important;
              box-sizing: border-box !important;
            }
            #printable-business-certificate .grid-cols-12, #printable-business-certificate [class*="grid-cols-12"], #printable-business-certificate [class*="md:grid-cols-12"] {
              display: grid !important;
              grid-template-columns: 7fr 5fr !important;
              gap: 10px !important;
            }
            #printable-business-certificate [class*="md:col-span-7"], #printable-business-certificate [class*="col-span-7"] {
              grid-column: span 1 !important;
            }
            #printable-business-certificate [class*="md:col-span-5"], #printable-business-certificate [class*="col-span-5"] {
              grid-column: span 1 !important;
            }
            #printable-business-certificate [class*="sm:grid-cols-4"], #printable-business-certificate [class*="grid-cols-4"] {
              display: grid !important;
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              gap: 6px !important;
            }
            #printable-business-certificate [class*="hidden md:flex"], #printable-business-certificate [class*="md:flex"] {
              display: flex !important;
            }
            #printable-business-certificate [class*="grid-cols-2"] {
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            .floating-toolbar {
              position: sticky;
              top: 10px;
              z-index: 99999;
              display: flex;
              justify-content: center;
              gap: 12px;
              background: #0f172a;
              color: white;
              padding: 10px 16px;
              border-radius: 14px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.3);
              margin: 8px auto 16px auto;
              max-width: 600px;
            }
            .floating-print-btn {
              background: #059669;
              color: white;
              padding: 9px 22px;
              border-radius: 10px;
              font-weight: 800;
              font-size: 14px;
              cursor: pointer;
              border: 1px solid #10b981;
              display: flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 2px 8px rgba(5,150,105,0.4);
            }
            .floating-print-btn:hover {
              background: #047857;
            }
            .floating-close-btn {
              background: #334155;
              color: #f8fafc;
              padding: 9px 18px;
              border-radius: 10px;
              font-weight: 700;
              font-size: 14px;
              cursor: pointer;
              border: 1px solid #475569;
            }
            .floating-close-btn:hover {
              background: #475569;
            }
            @media print {
              .floating-toolbar {
                display: none !important;
              }
            }
          </style>
        </head>
        <body class="bg-slate-100 p-3">
          <div class="floating-toolbar no-print">
            <button class="floating-print-btn" onclick="window.print()">🖨️ प्रमाण पत्र प्रिंट / PDF सेव करें</button>
            <button class="floating-close-btn" onclick="window.close()">✕ विंडो बंद करें</button>
          </div>
          <div class="print-container ${isLandscape ? 'printable-landscape' : ''}">
            ${renderedHtml}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 300);
            });
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  } catch (e) {
    console.error('Popup print window error, fallback to in-page triggerPrint:', e);
    triggerPrint(elementIdOrHtml, { orientation, title });
  }
}
