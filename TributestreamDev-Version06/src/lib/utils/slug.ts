/**
 * Converts a string to a URL-friendly slug
 * Handles special characters, spaces, and accents
 * 
 * @param input - The string to convert to a slug
 * @param options - Optional configuration for slug generation
 * @returns A URL-friendly slug
 */
export function generateSlug(
  input: string,
  options: {
    lowercase?: boolean;
    separator?: string;
    removeStopWords?: boolean;
    maxLength?: number;
  } = {}
): string {
  if (!input) return '';

  const {
    lowercase = true,
    separator = '-',
    removeStopWords = false,
    maxLength = 100
  } = options;

  // List of common English stop words
  const stopWords = removeStopWords 
    ? ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of']
    : [];

  // Convert accented characters to their ASCII equivalents
  let result = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Convert to lowercase if specified
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Replace non-alphanumeric characters with separator
  result = result
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (excl. spaces and hyphens)
    .replace(/[\s_-]+/g, separator) // Replace spaces, underscores, and hyphens with separator
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separators

  // Remove stop words if enabled
  if (removeStopWords && stopWords.length) {
    const words = result.split(separator);
    const filteredWords = words.filter(word => !stopWords.includes(word));
    result = filteredWords.join(separator);
  }

  // Truncate if longer than maxLength
  if (maxLength > 0 && result.length > maxLength) {
    // Truncate at the last separator before maxLength
    const lastSeparatorIndex = result.substring(0, maxLength).lastIndexOf(separator);
    if (lastSeparatorIndex > 0) {
      result = result.substring(0, lastSeparatorIndex);
    } else {
      result = result.substring(0, maxLength);
    }
  }

  // Log successful slug generation
  console.log('🔗 Generated slug:', result);

  return result;
}