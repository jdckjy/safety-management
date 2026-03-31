
import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getHolidaysForYear } from '../data/holidays';
import { useProjectData } from '../providers/ProjectDataProvider';
import { EventInput } from '@fullcalendar/core';
import AddGeneralActivityModal from '../components/AddGeneralActivityModal';

const ProjectCalendar: React.FC = () => {
  const { kpiData, generalActivities } = useProjectData();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // 1. 카테고리별 색상을 명확하게 정의하는 객체를 생성합니다.
  const categoryColors: { [key: string]: string } = {
    '일반': '#3B82F6', // Blue-500
    '회의': '#10B981', // Emerald-500
    '마감일': '#EF4444', // Red-500
    '개인': '#8B5CF6', // Violet-500
    '공휴일': '#F97316', // Orange-500 (배경색으로 사용)
    'KPI': '#64748B',   // Slate-500
  };

  const allEvents: EventInput[] = useMemo(() => {
    const holidaySet = getHolidaysForYear(currentYear);
    const holidayEvents: EventInput[] = Array.from(holidaySet).map(date => ({
      id: `holiday-${date}`,
      title: '휴일',
      start: date,
      allDay: true,
      display: 'background', // 배경 이벤트로 표시합니다.
      backgroundColor: categoryColors['공휴일'],
    }));

    const kpiActivityEvents: EventInput[] = (kpiData || [])
      .flatMap(kpi => kpi.activities || [])
      .map(activity => ({
        id: activity.id,
        title: `[KPI] ${activity.name}`,
        start: activity.startDate,
        end: activity.endDate,
        allDay: true,
        backgroundColor: categoryColors['KPI'],
        borderColor: categoryColors['KPI'],
        extendedProps: { type: 'KPI' }
      }));
    
    const generalActivityEvents: EventInput[] = (generalActivities || []).map(activity => {
      // 2. 정의된 색상 객체를 사용하여 카테고리에 맞는 색상을 적용합니다.
      const color = categoryColors[activity.category] || categoryColors['일반'];
      return {
        id: activity.id,
        title: activity.name,
        start: activity.date,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        extendedProps: { type: 'General' }
      };
    });

    return [...holidayEvents, ...kpiActivityEvents, ...generalActivityEvents];
  }, [kpiData, generalActivities, currentYear]);

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">프로젝트 캘린더</h1>
        <div className="h-[75vh]">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            events={allEvents}
            locale={'ko'}
            height="100%"
            dateClick={handleDateClick}
            datesSet={(dateInfo) => {
              const newYear = dateInfo.view.currentStart.getFullYear();
              if (newYear !== currentYear) {
                setCurrentYear(newYear);
              }
            }}
            eventDisplay='block' // 이벤트를 블록 형태로 표시합니다.
            dayMaxEvents={true} // 하루에 표시할 수 있는 최대 이벤트 수를 제한합니다.
            eventTimeFormat={{ // 시간 형식을 숨깁니다.
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
          />
        </div>
      </div>
      <AddGeneralActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default ProjectCalendar;
