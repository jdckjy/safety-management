
// src/utils/geometry.ts

import { Point } from '../types';

/**
 * 다각형의 면적을 계산합니다. (Shoelace/Surveyor's formula 사용)
 * @param points - 다각형을 구성하는 꼭짓점의 배열 (순서대로)
 * @param scaleFactor - 좌표계와 실제 면적 사이의 축척 계수입니다. 
 *                      예를 들어, 1 픽셀이 0.1 제곱미터를 나타낸다면 이 값은 0.1이 됩니다.
 *                      기본값은 1 (좌표 면적 = 실제 면적)로 설정됩니다.
 * @returns 다각형의 면적
 */
export const calculatePolygonArea = (points: Point[], scaleFactor: number = 1): number => {
  if (points.length < 3) {
    return 0; // 면적을 계산하려면 최소 3개의 점이 필요합니다.
  }

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length]; // 마지막 점에서 첫 번째 점으로 연결
    area += (p1.x * p2.y) - (p2.x * p1.y);
  }

  // 절대값의 절반을 취하고 축척 계수를 곱하여 최종 면적을 얻습니다.
  return Math.abs(area / 2) * scaleFactor;
};
