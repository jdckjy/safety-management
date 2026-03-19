
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { useLeaseAnalytics } from '../hooks/useLeaseAnalytics';
import { useProjectData } from '../providers/ProjectDataProvider';
import { LeaseAnalytics } from '../hooks/useLeaseAnalytics';

interface SimulatorResult {
  original: LeaseAnalytics;
  simulated: LeaseAnalytics;
}

const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);
const formatTo億 = (num: number) => `${(num / 100000000).toFixed(1)}억`;

const ResultDisplay = ({ title, value, change, colorClass }: { title: string, value: string, change: string, colorClass: string }) => (
  <div className="text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-lg font-bold">{value}</p>
    <p className={`text-xs font-semibold ${colorClass}`}>{change}</p>
  </div>
);

const LeaseSimulator: React.FC = () => {
  const { tenantUnits, complexFacilities } = useProjectData();
  const { analytics, runLeaseSimulation } = useLeaseAnalytics(tenantUnits, complexFacilities);

  const totalVacantArea = analytics['전체']?.vacantCount > 0 ? analytics['전체'].totalArea - analytics['전체'].leasedArea : 0;
  
  const [areaToLease, setAreaToLease] = useState(Math.floor(totalVacantArea / 2));
  const [avgRent, setAvgRent] = useState(30000);
  const [result, setResult] = useState<SimulatorResult | null>(null);

  const handleSimulation = () => {
    const simulatedAnalytics = runLeaseSimulation(areaToLease, avgRent);
    setResult({
      original: analytics['전체'],
      simulated: simulatedAnalytics['전체'],
    });
  };

  const getChange = (original: number, simulated: number, isPercentage: boolean = false) => {
    const change = simulated - original;
    if (isPercentage) return `${change > 0 ? '+' : ''}${change.toFixed(1)}%p`;
    return `${change > 0 ? '+' : ''}${formatTo億(change)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>공실 해소 시뮬레이터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-sm">추가 임대 면적 (m²)</label>
            <Slider
              min={0}
              max={totalVacantArea}
              step={10}
              value={[areaToLease]}
              onValueChange={(value) => setAreaToLease(value[0])}
            />
            <div className="flex justify-between text-xs mt-1">
              <span>0</span>
              <span>{formatNumber(totalVacantArea)} m² (최대)</span>
            </div>
            <p className="text-center font-bold text-blue-600">{formatNumber(areaToLease)} m²</p>
          </div>
        </div>
        <Button onClick={handleSimulation} className="w-full">시뮬레이션 실행</Button>
        
        {result && (
          <div className="pt-4 border-t">
            <h3 className="text-center font-bold mb-4">시뮬레이션 결과</h3>
            <div className="grid grid-cols-2 gap-4">
              <ResultDisplay 
                title="예상 임대율"
                value={`${result.simulated.leaseRate.toFixed(1)}%`}
                change={getChange(result.original.leaseRate, result.simulated.leaseRate, true)}
                colorClass="text-green-600"
              />
              <ResultDisplay 
                title="월 예상 수익"
                value={formatTo億(result.simulated.leasedRevenue)}
                change={getChange(result.original.leasedRevenue, result.simulated.leasedRevenue)}
                colorClass="text-green-600"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LeaseSimulator;
