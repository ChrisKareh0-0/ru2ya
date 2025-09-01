import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the first image URL from a comma-separated string of image URLs
 * @param imageString - Comma-separated string of image URLs
 * @returns The first image URL or empty string if none found
 */
export function getFirstImageUrl(imageString: string | undefined | null): string {
  if (!imageString) return '';
  
  // Split by comma and get the first URL, then trim whitespace
  const firstUrl = imageString.split(',')[0]?.trim();
  return firstUrl || '';
}