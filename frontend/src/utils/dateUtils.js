/**
 * Standardized Date Utility Module for DD/MM/YYYY format.
 */

/**
 * Formats a date string (YYYY-MM-DD or ISO string) or Date object into DD/MM/YYYY.
 * Example: '2025-12-05' -> '05/12/2025'
 * @param {string|Date} dateVal 
 * @returns {string} Formatted date string in DD/MM/YYYY
 */
export function formatDateDDMMYYYY(dateVal) {
  if (!dateVal) return '';

  // If dateVal is already a YYYY-MM-DD string
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    const parts = dateVal.split('T')[0].split('-');
    const [year, month, day] = parts;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats a Date object or YYYY-MM-DD string to standard HTML5 date input format (YYYY-MM-DD).
 * @param {string|Date} dateVal 
 * @returns {string} YYYY-MM-DD
 */
export function toISOYYYYMMDD(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses manual DD/MM/YYYY input string to YYYY-MM-DD for backend APIs.
 * Returns null if invalid date.
 * @param {string} str 
 * @returns {string|null}
 */
export function parseDDMMYYYYToISO(str) {
  if (!str) return null;
  const match = str.trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Validate actual days in month
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
