import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { testsData } from "./constants/tests-data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a string to title case
 * @param str - The string to convert
 * @returns The string in title case
 */
export function toTitleCase(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Sorts test parameters according to the order defined in tests-data.ts
 * and includes all parameters from constants, showing "-" for missing values
 * @param testId - The test ID
 * @param parameters - The parameters object from the report
 * @returns Array of [paramName, paramResult] tuples sorted by constants order
 */
export function sortParametersByConstantsOrder(
  testId: string,
  parameters: Record<string, any>
): Array<[string, any]> {
  const testData = testsData[testId as keyof typeof testsData];
  
  // If test not found in constants, return original order
  if (!testData || !testData.parameters) {
    return Object.entries(parameters);
  }

  // Create result array with all parameters from constants in order
  const result: Array<[string, any]> = [];
  
  testData.parameters.forEach((param) => {
    const paramName = param.name;
    // Check if parameter exists in the test results
    if (parameters[paramName]) {
      // Use the existing result
      result.push([paramName, parameters[paramName]]);
    } else {
      // Create a placeholder with "-" as value
      result.push([
        paramName,
        {
          value: "-",
          unit: param.unit || "",
          range: param.range || "",
        },
      ]);
    }
  });

  // Also include any parameters that exist in results but not in constants
  // (for backward compatibility)
  Object.entries(parameters).forEach(([paramName, paramResult]) => {
    const existsInConstants = testData.parameters.some(
      (p) => p.name === paramName
    );
    if (!existsInConstants) {
      result.push([paramName, paramResult]);
    }
  });

  return result;
}
