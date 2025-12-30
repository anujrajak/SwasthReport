/**
 * Options for cleaning Firestore data
 */
export interface CleanDataOptions {
  /**
   * Fields that should be converted from empty strings to null
   * (typically optional string fields)
   */
  optionalStringFields?: string[];
  /**
   * Fields that are arrays and should be filtered/cleaned
   * (empty arrays will be converted to null)
   */
  arrayFields?: string[];
}

/**
 * Cleans data for Firestore by:
 * - Filtering out undefined values
 * - Converting empty strings to null for optional fields
 * - Filtering empty values from arrays
 *
 * @param data - The data object to clean
 * @param options - Configuration options for cleaning
 * @returns Cleaned data object ready for Firestore
 */
export function cleanFirestoreData<T extends Record<string, unknown> | object>(
  data: Partial<T> | T,
  options: CleanDataOptions = {}
): Record<string, unknown> {
  const { optionalStringFields = [], arrayFields = [] } = options;
  const cleanedData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue; // Skip undefined values
    }

    // Handle optional string fields - convert empty strings to null
    if (optionalStringFields.includes(key) && value === "") {
      cleanedData[key] = null;
    }
    // Handle array fields - filter empty values and convert empty arrays to null
    else if (arrayFields.includes(key) && Array.isArray(value)) {
      const filtered = value.filter(
        (item) =>
          item !== null && item !== undefined && String(item).trim() !== ""
      );
      cleanedData[key] = filtered.length > 0 ? filtered : null;
    }
    // Keep other values as-is
    else {
      cleanedData[key] = value;
    }
  }

  return cleanedData;
}
