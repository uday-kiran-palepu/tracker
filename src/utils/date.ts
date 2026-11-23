/**
 * Date formatting utilities for Project Portal
 * Eliminates raw ISO timestamps (e.g. '2026-11-20T18:30:00.000Z') across the entire application.
 */

/**
 * Format any date input into a clean string.
 * @param val Date, timestamp, or date string
 * @param format 'display' (e.g. '20 Nov 2026') | 'input' / 'isoDate' (e.g. 'YYYY-MM-DD')
 */
export function formatDate(val: any, format: 'display' | 'input' | 'isoDate' = 'display'): string {
  if (!val) return '';

  let date: Date;
  if (val instanceof Date) {
    date = val;
  } else if (typeof val === 'number') {
    date = new Date(val);
  } else if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return '';
    // If input requires YYYY-MM-DD and it already is YYYY-MM-DD
    if ((format === 'input' || format === 'isoDate') && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    date = new Date(trimmed);
  } else {
    return '';
  }

  if (isNaN(date.getTime())) {
    // If unparseable string, strip T if present
    return typeof val === 'string' ? val.split('T')[0] : '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const ymd = `${year}-${month}-${day}`;

  if (format === 'input' || format === 'isoDate') {
    return ymd;
  }

  // Human-friendly readable format: '20 Nov 2026'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getMonth()]} ${year}`;
}

/**
 * Convenience helper specifically for HTML <input type="date" value={formatDateInput(val)} />
 */
export function formatDateInput(val: any): string {
  return formatDate(val, 'input');
}
