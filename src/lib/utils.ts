import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ======================================================================================
// [신규] CSV 다운로드 유틸리티 함수
// ======================================================================================

/**
 * 주어진 데이터를 사용하여 CSV 파일을 생성하고 다운로드합니다.
 * @param filename 다운로드될 파일의 이름 (예: "tenant-data.csv")
 * @param data CSV로 변환할 객체의 배열
 * @param headers CSV 파일의 헤더 행에 사용할 키와 표시 이름의 매핑 객체.
 *                (예: { id: '세대 ID', name: '세대 이름', status: '상태' })
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  data: T[],
  headers: Record<keyof T, string>
) {
  if (!data || data.length === 0) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }

  const headerKeys = Object.keys(headers) as (keyof T)[];
  const headerValues = Object.values(headers);

  // CSV 헤더 행 생성
  const csvHeader = headerValues.join(',');

  // CSV 데이터 행 생성
  const csvRows = data.map(row => {
    return headerKeys
      .map(key => {
        let cell = row[key] === null || row[key] === undefined ? '' : String(row[key]);
        // 셀 내에 쉼표나 따옴표가 포함된 경우 처리
        if (/[,"]/.test(cell)) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      })
      .join(',');
  });

  // 전체 CSV 내용 조합
  const csvContent = [csvHeader, ...csvRows].join('\n');

  // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-t-8;' });

  // 파일 다운로드
  const link = document.createElement("a");
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
