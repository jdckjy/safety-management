
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenName(name: string) {
  if (name.length <= 2) {
    return name;
  }
  return `${name[0]}*${name[name.length - 1]}`;
}
