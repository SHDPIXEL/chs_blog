/**
 * Utility functions for date and time handling with time zone support
 */
import * as dateFnsTz from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

// Convert UTC to IST
export function utcToIst(utcDate: Date | string | null): Date | null {
  if (!utcDate) return null;

  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return dateFnsTz.toZonedTime(date, IST_TIMEZONE);
}

// Convert IST to UTC
export function istToUtc(istDate: Date | string | null): Date | null {
  if (!istDate) return null;

  const date = typeof istDate === 'string' ? new Date(istDate) : istDate;
  return dateFnsTz.zonedTimeToUtc(date, IST_TIMEZONE);
}

// IST is UTC+5:30
const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

/**
 * Convert a UTC date to IST date
 * @param utcDate Date in UTC
 * @returns Date in IST
 */
export function getNowInIst(): Date {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // add 5.5 hours
}

// export function utcToIst(utcDate: Date | string | null): Date | null {
//   if (!utcDate) return null;

//   const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

//   // Use toLocaleString to get IST time string, then convert back to Date object
//   const istString = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//   return new Date(istString);
// }

// /**
//  * Convert an IST date to UTC date
//  * @param istDate Date in IST
//  * @returns Date in UTC
//  */
// export function istToUtc(istDate: Date | string | null): Date | null {
//   if (!istDate) return null;
  
//   const date = typeof istDate === 'string' ? new Date(istDate) : istDate;
//   const istMs = date.getTime();
//   const utcMs = istMs - IST_OFFSET;
//   return new Date(utcMs);
// }

/**
 * Format a date for display in IST
 * @param date Date to format
 * @returns Formatted date string in IST
 */
export function formatIstDate(date: Date | string | null): string {
  if (!date) return '';
  
  const istDate = utcToIst(date);
  if (!istDate) return '';
  
  // Format: "May 2, 2025, 5:36 AM IST"
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(istDate) + ' IST';
}

/**
 * Format a date in ISO format but in IST timezone
 * @param date Date to format
 * @returns ISO formatted date string in IST
 */
export function formatIstIsoDate(date: Date | string | null): string {
  if (!date) return '';
  
  const istDate = utcToIst(date);
  if (!istDate) return '';
  
  return istDate.toISOString();
}

/**
 * Get the current date and time in IST
 * @returns Current date in IST
 */
export function getCurrentIstDate(): Date {
  return utcToIst(new Date())!;
}

/**
 * Check if a date is in the past (in IST)
 * @param date Date to check
 * @returns True if the date is in the past
 */
export function isDatePastInIst(date: Date | string | null): boolean {
  if (!date) return false;
  
  const istDate = typeof date === 'string' ? new Date(date) : date;
  const currentIst = getCurrentIstDate();
  return istDate < currentIst;
}