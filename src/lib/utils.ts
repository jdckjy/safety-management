
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenName(name: string, maxLength = 8) {
  if (!name) return "";

  // Remove common prefixes like (재), (주), 재단법인 등
  const cleanedName = name.replace(/\(재\)|\(주\)|재단법인|사단법인/g, '').trim();

  // If the name is still too long, truncate it
  if (cleanedName.length > maxLength) {
    return `${cleanedName.substring(0, maxLength)}...`;
  }

  return cleanedName;
}
