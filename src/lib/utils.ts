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

/**
 * Calculates a formula-based parameter value
 * @param formula - The formula string (e.g., "Hemoglobin * 10 / RBC Count")
 * @param parameters - Map of parameter names to their values
 * @returns Calculated value or null if calculation fails
 */
export function calculateFormula(
  formula: string,
  parameters: Record<string, number | string | undefined>
): number | null {
  if (!formula) return null;

  try {
    // Replace parameter names with their values
    let expression = formula;
    const paramNames = Object.keys(parameters).sort((a, b) => b.length - a.length); // Sort by length to match longer names first
    
    for (const paramName of paramNames) {
      const value = parameters[paramName];
      if (value !== undefined && value !== null && value !== "") {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (!isNaN(numValue)) {
          // Replace parameter name with its numeric value
          const regex = new RegExp(`\\b${paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
          expression = expression.replace(regex, String(numValue));
        }
      }
    }

    // Check if expression still contains non-numeric characters (should only have numbers, operators, spaces)
    // Allow: numbers, +, -, *, /, (, ), ., and spaces
    const sanitized = expression.replace(/\s/g, ''); // Remove spaces first
    const validPattern = /^[0-9+\-*/().]+$/;
    
    if (!validPattern.test(sanitized)) {
      return null; // Invalid characters found
    }

    // Use Function constructor for safe evaluation
    const result = Function(`"use strict"; return (${sanitized})`)();
    
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      // Round to 2 decimal places
      return Math.round(result * 100) / 100;
    }
    
    return null;
  } catch (error) {
    console.error("Formula calculation error:", error);
    return null;
  }
}
