import type { PopulationData } from '@/types/population';

interface PopulationDataTableProps {
  data: PopulationData[];
}

export default function PopulationDataTable({ data }: PopulationDataTableProps) {
  return (
    <div className="mt-8">
      <h4 className="text-md font-semibold mb-2">상세 데이터</h4>
      <div className="overflow-x-auto rounded-lg border max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기간
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                지역
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                인구 수
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={`${item.period}-${item.region}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.value.toLocaleString()} 명</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
