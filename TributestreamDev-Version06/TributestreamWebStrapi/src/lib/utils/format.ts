/**
 * Format utilities for the application
 */

/**
 * Format a number as currency
 * @param value The value to format
 * @param locale The locale to use (defaults to 'en-US')
 * @param currency The currency to use (defaults to 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  locale = 'en-US', 
  currency = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format a date string
 * @param dateString The date string to format
 * @param locale The locale to use (defaults to 'en-US')
 * @param options The options to use (defaults to { dateStyle: 'medium' })
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string, 
  locale = 'en-US', 
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  if (!dateString) return '';
  return new Intl.DateTimeFormat(locale, options).format(new Date(dateString));
}

/**
 * Format a string to title case
 * @param str The string to format
 * @returns Title cased string
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str The string to truncate
 * @param maxLength The maximum length of the string
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Format a date string as date, time, or datetime
 * @param dateString The date string to format
 * @param type The type of format ('date', 'time', or 'datetime')
 * @param locale The locale to use (defaults to 'en-US')
 * @returns Formatted date/time string
 */
export function formatDateTime(
  dateString: string,
  type: 'date' | 'time' | 'datetime' = 'datetime',
  locale = 'en-US'
): string {
  if (!dateString) return '';
  
  let options: Intl.DateTimeFormatOptions;
  
  switch (type) {
    case 'date':
      options = { dateStyle: 'medium' };
      break;
    case 'time':
      options = { timeStyle: 'short' };
      break;
    case 'datetime':
    default:
      options = {
        dateStyle: 'medium',
        timeStyle: 'short'
      };
      break;
  }
  
  return formatDate(dateString, locale, options);
}