/**
 * Centralized Formatter Utilities for MCU Admission System
 */

/**
 * Strictly normalizes any raw candidate application code into official MCU-69-XXXXX format.
 * Examples:
 *   '69004' -> 'MCU-69-69004'
 *   'MCU-69-69005' -> 'MCU-69-69005'
 *   '4' -> 'MCU-69-00004'
 */
export function formatMCUCode(rawCode: string | number | undefined | null): string {
  if (!rawCode) return 'MCU-69-69001';

  const str = String(rawCode).trim();
  if (str.startsWith('MCU-69-')) {
    return str;
  }

  // Extract numeric digits
  const digits = str.replace(/\D/g, '');
  if (!digits) return 'MCU-69-69001';

  if (digits.length >= 5) {
    return `MCU-69-${digits}`;
  }

  return `MCU-69-${digits.padStart(5, '0')}`;
}
