
// =================================================================================================
// [핵심 수정] 특정 연도에 종속되지 않도록, 연도를 인자로 받아 공휴일 목록을 동적으로 생성하는 함수로 변경합니다.
// =================================================================================================

import { format, addDays } from 'date-fns';

// 주요 음력 공휴일 데이터 (향후 몇 년간의 데이터)
const lunarHolidays: { [key: number]: { seollal: string; buddha: string; chuseok: string; } } = {
  2024: {
    seollal: '2024-02-10',
    buddha: '2024-05-15',
    chuseok: '2024-09-17',
  },
  2025: {
    seollal: '2025-01-29',
    buddha: '2025-05-05',
    chuseok: '2025-10-06',
  },
  2026: {
    seollal: '2026-02-17',
    buddha: '2026-05-24',
    chuseok: '2026-09-25',
  },
};

/**
 * 주어진 연도의 대한민국 공휴일 목록을 계산하여 반환합니다.
 * @param year 계산할 연도 (e.g., 2024, 2025...)
 * @returns 해당 연도의 공휴일 날짜 문자열(YYYY-MM-DD) 배열
 */
export const getHolidaysForYear = (year: number): Set<string> => {
  const holidays = new Set<string>();

  // 1. 고정 양력 공휴일
  const fixedHolidays = {
    '01-01': '신정',
    '03-01': '삼일절',
    '05-05': '어린이날',
    '06-06': '현충일',
    '08-15': '광복절',
    '10-03': '개천절',
    '10-09': '한글날',
    '12-25': '기독탄신일',
  };

  for (const [day, name] of Object.entries(fixedHolidays)) {
    holidays.add(`${year}-${day}`);
  }
  
  // 2. 음력 공휴일 및 연휴 (미래 몇 년치 데이터 기반)
  const yearLunarData = lunarHolidays[year];
  if (yearLunarData) {
    // 설날 연휴 (당일, 앞뒤 하루)
    const seollalDate = new Date(yearLunarData.seollal);
    holidays.add(format(addDays(seollalDate, -1), 'yyyy-MM-dd'));
    holidays.add(format(seollalDate, 'yyyy-MM-dd'));
    holidays.add(format(addDays(seollalDate, 1), 'yyyy-MM-dd'));

    // 부처님오신날
    holidays.add(yearLunarData.buddha);

    // 추석 연휴 (당일, 앞뒤 하루)
    const chuseokDate = new Date(yearLunarData.chuseok);
    holidays.add(format(addDays(chuseokDate, -1), 'yyyy-MM-dd'));
    holidays.add(format(chuseokDate, 'yyyy-MM-dd'));
    holidays.add(format(addDays(chuseokDate, 1), 'yyyy-MM-dd'));
  }

  // 3. 대체공휴일 및 선거일 등 비정기 공휴일 (2024년 기준 예시)
  if (year === 2024) {
      holidays.add('2024-02-12'); // 설날 대체공휴일
      holidays.add('2024-04-10'); // 국회의원 선거
      holidays.add('2024-05-06'); // 어린이날 대체공휴일
  }
  // (필요시 다른 연도의 비정기 공휴일 추가)
  if (year === 2025) {
      // 2025년의 어린이날은 월요일이므로 대체공휴일 없음.
      // 부처님오신날이 월요일이므로 대체공휴일 없음.
      // 추석 연휴에 일요일이 포함되므로 대체공휴일(10/8) 발생
      holidays.add('2025-10-08');
  }

  return holidays;
};
