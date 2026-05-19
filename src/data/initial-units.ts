import { Unit } from '../types';

export const initialUnits: Unit[] = [
  {
    id: 'U001',
    unitNumber: '101',
    floor: '1F',
    area_sqm: 150.5,
    status: 'occupied',
    svgPath: 'M10 80 C 40 10, 60 10, 90 80 S 150 150, 10 80'
  },
  {
    id: 'U002',
    unitNumber: '102',
    floor: '1F',
    area_sqm: 120.0,
    status: 'vacant',
    svgPath: 'M110 80 C 140 10, 160 10, 190 80 S 250 150, 110 80'
  },
  {
    id: 'U003',
    unitNumber: '201',
    floor: '2F',
    area_sqm: 200.0,
    status: 'occupied',
    svgPath: 'M10 180 C 40 110, 60 110, 90 180 S 150 250, 10 180'
  }
];
