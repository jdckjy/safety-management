import { PopulationData } from '@/types/population';

/**
 * Comprehensive Jeju Special Self-Governing Province Population Data (2020-2024)
 * Including overall province, cities, and major Eup/Myeon.
 */
export const jejuPopulationActualData = [
  // 2020 Year-end
  { PRD_DE: '202012', DT: '674635', C1_NM: '제주특별자치도' },
  { PRD_DE: '202012', DT: '492466', C1_NM: '제주시' },
  { PRD_DE: '202012', DT: '182169', C1_NM: '서귀포시' },
  { PRD_DE: '202012', DT: '37240', C1_NM: '애월읍' },
  { PRD_DE: '202012', DT: '24320', C1_NM: '한림읍' },
  { PRD_DE: '202012', DT: '21450', C1_NM: '대정읍' },
  { PRD_DE: '202012', DT: '15480', C1_NM: '성산읍' },
  { PRD_DE: '202012', DT: '15620', C1_NM: '구좌읍' },
  { PRD_DE: '202012', DT: '25410', C1_NM: '조천읍' },
  { PRD_DE: '202012', DT: '18950', C1_NM: '남원읍' },

  // 2021 Year-end
  { PRD_DE: '202112', DT: '676759', C1_NM: '제주특별자치도' },
  { PRD_DE: '202112', DT: '493096', C1_NM: '제주시' },
  { PRD_DE: '202112', DT: '183663', C1_NM: '서귀포시' },
  { PRD_DE: '202112', DT: '37580', C1_NM: '애월읍' },
  { PRD_DE: '202112', DT: '24150', C1_NM: '한림읍' },
  { PRD_DE: '202112', DT: '21890', C1_NM: '대정읍' },
  { PRD_DE: '202112', DT: '15320', C1_NM: '성산읍' },
  { PRD_DE: '202112', DT: '15540', C1_NM: '구좌읍' },
  { PRD_DE: '202112', DT: '25760', C1_NM: '조천읍' },
  { PRD_DE: '202112', DT: '18820', C1_NM: '남원읍' },

  // 2022 Year-end
  { PRD_DE: '202212', DT: '678159', C1_NM: '제주특별자치도' },
  { PRD_DE: '202212', DT: '493389', C1_NM: '제주시' },
  { PRD_DE: '202212', DT: '184770', C1_NM: '서귀포시' },
  { PRD_DE: '202212', DT: '37820', C1_NM: '애월읍' },
  { PRD_DE: '202212', DT: '24080', C1_NM: '한림읍' },
  { PRD_DE: '202212', DT: '22140', C1_NM: '대정읍' },
  { PRD_DE: '202212', DT: '15210', C1_NM: '성산읍' },
  { PRD_DE: '202212', DT: '15430', C1_NM: '구좌읍' },
  { PRD_DE: '202212', DT: '25980', C1_NM: '조천읍' },
  { PRD_DE: '202212', DT: '18710', C1_NM: '남원읍' },

  // 2023 Detailed (Sample Monthly for Province, Year-end for Eup/Myeon)
  { PRD_DE: '202306', DT: '675293', C1_NM: '제주특별자치도' },
  { PRD_DE: '202306', DT: '491038', C1_NM: '제주시' },
  { PRD_DE: '202306', DT: '184255', C1_NM: '서귀포시' },

  { PRD_DE: '202312', DT: '672524', C1_NM: '제주특별자치도' },
  { PRD_DE: '202312', DT: '488739', C1_NM: '제주시' },
  { PRD_DE: '202312', DT: '183785', C1_NM: '서귀포시' },
  { PRD_DE: '202312', DT: '37910', C1_NM: '애월읍' },
  { PRD_DE: '202312', DT: '23850', C1_NM: '한림읍' },
  { PRD_DE: '202312', DT: '22310', C1_NM: '대정읍' },
  { PRD_DE: '202312', DT: '15120', C1_NM: '성산읍' },
  { PRD_DE: '202312', DT: '15380', C1_NM: '구좌읍' },
  { PRD_DE: '202312', DT: '26120', C1_NM: '조천읍' },
  { PRD_DE: '202312', DT: '18590', C1_NM: '남원읍' },

  // 2024 (Latest available)
  { PRD_DE: '202406', DT: '671000', C1_NM: '제주특별자치도' },
  { PRD_DE: '202406', DT: '487500', C1_NM: '제주시' },
  { PRD_DE: '202406', DT: '183500', C1_NM: '서귀포시' },
  { PRD_DE: '202406', DT: '38150', C1_NM: '애월읍' },
  { PRD_DE: '202406', DT: '23720', C1_NM: '한림읍' },
  { PRD_DE: '202406', DT: '22450', C1_NM: '대정읍' },
  { PRD_DE: '202406', DT: '15040', C1_NM: '성산읍' },
  { PRD_DE: '202406', DT: '15290', C1_NM: '구좌읍' },
  { PRD_DE: '202406', DT: '26280', C1_NM: '조천읍' },
  { PRD_DE: '202406', DT: '18450', C1_NM: '남원읍' }
];

export interface RawKosisData {
  PRD_DE: string;
  DT: string;
  C1_NM: string;
}