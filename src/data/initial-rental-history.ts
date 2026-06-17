
import { RentalHistory } from '../types';

export const initialRentalHistory: RentalHistory[] = [
  {
    id: 'rh-2025',
    year: 2025,
    rentable_area: 3912.31,
    leased_area: 3025.27,
    occupancy_rate: (3025.27 / 3912.31) * 100,
    created_at: new Date('2025-12-31').toISOString(),
  },
  {
    id: 'rh-2024',
    year: 2024,
    rentable_area: 4071.19,
    leased_area: 3333.98,
    occupancy_rate: (3333.98 / 4071.19) * 100,
    created_at: new Date('2024-12-31').toISOString(),
  },
  {
    id: 'rh-2023',
    year: 2023,
    rentable_area: 4071.19,
    leased_area: 2768.82,
    occupancy_rate: (2768.82 / 4071.19) * 100,
    created_at: new Date('2023-12-31').toISOString(),
  },
  {
    id: 'rh-2022',
    year: 2022,
    rentable_area: 4071.19,
    leased_area: 2593.35,
    occupancy_rate: (2593.35 / 4071.19) * 100,
    created_at: new Date('2022-12-31').toISOString(),
  },
  {
    id: 'rh-2021',
    year: 2021,
    rentable_area: 4071.19, // 2022년과 동일하게 설정
    leased_area: 0,
    occupancy_rate: 0,
    created_at: new Date('2021-12-31').toISOString(),
  },
];
