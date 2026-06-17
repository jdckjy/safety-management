
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv<T extends Record<string, any>>(
  filename: string, 
  data: T[], 
  headers: Record<keyof T, string>
) {
  const headerValues = Object.values(headers);
  const csvRows = [headerValues.join(',')];

  data.forEach(item => {
    const row = Object.keys(headers).map(key => {
      let value: any = item[key as keyof T];
      if (value === null || value === undefined) {
        value = '-';
      } else if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      return value;
    });
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\r\n');
  const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const shortenName = (name: string, maxLength = 10) => {
  if (name.length <= maxLength) {
    return name;
  }
  return `${name.substring(0, maxLength - 3)}...`;
};