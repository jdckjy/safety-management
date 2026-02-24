
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';

interface Week {
  weekNumber: number;
  startDate: number;
  endDate: number;
  startMonth: number;
  endMonth: number;
}

interface DayInfo {
    date: number | string;
    dayName: string;
}

// 이 컴포넌트는 연/월을 받아 주간 캘린더 UI를 렌더링하고, 선택된 주와 요일 정보를 부모로 전달합니다.
interface WeeklyCalendarProps {
  year: number;
  month: number; // 1-12
  onWeekSelect: (week: Week) => void;
  onDaySelect: (days: string[]) => void;
  initialSelectedDays?: string[];
}

const getWeeksInMonth = (year: number, month: number): Week[] => {
    const weeks: Week[] = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    let current = new Date(firstDayOfMonth);
    
    current.setDate(current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1));

    let weekNumber = 1;
    while (current.getFullYear() < year || current.getMonth() < month) {
        const startDate = new Date(current);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        if (endDate.getFullYear() < year && startDate.getMonth() >= month) continue;

        weeks.push({
            weekNumber: weekNumber++,
            startDate: startDate.getDate(),
            endDate: endDate.getDate(),
            startMonth: startDate.getMonth() + 1,
            endMonth: endDate.getMonth() + 1,
        });

        current.setDate(current.getDate() + 7);
        if(current.getFullYear() > year && current.getMonth() > 0) break;
    }

    return weeks.filter(week => week.startMonth === month || week.endMonth === month);
};

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ year, month, onWeekSelect, onDaySelect, initialSelectedDays = [] }) => {
  const weeksInMonth = useMemo(() => getWeeksInMonth(year, month), [year, month]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(weeksInMonth[0] || null);
  const [selectedDays, setSelectedDays] = useState<string[]>(initialSelectedDays);

  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

  useEffect(() => {
    setSelectedWeek(weeksInMonth[0] || null);
  }, [weeksInMonth]);

  useEffect(() => {
    if (selectedWeek) {
      onWeekSelect(selectedWeek);
    }
  }, [selectedWeek, onWeekSelect]);

  useEffect(() => {
    onDaySelect(selectedDays);
  }, [selectedDays, onDaySelect]);

  const daysInSelectedWeek = useMemo(() => {
    if (!selectedWeek) return [];
    const result: DayInfo[] = [];
    let current = new Date(year, selectedWeek.startMonth - 1, selectedWeek.startDate);
    
    for(let i=0; i<7; i++) {
        result.push({
            date: current.getDate(),
            dayName: daysOfWeek[i],
        });
        current.setDate(current.getDate() + 1);
    }
    return result;
  }, [selectedWeek, year]);

  const handleDayClick = (day: string) => {
    if(day === ' ') return;
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div>
        <div className="flex space-x-2 overflow-x-auto pb-2 bg-gray-100 p-2 rounded-lg mb-4">
            {weeksInMonth.map(week => (
              <Button 
                key={week.weekNumber} 
                variant={selectedWeek?.weekNumber === week.weekNumber ? 'outline' : 'ghost'}
                className={`${selectedWeek?.weekNumber === week.weekNumber ? 'bg-orange-100 text-orange-600' : ''} flex-shrink-0`}
                onClick={() => setSelectedWeek(week)}
              >
                {week.weekNumber}주차 ({`${week.startMonth}/${week.startDate}~${week.endMonth}/${week.endDate}`})
              </Button>
            ))}
        </div>

        <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">요일 범위 선택:</span>
            <div className="flex space-x-2">
                {daysInSelectedWeek.map((dayInfo, index) => {
                    if (!dayInfo.dayName.trim()) return <div key={index} className="w-10 h-10" />; 

                    const isSelected = selectedDays.includes(dayInfo.dayName);
                    const isSaturday = dayInfo.dayName === '토';
                    const isSunday = dayInfo.dayName === '일';

                    let dateColorClass = 'text-gray-600';
                    if (isSunday) dateColorClass = 'text-red-500';
                    else if (isSaturday) dateColorClass = 'text-orange-500';

                    let buttonDayColorClass = '';
                    if (!isSelected) {
                        if (isSunday) buttonDayColorClass = 'text-red-500 border-red-200 hover:text-red-600';
                        else if (isSaturday) buttonDayColorClass = 'text-orange-500 border-orange-200 hover:text-orange-600';
                    }
                    
                    return(
                        <div key={index} className="flex flex-col items-center space-y-1">
                            <span className={`text-xs font-medium mb-1 h-4 ${dateColorClass}`}>{dayInfo.date}</span>
                            <Button 
                                variant={isSelected ? 'default' : 'outline'}
                                size='sm'
                                className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200 ${isSelected ? 'bg-blue-500 text-white' : buttonDayColorClass}`}
                                onClick={() => handleDayClick(dayInfo.dayName)}
                            >
                                {dayInfo.dayName}
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  );
}
